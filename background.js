// === background.js ===

// =====================[ NEW: Remote API base + token helpers ]=====================
// const API_BASE = "http://localhost:5226"; // <- החלף לכתובת ה-API שלך (למשל https://api.example.com)
const API_BASE = "https://optima-trader.com";

const STORAGE_KEYS = {
  deviceId: "po_device_id",
  session: "po_session_token",
};

// background.js – כלי עזר ל-DeviceId
async function ensureDeviceId() {
  const k = 'po_device_id';
  const got = (await chrome.storage.local.get(k))[k];
  if (got) return got;
  // מזהה רנדומי יציב למכשיר הנוכחי
  const arr = new Uint8Array(16); crypto.getRandomValues(arr);
  const id = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  await chrome.storage.local.set({ [k]: id });
  return id;
}

function mask(t) { return t ? t.slice(0, 6) + '…' + t.slice(-4) : ''; }

async function writeSession(token) {
  await chrome.storage.local.set({ [STORAGE_KEYS.session]: token });
}
async function readSession() {
  const x = await chrome.storage.local.get(STORAGE_KEYS.session);
  return x?.[STORAGE_KEYS.session] || null;
}
async function clearSession() {
  await chrome.storage.local.remove([STORAGE_KEYS.session]);
}


// מאזין להודעות מה-content
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // =====================[ NEW: AUTH & SERVER DECISION HANDLERS ]==================

  // LOGIN
  // LOGIN
  if (msg?.action === "auth.login") {
    (async () => {
      try {
        const email = (msg?.data?.email || "").trim();
        const password = msg?.data?.password || "";
        if (!email || !password) {
          sendResponse({ ok: false, code: "missing_fields", error: "נא למלא אימייל וסיסמה" });
          return;
        }

        const deviceId = await ensureDeviceId();
        const r = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, deviceId, deviceName: "Chrome Ext" })
        });

        const text = await r.text();
        let json; try { json = JSON.parse(text); } catch { json = null; }

        const sessionToken = json?.sessionToken || json?.token; // ⬅️ תמיכה בשני שמות

        if (!r.ok || !json?.success || !sessionToken) {
          const code = json?.error ??
            (r.status === 401 ? "bad_credentials" :
              r.status === 403 ? "not_allowed" : `http_${r.status}`);

          const friendly =
            code === "missing_fields" ? "נא למלא אימייל וסיסמה" :
              code === "bad_credentials" ? "אימייל או סיסמה לא נכונים" :
                code === "device_limit" ? "חרגת ממספר המכשירים המותרים לחשבון" :
                  code === "device_belongs_to_other_user" ? "המכשיר הזה משויך למשתמש אחר" :
                    code === "trial_expired" || code === "access_expired" ? "אין לך גישה (פג התוקף)" :
                      code === "not_allowed" ? "אינך מורשה להשתמש בתוסף" :
                        code === "invalid_or_expired_session" ? "ההתחברות פגה — התחבר מחדש" :
                          `שגיאת התחברות (HTTP ${r.status})`;

          sendResponse({ ok: false, code, error: friendly, status: r.status, statusText: r.statusText, raw: json ?? text });
          return;
        }

        await chrome.storage.local.set({
          po_session_token: sessionToken,
          po_device_id: deviceId,
          po_is_trial: !!json.isTrial,
          po_plan_kind: json.planKind || null,
          po_access_expires_at: json.accessExpiresAtUtc || null
        });

        sendResponse({ ok: true });
      } catch (e) {
        sendResponse({ ok: false, code: "network_error", error: e?.message || "שגיאת רשת", status: 0, statusText: "Network/Fetch Error" });
      }
    })();
    return true;
  }

  //refresh plan info
  if (msg?.action === "auth.sessionInfo") {
    (async () => {
      try {
        const token = await readSession();
        if (!token) { sendResponse({ ok: false, code: "no_token" }); return; }
        const deviceId = await ensureDeviceId();

        const r = await fetch(`${API_BASE}/api/auth/session-info`, {
          method: "GET",
          headers: {
            "X-Session-Token": token,
            "X-Device-Id": deviceId
          }
        });

        const text = await r.text();
        let json; try { json = JSON.parse(text); } catch { json = null; }
        debugger;
        if (!r.ok || !json?.ok) {
          sendResponse({ ok: false, code: json?.error ?? `http_${r.status}`, status: r.status });
          return;
        }

        await chrome.storage.local.set({
          po_is_trial: !!json.isTrial,
          po_plan_kind: json.planKind || null,
          po_access_expires_at: json.accessExpiresAtUtc || null
        });

        sendResponse({ ok: true, ...json });
      } catch (e) {
        sendResponse({ ok: false, code: "network_error", error: e?.message || "שגיאת רשת" });
      }
    })();
    return true;
  }


  // GET TOKEN (קיים?)
  if (msg?.action === "auth.getToken") {
    (async () => {
      try {
        const token = await readSession();                 // מהאחסון המקומי
        if (!token) {
          sendResponse({ ok: false, token: null });
          return;
        }

        const deviceId = await ensureDeviceId();

        // אימות מול השרת
        const r = await fetch(`${API_BASE}/api/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, deviceId })
        });

        const text = await r.text();
        let json; try { json = JSON.parse(text); } catch { json = null; }

        if (!r.ok || !json?.success) {
          // ננקה הכל מקומית – כדי לא "להיתקע" עם טוקן מת
          await chrome.storage.local.remove([
            "po_session_token",
            "po_device_id",
            "po_is_trial",
            "po_plan_kind",
            "po_access_expires_at"
          ]);

          const code = json?.error ??
            (r.status === 401 ? "invalid_or_expired_session" :
              r.status === 403 ? "access_expired" : `http_${r.status}`);

          sendResponse({ ok: false, token: null, code, raw: json ?? text });
          return;
        }

        // OK – מעדכנים את המטא־נתונים המקומיים מהשרת (תמיד טרי)
        const d = json.data || {};
        await chrome.storage.local.set({
          po_is_trial: !!d.isTrial,
          po_plan_kind: d.planKind || null,
          po_access_expires_at: d.accessExpiresAtUtc || null
        });

        sendResponse({
          ok: true,
          token,                                    // נשאר אותו טוקן
          isTrial: !!d.isTrial,
          planKind: d.planKind || null,
          accessExpiresAtUtc: d.accessExpiresAtUtc || null
        });
      } catch (e) {
        // במקרה של רשת – לא מוחקים טוקן; תחליט אם ברצונך לאלץ לוגין
        sendResponse({ ok: false, error: e?.message || String(e) });
      }
    })();
    return true;
  }

  // LOGOUT
  if (msg?.action === "auth.logout") {
    (async () => {
      try {
        const token = await readSession();
        const deviceId = (await chrome.storage.local.get(STORAGE_KEYS.deviceId))[STORAGE_KEYS.deviceId];
        if (token && deviceId) {
          await fetch(`${API_BASE}/api/auth/logout`, {
            method: "POST",
            headers: {
              "X-Session-Token": token,
              "X-Device-Id": deviceId
            }
          }).catch(() => { });
        }
        await clearSession();
        await chrome.storage.local.remove(["po_is_trial", "po_access_expires_at"]);
        sendResponse({ ok: true });
      } catch (e) {
        sendResponse({ ok: false, error: e?.message || String(e) });
      }
    })();
    return true;
  }

  // DECIDE
  // בקשת החלטה – שולח כותרות ה-Session
  if (msg && msg.action === "decision.decide") {
    (async () => {
      try {
        const { po_session_token: token, po_device_id: deviceId } = await chrome.storage.local.get(['po_session_token', 'po_device_id']);
        if (!token || !deviceId) { sendResponse({ ok: false, error: "no_session" }); return; }

        const r = await fetch(`${API_BASE}/api/decisions/decide`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": token,
            "X-Device-Id": deviceId
          },
          body: JSON.stringify(msg.data || {})
        });
        const text = await r.text();
        let data; try { data = JSON.parse(text); } catch { data = null; }

        if (!r.ok) { sendResponse({ ok: false, error: data?.error || text || `HTTP ${r.status}` }); return; }
        sendResponse({ ok: true, data });
      } catch (e) {
        sendResponse({ ok: false, error: e?.message || String(e) });
      }
    })();
    return true;
  }

});
