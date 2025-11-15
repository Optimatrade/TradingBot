(() => {
  'use strict';

  // === מניעת כפילויות ודאבלים ===
  // פעם אחת בלבד
  if (!window.__poInit__) {
    window.__poInit__ = true;
  } else {
    console.log("⚠️ content.js כבר הותקן, מתעלם...");
    return;
  }

  // === הגנת HTML בסיסית (להכניס פעם אחת בראש הקובץ) ===
  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  /**********************
   * CONFIG
   **********************/
  const SAMPLE_MS = 100;
  const SELECTOR_PRICE = '.block--payout .tooltip-text';
  const SELECTOR_SYMBOL = '.current-symbol';
  const WIDGET_ID = 'po-analyzer-container';
  const POS_KEY = 'po_analyzer_position_v1';
  const SERVER_URL = 'http://localhost:3000'; // לא בשימוש כרגע, נשאיר אם תרצה לחזור ל-fetch


  // === מערכת שפות ותרגום ===
  let currentLanguage = 'he'; // ברירת מחדל: עברית

  const translations = {
    he: {
      // כותרות עיקריות
      title: 'OPtimatraDE',

      // תוויות עיקריות
      symbol: 'סימבול',
      profitPercent: 'אחוז רווח',
      price: 'מחיר',
      time: 'שעה',
      candlesSampled: 'נרות נדגמו',
      timeframe: 'טיים פריים',

      // תוכניות / Generic & plans
      generic_left_days: 'נותרו {d} ימים',
      generic_left_short: 'נותרו {h}ש׳ {m}ד׳',
      generic_expired: 'פג התוקף',

      trial_badge: 'ניסיון 24 שעות',
      trial_left_days: 'נותרו {d} ימים',
      trial_expired: 'פג התוקף',

      weekly_badge: 'שבועי',
      weekly_left_days: 'נותרו {d} ימים',
      weekly_expired: 'פג התוקף',

      monthly_badge: 'חודשי',
      monthly_left_days: 'נותרו {d} ימים',
      monthly_expired: 'פג התוקף',

      annual_badge: 'שנתי',
      annual_left_days: 'נותרו {d} ימים',
      annual_expired: 'פג התוקף',

      // כפתורים
      start: 'התחל',
      stop: 'עצור',
      sync: 'סנכרון לנר ראשון',

      // קישורים
      signals: '📡 איתותים',
      trades: '📊 עסקאות',
      analysis: '🔍 ניתוח',
      statistics: '📈 סטטיסטיקה',

      // כותרות מודלים
      allBotSignals: 'איתותי בוט',
      allBotTrades: 'עסקאות בוט',
      signalHistory: 'היסטוריית איתותים (80 אחרונים)',
      tradeHistory: 'היסטוריית עסקאות (80 אחרונות)',
      reset: 'איפוס',
      close: 'סגור',

      // איתותים
      waitingForSignal: 'ממתין לאיתות',
      waitingForBotStart: 'ממתין להפעלת הבוט',
      buy: 'קנייה',
      sell: 'מכירה',
      oversoldWait: 'ייתכן איתות בקרוב',
      overboughtWait: 'ייתכן איתות בקרוב',
      noSignalRange: 'אין איתות — טווח ביניים',
      oversoldCooldown: 'אוברסולד — קולדאון',
      overboughtCooldown: 'אוברבוט — קולדאון',
      noSignalCooldown: 'אין איתות — קולדאון',
      oversoldWaitMore: 'ייתכן איתות בקרוב',
      overboughtWaitMore: 'ייתכן איתות בקרוב',
      // שורת סטטוס
      confidence: 'ביטחון',

      // אוטומציה
      automationSystem: 'מערכת מסחר אוטומטית',
      enable: 'הפעל מסחר אוטומטי',
      disable: 'כבה מסחר אוטומטי',
      currentBalance: 'יתרה נוכחית',
      entryAmount: 'כניסה ראשונית',
      stopLoss: 'סטופ לוס',
      takeProfit: 'טייק פרופיט',

      // טבלאות
      succeeded: 'הצליח',
      failed: 'נכשל',
      date: 'תאריך',
      entryTime: 'זמן כניסה',
      closeTime: 'זמן סגירה',
      signal: 'איתות',
      entryPrice: 'מחיר כניסה',
      duration: 'משך',
      closePrice: 'מחיר סגירה',
      verification: 'אימות',
      backup1: 'גיבוי 1',
      backup2: 'גיבוי 2',
      backup3: 'גיבוי 3',
      action: 'פעולה',
      reasoning: 'נימוק/הסבר',
      signalSource: 'מקור האיתות',

      // זמנים
      halfMinute: 'חצי דקה',
      oneMinute: '1 דקה',
      fiveMinutes: '5 דקות',
      minutes: 'דקות',

      // הודעות מערכת
      automationEnabled: 'מערכת אוטומציה הופעלה!',
      automationDisabled: 'מערכת אוטומציה כובתה',
      automatedTrade: 'עסקה אוטומטית',
      tradeSucceeded: 'עסקה הצליחה!',
      tradeFailed: 'עסקה נכשלה',
      backupLevel: 'רמת גיבוי',
      waitingForNextCandle: 'מחכה לנר הבא',
      nextCandle: 'בנר הבא',

      // סוגי פעולות
      automatic: 'אוטומטי',
      manual: 'ידני',

      // סטטיסטיקה
      statistics: '📈 סטטיסטיקה',
      botSignals: 'איתותי בוט',
      total: 'סה"כ',
      successfulTrades: 'הצליח',
      failedTrades: 'נכשל',
      // פאנל סטטיסטיקה
      statisticsPanel: 'לוח סטטיסטיקות',
      totalTrades: 'סה"כ עסקאות',
      successRate: 'אחוז הצלחה',
      technicalBotSuccessRate: 'הצלחה בעסקה - בוט טכני',

      // אינדיקטורים טכניים
      technicalIndicators: 'אינדיקטורים טכניים',

      // הודעות שגיאה
      pleaseEnterEntryAmount: 'יש להזין סכום כניסה ראשונית',
      pleaseEnterStopLossTakeProfit: 'יש להזין סטופ לוס וטייק פרופיט'
    },

    en: {
      // Main titles
      title: 'OPtimatraDE',

      // Main labels
      symbol: 'Symbol',
      profitPercent: 'Profit %',
      price: 'Price',
      time: 'Time',
      candlesSampled: 'Candles Sampled',
      timeframe: 'Timeframe',

      // Generic & plans
      generic_left_days: 'Remaining {d} days',
      generic_left_short: 'Remaining {h}h {m}m',
      generic_expired: 'Expired',

      trial_badge: '24h Trial',
      trial_left_days: 'Remaining {d} days',
      trial_expired: 'Expired',

      weekly_badge: 'Weekly',
      weekly_left_days: 'Remaining {d} days',
      weekly_expired: 'Expired',

      monthly_badge: 'Monthly',
      monthly_left_days: 'Remaining {d} days',
      monthly_expired: 'Expired',

      annual_badge: 'Annual',
      annual_left_days: 'Remaining {d} days',
      annual_expired: 'Expired',

      // Buttons
      start: 'Start',
      stop: 'Stop',
      sync: 'Sync to First Candle',

      // Links
      signals: '📡 Signals',
      trades: '📊 Trades',
      analysis: '🔍 Analysis',
      statistics: '📈 Statistics',

      // Modal titles
      allBotSignals: 'All Bot Signals',
      allBotTrades: 'All Bot Trades',
      signalHistory: 'Signal History (Last 80)',
      tradeHistory: 'Trade History (Last 80)',
      reset: 'Reset',
      close: 'Close',
      statisticsPanel: 'Statistics Panel',

      // Signals
      waitingForSignal: 'Waiting for signal',
      waitingForBotStart: 'Waiting for bot activation',
      buy: 'Buy',
      sell: 'Sell',
      oversoldWait: 'Signal possible soon',
      overboughtWait: 'Signal possible soon',
      noSignalRange: 'No signal — Mid range',
      oversoldCooldown: 'Oversold — Cooldown',
      overboughtCooldown: 'Overbought — Cooldown',
      noSignalCooldown: 'No signal — Cooldown',
      oversoldWaitMore: 'Signal possible soon',
      overboughtWaitMore: 'Signal possible soon',
      // Status line
      confidence: 'Confidence',

      // Automation
      automationSystem: 'Automated Trading System',
      enable: 'Enable Auto Trading',
      disable: 'Disable Auto Trading',
      currentBalance: 'Current Balance',
      entryAmount: 'Entry Amount',
      stopLoss: 'Stop Loss',
      takeProfit: 'Take Profit',

      // Error messages
      pleaseEnterEntryAmount: 'Please enter initial entry amount',
      pleaseEnterStopLossTakeProfit: 'Please enter stop loss and take profit',
        
      // Trial version frame
      trialVersion24h: '24 Hour Trial Version',

      // Tables
      succeeded: 'Succeeded',
      failed: 'Failed',
      date: 'Date',
      entryTime: 'Entry Time',
      closeTime: 'Close Time',
      signal: 'Signal',
      entryPrice: 'Entry Price',
      duration: 'Duration',
      closePrice: 'Close Price',
      verification: 'Verification',
      backup1: 'Backup 1',
      backup2: 'Backup 2',
      backup3: 'Backup 3',
      action: 'Action',

      // Times
      halfMinute: '30 Seconds',
      oneMinute: '1 Minute',
      fiveMinutes: '5 Minutes',
      minutes: 'Minutes',

      // System messages
      automationEnabled: 'Automation system enabled!',
      automationDisabled: 'Automation system disabled',
      automatedTrade: 'Automated trade',
      tradeSucceeded: 'Trade succeeded!',
      tradeFailed: 'Trade failed',
      backupLevel: 'Backup level',
      waitingForNextCandle: 'Waiting for next candle',
      nextCandle: 'Next candle',

      // Action types
      automatic: 'Automatic',
      manual: 'Manual',

      // Statistics
      statistics: '📈 Statistics',
      botSignals: 'Bot Signals',
      total: 'Total',
      successfulTrades: 'Successful Trades',
      failedTrades: 'Failed Trades',
      // Stats panel
      totalTrades: 'Total trades',
      successRate: 'Success rate',
      technicalBotSuccessRate: 'Technical Bot Success Rate',

      // Technical Indicators
      technicalIndicators: 'Technical Indicators'
    }
  };

  const MAX_BACKUP_LEVEL = 3; // מספר רמות הגיבוי המקסימלי הנתמך
  // allow configuring up to which backup level the amount will keep doubling.
  // Levels above that will reuse the amount calculated at the cap level.
  const DUPLICATE_MAX_LEVEL = 3 // default: only level 1 duplicates (current behavior)

  // פונקציה לקבלת תרגום
  function t(key) {
    return translations[currentLanguage]?.[key] || translations.he[key] || key;
  }

  // פונקציה לתרגום איתותים דינמי
  function translateSignalText(text) {
    if (currentLanguage === 'he') return text;

    let result = text
      .replace(/קנייה/g, 'Buy')
      .replace(/קניה/g, 'Buy')  // ללא יו"ד כפולה
      .replace(/מכירה/g, 'Sell')
      .replace(/אין עסקה/g, 'No Trade')
      .replace(/הצליח/g, 'Succeeded')
      .replace(/נכשל/g, 'Failed')
      .replace(/בוט/g, 'Bot')
      .replace(/בוט טכני מתקדם/g, 'Advanced Technical Bot')
      .replace(/GPT-4/g, 'GPT-4')
      .replace(/GPT-5/g, 'GPT-5')
      // תרגום ניתוחים טכניים
      .replace(/RSI\(5\)\s*(\d+)\s*חצה מעל/g, 'RSI(5) crossed above $1')
      .replace(/RSI\(5\)\s*(\d+)\s*חצה מתחת/g, 'RSI(5) crossed below $1')
      .replace(/RSI\(\d+\)\s*(\d+)\s*אוברסולד/g, 'RSI($1) oversold')
      .replace(/RSI\(\d+\)\s*(\d+)\s*אוברבוט/g, 'RSI($1) overbought')
      .replace(/חצה מעל/g, 'crossed above')
      .replace(/חצה מתחת/g, 'crossed below')
      .replace(/אוברסולד/g, 'oversold')
      .replace(/אוברבוט/g, 'overbought')
      .replace(/יציאה מאוברסולד/g, 'exit from oversold')
      .replace(/יציאה מאוברבוט/g, 'exit from overbought')
      // תרגומים נוספים לטקסטים ארוכים
      .replace(/תנועה ירידית וציפוי עם חצייה מתחתית/g, 'Downward movement with bearish crossover')
      .replace(/המחיר לא זוכה או פריצה לא מובהק/g, 'Price not gaining or unclear breakout')
      .replace(/אין דמפו נר מובהק או פריצה נקיה/g, 'No clear candlestick pattern or clean breakout')
      .replace(/סביר האמצע ללא קיצון/g, 'Moderate range without extremes')
      .replace(/לאחר הכוונים/g, 'after directions')
      .replace(/מדן לכיוראונד/g, 'trending around')
      .replace(/אין איתות/g, 'No signal')
      .replace(/אין עסקה/g, 'No trade')
      // תרגום הטקסט הארוך של GPT
      .replace(/תנועה ירידית וציפוי עם חצייה מתחתית מהחמצת באזור/g, 'Downward movement with bearish crossover missing in area')
      .replace(/המחיר לא זוכה קמיקה קונת באזור/g, 'Price not gaining clear momentum in area')
      .replace(/אין דמפו נר מובהק או פריצה נקיה/g, 'No clear candlestick pattern or clean breakout')
      .replace(/לאחר הכוונים RSI/g, 'after RSI directions')
      .replace(/סביר האמצע ללא קיצוניקראונד/g, 'Moderate middle range without extremes')
      .replace(/דיכוי/g, 'suppression')
      .replace(/מדן/g, 'from')
      .replace(/לכיוראונד/g, 'around direction')
      // תרגום הטקסט הספציפי מהתמונה
      .replace(/תנועה ירידית וציפוי עם חצייה מתחתית מהחמצת באזור 169\.10-169\.09 - המחיר לא זוכה קמיקה קונת באזור - אין דמפו נר מובהק או פריצה נקיה לאחר הכוונים RSI לאחר הכוונים - סביר האמצע ללא קיצוניקראונד/g, 'Downward movement with bearish crossover missing in 169.10-169.09 area - Price not gaining clear momentum - No clear candlestick pattern or clean breakout after RSI directions - Moderate middle range without extremes');

    return result;
  }

  // פונקציה לשינוי שפה
  function changeLanguage(lang) {
    console.log('🔄 משנה שפה ל:', lang, 'מ:', currentLanguage);
    currentLanguage = lang;

    // שמירה ב-localStorage
    try {
      localStorage.setItem('po_language', lang);
      console.log('💾 שפה נשמרה ב-localStorage:', lang);
    } catch (e) {
      console.warn('לא ניתן לשמור שפה:', e);
    }

    // עדכון כיוון הטקסט
    updateTextDirection();

    // עדכון כל הטקסטים
    updateAllTexts();

    // עדכון מיידי של מסגרת התוכנית
    updateTrialFrameText().catch(console.error);

    // עדכון טיים פריים
    updateTimeframeOptions();

    // רענון הטבלאות אם הן פתוחות
    refreshOpenTables();

    console.log('✅ שינוי שפה הושלם ל:', currentLanguage);
  }

  // פונקציה לעדכון כיוון הטקסט
  function updateTextDirection() {
    if ($.host) {
      if (currentLanguage === 'en') {
        // רק באנגלית נשנה כיוון
        $.host.setAttribute('dir', 'ltr');
      } else {
        // בעברית מסירים את הdir כדי לחזור למצב הקודם
        $.host.removeAttribute('dir');
      }
    }
  }

  // פונקציה לעדכון כל הטקסטים
  function updateAllTexts() {
    if (!$) return;

    // עדכון תוויות עיקריות - רק הטקסט, לא המיקום
    updateLabelTexts();

    // עדכון כפתורים
    updateButtonTexts();

    // עדכון קישורים
    updateLinkTexts();
      
    // עדכון מסגרת גרסת נסיון
    updateTrialFrameText().catch(console.error);

    // עדכון טבלאות
    updateTableHeaders();

    // עדכון אוטומציה
    updateAutomationTexts();

    // עדכון הודעת האיתות הראשית
    if ($.signal) {
      $.signal.textContent = botStarted ? t('waitingForSignal') : t('waitingForBotStart');
    }
    // עדכון שורת המטא (confidence) אם קיימת תצוגה קודמת
    if ($.signalMeta && typeof $.signalMeta.textContent === 'string' && $.signalMeta.textContent) {
      $.signalMeta.textContent = $.signalMeta.textContent.replace(/\b(ביטחון|Confidence)\b/, t('confidence'));
    }
  }

  // טעינת שפה מ-localStorage
  function loadLanguage() {
    try {
      const saved = localStorage.getItem('po_language');
      if (saved && translations[saved]) {
        currentLanguage = saved;
      }
    } catch (e) {
      console.warn('לא ניתן לטעון שפה:', e);
    }
  }

  // פונקציות עדכון טקסטים
  function updateLabelTexts() {
    // עדכון תוויות בגריד הראשי - אבל רק את הטקסט, לא את הסדר
    const labels = $.shadow.querySelectorAll('.label');
    if (labels[0]) labels[0].textContent = t('symbol');
    if (labels[1]) labels[1].textContent = t('profitPercent');
    if (labels[2]) labels[2].textContent = t('price');
    if (labels[3]) labels[3].textContent = t('time');
    if (labels[4]) labels[4].textContent = t('candlesSampled');
    if (labels[5]) labels[5].textContent = t('timeframe');
  }

  function updateButtonTexts() {
    // עדכון כפתור התחל/עצור לפי מצב הבוט
    if ($.startBtn) {
      if (sampling) {
        $.startBtn.textContent = t('stop');
      } else {
        $.startBtn.textContent = t('start');
      }
    }
  }

  function updateLinkTexts() {
    if ($.signalsLink) $.signalsLink.textContent = t('signals');
    if ($.tradesLink) $.tradesLink.textContent = t('trades');
    if ($.statsLink) $.statsLink.textContent = t('statistics');
  }  

  async function updateTrialFrameText() {
    if ($.trialFrame) {
      try {
        // בדיקה שהקשר של התוסף עדיין תקין
        if (!chrome.runtime?.id) {
          $.trialFrame.textContent = currentLanguage === 'en' ? 'Extension Reloaded' : 'התוסף נטען מחדש';
          return;
        }

        // קבלת נתוני התוכנית מהשרת
        const tokenRes = await chrome.runtime.sendMessage({ action: "auth.getToken" });
        
        if (tokenRes && tokenRes.ok) {
          const kind = normalizePlanKind(tokenRes.planKind, tokenRes.isTrial);
          const expiresIso = tokenRes.accessExpiresAtUtc;
          
          if (kind && expiresIso) {
            const leftMs = new Date(expiresIso).getTime() - Date.now();
            
            // קביעת שם התוכנית
            let planName = '';
            switch(kind) {
              case 'trial': 
                planName = currentLanguage === 'en' ? '24 Hour Trial' : 'ניסיון 24 שעות'; 
                break;
              case 'weekly': 
                planName = currentLanguage === 'en' ? 'Weekly Plan' : 'תוכנית שבועית'; 
                break;
              case 'monthly': 
                planName = currentLanguage === 'en' ? 'Monthly Plan' : 'תוכנית חודשית'; 
                break;
              case 'annual': 
                planName = currentLanguage === 'en' ? 'Annual Plan' : 'תוכנית שנתית'; 
                break;
              default: 
                planName = currentLanguage === 'en' ? 'Plan' : 'תוכנית'; 
                break;
            }
            
            // חישוב זמן נותר
            let timeLeft = '';
            if (leftMs <= 0) {
              timeLeft = currentLanguage === 'en' ? 'Expired' : 'פג התוקף';
              // עצירת הטיימר כשהתוקף פג
              if (trialFrameTimer) {
                clearInterval(trialFrameTimer);
                trialFrameTimer = null;
              }
              
              // logout אוטומטי ופתיחת מסך לוגין כשהתוקף פג
              console.log('🚨 התוקף פג - מבצע logout אוטומטי');
              try {
                // logout מהשרת
                await chrome.runtime.sendMessage({ action: "auth.logout" });
                console.log('✅ Logout הושלם');
                
                // פתיחת מסך לוגין
                await openLoginOverlayOnWidget();
                console.log('✅ מסך לוגין נפתח');
                
                // עצירת הבוט אם הוא פועל
                stopSampling();
                console.log('✅ הבוט נעצר');
                
              } catch (error) {
                console.error('❌ שגיאה ב-logout אוטומטי:', error);
                // גם אם יש שגיאה, נפתח מסך לוגין
                try {
                  await openLoginOverlayOnWidget();
                } catch (e) {
                  console.error('❌ שגיאה בפתיחת מסך לוגין:', e);
                }
              }
            } else if (leftMs < 24 * 60 * 60 * 1000) { // פחות מ-24 שעות
              const hours = Math.floor(leftMs / (60 * 60 * 1000));
              const minutes = Math.floor((leftMs % (60 * 60 * 1000)) / (60 * 1000));
              if (currentLanguage === 'en') {
                timeLeft = `${hours}h ${minutes}m left`;
              } else {
                timeLeft = `נותרו ${hours} שעות ${minutes} דקות`;
              }
            } else {
              const days = Math.floor(leftMs / (24 * 60 * 60 * 1000));
              if (currentLanguage === 'en') {
                timeLeft = `${days} days left`;
              } else {
                timeLeft = `נותרו ${days} ימים`;
              }
            }
            
            $.trialFrame.textContent = `${planName} - ${timeLeft}`;
          } else {
            $.trialFrame.textContent = currentLanguage === 'en' ? 'Not Connected' : 'לא מחובר';
          }
        } else {
          $.trialFrame.textContent = currentLanguage === 'en' ? 'Not Connected' : 'לא מחובר';
        }
      } catch (error) {
        console.error('שגיאה בעדכון מסגרת התוכנית:', error);
        // בדיקה אם זו שגיאת הקשר
        if (error.message?.includes('Extension context invalidated') || error.message?.includes('context invalidated')) {
          $.trialFrame.textContent = currentLanguage === 'en' ? 'Extension Reloaded' : 'התוסף נטען מחדש';
          // עצירת הטיימר
          if (trialFrameTimer) {
            clearInterval(trialFrameTimer);
            trialFrameTimer = null;
          }
        } else {
          $.trialFrame.textContent = currentLanguage === 'en' ? 'Loading Error' : 'שגיאה בטעינה';
        }
      }
    }
  }

  function updateAutomationTexts() {
    if ($.automationToggle) {
      const isActive = $.automationToggle.classList.contains('active');
      $.automationToggle.textContent = isActive ? t('disable') : t('enable');
    }

    // עדכון תוויות אוטומציה
    const automationLabels = $.shadow.querySelectorAll('.automation-controls .label');
    if (automationLabels[0]) automationLabels[0].textContent = t('entryAmount');
    if (automationLabels[1]) automationLabels[1].textContent = t('stopLoss');
    if (automationLabels[2]) automationLabels[2].textContent = t('takeProfit');

    // עדכון placeholder בתיבות טקסט
    if ($.entryAmount) $.entryAmount.placeholder = t('entryAmount').replace(' ($)', '');
    if ($.stopLoss) $.stopLoss.placeholder = t('stopLoss').replace(' ($)', '');
    if ($.takeProfit) $.takeProfit.placeholder = t('takeProfit').replace(' ($)', '');

    // עדכון תווית יתרה נוכחית
    if ($.currentBalanceLabel) $.currentBalanceLabel.textContent = t('currentBalance');

    // עדכון סדר היתרה לפי השפה
    updateBalanceOrder();
  }

  // פונקציה לעדכון סדר היתרה
  function updateBalanceOrder() {
    if ($.balanceDisplayContainer && $.currentBalanceDisplay && $.currentBalanceLabel) {
      if (currentLanguage === 'en') {
        // באנגלית: Current Balance $ 6047.38
        $.balanceDisplayContainer.innerHTML = `<span id="currentBalanceLabel">Current Balance</span> $ <span id="currentBalanceDisplay">${$.currentBalanceDisplay.textContent}</span>`;
      } else {
        // בעברית: 6047.38 $ יתרה נוכחית
        $.balanceDisplayContainer.innerHTML = `<span id="currentBalanceDisplay">${$.currentBalanceDisplay.textContent}</span> $ :<span id="currentBalanceLabel">יתרה נוכחית</span>`;
      }

      // עדכון המצביעים אחרי שינוי ה-HTML
      $.currentBalanceDisplay = $.shadow.getElementById('currentBalanceDisplay');
      $.currentBalanceLabel = $.shadow.getElementById('currentBalanceLabel');
    }
  }

  function updateTableHeaders() {
    // עדכון כותרות מודלים
    const signalsModalTitle = $.shadow.querySelector('#signalsModal .modal-title span:last-child');
    const tradesModalTitle = $.shadow.querySelector('#tradesModal .modal-title span:last-child');
    const signalsHistoryTitle = $.shadow.querySelector('#signalsModal .panel-title');
    const tradesHistoryTitle = $.shadow.querySelector('#tradesModal .panel-title');

    if (signalsModalTitle) signalsModalTitle.textContent = t('allBotSignals');
    if (tradesModalTitle) tradesModalTitle.textContent = t('allBotTrades');

    // עדכון כותרת סטטיסטיקה
    const statsModalTitle = $.shadow.querySelector('#statsModal .modal-title span:last-child');
    if (statsModalTitle) statsModalTitle.textContent = t('statistics');
    const statsPanelTitle = $.shadow.querySelector('#statsPanelTitle');
    if (statsPanelTitle) statsPanelTitle.textContent = t('statisticsPanel');
    const statsResetBtnEl = $.shadow.getElementById('statsResetBtn');
    if (statsResetBtnEl) statsResetBtnEl.textContent = t('reset');
    if (signalsHistoryTitle) {
      const firstTextNode = signalsHistoryTitle.firstChild;
      if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
        // השאר רק את האייקון, הטקסט עצמו נכנס ל-span כדי למנוע כפילות
        firstTextNode.textContent = '📜 ';
      }
    }
    const signalsCloseLabel = $.shadow.getElementById('signalsCloseLabel');
    if (signalsCloseLabel) signalsCloseLabel.textContent = t('close');
    const signalsHistoryLabel = $.shadow.getElementById('signalsHistoryTitle');
    if (signalsHistoryLabel) signalsHistoryLabel.textContent = t('signalHistory');
    const signalsResetBtn = $.shadow.getElementById('signalsResetBtn');
    if (signalsResetBtn) signalsResetBtn.textContent = t('reset');
    
    // עדכון כותרות טבלת האיתותים
    const signalsTableHeaders = $.shadow.querySelectorAll('#signalsModal thead th');
    if (signalsTableHeaders.length >= 5) {
      signalsTableHeaders[0].textContent = t('symbol');
      signalsTableHeaders[1].textContent = t('time');
      signalsTableHeaders[2].textContent = t('signal');
      signalsTableHeaders[3].textContent = t('price');
      signalsTableHeaders[4].textContent = t('duration');
    }
    if (tradesHistoryTitle) {
      const firstTextNode = tradesHistoryTitle.firstChild;
      if (firstTextNode && firstTextNode.nodeType === Node.TEXT_NODE) {
        // השאר רק את האייקון, הטקסט עצמו נכנס ל-span כדי למנוע כפילות
        firstTextNode.textContent = '📊 ';
      }
    }
    const tradesCloseLabel = $.shadow.getElementById('tradesCloseLabel');
    if (tradesCloseLabel) tradesCloseLabel.textContent = t('close');
    const tradesHistoryLabel = $.shadow.getElementById('tradesHistoryTitle');
    if (tradesHistoryLabel) tradesHistoryLabel.textContent = t('tradeHistory');
    const tradesResetBtn = $.shadow.getElementById('tradesResetBtn');
    if (tradesResetBtn) tradesResetBtn.textContent = t('reset');

    // עדכון טבלת איתותים
    const signalsHeaders = $.shadow.querySelectorAll('#signalsModal thead th');
    if (signalsHeaders.length >= 7) {
      signalsHeaders[0].textContent = t('symbol');
      signalsHeaders[1].textContent = t('time');
      signalsHeaders[2].textContent = t('signal');
      signalsHeaders[3].textContent = t('price');
      signalsHeaders[4].textContent = t('duration');
      signalsHeaders[5].textContent = t('reasoning');
      signalsHeaders[6].textContent = t('signalSource');
    }

    // עדכון טבלת עסקאות
    const tradesHeaders = $.shadow.querySelectorAll('#tradesModal thead th');
    if (tradesHeaders.length >= 11) {
      tradesHeaders[0].textContent = t('symbol');
      tradesHeaders[1].textContent = t('date');
      tradesHeaders[2].textContent = t('entryTime');
      tradesHeaders[3].textContent = t('closeTime');
      tradesHeaders[4].textContent = t('signal');
      tradesHeaders[5].textContent = t('entryPrice');
      tradesHeaders[6].textContent = t('duration');
      tradesHeaders[7].textContent = t('closePrice');
      tradesHeaders[8].textContent = t('verification');
      tradesHeaders[9].textContent = t('backup1');
      tradesHeaders[10].textContent = t('verification') + ' 1';
      if (tradesHeaders[11]) tradesHeaders[11].textContent = t('backup2');
      if (tradesHeaders[12]) tradesHeaders[12].textContent = t('verification') + ' 2';
      if (tradesHeaders[13]) tradesHeaders[13].textContent = t('backup3');
      if (tradesHeaders[14]) tradesHeaders[14].textContent = t('verification') + ' 3';
      if (tradesHeaders[15]) tradesHeaders[15].textContent = t('action');
    }

    // עדכון סטטיסטיקות עסקאות
    const successLabel = $.shadow.querySelector('.stat-item.success .stat-label');
    const failureLabel = $.shadow.querySelector('.stat-item.failure .stat-label');
    if (successLabel) successLabel.textContent = t('succeeded');
    if (failureLabel) failureLabel.textContent = t('failed');

    // כפתורי איפוס במודלים
    const signalsResetBtnEl = $.shadow.getElementById('signalsResetBtn');
    if (signalsResetBtnEl) signalsResetBtnEl.textContent = t('reset');
    const tradesResetBtnEl = $.shadow.getElementById('tradesResetBtn');
    if (tradesResetBtnEl) tradesResetBtnEl.textContent = t('reset');
  }

  function updateTimeframeOptions() {
    if ($.tfSelect) {
      // רק חצי דקה זמינה
      const opt = $.tfSelect.querySelector('option[value="0.5m"]');
      if (opt) opt.textContent = t('halfMinute');
      // אם קיימות אפשרויות ישנות, נמחק אותן
      $.tfSelect.querySelectorAll('option[value="1m"], option[value="5m"]').forEach(o => o.remove());
      // הבטח שהערך הנוכחי הוא חצי דקה
      $.tfSelect.value = '0.5m';
    }
  }

  // פונקציה לרענון טבלאות פתוחות
  function refreshOpenTables() {
    console.log('🔄 מרענן טבלאות פתוחות, שפה נוכחית:', currentLanguage);

    if ($.signalsModal && $.signalsModal.classList.contains('show')) {
      renderSignalsTable();
      updateTableHeaders();
    }
    if ($.tradesModal && $.tradesModal.classList.contains('show')) {
      renderTradesTable();
      updateTableHeaders();
    }
    if ($.statsModal && $.statsModal.classList.contains('show')) {
      renderStatsChart();
    }

    // רענון כפוי של כל הטבלאות - גם אם הן לא פתוחות כרגע
    setTimeout(() => {
      if ($.signalsTbody) {
        renderSignalsTable();
      }
      if ($.tradesTbody) {
        renderTradesTable();
      }
    }, 100);
  }

  // === שליחת הודעה ל-background (פעם אחת בלבד) ===
  function sendToBackground(action, data) {
    return new Promise((resolve, reject) => {
      try {
        console.log("📤 שולח הודעה ל-background:", { action, data });

        chrome.runtime.sendMessage({ action, data }, (resp) => {
          console.log("📥 קיבלתי תשובה מ-background:", resp);

          if (chrome.runtime.lastError) {
            console.error("❌ שגיאה מ-background:", chrome.runtime.lastError);
            return reject(new Error(chrome.runtime.lastError.message));
          }

          if (resp === undefined || resp === null) {
            console.error("❌ לא קיבלתי תשובה מ-background");
            return reject(new Error("לא קיבלתי תשובה מ-background"));
          }

          console.log("✅ תשובה תקינה מ-background:", resp);
          resolve(resp);
        });
      } catch (e) {
        console.error("❌ שגיאה בשליחה ל-background:", e);
        reject(e);
      }
    });
  }

  // GATE: Auth before UI (compact login inside widget)
  async function ensureAuthGateAndMount() {
    // להרכיב את הווידג'ט קודם, כדי שנוכל לצייר אליו את ה-overlay
    ensureWidget();
    let tokenRes;
    try {
      tokenRes = await sendToBackground("auth.getToken", {});
      if (!tokenRes?.ok || !tokenRes.token) {
        console.log("Auth not available, opening login overlay.");
        await openLoginOverlayOnWidget(); // ← לוגין על הווידג'ט עצמו
      }
    } catch (e) {
      console.warn("Auth not available, continuing without login:", e?.message || e);
    } finally {
      startClock();
      await startPlanCountdownFromStorage(tokenRes);
    }
  }


  // פונקציה לחישוב הזמן עד הנר הבא
  function getSecondsToNextCandle() {
    // determine sampling interval from current timeframe (fallback to SAMPLE_MS)
    const tfSec = (TIMEFRAMES[currentTf] && TIMEFRAMES[currentTf].seconds) ? TIMEFRAMES[currentTf].seconds : Math.max(1, Math.floor(SAMPLE_MS / 1000));
    const intervalMs = tfSec * 1000;

    // compute delay until next rounded boundary (e.g. next 30s, 60s, ...)
    const now = getTimeFromDom();
    // compute next tick strictly after `now` so when `now` is exactly on the boundary
    // we consider the following tick (avoid returning 0 seconds left)
    const nextTick = Math.floor(now / intervalMs) * intervalMs + intervalMs;
    const delay = Math.max(0, nextTick - now);
    const secondsLeft = Math.ceil(delay / 1000);

    return secondsLeft;
  }

  // טיים־פריימים אפשריים - מעודכן לטיים פריים של דקה אחת
  const TIMEFRAMES = {
    '0.5m': { seconds: 30, rsiPeriod: 5, macdFast: 6, macdSlow: 12, macdSignal: 4, momentum: 5 },
    '1m': { seconds: 60, rsiPeriod: 14, macdFast: 12, macdSlow: 26, macdSignal: 9, momentum: 10 },
    '5m': { seconds: 300, rsiPeriod: 14, macdFast: 12, macdSlow: 26, macdSignal: 9, momentum: 10 }
  };
  let currentTf = '0.5m'; // ברירת מחדל: חצי דקה כמו שביקשת
  let RSI_PERIOD = TIMEFRAMES[currentTf].rsiPeriod;

  // === משתנים לנתוני אינדיקטורים ===
  let currentSymbol = '–';
  let currentPrice = '–';
  let currentRsi = '–';
  let currentMacd = {};
  let currentMa = {};
  let currentMomentum = null;

  /**********************
   * STATE
   **********************/
  let sampling = false;
  let botStarted = false; // האם הבוט הופעל
  let sampleTimer = null;
  let clockTimer = null;

  let candles = [];
  let currentCandle = null;
  let lastTfTs = null;
  let lastSignalAt = 0;

  // Anti-noise guards
  let lastSignalBarTs = null;      // מתי נשלח האיתות האחרון (חותמת זמן של הנר)
  const MIN_COOLDOWN_SEC = 30;     // לפחות 30 שניות בין איתותים

  // מונים + היסטוריות
  let buyCount = 0;
  let sellCount = 0;
  let soundEnabled = true; // מצב הצליל - מופעל כברירת מחדל
  const lastSignals = [];   // לתצוגת "4 אחרונים"
  const signalsLog = [];   // ליומן המודאל (עד 80 אחרונים)
  const tradesLog = [];    // ליומן העסקאות (עד 80 אחרונים)
  const statsLog = [];    // ליומן הסטטיסטיקה (נשמר בנפרד)
  const indicatorLog = [];  // ליומן האינדיקטור (נשמר בנפרד)

  // === PENDING SIGNAL STATE ===
  let pendingSignal = null; // { id, side, entry_timing, entry_rule, expiresAtIndex, awaitedPullback, createdAtIndex, horizon, confidence }
  let lastCandleIndex = 0;  // אם כבר קיים אצלך, השתמש בקיים

  let $ = {};

  /**********************
   * PENDING SIGNAL HELPERS
   **********************/

  // יצירת מזהה איתות ויומן
  function createSignalId() {
    return 'sig_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
  }

  // רישום לטבלאת האיתותים
  function logSignalPending(sig) {
    // TODO: החלף בקריאה ל-UI שלך להוסיף שורה ל"ניתוחים/איתותים"
    // שדות מומלצים: side, entry_timing, entry_rule, horizon, status=PENDING, createdAt
    console.log('[SIGNAL][PENDING]', sig);
  }

  // עדכון סטטוס האיתות
  function updateSignalStatus(signalId, status, extra = '') {
    // TODO: עדכן את השורה הקיימת בטבלת האיתותים
    console.log('[SIGNAL][STATUS]', signalId, status, extra);
  }

  // רישום עסקה בפועל (טבלת עסקאות) – נקלט מחיר מה-DOM ברגע הכניסה!
  function logTradeEntryFromSignal(signalId, side, reasonTag) {
    const entryPrice = getPriceFromDom(); // אתה כבר יודע לקרוא מחיר – השתמש בפונקציה הקיימת שלך
    // TODO: הוסף לטבלת העסקאות: {signalId, side, entryPrice, time, reasonTag}
    if (window.__poDebug) console.log('[TRADE][ENTER]', side, 'price=', entryPrice, 'reason=', reasonTag, 'signalId=', signalId);
  }

  // פונקציות זיהוי טריגר
  function didTrigger(side, rule, last, prev) {
    if (!last || !prev) return false;

    if (side === 'SHORT') {
      if (rule === 'next_red') {
        // כניסה בתחילת נר אדום הבא – נבדוק בסגירה: אם הנר הנוכחי אדום, סימן שהיה אדום (אפשר גם בפתיחה)
        return (last.close < last.open);
      }
      if (rule === 'red_breaks_prev_low') {
        // שבירת שפל של הנר הקודם (אפשר לדרוש "סגירה מתחת" או "פריצה תוך-נרית" – כאן סגירה)
        return (last.close < last.open) && (last.close < prev.low);
      }
    } else { // LONG
      if (rule === 'next_green') {
        return (last.close > last.open);
      }
      if (rule === 'green_breaks_prev_high') {
        return (last.close > last.open) && (last.close > prev.high);
      }
    }
    return false;
  }

  function isCounterPullback(side, candle) {
    if (!candle) return false;
    // פולבק נגד הכיוון = נר "נגד" או דשדוש קטן
    if (side === 'SHORT') return (candle.close >= candle.open); // ירוק/דוג'י
    return (candle.close <= candle.open);                       // אדום/דוג'י
  }

  // הערכה בכל סגירת נר (טריגרים וביצוע)
  function onCandleCloseIntegration() {
    if (!pendingSignal) return;

    const idx = lastCandleIndex;
    if (idx >= pendingSignal.expiresAtIndex) {
      updateSignalStatus(pendingSignal.id, 'CANCELED (no trigger)');
      pendingSignal = null;
      return;
    }

    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];

    if (pendingSignal.entry_timing === 'next') {
      // נכניס בתחילת הנר הבא – בפועל מומלץ לסמן כניסה מיד עם פתיחת הנר,
      // אבל אם האירוע אצלך הוא "בסגירה", זה קרוב מספיק – תוכל להזיז למקום של פתיחת נר אם קיים.
      updateSignalStatus(pendingSignal.id, 'ENTERED (next)');
      logTradeEntryFromSignal(pendingSignal.id, pendingSignal.side, 'GPT-next');
      pendingSignal = null;
      return;
    }

    if (pendingSignal.entry_timing === 'after_pullback') {
      // 1) קודם לראות פולבק נגד הכיוון
      if (pendingSignal.awaitedPullback === false) {
        if (isCounterPullback(pendingSignal.side, last)) {
          pendingSignal.awaitedPullback = true; // ראינו פולבק
          updateSignalStatus(pendingSignal.id, 'PENDING (pullback seen)');
          return;
        } else {
          // עדיין לא ראינו פולבק – מחכים
          return;
        }
      }

      // 2) אחרי שראינו פולבק – מחכים לטריגר
      const hit = didTrigger(pendingSignal.side, pendingSignal.entry_rule, last, prev);
      if (hit) {
        updateSignalStatus(pendingSignal.id, `ENTERED (after_pullback / ${pendingSignal.entry_rule})`);
        logTradeEntryFromSignal(pendingSignal.id, pendingSignal.side, `GPT-after_pullback/${pendingSignal.entry_rule}`);
        pendingSignal = null;
        return;
      }
    }
  }

  // === PENDING SIGNAL UI ===

  // עדכון תצוגת ה-Banner
  function renderPendingBanner() {
    const el = document.getElementById('po-pending-banner');
    if (!el) return;

    if (!pendingSignal) {
      el.textContent = '';
      return;
    }

    const left = Math.max(pendingSignal.expiresAtIndex - lastCandleIndex, 0);
    el.textContent = `Pending: ${pendingSignal.side} | ${pendingSignal.entry_timing} | ${pendingSignal.entry_rule} | expires in ${left} candles`;
  }

  // עדכון UI כל X שניות
  function uiTick() {
    renderPendingBanner();

  }

  /**********************
   * UI
   **********************/
  function ensureWidget() {
    if (document.getElementById(WIDGET_ID)) return;

    const host = document.createElement('div');
    host.id = WIDGET_ID;
    Object.assign(host.style, {
      position: 'fixed',
      top: '120px',
      right: '20px',
      zIndex: '2147483647'
    });

    const shadow = host.attachShadow({ mode: 'open' });
    const imageUrl = chrome.runtime.getURL("pesel.png");
    const style = document.createElement('style');

    // === כפתור ו"חלונית נתונים" בתוך ה-shadow של הווידג'ט ===


    // === פונקציית עדכון התוכן של הטבלה ===
    // (הועברה לגלובלי למטה)

    // דוגמת בדיקה ידנית (תמחק אם לא צריך):
    // updateIndicatorsPanel({
    //   symbol: 'JNJ', timeframe: '1m', price: 181.58,
    //   rsi: 63.2, macd: { line: 0.021, signal: 0.013, hist: 0.008 },
    //   ma: { '20': 181.40, '50': 181.20 }
    // });

    style.textContent = `
      /* ===== Widget ===== */
      .widget {
      width: 420px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial !important;
      background: radial-gradient(120% 100% at 100% 0%, #051321 0%, #071525 35%, #0a1730 70%, #08121f 100%);
      color: #e8f6ff;
      border: 1px solid rgba(0, 180, 255, 0.35);
      border-radius: 18px;
      box-shadow: 0 16px 44px rgba(18,130,255,0.35), 0 0 0 1px rgba(0,180,200,0.05) inset;
      overflow-y: auto;
      overflow-x: hidden;
      user-select: none;
      position: relative;
      /* הגבלת גובה עליון - לא יעלה יותר מדי למעלה */
      max-height: calc(100vh - 40px);
      min-top: 20px;
      }
      
      /* התאמות לאנגלית בלבד - עברית נשארת כמו שהיתה */
      .widget[dir="ltr"] {
      direction: ltr;
      }
      
      .widget[dir="ltr"] .grid {
      grid-template-columns: 1fr auto;
      }
      
      .widget[dir="ltr"] .label {
      text-align: left;
      }
      
      .widget[dir="ltr"] .value {
      text-align: right;
      }
      
      /* Scrollbar יפה */
      .widget::-webkit-scrollbar {
      width: 8px;
      }
      
      .widget::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      }
      
      .widget::-webkit-scrollbar-thumb {
      background: rgba(0, 180, 255, 0.5);
      border-radius: 4px;
      }
      
      .widget::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 180, 255, 0.7);
      }
      /* Watermark עדין בתוך הקופסה */
      .widget::before {
      content: "";
      position: absolute;
      inset: 0;
      background: url("${imageUrl}") center / cover no-repeat;
      opacity: 0.1;           /* עדינות ה-watermark */
      pointer-events: none;   /* שלא יחסום קליקים */
      }

      .header {
      padding: 12px 16px;
      background: #000000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: move;
      border-bottom: 1px solid rgba(0, 180, 255, 0.55);
      letter-spacing: .2px;
      color: white;
      text-shadow: 0 0 6px rgba(0, 200, 255, 0.6);
      box-shadow: 0 0 12px rgba(0, 180, 255, 0.6),
            0 0 20px rgba(0, 120, 255, 0.4);
      }
      
      .pending-banner {
      padding: 8px 16px;
      background: linear-gradient(90deg, #ff6b35, #f7931e);
      color: white;
      font-size: 12px;
      font-weight: 600;
      text-align: center;
      border-bottom: 1px solid rgba(255, 107, 53, 0.3);
      display: none;
      animation: pulse 2s infinite;
      }
      
      .pending-banner:not(:empty) {
      display: block;
      }
      
      @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
      }
      
      .success-rate-header {
      background: transparent;
      border: 2px solid #00e676;
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 14px;
      min-width: 35px;
      font-weight: 900;
      color: #00e676;
      text-shadow: 0 0 6px rgba(0, 230, 118, 0.6);
      box-shadow: 0 0 8px rgba(0, 230, 118, 0.3);
      text-align: center;
      }

      .body { padding: 14px 16px 16px; display: grid; gap: 12px; }
      .grid { display: grid; grid-template-columns: auto 1fr; gap: 6px 10px; align-items: center; }
      .label { color: #93c2ff; font-size: 14px; opacity: .9; text-align: right; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
      .value { font-weight: 700; text-align: left; }
      .value.price { font-size: 18px; letter-spacing: .2px; color:#b8f3ff; }
      
      /* צבעים דינמיים לאחוז הרווח */
      .value.profit-high { color: #ffffff; } /* 89% ומעלה - לבן */
      .value.profit-low { 
      color: #ff4444; 
      text-shadow: 0 0 10px #ff4444, 0 0 20px #ff4444;
      animation: profitGlow 2s ease-in-out infinite;
      }
      
      @keyframes profitGlow {
      0%, 100% { text-shadow: 0 0 10px #ff4444, 0 0 20px #ff4444; }
      50% { text-shadow: 0 0 15px #ff6666, 0 0 25px #ff6666, 0 0 35px #ff4444; }
      }

      .controls { display: flex; gap: 8px; flex-wrap: wrap; }
      select, button, a.link {
      flex:1; border:1px solid rgba(64,148,255,0.5);
      background: linear-gradient(180deg,#071b35,#0a2447);
      color:#e8f6ff; padding:9px 12px; border-radius: 12px; font-weight:700;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial !important;
      text-decoration:none; text-align:center;
      transition: transform .06s, background .2s, border-color .2s, box-shadow .2s;
      box-shadow: 0 0 0 rgba(0,200,255,0);
      }
      select:focus, button:focus, a.link:focus { outline: none; }
      button:hover, select:hover, a.link:hover {
      background: linear-gradient(180deg,#0a2345,#0d2d59);
      border-color: #46b4ff;
      box-shadow: 0 0 16px rgba(0,200,255,0.28), 0 0 2px rgba(0,200,255,0.6) inset;
      transform: translateY(-1px);
      }
      .btn-stop { border-color:#ff6b6b; }
      .btn-gpt { border-color:#10b981; background: linear-gradient(180deg,#0a2345,#0d2d59); }

      #tfSelect { background-color:#0b1d36; color:#ffffff; }
      #tfSelect option{ background-color:#0b1d36; color:#ffffff; }

      .signal {
      padding: 14px;
      border-radius: 14px;
      text-align: center;
      font-weight: bold;
      font-size: 16px;
      font-family: Arial, sans-serif !important;
      letter-spacing: 0.2px;
      background: radial-gradient(120% 120% at 50% 120%, rgba(0,180,200,0.18), rgba(10,24,48,0.75));
      border: 1px solid rgba(64,148,255,0.45);
      color:#e8f6ff;
      text-shadow: 0 2px 12px rgba(0,200,255,0.25);
      }
      
      /* וידוא שכל הטקסט בתוך המסגרת יהיה באותו פונט */
      .signal * {
      font-weight: bold !important;
      font-size: 16px !important;
      font-family: Arial, sans-serif !important;
      }
      .signal.buy {
      background: radial-gradient(120% 120% at 50% 120%, rgba(0,200,155,0.20), rgba(10,24,48,0.75));
      border-color: rgba(0,200,155,0.55);
      box-shadow: 0 0 24px rgba(0,200,155,0.22) inset;
      }
      .signal.sell {
      background: radial-gradient(120% 120% at 50% 120%, rgba(255,80,100,0.20), rgba(10,24,48,0.75));
      border-color: rgba(255,80,100,0.55);
      box-shadow: 0 0 24px rgba(255,80,100,0.22) inset;
      }
      .sub { text-align: center; font-size: 12px; color: #9fdfff; }

      /* מסגרת גרסת נסיון בורדו עדין - צמודה לחלוטין לקצוות */
      .trial-frame {
      background: linear-gradient(135deg, #8B1538, #A02040);
      border: none;
      border-radius: 0;
      padding: 8px 0;
      margin: 0;
      text-align: center;
      font-size: 13px;
      color: #ffffff;
      font-weight: 600;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      box-shadow: 0 2px 8px rgba(139, 21, 56, 0.3);
      transition: all 0.3s ease;
      width: 100%;
      position: relative;
      left: 0;
      right: 0;
      margin-left: 0;
      margin-right: 0;
      padding-left: 0;
      padding-right: 0;
      }
      .trial-frame:hover {
      background: linear-gradient(135deg, #A02040, #B0254A);
      transform: none;
      }

      .rsi-line { display:flex; justify-content:space-between; align-items:center; font-size: 12px; color: #9fdfff; padding: 0 2px; }
      .rsi-val { font-weight:900; color:#c9fffe; }


      
      /* אחוז הצלחה */
      .success-rate {
      display: flex;
      justify-content: center;
      margin: 8px 0;
      }
      
      .rate-box {
      background: linear-gradient(180deg, #ffd700, #ffed4e);
      border: 2px solid #ffb300;
      border-radius: 12px;
      padding: 12px 20px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
      min-width: 140px;
      }
      
      .rate-label {
      display: block;
      font-size: 12px;
      color: #8b6914;
      font-weight: 700;
      margin-bottom: 4px;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
      }
      
      .rate-value {
      display: block;
      font-size: 20px;
      color: #8b6914;
      font-weight: 900;
      text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
      }

      .recent {
      background: linear-gradient(180deg,#071b35,#0a2242);
      border:1px solid rgba(64,148,255,0.35); border-radius:12px; padding:5px 8px;
      display:flex; flex-direction:column; gap:3px;
      }
      .recent-title { font-size:12px; color:#9fdfff; margin-bottom:2px; }
      .chip {
      display:flex; justify-content:space-between; align-items:center; gap:10px;
      padding:6px 10px; border-radius:999px; border:1px solid rgba(64,148,255,0.35);
      background: linear-gradient(180deg,#071b35,#0a2242); font-size:12px; color:#e8f6ff;
      }
      .chip.buy { border-color: rgba(0,200,155,0.55); }
      .chip.sell { border-color: rgba(255,80,100,0.55); }
      .chip .kind { font-weight:900; }
      .chip .time { color:#9fdfff; }
      .chip .rsi { font-weight:800; }

       .links { display:flex; gap:8px; margin-top:8px; }
       .links .link { font-size:14px; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }

      /* ===== עיצוב פאנל אוטומציה ===== */
      .automation-panel {
      background: linear-gradient(180deg,#071b35,#0a2242);
      border: 1px solid rgba(64,148,255,0.35);
      border-radius: 12px;
      padding: 12px 14px;
      margin-top: 8px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial !important;
      }

      .automation-panel .panel-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      }

      .automation-toggle {
      padding: 8px 24px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      border: 1px solid rgba(0, 200, 155, 0.5);
      background: linear-gradient(180deg,#0a2345,#0d2d59);
      color: #00e676;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial !important;
      min-width: 80px;
      }

      .automation-toggle:hover {
      background: linear-gradient(180deg,#0d2d59,#0f3566);
      border-color: #00e676;
      box-shadow: 0 0 12px rgba(0, 230, 118, 0.3);
      }

      .automation-toggle.active {
      background: linear-gradient(180deg,#7f1d1d,#9f1d1d);
      border-color: #ef4444;
      color: #fecaca;
      }

      .automation-toggle.active:hover {
      background: linear-gradient(180deg,#9f1d1d,#b91c1c);
      border-color: #f87171;
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
      }
      
      /* סטייל מיוחד לכפתור אוטומציה כשהוא פעיל - אדום כמו הכחול */
      #automationToggle.active {
      background: linear-gradient(45deg, #ff3333, #ff6666, #ff9999) !important;
      color: white !important;
      box-shadow: 0 0 12px rgba(255, 51, 51, 0.6), 0 0 20px rgba(255, 102, 102, 0.5) !important;
      }
      
      #automationToggle.active:hover {
      background: linear-gradient(45deg, #cc0000, #ff3333, #ff6666) !important;
      box-shadow: 0 0 18px rgba(204, 0, 0, 0.9), 0 0 28px rgba(255, 51, 51, 0.7) !important;
      transform: scale(1.05) !important;
      }
      
      /* כפתור אוטומציה - מצב רגיל (כחול) */
      #automationToggle:not(.active) {
      background: linear-gradient(45deg, #0066ff, #0099ff, #00ccff) !important;
      color: white !important;
      box-shadow: 0 0 12px rgba(0, 102, 255, 0.6), 0 0 20px rgba(0, 153, 255, 0.5) !important;
      }

      .automation-controls input {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(64, 148, 255, 0.5);
      border-radius: 8px;
      padding: 6px 10px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial !important;
      color: #e8f6ff;
      font-size: 13px;
      font-weight: 600;
      width: 140px;
      box-sizing: border-box;
      text-align: center;
      }

      .automation-controls input:focus {
      outline: none;
      border-color: #46b4ff;
      box-shadow: 0 0 8px rgba(0, 200, 255, 0.3);
      }

      .automation-controls input::placeholder {
      color: #9fdfff;
      opacity: 0.7;
      }

      .balance-display {
      text-align: center;
      margin-bottom: 15px;
      padding: 8px;
      background: rgba(0, 150, 255, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(0, 150, 255, 0.3);
      font-size: 14px;
      font-weight: 600;
      color: white !important;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial !important;
      }
      
      /* התאמה לאנגלית - סדר משמאל לימין */
      .widget[dir="ltr"] .balance-display {
      direction: ltr;
      }

      .balance-display span {
      font-size: 16px;
      font-weight: 700;
      color: white !important;
      }

      .automation-status {
      margin-top: 12px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      border: 1px solid rgba(64, 148, 255, 0.2);
      }

      .status-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 12px;
      }

      .status-line:last-child {
      margin-bottom: 0;
      }

      .status-line .label {
      color: #9fdfff;
      opacity: 0.9;
      }

      .status-line .value {
      font-weight: 700;
      color: #c9fffe;
      }

      /* ===== Modal (Signals) ===== */
      .modal {
      position: fixed; inset: 0; display: none; align-items: center; justify-content: center;
      background: radial-gradient(100% 120% at 20% 15%, rgba(3,12,24,0.85), rgba(2,8,16,0.92));
      backdrop-filter: blur(3px);
      z-index: 2147483647;
      }
      .modal.show { display:flex; }
      .modal-card {
      width: min(1400px, 98vw);
      height: 800px;
      overflow: hidden;
      background: linear-gradient(180deg,#08182b 0%, #0a1e37 55%, #091a2e 100%);
      color: #e6f6ff;
      border: 1px solid rgba(0, 180, 255, 0.28);
      border-radius: 16px;
      box-shadow: 0 18px 54px rgba(18,130,255,0.28),
            0 0 0 1px rgba(0, 200, 255, 0.06) inset,
            0 0 40px rgba(0,120,255,0.12);
      display: flex;
      flex-direction: column;
      }
      
      /* רוחב מיוחד רק לחלון העסקאות */
      #tradesModal .modal-card {
      width: min(1800px, 95vw);
      }
      
      /* רוחב וגובה מיוחדים לחלון הסטטיסטיקה */
      #statsModal .modal-card {
      width: min(650px, 90vw);
      height: 800px;
      }

        .modal-head {
      padding: 12px 16px;
      background: #000000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border-bottom: 1px solid rgba(0, 180, 255, 0.55);
      font-weight: 800;
      color: white;
      letter-spacing: .2px;
      }
      .modal-body {
      padding: 12px 14px;
      overflow-y: auto;     /* מאפשר גלילה אנכית */
      flex: 1 1 auto;       /* הגוף יתפוס את הגובה הפנוי בתוך .modal-card */
      min-height: 0;        /* חובה כדי ש-flex יאפשר גלילה פנימית */
      }


      .modal-title { display: flex; align-items: center; justify-content: center; flex: 1 1 auto; min-width: 0; }
      
      .modal-head .reset-btn {
      background: rgba(255, 165, 0, 0.2);
      border: 1px solid rgba(255, 165, 0, 0.4);
      color: #ffa500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
      min-width: 80px;
      }
      
      .modal-head .reset-btn:hover {
      background:
        border-color: rgba(255, 165, 0, 0.6);
        transform: translateY(-1px);
      }
      .close-btn {
        flex: 0 0 auto;
        padding: 6px 10px;
        font-size: 12px;
        line-height: 1;
        border-radius: 10px;
        border: 1px solid rgba(0, 180, 255, 0.45);
        background: linear-gradient(180deg,#07203f,#0a2c58);
        color: #e6f6ff;
        cursor: pointer;
        box-shadow: 0 0 0 rgba(0,200,255,0);
        max-width: fit-content;
      }
      .close-btn:hover {
        background:#0b356c;
        border-color:#46b4ff;
        box-shadow: 0 0 12px rgba(0,200,255,0.28);
      }

      .panel {
        background: linear-gradient(180deg,#081a30,#0a2342);
        border: 1px solid rgba(0,180,255,0.28);
        border-radius: 14px;
        padding: 12px 14px;
        box-shadow: inset 0 0 18px rgba(0, 200, 255, 0.06);
      }

      .panel-title { 
        display:flex; 
        gap:10px; 
        align-items:center; 
        font-weight: bold !important;
        font-size: 16px !important;
        font-family: Arial, sans-serif !important;
        color:#c9fffe; 
        margin-bottom:10px; 
        letter-spacing:.2px; 
      }
      
      /* וידוא שכל הטקסט בתוך panel-title יהיה באותו פונט */
      .panel-title * {
        font-weight: bold !important;
        font-size: 16px !important;
        font-family: Arial, sans-serif !important;
      }
      
      .modal-title { 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        flex: 1 1 auto; 
        min-width: 0; 
        font-weight: bold !important;
        font-size: 16px !important;
        font-family: Arial, sans-serif !important;
      }
      
      /* וידוא שכל הטקסט בתוך modal-title יהיה באותו פונט */
      .modal-title * {
        font-weight: bold !important;
        font-size: 16px !important;
        font-family: Arial, sans-serif !important;
      }
      
      /* כותרות טבלה */
      table thead th {
        font-weight: bold !important;
        font-size: 16px !important;
        font-family: Arial, sans-serif !important;
      }
      
      /* וידוא שכל הטקסט בתוך כותרות הטבלה יהיה באותו פונט */
      table thead th * {
        font-weight: bold !important;
        font-size: 16px !important;
        font-family: Arial, sans-serif !important;
      }
      
      .reset-btn {
        margin-left: 0;
        padding: 6px 10px;
        font-size: 16px !important;
        font-weight: bold !important;
        font-family: Arial, sans-serif !important;
        line-height: 1;
        border-radius: 10px;
        border: 1px solid rgba(255, 80, 100, 0.45);
        background: linear-gradient(180deg,#07203f,#0a2c58);
        color: #e6f6ff;
        cursor: pointer;
        box-shadow: 0 0 0 rgba(255,80,100,0);
        transition: all 0.2s ease;
        max-width: fit-content;
      }
      .reset-btn:hover {
        background:#0b356c;
        border-color:#ff6b6b;
        box-shadow: 0 0 12px rgba(255,80,100,0.28);
      }
      
      /* טבלת ניתוחים */
      .po-table{width:100%; border-collapse: collapse; font-size: 12px; background:#0b1220; color:#e5e7eb; border-radius:10px; overflow:hidden}
      .po-table th, .po-table td{border-bottom:1px solid #1f2937; padding:8px; vertical-align: top}
      /* צמצום קל של עמודות אימות כדי למנוע גלילה אופקית באנגלית */
      #tradesModal table th:nth-child(9),  /* Verification */
      #tradesModal table th:nth-child(11), /* Verification 1 */
      #tradesModal table th:nth-child(13), /* Verification 2 */
      #tradesModal table th:nth-child(15)  /* Verification 3 */ { width: 110px; }
      #tradesModal table td:nth-child(9),
      #tradesModal table td:nth-child(11),
      #tradesModal table td:nth-child(13),
      #tradesModal table td:nth-child(15) { max-width: 110px; }
      .po-table th{background:#111827; position:sticky; top:0}
      .po-thumb{width:96px; height:64px; object-fit:cover; border-radius:6px; border:1px solid #1f2937; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer;}
      .po-thumb:hover{transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,180,255,0.3);}
      .sig-badge{display:inline-block; padding:2px 6px; border-radius:999px; font-weight:700}
      .sig-long{background:#064e3b; color:#a7f3d0}
      .sig-short{background:#7f1d1d; color:#fecaca}
      .sig-none{background:#374151; color:#cbd5e1}
      .po-reasons{white-space: pre-line}
      
      /* Lightbox (חלון הגדלה) */
      #po-lightbox{
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        display: none;
        z-index: 2147483647 !important;
        background: rgba(0,0,0,0.9) !important;
        align-items: center;
        justify-content: center;
      }
      #po-lightbox[open]{
        display: flex !important;
      }
      #po-lightbox .po-lightbox__backdrop{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.85);
        cursor: pointer;
      }
      #po-lightbox .po-lightbox__panel{
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        width: 100%;
        height: 100%;
      }
      #po-lightbox img{
        max-width: 90vw;
        max-height: 90vh;
        border-radius: 12px;
        box-shadow: 0 20px 80px rgba(0,0,0,0.8);
        pointer-events: auto;
        transition: transform 0.15s ease;
        object-fit: contain;
      }
      #po-lightbox img.zoom{
        transform: scale(1.6);
        cursor: zoom-out;
      }
      #po-lightbox .po-lightbox__close{
        position: absolute;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        border: 0;
        background: #111827;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        transition: all 0.2s ease;
        z-index: 2147483648;
      }
      #po-lightbox .po-lightbox__close:hover{
        background: #1f2937;
        transform: scale(1.1);
      }
      
      /* סטטיסטיקות עסקאות */
      .trades-stats {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        justify-content: center;
      }
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 14px;
        border: 2px solid;
      }
      
      .stat-item.success {
        background: rgba(0, 200, 155, 0.15);
        border-color: rgba(0, 200, 155, 0.6);
        color: #d6fff3;
      }
      
      .stat-item.failure {
        background: rgba(255, 80, 100, 0.15);
        border-color: rgba(255, 80, 100, 0.6);
        color: #ffe1e6;
      }
      
      .stat-label {
        font-size: 13px;
        opacity: 0.9;
      }
      
      .stat-count {
        font-size: 16px;
        font-weight: 900;
      }

      table { width: 100%; border-collapse: collapse; font-size: 15px; }
      thead th {
        position: sticky; top: 0;
        background: linear-gradient(180deg,#061a31,#072040);
        color: #cff1ff;
        text-align: center;
        padding: 8px 10px;
        border-bottom: 1px solid rgba(0,180,255,0.32);
        font-weight: 800;
      }
      tbody td {
        padding: 8px 10px;
        border-bottom: 1px solid rgba(0,180,255,0.14);
        color: #e6f6ff;
        text-align: center;
      }

      tbody tr:hover { background: rgba(0,200,255,0.06); }

      .pill {
        display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px; border-radius: 999px; font-weight: 900; letter-spacing: .2px;
      }
      .pill.buy  { background: rgba(0,200,155,0.18);  border: 1px solid rgba(0,200,155,0.55);  color: #d6fff3; box-shadow: inset 0 0 10px rgba(0,200,155,0.15); }
      .pill.sell { background: rgba(255,80,100,0.18); border: 1px solid rgba(255,80,100,0.55); color: #ffe1e6; box-shadow: inset 0 0 10px rgba(255,80,100,0.15); }

      .sym { display:flex; align-items:center; gap:6px; }

      /* ===== עיצוב להודעות GPT ===== */
      .signal-message {
        direction: rtl;
        display: table;
        width: 100%;
        border-collapse: collapse;
        margin-top: 5px;
        font-size: 14px;
      }
      .signal-message .row { display: table-row; }
      .signal-message .label,
      .signal-message .value { display: table-cell; padding: 4px 8px; vertical-align: top; }
      .signal-message .label {
        font-weight: bold; color: #9fdfff; text-align: right; white-space: nowrap;
      }
      .signal-message .value { text-align: left; color: #00e0ff; font-weight: bold; }

      .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
      .dot.green { background-color: #00e676; box-shadow: 0 0 6px rgba(0,230,118,.7); }
      .dot.red   { background-color: #ff5252; box-shadow: 0 0 6px rgba(255,82,82,.7); }
      .dot.gray  { background-color: #9aa4ad; box-shadow: 0 0 6px rgba(154,164,173,.6); }

      .btn-gpt {
        background: linear-gradient(45deg, #ff3d00, #ff9100, #ffc400);
        color: white; font-weight: bold; border: none; border-radius: 8px;
        padding: 10px 18px; cursor: pointer;
        font-size: 16px;
        box-shadow: 0 0 12px rgba(255, 80, 0, 0.6), 0 0 20px rgba(255, 140, 0, 0.5);
        transition: all 0.3s ease;
      }
      .btn-gpt:hover {
        background: linear-gradient(45deg, #ff6d00, #ff3d00, #ff9100);
        box-shadow: 0 0 18px rgba(255, 90, 0, 0.9), 0 0 28px rgba(255, 160, 0, 0.7);
        transform: scale(1.05);
      }
      .btn-gpt:active {
        transform: scale(0.95);
        background: linear-gradient(45deg, #e65100, #ff3d00, #ff6d00);
      }
      
      /* הנפשת נשימה לכפתור GPT כשהוא בפעולה */
      .btn-gpt.analyzing {
        animation: breathing 2s ease-in-out infinite;
        background: linear-gradient(45deg, #ff6d00, #ff9100, #ffc400);
        box-shadow: 0 0 20px rgba(255, 100, 0, 0.8), 0 0 30px rgba(255, 160, 0, 0.6);
      }
      
      @keyframes breathing {
        0%, 100% { 
          transform: scale(1);
          box-shadow: 0 0 20px rgba(255, 100, 0, 0.8), 0 0 30px rgba(255, 160, 0, 0.6);
        }
        50% { 
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(255, 120, 0, 1), 0 0 35px rgba(255, 180, 0, 0.8);
        }
      }
      
      /* כפתור התחל בסגנון דומה ל-GPT אבל בגוונים של כחול */
      #startBtn {
        background: linear-gradient(45deg, #0066ff, #0099ff, #00ccff) !important;
        color: white !important; font-weight: bold !important; border: none !important; border-radius: 8px !important;
        padding: 10px 18px !important; cursor: pointer !important;
        font-size: 16px !important;
        box-shadow: 0 0 12px rgba(0, 102, 255, 0.6), 0 0 20px rgba(0, 153, 255, 0.5) !important;
        transition: all 0.3s ease !important;
      }
      #startBtn:hover {
        background: linear-gradient(45deg, #0052cc, #0066ff, #0099ff) !important;
        box-shadow: 0 0 18px rgba(0, 82, 204, 0.9), 0 0 28px rgba(0, 102, 255, 0.7) !important;
        transform: scale(1.05) !important;
      }
      #startBtn:active {
        transform: scale(0.95) !important;
        background: linear-gradient(45deg, #003d99, #0066ff, #0052cc) !important;
      }

      .header { display: flex; justify-content: space-between; align-items: center; }
      .header .title { flex: 1; text-align: center; font-weight: bold; font-size: 20px; font-family: 'Segoe Script', 'Comic Sans MS', 'Trebuchet MS', cursive; letter-spacing: 1px; }
      .header-controls { display: flex; align-items: center; }
      
      /* בורר שפות */
      .language-selector {
        margin-right: 10px;
        padding: 4px 6px;
        border-radius: 6px;
        border: 1px solid rgba(0,180,255,0.5);
        background: rgba(0,0,0,0.3);
        color: #e8f6ff;
        font-size: 12px;
        cursor: pointer;
        outline: none;
        width: 35px;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        flex-shrink: 0;
        position: relative;
        z-index: 1000;
      }
      
      .language-selector:hover {
        border-color: #46b4ff;
        box-shadow: 0 0 8px rgba(0,200,255,0.3);
      }
      
      .language-selector option {
        background: #0b1220;
        color: #e8f6ff;
        border: 1px solid rgba(0,180,255,0.3);
        padding: 4px;
      }
      
      
      /* סימן אוטומציה מהבהב */
      .automation-indicator {
        color: #00ff88;
        font-weight: bold;
        animation: blink 1s infinite;
        margin-left: 8px;
        font-size: 16px;
        align-self: center;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
      
      /* ===== אייקון צליל ===== */
      .sound-icon {
        cursor: pointer;
        transition: all 0.3s ease;
        user-select: none;
      }
      .sound-icon:hover {
        transform: scale(1.1);
        filter: brightness(1.2);
      }

      /* ===== נורה למצב מערכת ===== */
      #runState {
        display: inline-block;
        width: 20px; height: 20px; border-radius: 50%;
        margin-left: 10px;
        box-shadow: 0 0 12px rgba(0,0,0,0.6);
      }
      #runState.orange { background-color: orange; box-shadow: 0 0 15px orange, 0 0 25px rgba(255,165,0,0.6); }
      #runState.red { background-color: red; box-shadow: 0 0 15px red, 0 0 25px rgba(255, 0, 0, 0.6); }
      #runState.green  { background-color: #00e676; box-shadow: 0 0 15px #00e676, 0 0 25px rgba(0,230,118,0.6); animation: blink 1s infinite; }

      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

      /* ===== Login overlay INSIDE the widget ===== */
      #po-login-overlay{
        position:absolute;
        inset:0;
        display:none;
        align-items:center;
        justify-content:center;
        background:rgba(0,0,0,.65);
        z-index:2147483647;
        backdrop-filter: blur(2px);

        /* זה הקסם: קליקים "עוברים" מתחתיו לגריפת הווידג'ט */
        pointer-events: none;
      }

      #po-login-overlay.open { display:flex; }

      #po-login-card{
        width:min(340px, calc(100% - 24px));
        background:#0b172b;
        color:#e6f6ff;
        border:1px solid rgba(0,180,255,.35);
        border-radius:14px;
        box-shadow:0 16px 44px rgba(18,130,255,.35);
        padding:14px;
        font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;
        pointer-events: auto;
        text-align:right;
      }

      #po-login-card .title{
        display:flex; align-items:center; justify-content:center;
        font-weight:900; font-size:16px; margin-bottom:8px; 
        cursor: move;
        user-select: none;
      }

      #po-login-card input{
        width:95%; padding:10px; border-radius:10px;
        border:1px solid rgba(0,180,255,.35);
        background:#0a2242; color:#fff;
      }

      #po-login-card button.go{
        width:100%; margin-top:12px; padding:10px; border-radius:10px;
        border:1px solid rgba(0,180,255,.55);
        background:linear-gradient(45deg,#0066ff,#00ccff);
        color:#fff; font-weight:800; cursor:pointer;
      }
      #po-login-err{ color:#ff6b6b; min-height:18px; margin-top:8px; font-size:12px }
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'widget';
    wrapper.innerHTML = `
      <div class="header" id="dragHandle">
        <div class="success-rate-header" id="headerSuccessRate">0%</div>
        <span id="automationIndicator" class="automation-indicator" style="display: none;">A</span>
        <div class="title">OPtimatraDE</div>
        <div class="header-controls">
          <select id="languageSelect" class="language-selector">
            <option value="he">עב</option>
            <option value="en">EN</option>
          </select>
          <span id="soundIcon" class="sound-icon" style="cursor: pointer; margin-right: 10px; font-size: 18px;">🔊</span>
          <span id="runState" class="light red"></span>
        </div>
      </div>
      
      <!-- Pending Signal Banner -->
      <div id="po-pending-banner" class="pending-banner"></div>

      <!-- מסגרת גרסת נסיון אפורה - מחוץ ל-body כדי שתהיה צמודה לקצוות -->
      <div class="trial-frame" id="trialFrame"></div>

      <div class="body">
        <div class="grid">
          <div class="value" id="sym">—</div><div class="label">סימבול</div>
          <div class="value" id="profitPercent">—</div><div class="label">אחוז רווח</div>
          <div class="value price" id="price">—</div><div class="label">מחיר</div>
          <div class="value" id="clock">—</div><div class="label">שעה</div>
          <div class="value" id="count">0</div><div class="label">נרות נדגמו</div>
          <select id="tfSelect">
            <option value="0.5m" selected>חצי דקה</option>
          </select>
          <div class="label">טיים פריים</div>
        </div>

        <div class="controls">
          <button id="startBtn">התחל</button>
        </div>

        <div class="signal" id="signal">ממתין להפעלת הבוט</div>
        <div class="sub" id="signalMeta"></div>
        <div class="links">
          <a href="#" class="link" id="signalsLink">📡 איתותים</a>
          <a href="#" class="link" id="tradesLink">📊 עסקאות</a>
        </div>
        <div class="links">
          <a href="#" class="link" id="statsLink" style="width: 100%; text-align: center;">📈 סטטיסטיקה</a>
        </div>

        <!-- פאנל מערכת אוטומציה -->
        <div class="automation-panel" id="automationPanel">
          <div class="panel-title" style="flex-direction: column; align-items: center; gap: 8px;">
            <button id="automationToggle" class="automation-toggle" style="color: white !important; font-weight: bold !important; border: none !important; border-radius: 8px !important; padding: 10px 18px !important; cursor: pointer !important; font-size: 16px !important; transition: all 0.3s ease !important; width: 100% !important; font-family: Arial, sans-serif !important;">הפעל מסחר אוטומטי</button>
          </div>
          
          <div class="automation-controls" id="automationControls">
            <div class="balance-display" id="balanceDisplayContainer">
              <span id="currentBalanceDisplay">—</span> $ :<span id="currentBalanceLabel">יתרה נוכחית</span>
            </div>
            <div class="grid">
              <input type="number" id="entryAmount" placeholder="Amount" min="1" step="0.01">
              <div class="label">סכום כניסה ראשונית</div>
              
              <input type="number" id="stopLoss" placeholder="סטופ לוס" min="1" step="0.01">
              <div class="label">סטופ לוס</div>
              
              <input type="number" id="takeProfit" placeholder="טייק פרופיט" min="1" step="0.01">
              <div class="label">טייק פרופיט</div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal" id="signalsModal" aria-hidden="true">
        <div class="modal-card">
          <div class="modal-head">
            <div class="modal-title" style="font-family: 'Segoe Script', 'Comic Sans MS', 'Trebuchet MS', cursive; font-size: 18px; flex: 1; text-align: center;">OPtimatraDE</div>
            <button class="close-btn" id="signalsCloseBtn">❌ <span id="signalsCloseLabel">Close</span></button>
          </div>
          <div class="modal-body">
            <div class="panel">
              <div class="panel-title">
                📜 <span id="signalsHistoryTitle"></span>
                <button class="reset-btn" id="signalsResetBtn">Reset</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>סימבול</th>
                    <th>שעה</th>
                    <th>איתות</th>
                    <th>מחיר</th>
                    <th>משך</th>
                  </tr>
                </thead>
                <tbody id="signalsTbody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="modal" id="tradesModal" aria-hidden="true">
        <div class="modal-card">
          <div class="modal-head">
            <div class="modal-title" style="font-family: 'Segoe Script', 'Comic Sans MS', 'Trebuchet MS', cursive; font-size: 18px; flex: 1; text-align: center;">OPtimatraDE</div>
            <button class="close-btn" id="tradesCloseBtn">❌ <span id="tradesCloseLabel">Close</span></button>
          </div>
          <div class="modal-body">
            <div class="panel">
              <div class="panel-title">
                📊 <span id="tradesHistoryTitle"></span>
                <button class="reset-btn" id="tradesResetBtn">Reset</button>
              </div>
              
              <!-- סטטיסטיקות עסקאות -->
              <div class="trades-stats">
                <div class="stat-item success">
                  <span class="stat-label">הצליח</span>
                  <span class="stat-count" id="successCount">0</span>
                </div>
                <div class="stat-item failure">
                  <span class="stat-label">נכשל</span>
                  <span class="stat-count" id="failureCount">0</span>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>סימבול</th>
                    <th>תאריך</th>
                    <th>זמן כניסה</th>
                    <th>זמן סגירה</th>
                    <th>איתות</th>
                    <th>מחיר כניסה</th>
                    <th>משך</th>
                    <th>מחיר סגירה</th>
                    <th>אימות</th>
                    <th>גיבוי 1</th>
                    <th>אימות 1</th>
                    <th>גיבוי 2</th>
                    <th>אימות 2</th>
                    <th>גיבוי 3</th>
                    <th>אימות 3</th>
                    <th>פעולה</th>
                  </tr>
                </thead>
                <tbody id="tradesTbody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>



      <div class="modal" id="statsModal" aria-hidden="true">
        <div class="modal-card">
          <div class="modal-head">
            <div class="modal-title" style="font-family: 'Segoe Script', 'Comic Sans MS', 'Trebuchet MS', cursive; font-size: 18px; flex: 1; text-align: center;">OPtimatraDE</div>
            <button class="close-btn" id="statsCloseBtn">❌ <span id="statsCloseLabel">Close</span></button>
          </div>
          <div class="modal-body">
              <div class="panel">
                <div class="panel-title">
                  📈 <span id="statsPanelTitle">Statistics Panel</span>
                  <button class="reset-btn" id="statsResetBtn">Reset</button>
                </div>
              <div class="stats-content">
                <!-- כאן יהיה תוכן הסטטיסטיקה בעתיד -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    shadow.appendChild(style);
    shadow.appendChild(wrapper);
    document.body.appendChild(host);

    $ = {
      host, shadow,
      widget: wrapper,              // ← חשוב!
      runState: shadow.getElementById('runState'),
      soundIcon: shadow.getElementById('soundIcon'),
      languageSelect: shadow.getElementById('languageSelect'),
      dragHandle: shadow.getElementById('dragHandle'),
      sym: shadow.getElementById('sym'),
      profitPercent: shadow.getElementById('profitPercent'),
      price: shadow.getElementById('price'),
      clock: shadow.getElementById('clock'),
      count: shadow.getElementById('count'),
      startBtn: shadow.getElementById('startBtn'),
      tfSelect: shadow.getElementById('tfSelect'),
      signal: shadow.getElementById('signal'),
      signalMeta: shadow.getElementById('signalMeta'),
      trialFrame: shadow.getElementById('trialFrame'),
      rsiVal: shadow.getElementById('rsiVal'),

      recentList: shadow.getElementById('recentList'),
      signalsLink: shadow.getElementById('signalsLink'),
      tradesLink: shadow.getElementById('tradesLink'),
      signalsModal: shadow.getElementById('signalsModal'),
      signalsCloseBtn: shadow.getElementById('signalsCloseBtn'),
      signalsTbody: shadow.getElementById('signalsTbody'),
      signalsResetBtn: shadow.getElementById('signalsResetBtn'),
      tradesModal: shadow.getElementById('tradesModal'),
      tradesCloseBtn: shadow.getElementById('tradesCloseBtn'),
      tradesTbody: shadow.getElementById('tradesTbody'),
      tradesResetBtn: shadow.getElementById('tradesResetBtn'),
      statsLink: shadow.getElementById('statsLink'),
      statsModal: shadow.getElementById('statsModal'),
      statsCloseBtn: shadow.getElementById('statsCloseBtn'),
      statsResetBtn: shadow.getElementById('statsResetBtn'),

      // אלמנטים למערכת אוטומציה
      automationToggle: shadow.getElementById('automationToggle'),
      automationControls: shadow.getElementById('automationControls'),
      entryAmount: shadow.getElementById('entryAmount'),
      stopLoss: shadow.getElementById('stopLoss'),
      takeProfit: shadow.getElementById('takeProfit'),
      automationStatusText: shadow.getElementById('automationStatusText'),
      currentBalanceDisplay: shadow.getElementById('currentBalanceDisplay'),
      currentBalanceLabel: shadow.getElementById('currentBalanceLabel'),
      balanceDisplayContainer: shadow.getElementById('balanceDisplayContainer')
    };

    // אירועים
    $.startBtn.addEventListener('click', toggleSampling);
    $.tfSelect.addEventListener('change', (e) => {
      currentTf = e.target.value;
      RSI_PERIOD = TIMEFRAMES[currentTf].rsiPeriod;
      syncFirstCandle();
    });

    // כפתורי מסכים
    $.signalsLink.addEventListener('click', (e) => {
      e.preventDefault();
      openSignalsModal();
    });
    $.signalsCloseBtn.addEventListener('click', closeSignalsModal);
    $.signalsModal.addEventListener('click', (e) => { if (e.target === $.signalsModal) closeSignalsModal(); });
    $.signalsResetBtn.addEventListener('click', resetSignalsTable);
    $.tradesLink.addEventListener('click', (e) => {
      e.preventDefault();
      openTradesModal();
    });
    $.tradesCloseBtn.addEventListener('click', closeTradesModal);
    $.tradesModal.addEventListener('click', (e) => { if (e.target === $.tradesModal) closeTradesModal(); });
    $.tradesResetBtn.addEventListener('click', resetTradesTable);


    // כפתור סטטיסטיקה
    if ($.statsLink) {
      $.statsLink.addEventListener('click', (e) => {
        e.preventDefault();
        openStatsModal();
      });
    }

    // כפתור סגירה של חלון הסטטיסטיקה
    if ($.statsCloseBtn) {
      $.statsCloseBtn.addEventListener('click', closeStatsModal);
    }
    // עדכון תוויות בחלונות לפי שפה
    const statsCloseLabel = $.shadow.getElementById('statsCloseLabel');
    if (statsCloseLabel) statsCloseLabel.textContent = t('close');
    const statsResetBtn = $.shadow.getElementById('statsResetBtn');
    if (statsResetBtn) statsResetBtn.textContent = t('reset');
    const indicatorsCloseLabel = $.shadow.getElementById('indicatorsCloseLabel');
    if (indicatorsCloseLabel) indicatorsCloseLabel.textContent = t('close');

    // סגירת חלון הסטטיסטיקה בלחיצה על הרקע
    if ($.statsModal) {
      $.statsModal.addEventListener('click', (e) => {
        if (e.target === $.statsModal) closeStatsModal();
      });
    }

    // כפתור reset של חלון הסטטיסטיקה
    if ($.statsResetBtn) {
      $.statsResetBtn.addEventListener('click', resetStatsData);
    }

    // אייקון צליל
    $.soundIcon.addEventListener('click', toggleSound);

    // בורר שפות
    $.languageSelect.addEventListener('change', (e) => {
      changeLanguage(e.target.value);
    });

    // מניעת גרירה כשלוחצים על בורר השפות
    $.languageSelect.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // עוצר את ההפצה לdragHandle
    });
    $.languageSelect.addEventListener('click', (e) => {
      e.stopPropagation(); // עוצר את ההפצה לdragHandle
    });
    $.languageSelect.addEventListener('focus', (e) => {
      e.stopPropagation(); // עוצר את ההפצה לdragHandle
    });

    // אירועים למערכת אוטומציה - יועברו למטה אחרי הגדרת הפונקציות

    enableDragging();
    restorePosition();

    // אתחול שפה ועדכון טקסטים לאחר יצירת הUI
    $.languageSelect.value = currentLanguage;
    updateTextDirection(); // כיוון טקסט
    updateAllTexts(); // עדכון כל הטקסטים לפי השפה הנוכחית
    updateTimeframeOptions(); // עדכון אפשרויות טיים פריים

    console.log('🔄 אתחול הושלם, שפה:', currentLanguage);


    /**********************
     * מערכת אוטומציה - גלובלית
     **********************/

    // משתני מערכת אוטומציה - גלובליים
    if (!window.automationEnabled) {
      window.automationEnabled = false;
      window.automationSettings = {
        entryAmount: 10,
        stopLoss: 0,
        takeProfit: 0,
        currentBalance: 0,
        backupLevel: 0,
        nextTradeAmount: 10,
        entryPrice: null,
        isProcessingBackupLevels: false, // האם המערכת מעבדת רמות גיבוי
        lastDuration: null // משך העסקה האחרונה
      };
      console.log('🔧 משתני אוטומציה הוגדרו');
    }

    // פונקציה להפעלה/כיבוי של מערכת האוטומציה
    window.toggleAutomation = function () {
      window.automationEnabled = !window.automationEnabled;
      console.log('🔧 מערכת אוטומציה:', window.automationEnabled ? 'מופעלת' : 'מכובה');

      // הצגה/הסתרה של סימן האוטומציה - אלמנט נפרד
      let automationIndicator = null;
      if ($.shadow) {
        automationIndicator = $.shadow.getElementById('automationIndicator');
      }
      if (!automationIndicator) {
        automationIndicator = document.getElementById('automationIndicator');
      }
      if (automationIndicator) {
        automationIndicator.style.display = window.automationEnabled ? 'inline' : 'none';
        console.log('✅ סימן A:', window.automationEnabled ? 'מוצג' : 'מוסתר');
      }

      if (window.automationEnabled) {
        // בדיקת תקינות נתונים
        const entryAmount = parseFloat($.entryAmount.value) || 0;
        const stopLoss = parseFloat($.stopLoss.value) || 0;
        const takeProfit = parseFloat($.takeProfit.value) || 0;

        if (entryAmount <= 0) {
          const errorMsg = t('pleaseEnterEntryAmount') || 'יש להזין סכום כניסה ראשונית';
          setSignal(errorMsg, null);
          window.automationEnabled = false;
          // הסתרת הסימן A כי הבוט לא באמת עובד
          if (automationIndicator) {
            automationIndicator.style.display = 'none';
          }
          return;
        }

        if (stopLoss <= 0 || takeProfit <= 0) {
          const errorMsg2 = t('pleaseEnterStopLossTakeProfit') || 'יש להזין סטופ לוס וטייק פרופיט';
          setSignal(errorMsg2, null);
          window.automationEnabled = false;
          // הסתרת הסימן A כי הבוט לא באמת עובד
          if (automationIndicator) {
            automationIndicator.style.display = 'none';
          }
          return;
        }

        // שמירת הגדרות והתחלה נקייה
        window.automationSettings.entryAmount = entryAmount;
        window.automationSettings.stopLoss = stopLoss;
        window.automationSettings.takeProfit = takeProfit;
        window.automationSettings.nextTradeAmount = entryAmount;
        // איפוס מוחלט של משתני רמות הגיבוי - התחלה נקייה!
        window.automationSettings.backupLevel = 0;
        window.automationSettings.isProcessingBackupLevels = false;
        window.automationSettings.lastDuration = null;
        window.automationSettings.entryPrice = null;

        // עדכון UI
        $.automationToggle.textContent = t('disable');
        $.automationToggle.classList.add('active');

        const enabledMsg = currentLanguage === 'en' ? '🤖 Automation system enabled!' : '🤖 מערכת אוטומציה הופעלה!';
        setSignal(enabledMsg, null);

        // התחלת מעקב אחר יתרה
        window.startBalanceMonitoring();

      } else {
        // כיבוי מערכת
        $.automationToggle.textContent = t('enable');
        $.automationToggle.classList.remove('active');

        const disabledMsg = currentLanguage === 'en' ? '🤖 Automation system disabled' : '🤖 מערכת אוטומציה כובתה';
        setSignal(disabledMsg, null);

        // איפוס מוחלט של כל משתני האוטומציה - בטיחות מקסימלית!
        window.automationSettings.backupLevel = 0;
        window.automationSettings.nextTradeAmount = 0; // איפוס מוחלט!
        window.automationSettings.isProcessingBackupLevels = false;
        window.automationSettings.lastDuration = null;
        window.automationSettings.entryPrice = null;
        window.automationSettings.entryAmount = 0; // איפוס גם הסכום הבסיסי!
        window.automationSettings.stopLoss = 0;
        window.automationSettings.takeProfit = 0;

        console.log('🛡️ איפוס מוחלט של כל משתני האוטומציה - הבוט לא יכול להפעיל עסקאות!');
      }

      window.updateAutomationStatus();
    }

    // פונקציה לשינוי משך הזמן של העסקה
    window.setTradeDuration = function (duration) {
      console.log('⏰ משנה משך זמן לעסקה:', duration);

      try {
        // לחיצה על תיבת משך הזמן
        const durationBox = document.querySelector('.value__val');
        if (durationBox) {
          console.log('✅ נמצא תיבת משך זמן, לוחץ עליה');
          durationBox.click();

          // המתנה קצרה לטעינת הטבלה
          setTimeout(() => {
            // חיפוש הזמן הנכון בטבלה
            let targetTime = '';
            if (duration === 0.5) {
              targetTime = 'S30'; // חצי דקה
            } else if (duration === 1) {
              targetTime = 'M1'; // דקה
            } else if (duration === 3) {
              targetTime = 'M3'; // 3 דקות
            } else if (duration === 5) {
              targetTime = 'M5'; // 5 דקות
            } else if (duration === 30) {
              targetTime = 'M30'; // 30 דקות
            } else if (duration === 60) {
              targetTime = 'H1'; // שעה
            }

            if (targetTime) {
              const timeElements = document.querySelectorAll('.dops__timeframes-item');
              for (let element of timeElements) {
                if (element.textContent.includes(targetTime)) {
                  console.log('✅ נמצא זמן בטבלה:', targetTime, 'לוחץ עליו');
                  element.click();
                  break;
                }
              }
            }
          }, 200); // המתנה של חצי שנייה
        } else {
          console.log('❌ לא נמצא תיבת משך זמן');
        }
      } catch (error) {
        console.error('❌ שגיאה בשינוי משך הזמן:', error);
      }
    };

    // פונקציה לעדכון סטטוס מערכת האוטומציה
    window.updateAutomationStatus = function () {
      if (!window.automationEnabled) return;

      const entryAmount = parseFloat($.entryAmount.value) || 0;
      const stopLoss = parseFloat($.stopLoss.value) || 0;
      const takeProfit = parseFloat($.takeProfit.value) || 0;

      // עדכון היתרה בתצוגה
      if ($.currentBalanceDisplay) {
        $.currentBalanceDisplay.textContent = window.automationSettings.currentBalance.toFixed(2);
      }
    }

    // פונקציה למעקב אחר יתרת החשבון
    window.startBalanceMonitoring = function () {
      // זיהוי סוג החשבון
      let accountType = 'unknown';
      let balanceElement = null;
      let balanceText = '';

      // חיפוש האלמנט שמזהה את סוג החשבון
      const accountLabel = document.querySelector('.balance-info-block__label');
      if (accountLabel) {
        const labelText = accountLabel.textContent.trim();
        if (labelText.includes('QT Real')) {
          accountType = 'real';
          balanceElement = document.querySelector('.js-balance-real-USD');
        } else if (labelText.includes('QT Demo')) {
          accountType = 'demo';
          balanceElement = document.querySelector('.js-balance-demo');
        }
      }

      if (balanceElement) {
        // קריאה מה-data-hd-show או מה-textContent - בדיקה של שניהם!
        const dataHdShow = balanceElement.getAttribute('data-hd-show');
        const textContent = balanceElement.textContent;

        // עדיפות ל-textContent כי זה מה שהפלטפורמה משנה בזמן אמת
        balanceText = textContent || dataHdShow || '0';

        const balance = parseFloat(balanceText.replace(/[^0-9.-]/g, '')) || 0;

        // עדכון התצוגה של היתרה מיידית - קריאה ישירה מהפלטפורמה
        if ($.currentBalanceDisplay) {
          $.currentBalanceDisplay.textContent = balance.toFixed(2);
        }

        // עדכון היתרה הפנימית לצורך השוואות (אבל לא נעדכן אותה יותר)
        if (balance > 0) {
          window.automationSettings.currentBalance = balance;
        }

        if (window.automationEnabled) {
          window.updateAutomationStatus();
        }
      } else {
        console.log('⚠️ לא נמצא אלמנט יתרה או לא זוהה סוג חשבון');
      }

      // עדכון כל שנייה אחת - הרבה יותר תכוף!
      setTimeout(window.startBalanceMonitoring, 1000);
    }

    let amountInput = null;
    window.updateTradingPrice = function (nextAmount) {
      // הזנת סכום - לפי הנתיב המדויק שהמשתמש נתן
      if (!amountInput) {
        amountInput = document.querySelector('input[type="text"][autocomplete="off"][value]');
      }

      // console.log('🔍 מחפש שדה הזנת סכום לפי הנתיב המדויק:', amountInput);
      if (amountInput) {
        // console.log('✅ נמצא שדה הזנת סכום, מזין:', nextAmount);
        // ניקוי השדה והזנת הסכום החדש
        amountInput.value = '';
        amountInput.focus();

        // הזנת הסכום תו אחר תו כדי לחקות הזנה ידנית
        const amountStr = nextAmount.toString();
        for (let i = 0; i < amountStr.length; i++) {
          setTimeout(() => {
            amountInput.value += amountStr[i];
            amountInput.dispatchEvent(new Event('input', { bubbles: true }));
          }, i * 10);
        }
        return true
      }
      else { 
        // console.log('❌ לא נמצא שדה הזנת סכום!');
        return false;
      } 
    }

    let buySvg = null;
    let sellSvg = null;
    window.executeBuyOrSell = function (signal) {
      // console.log('🖱️ מחפש כפתור:', signal);

      // לחיצה על כפתור Buy או Sell לפי הנתיבים המדויקים שהמשתמש נתן
      if (signal === 'buy') {
        // נתיב מדויק לכפתור Buy שנתת לי
        if (!buySvg) {
          buySvg = document.querySelector('.switch-state-block__item .svg-icon-wrap div svg[data-src="/themes/cabinet/svg/icons/btn-buy.svg?v=1"]');
        }
        // console.log('🔍 מחפש SVG של Buy:', buySvg);

        if (buySvg) {
          const buyButton = buySvg.closest('.switch-state-block__item');
          // console.log('🔍 מחפש כפתור Buy לפי הנתיב המדויק:', buyButton);

          if (buyButton) {
            // console.log('✅ לוחץ על Buy לפי הנתיב המדויק');
            buyButton.click();
          } else {
            // console.log('❌ לא נמצא כפתור Buy לפי הנתיב המדויק');
          }
        } else {
          // console.log('❌ לא נמצא SVG של Buy');
        }
      } else if (signal === 'sell') {
        // נתיב מדויק לכפתור Sell שנתת לי
        if (!sellSvg) {
          sellSvg = document.querySelector('.switch-state-block__item .svg-icon-wrap div svg[data-src="/themes/cabinet/svg/icons/btn-sell.svg?v=1"]');
        }
        // console.log('🔍 מחפש SVG של Sell:', sellSvg);

        if (sellSvg) {
          const sellButton = sellSvg.closest('.switch-state-block__item');
          // console.log('🔍 מחפש כפתור Sell לפי הנתיב המדויק:', sellButton);

          if (sellButton) {
            // console.log('✅ לוחץ על Sell לפי הנתיב המדויק');
            sellButton.click();
          } else {
            // console.log('❌ לא נמצא כפתור Sell לפי הנתיב המדויק');
          }
        } else {
          // console.log('❌ לא נמצא SVG של Sell');
        }
      }
    }

    // פונקציה לביצוע עסקה אוטומטית
    window.executeAutomatedTrade = function (signal, duration) {

      // 🛡️ בדיקות בטיחות חזקות - מניעת עסקאות רפאים!
      if (!window.automationEnabled) {
        console.log('🚫 מערכת אוטומציה לא מופעלת - עוצר מיד!');
        return false;
      }

      // בדיקה נוספת - אם הסכומים אופסו, זה אומר שהבוט נעצר
      if (window.automationSettings.entryAmount <= 0 || window.automationSettings.nextTradeAmount <= 0) {
        console.log('🚫 סכומי האוטומציה אופסו - הבוט נעצר! מבטל עסקה.');
        return false;
      }

      // בדיקה נוספת - אם אין עיבוד רמות גיבוי פעיל
      if (!window.automationSettings.isProcessingBackupLevels) {
        console.log('🚫 אין עיבוד רמות גיבוי פעיל - מבטל עסקה.');
        return false;
      }

      // שמירת duration למקרה שנצטרך לרמות גיבוי
      if (duration) {
        window.automationSettings.lastDuration = duration;
      }

      // הכנת הסכום הבא כבר עכשיו - אם זה רמת גיבוי, נכין את הבאה
      if (window.automationSettings.backupLevel > 0 && window.automationSettings.backupLevel < MAX_BACKUP_LEVEL) {
        const nextBackupAmount = window.automationSettings.entryAmount * Math.pow(2, window.automationSettings.backupLevel + 1);
        console.log(`🔮 מכין סכום לרמת גיבוי הבאה: ${nextBackupAmount}$`);
      }

      // בדיקת גבולות לפני ביצוע עסקה - קריאה ישירה מהפלטפורמה
      const nextAmount = window.automationSettings.nextTradeAmount;

      // קריאת היתרה ישירות מהפלטפורמה
      const accountLabel = document.querySelector('.balance-info-block__label');
      let realBalance = 0;

      if (accountLabel) {
        const labelText = accountLabel.textContent.trim();
        let balanceElement = null;

        if (labelText.includes('QT Real')) {
          balanceElement = document.querySelector('.js-balance-real-USD');
        } else if (labelText.includes('QT Demo')) {
          balanceElement = document.querySelector('.js-balance-demo');
        }

        if (balanceElement) {
          const balanceText = balanceElement.textContent.trim();
          realBalance = parseFloat(balanceText.replace(/[^0-9.-]/g, '')) || 0;
        }
      }

      console.log('💰 סכום עסקה:', nextAmount, 'יתרה אמיתית מהפלטפורמה:', realBalance);

      // בדיקת אחוז רווח - עצירה אם ירד ל-88% או פחות
      const currentProfit = parseFloat((($.profitPercent.textContent || '').replace(/[^0-9.\-]/g, ''))) || null;
      if (currentProfit !== null && currentProfit < 89) {
        console.log('🚫 אחוז רווח נמוך מדי:', currentProfit + '%');
        setSignal(`🚫 מערכת אוטומציה נעצרה - אחוז רווח: ${currentProfit}% (מינימום: 89%)`, null);
        return false;
      }

      // בדיקת סטופ לוס - אם העסקה תגרום לחריגה, לא להיכנס
      if (realBalance - nextAmount < window.automationSettings.stopLoss) {
        console.log('🚫 חריגה מסטופ לוס - יתרה:', realBalance, 'עסקה:', nextAmount, 'סטופ לוס:', window.automationSettings.stopLoss);
        setSignal('🚫 לא ניתן לבצע עסקה - חריגה מסטופ לוס', null);
        return false;
      }

      // בדיקת טייק פרופיט - רק אם היתרה כבר הגיעה לטייק פרופיט
      if (realBalance >= window.automationSettings.takeProfit) {
        console.log('🚫 הגעת לטייק פרופיט - יתרה:', realBalance, 'טייק פרופיט:', window.automationSettings.takeProfit);
        setSignal('🚫 הגעת לטייק פרופיט - מערכת אוטומציה נעצרת', null);
        return false;
      }

      // ביצוע העסקה
      try {
        // שינוי משך הזמן לפי האיתות
        if (window.automationSettings.lastDuration) {
          window.setTradeDuration(window.automationSettings.lastDuration);
        }

        // הזנת סכום - לפי הנתיב המדויק שהמשתמש נתן
        if (window.updateTradingPrice(nextAmount)) {
          // המתנה קצרה לפני הלחיצה על הכפתור
          setTimeout(() => {
            window.executeBuyOrSell(signal);
          }, 50);
        } else {
          console.log('❌ לא נמצא שדה הזנת סכום');
        }

        setSignal(`🤖 עסקה אוטומטית: ${signal.toUpperCase()} ${nextAmount}$`, signal);

        // שמירת מחיר הכניסה לבדיקה עתידית
        const entryPrice = getPriceFromDom();
        if (entryPrice) {
          window.automationSettings.entryPrice = entryPrice;
          if (window.__poDebug) console.log('💰 מחיר כניסה נשמר:', entryPrice);
        }
 
        return true;

      } catch (error) {
        console.error('שגיאה בביצוע עסקה אוטומטית:', error);
        setSignal('❌ שגיאה בביצוע עסקה אוטומטית', null);
        return false;
      }
    }

    // פונקציה לבדיקת תוצאת עסקה
    window.checkTradeResult = function (signal, amount) {
      // 🚫 פונקציה מושבתת! גרמה לבעיות של רמות גיבוי כפולות
      console.log('⚠️ checkTradeResult הופעלה - אבל מושבתת! המערכת החדשה מטפלת בזה');
      return; // לא עושה כלום
    }

    // הוספת event listeners למערכת אוטומציה אחרי שהפונקציות מוגדרות
    $.automationToggle.addEventListener('click', window.toggleAutomation);
    $.entryAmount.addEventListener('input', window.updateAutomationStatus);
    $.stopLoss.addEventListener('input', window.updateAutomationStatus);
    $.takeProfit.addEventListener('input', window.updateAutomationStatus);

    // התחלת מעקב אחר יתרה מיד
    window.startBalanceMonitoring();

    // מעקב אחר שינויים ב-DOM (MutationObserver) - עוד יותר מהיר!
    if (window.MutationObserver && !window.balanceObserver) {
      window.balanceObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'childList' || mutation.type === 'characterData' || mutation.type === 'attributes') {
            // בדיקה מהירה אם זה קשור ליתרה
            const target = mutation.target;
            if (target.classList && (target.classList.contains('js-balance-real-USD') || target.classList.contains('js-balance-demo'))) {
              setTimeout(() => {
                window.startBalanceMonitoring();
              }, 100);
            }
          }
        });
      });

      // מעקב אחר שינויים בכל הדף
      window.balanceObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['data-hd-show', 'data-hd-status']
      });

      // מעקב ישיר אחר האלמנטים של היתרה
      const realBalanceElement = document.querySelector('.js-balance-real-USD');
      const demoBalanceElement = document.querySelector('.js-balance-demo');

      if (realBalanceElement) {
        window.balanceObserver.observe(realBalanceElement, {
          characterData: true,
          childList: true,
          attributes: true,
          attributeFilter: ['data-hd-show', 'data-hd-status']
        });
        console.log('👁️ מעקב ישיר אחר יתרה אמיתית');
      }

      if (demoBalanceElement) {
        window.balanceObserver.observe(demoBalanceElement, {
          characterData: true,
          childList: true,
          attributes: true,
          attributeFilter: ['data-hd-show', 'data-hd-status']
        });
        console.log('👁️ מעקב ישיר אחר יתרת דמו');
      }

      console.log('👁️ MutationObserver הוגדר למעקב אחר שינויים ביתרה');
    }

    renderRecent();

    startClock();

    // === LIGHTBOX (חלון הגדלה) ===
    // הפונקציות האלה מוגדרות כאן כי כאן ה-$ כבר מוגדר

    function ensureLightbox() {
      console.log('🔍 === יצירת lightbox ===');
      console.log('🔍 $ קיים?', !!$);
      console.log('🔍 $.shadow קיים?', !!($ && $.shadow));

      // בדיקה אם ה-lightbox כבר קיים ב-Shadow DOM
      if ($.shadow.querySelector('#po-lightbox')) {
        console.log('🔍 Lightbox כבר קיים');
        return;
      }

      console.log('🔍 יוצר lightbox חדש...');

      const lb = document.createElement('div');
      lb.id = 'po-lightbox';
      lb.innerHTML = `
        <div class="po-lightbox__backdrop" data-close></div>
        <div class="po-lightbox__panel">
          <button class="po-lightbox__close" data-close>&times;</button>
          <img id="po-lightbox-img" alt="screenshot">
        </div>`;

      // הוספה ל-Shadow DOM במקום ל-document.body
      $.shadow.appendChild(lb);

      // וידוא שה-lightbox נמצא במקום הנכון
      console.log('📍 Lightbox נוסף ל-Shadow DOM:', {
        lightboxExists: !!$.shadow.querySelector('#po-lightbox'),
        lightboxParent: lb.parentElement?.tagName,
        lightboxPosition: lb.style.position,
        lightboxHTML: lb.outerHTML.slice(0, 200) + '...'
      });

      // סגירה בלחיצה על הרקע
      lb.addEventListener('click', e => {
        if (e.target.hasAttribute('data-close') || e.target.classList.contains('po-lightbox__backdrop')) {
          closeLightbox();
        }
      });

      // דאבל-קליק לזום פנימה/החוצה
      const img = lb.querySelector('#po-lightbox-img');
      if (img) {
        img.addEventListener('dblclick', () => {
          img.classList.toggle('zoom');
        });
      }

      console.log('🔍 Lightbox נוצר בהצלחה');
    }

    function openLightbox(src) {
      console.log('🔍 === פתיחת lightbox ===');
      console.log('🔍 src:', src);
      console.log('🔍 $ קיים?', !!$);
      console.log('🔍 $.shadow קיים?', !!($ && $.shadow));

      ensureLightbox();

      const lb = $.shadow.querySelector('#po-lightbox');
      const img = $.shadow.querySelector('#po-lightbox-img');

      console.log('🔍 lightbox element:', lb);
      console.log('🔍 lightbox img element:', img);

      if (img && src) {
        img.src = src;
        console.log('✅ תמונה הועברה ל-lightbox');
      } else {
        console.warn('⚠️ לא ניתן להעביר תמונה:', { img: !!img, src: !!src });
      }

      if (lb) {
        lb.setAttribute('open', '');
        console.log('✅ Lightbox נפתח');

        // בדיקה שהתמונה נטענה
        if (img) {
          img.onload = () => console.log('✅ תמונה נטענה בהצלחה');
          img.onerror = () => console.error('❌ שגיאה בטעינת התמונה');
        }
      } else {
        console.error('❌ לא נמצא lightbox element!');
      }
    }

    function closeLightbox() {
      console.log('🔒 סוגר lightbox');
      const lb = $.shadow.querySelector('#po-lightbox');
      const img = $.shadow.querySelector('#po-lightbox-img');
      if (lb) {
        lb.removeAttribute('open');
        console.log('✅ Lightbox נסגר');
      }
      if (img) {
        img.src = '';
        img.classList.remove('zoom'); // איפוס זום
        console.log('✅ תמונה אופסה');
      }
    }


    function handleEscapeKey(e) {
      if (e.key === 'Escape') {
        console.log('⌨️ מקש ESC נלחץ - סוגר lightbox');
        closeLightbox();
      }
    }

    // הוספת הפונקציות ל-global scope כדי שהן יהיו נגישות
    window.ensureLightbox = ensureLightbox;
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.handleEscapeKey = handleEscapeKey;

    // === Event Delegation - האזנה יחידה לכל התמונות ===
    (function initHistoryClickOnce() {
      if (window.__poHistoryClickInit__) return;
      window.__poHistoryClickInit__ = true;

      const panel = $.shadow.querySelector("#po-history") || $.shadow;
      panel.addEventListener('click', (e) => {
        const img = e.target.closest('img.js-open-full');
        if (!img) return;
        e.preventDefault(); e.stopPropagation();

        console.log('🖱️ === לחיצה על תמונה (event delegation) ===');

        const full = img.getAttribute('data-full') || img.currentSrc || img.src;
        console.log('🖱️ פרטי התמונה:', {
          hasFullSrc: !!img.getAttribute('data-full'),
          fullSrc: img.getAttribute('data-full'),
          imgClass: img.className,
          imgSrc: img.src,
          imgWidth: img.naturalWidth,
          imgHeight: img.naturalHeight,
          fullToUse: full
        });

        if (full && full !== 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') {
          console.log('✅ יש תמונה זמינה, פותח lightbox...');
          openLightbox(full);
        } else {
          console.error('❌ אין תמונה זמינה בכלל!');
        }
      }, true);

      console.log('🎯 Event delegation הותקן לתמונות היסטוריה');
    })();
  }


  // ==========================
  // Plan Badge / Countdown JS
  // ==========================

  let planTimer = null;
  let trialFrameTimer = null;

  /** נרמול קבוע של שמות מסלולים מהשרת */
  function normalizePlanKind(rawKind, isTrialFlag) {
    if (!rawKind && isTrialFlag) return 'trial';
    if (!rawKind) return null;
    const k = String(rawKind).trim().toUpperCase();
    if (k.startsWith('TRIAL')) return 'trial';
    if (k === 'WEEKLY') return 'weekly';
    if (k === 'MONTHLY') return 'monthly';
    if (k === 'ANNUAL') return 'annual';
    // ברירת מחדל זהירה: אם לא זוהה—נחזיר null (לא נציג)
    return null;
  }

  /** פונקציית עזר: אם מפתח תרגום חסר, השתמש ב-fallback */
  function tOr(primaryKey, fallbackKey, vars) {
    const val = t(primaryKey, vars);
    if (val === primaryKey && fallbackKey) return t(fallbackKey, vars);
    return val;
  }

  /** תצוגה קצרה ל-<24h (שעות:דקות) */
  function fmtShortHoursMinutes(ms) {
    if (ms <= 0) return t('generic.expired');
    const totalMin = Math.floor(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return t('generic.left_short', { h, m }); // "נותרו {h}ש׳ {m}ד׳"
  }

  /** תצוגת ימים שלמים עם נפילה בטוחה ל-generic */
  function fmtDays(ms, ns) {
    // ns = 'trial' | 'weekly' | 'monthly' | 'annual'
    if (ms <= 0) return tOr(`${ns}_expired`, 'generic_expired');
    const d = Math.max(0, Math.floor(ms / 86400000));
    const key = `${ns}.left_days`;
    const probe = t(key, { d });
    if (probe === key) {
      // fallback בטוח אם חסר מפתח ייחודי:
      return t('generic.left_days', { d });
    }
    return probe;
  }

  /** כלל: אם נשאר פחות מיום – מציגים שעות/דקות; אחרת – ימים */
  function formatLeft(ms, kind) {
    const DAY = 86_400_000;
    if (ms <= 0) return tOr(`${kind}_expired`, 'generic_expired');
    if (ms < DAY) return fmtShortHoursMinutes(ms);
    return fmtDays(ms, kind);
  }

  /** קובע מרווח עדכון דינמי כדי לחסוך משאבים */
  function pickIntervalMs(leftMs, _kind) {
    if (leftMs <= 60 * 60 * 1000) return 30_000; // עד שעה: כל 30 שניות
    if (leftMs <= 86_400_000) return 60_000; // עד יממה: כל דקה
    return 3_600_000;                          // מעבר לזה: כל שעה
  }

  /** אתחול וספירה לאחור בהתאם ל-accessExpiresAtUtc */
  async function startPlanCountdownFromStorage() {
    const tokenRes = await sendToBackground("auth.getToken", {});

    // נרמול צד-קליינט, גם אם השרת ישלח אותיות גדולות/שם מעט שונה
    const kind = normalizePlanKind(tokenRes?.planKind, tokenRes?.isTrial);
    const expiresIso = tokenRes?.accessExpiresAtUtc || null;

    if (planTimer) { clearInterval(planTimer); planTimer = null; }
    if (kind && expiresIso) {
      const leftMsNow = new Date(expiresIso).getTime() - Date.now();
      const interval = pickIntervalMs(leftMsNow, kind);

      planTimer = setInterval(() => {
        const left = new Date(expiresIso).getTime() - Date.now();
        if (left <= 0) {
          clearInterval(planTimer);
          planTimer = null;
        }
      }, interval);
    }

    // התחלת טיימר למסגרת התוכנית
    startTrialFrameTimer();
  }

  /** התחלת טיימר לעדכון מסגרת התוכנית */
  function startTrialFrameTimer() {
    if (trialFrameTimer) { 
      clearInterval(trialFrameTimer); 
      trialFrameTimer = null; 
    }
    
    // עדכון ראשוני
    updateTrialFrameText().catch(console.error);
    
    // עדכון כל 30 שניות
    trialFrameTimer = setInterval(() => {
      updateTrialFrameText().catch(console.error);
    }, 30000);
  }

  // אופציונלי: ייצוא גלובלי להפעלה ידנית ממקומות אחרים
  window.PlanBadge = {
    startPlanCountdownFromStorage,
    normalizePlanKind
  };



  // ==========================
  // Login Overlay on Widget
  // ==========================
  function openLoginOverlayOnWidget() {
    return new Promise((resolve) => {
      if (!$ || !$.shadow || !$.widget) ensureWidget();
      console.log("starting login overlay on widget...");
      // בונים/מאתרים את האוברליי בתוך ה-Shadow
      let ov = $.shadow.getElementById('po-login-overlay');
      if (!ov) {
        console.log("creating login overlay...");
        ov = document.createElement('div');
        ov.id = 'po-login-overlay';
        ov.style.cssText = ``;
        ov.innerHTML = `
        <div id="po-login-card"
             style="min-width:320px; max-width:360px; width:92%;
                    background:#0b172b; color:#e6f6ff; border:1px solid rgba(0,180,255,.35);
                    border-radius:14px; box-shadow:0 16px 44px rgba(18,130,255,.35);
                    padding:14px; font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial">
          <div class="title" style="font-weight:900;font-size:16px;margin-bottom:10px">
            <span id="po-login-title"></span>
          </div>

          <label id="po-login-email-label" style="font-size:12px;opacity:.85"></label>
          <input id="po-login-email" type="email" autocomplete="username"
                 style="padding:10px;border-radius:10px;border:1px solid rgba(0,180,255,.35);
                        background:#0a2242;color:#fff;margin-bottom:8px" />

          <label id="po-login-pass-label" style="font-size:12px;opacity:.85"></label>
          <input id="po-login-pass" type="password" autocomplete="current-password"
                 style="padding:10px;border-radius:10px;border:1px solid rgba(0,180,255,.35);
                        background:#0a2242;color:#fff;margin-bottom:10px" />

          <div id="po-login-err" style="color:#ff6b6b; min-height:18px; margin-top:4px; font-size:12px"></div>

          <button class="go" id="po-login-go"
                  style=" margin-top:10px; padding:10px; border-radius:10px;
                         border:1px solid rgba(0,180,255,.55);
                         background:linear-gradient(45deg,#0066ff,#00ccff);
                         color:#fff; font-weight:800; cursor:pointer"></button>
        </div>
      `;
        console.log("appending login overlay to widget...");
        $.widget.appendChild(ov);
      }

      ov.classList.add('open');

      const $title = $.shadow.getElementById('po-login-title');
      const $emailLbl = $.shadow.getElementById('po-login-email-label');
      const $passLbl = $.shadow.getElementById('po-login-pass-label');
      const $email = $.shadow.getElementById('po-login-email');
      const $pass = $.shadow.getElementById('po-login-pass');
      const $btn = $.shadow.getElementById('po-login-go');
      const $err = $.shadow.getElementById('po-login-err');
      // רינדור טקסטים/כיווניות לפי השפה

      // כותרות/לייבלים/כפתור
      $title.textContent = 'Login';
      $emailLbl.textContent = 'Email';
      $passLbl.textContent = 'Password';
      $btn.textContent = 'Log in';

      // // מילוי רשימת שפות מהקטלוג
      // const all = await loadCatalog();
      // const langs = Object.keys(all).filter(k => !k.startsWith('__'));
      // $langSel.innerHTML = '';
      // for (const code of langs) {
      //   const opt = document.createElement('option');
      //   opt.value = code;
      //   opt.textContent = t(`languageNames.${code}`);
      //   if (code === I18N.lang) opt.selected = true;
      //   $langSel.appendChild(opt);
      // }

      // שליחה עם Enter
      const submitIfEnter = (e) => { if (e.key === 'Enter') $btn.click(); };
      $email.onkeydown = submitIfEnter;
      $pass.onkeydown = submitIfEnter;

      $btn.onclick = async () => {
        const email = ($email.value || '').trim();
        const password = $pass.value || '';

        if (!email || !password) {
          $err.textContent = 'Please enter email and password';
          return;
        }

        $btn.disabled = true;
        $btn.textContent = 'Logging in…';

        try {
          const resp = await sendToBackground("auth.login", { email, password });

          if (!resp?.ok) {
            // מיפוי קוד → טקסט לפי הקטלוג; פולבאק להודעת השרת אם צריך
            let msg;
            const code = resp?.code || '';
            if (code && code.startsWith('http')) {
              const status = code.split('_')[1] || resp?.status || '';
              msg = status;
            } else if (code && code.startsWith('trial_expired')) {
              msg = 'Trial period expired (24h)';
            } else if (code && code.startsWith('access_expired')) {
              msg = 'Access expired';
            } else if (code && code.startsWith('missing_fields')) {
              msg = 'Please enter email and password';
            } else if (code && code.startsWith('network_error')) {
              msg = 'Network error — try again';
            } else if (code && code.startsWith('unauthorized')) {
              msg = 'Incorrect email or password';
            } else if (code && code.startsWith('not_allowed')) {
              msg = 'Incorrect email or password';
            } else {
              msg = resp?.error || 'Unknown login error';
            }
            $err.textContent = msg;
            $btn.disabled = false;
            $btn.textContent = 'Log in';
            return;
          }

          // הצלחה
          hideLoginOverlayOnWidget();
          await startPlanCountdownFromStorage(resp);
          resolve();
        } catch (e) {
          $err.textContent = 'login.errors.network_error';
          $btn.disabled = false;
          $btn.textContent = 'login.button';
        }
      };
    });
  }

  function hideLoginOverlayOnWidget() {
    const ov = $.shadow?.getElementById('po-login-overlay');
    if (ov) ov.classList.remove('open');
  }

  /**********************
   * MODAL SIGNALS
   **********************/
  function openSignalsModal() {
    renderSignalsTable();
    updateTableHeaders(); // עדכון כותרות לפי השפה הנוכחית
    $.signalsModal.classList.add('show');
    $.signalsModal.setAttribute('aria-hidden', 'false');
  }
  function closeSignalsModal() {
    $.signalsModal.classList.remove('show');
    $.signalsModal.setAttribute('aria-hidden', 'true');
  }

  /**********************
   * MODAL TRADES
   **********************/
  function openTradesModal() {
    renderTradesTable();
    updateTableHeaders(); // עדכון כותרות לפי השפה הנוכחית
    $.tradesModal.classList.add('show');
    $.tradesModal.setAttribute('aria-hidden', 'false');
  }
  function closeTradesModal() {
    $.tradesModal.classList.remove('show');
    $.tradesModal.setAttribute('aria-hidden', 'true');
  }
  function renderTradesTable() {
    const tb = $.tradesTbody;
    tb.innerHTML = '';

    // עדכון סטטיסטיקות
    updateTradesStats();

    // הצג את כל העסקאות
    for (const trade of tradesLog.slice(0, 80)) {
      const tr = document.createElement('tr');

      // Date (תאריך בלבד)
      const tdDate = document.createElement('td');
      const entryDate = new Date(trade.entryTime);
      tdDate.textContent = entryDate.toLocaleDateString('he-IL');

      // Entry Time (זמן בלבד)
      const tdEntryTime = document.createElement('td');
      tdEntryTime.textContent = entryDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      // Close Time (זמן בלבד)
      const tdCloseTime = document.createElement('td');
      if (trade.closeTime) {
        const closeDate = new Date(trade.closeTime);
        tdCloseTime.textContent = closeDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } else {
        tdCloseTime.textContent = '—';
      }

      // Symbol
      const tdSymbol = document.createElement('td');
      tdSymbol.innerHTML = `<span class="sym">${getSymbolEmoji(trade.symbol)} <span>${trade.symbol || '—'}</span></span>`;

      // Signal
      const tdSignal = document.createElement('td');
      const isBuy = trade.signal === t('buy') || trade.signal === 'קנייה' || trade.signal === 'Buy';
      const isSell = trade.signal === t('sell') || trade.signal === 'מכירה' || trade.signal === 'Sell';
      const dotClass = isBuy ? 'green' : isSell ? 'red' : 'gray';
      const translatedSignal = isBuy ? t('buy') : isSell ? t('sell') : trade.signal;
      tdSignal.innerHTML = `
        <span class="pill ${isBuy ? 'buy' : isSell ? 'sell' : ''}">
          <span class="dot ${dotClass}"></span> ${translatedSignal}
        </span>
      `;

      // Entry Price
      const tdEntryPrice = document.createElement('td');
      tdEntryPrice.textContent = formatPrice(trade.entryPrice);

      // Duration
      const tdDuration = document.createElement('td');
      tdDuration.textContent = `${trade.duration}m`;

      // Close Price
      const tdClosePrice = document.createElement('td');
      tdClosePrice.textContent = trade.closePrice ? formatPrice(trade.closePrice) : '—';

      // Verification
      const tdVerification = document.createElement('td');
      if (trade.verification) {
        const isSuccess = trade.verification === t('succeeded') || trade.verification === 'הצליח' || trade.verification === 'Succeeded';
        const translatedVerification = isSuccess ? t('succeeded') : t('failed');
        tdVerification.innerHTML = `
          <span class="pill ${isSuccess ? 'buy' : 'sell'}">
            <span class="dot ${isSuccess ? 'green' : 'red'}"></span> ${translatedVerification}
          </span>
        `;
      } else {
        tdVerification.textContent = '—';
      }

      tr.appendChild(tdSymbol);
      tr.appendChild(tdDate);
      tr.appendChild(tdEntryTime);
      tr.appendChild(tdCloseTime);
      tr.appendChild(tdSignal);
      tr.appendChild(tdEntryPrice);
      tr.appendChild(tdDuration);
      tr.appendChild(tdClosePrice);
      tr.appendChild(tdVerification);

      // רמות גיבוי - גיבוי 1
      const tdBackup1 = document.createElement('td');
      tdBackup1.textContent = trade.backup1Price ? formatPrice(trade.backup1Price) : '—';
      tr.appendChild(tdBackup1);

      // אימות 1
      const tdVerification1 = document.createElement('td');
      if (trade.verification1) {
        const isSuccess1 = trade.verification1 === t('succeeded') || trade.verification1 === 'הצליח' || trade.verification1 === 'Succeeded';
        const translatedVerification1 = isSuccess1 ? t('succeeded') : t('failed');
        tdVerification1.innerHTML = `
          <span class="pill ${isSuccess1 ? 'buy' : 'sell'}">
            <span class="dot ${isSuccess1 ? 'green' : 'red'}"></span> ${translatedVerification1}
          </span>
        `;
      } else {
        tdVerification1.textContent = '—';
      }
      tr.appendChild(tdVerification1);

      // רמות גיבוי - גיבוי 2
      const tdBackup2 = document.createElement('td');
      tdBackup2.textContent = trade.backup2Price ? formatPrice(trade.backup2Price) : '—';
      tr.appendChild(tdBackup2);

      // אימות 2
      const tdVerification2 = document.createElement('td');
      if (trade.verification2) {
        const isSuccess2 = trade.verification2 === t('succeeded') || trade.verification2 === 'הצליח' || trade.verification2 === 'Succeeded';
        const translatedVerification2 = isSuccess2 ? t('succeeded') : t('failed');
        tdVerification2.innerHTML = `
          <span class="pill ${isSuccess2 ? 'buy' : 'sell'}">
            <span class="dot ${isSuccess2 ? 'green' : 'red'}"></span> ${translatedVerification2}
          </span>
        `;
      } else {
        tdVerification2.textContent = '—';
      }
      tr.appendChild(tdVerification2);

      // רמות גיבוי - גיבוי 3
      const tdBackup3 = document.createElement('td');
      tdBackup3.textContent = trade.backup3Price ? formatPrice(trade.backup3Price) : '—';
      tr.appendChild(tdBackup3);

      // אימות 3
      const tdVerification3 = document.createElement('td');
      if (trade.verification3) {
        const isSuccess3 = trade.verification3 === t('succeeded') || trade.verification3 === 'הצליח' || trade.verification3 === 'Succeeded';
        const translatedVerification3 = isSuccess3 ? t('succeeded') : t('failed');
        tdVerification3.innerHTML = `
          <span class="pill ${isSuccess3 ? 'buy' : 'sell'}">
            <span class="dot ${isSuccess3 ? 'green' : 'red'}"></span> ${translatedVerification3}
          </span>
        `;
      } else {
        tdVerification3.textContent = '—';
      }
      tr.appendChild(tdVerification3);

      // סוג הפעולה (אוטומטי או ידני)
      const tdAction = document.createElement('td');
      const action = trade.action || t('manual'); // אם אין action, זה ידני (תאימות לאחור)
      // תרגום פעולה לפי השפה הנוכחית, גם אם נשמר טקסט באנגלית/עברית בעבר
      const normalizedAction = /automatic/i.test(action) || action === translations.he.automatic ? t('automatic')
        : /manual/i.test(action) || action === translations.he.manual ? t('manual')
          : action;
      tdAction.textContent = normalizedAction;
      tr.appendChild(tdAction);

      tb.appendChild(tr);
    }
  }

  function resetTradesTable() {
    // מחק את כל הנתונים מהטבלה
    $.tradesTbody.innerHTML = '';
    // מחק את הנתונים מ-localStorage
    try {
      localStorage.removeItem('po_tradesLog');
      // נקה את המערך בזיכרון
      tradesLog.length = 0;
      // אפס סטטיסטיקות
      updateTradesStats();
      console.log('🗑️ טבלת העסקאות אופסה - כל הנתונים נמחקו מ-localStorage ומהזיכרון');
    } catch (e) {
      console.warn('שמירת נתונים נכשלה:', e);
    }
  }

  // עדכון סטטיסטיקות עסקאות
  function updateTradesStats() {
    let successCount = 0;
    let failureCount = 0;

    // בדיקה של כל עסקה - הצלחה בכל רמה נחשבת כהצלחה
    for (const trade of tradesLog) {
      let isSuccess = false;

      // בדיקה אם העסקה המקורית הצליחה
      if (trade.verification === t('succeeded') || trade.verification === 'הצליח' || trade.verification === 'Succeeded') {
        isSuccess = true;
      }
      // בדיקה אם רמת גיבוי כלשהי הצליחה
      else if (trade.verification1 === t('succeeded') || trade.verification1 === 'הצליח' || trade.verification1 === 'Succeeded' ||
        trade.verification2 === t('succeeded') || trade.verification2 === 'הצליח' || trade.verification2 === 'Succeeded' ||
        trade.verification3 === t('succeeded') || trade.verification3 === 'הצליח' || trade.verification3 === 'Succeeded') {
        isSuccess = true;
      }
      // רק אם הגענו לרמה 3 וכולן נכשלו - זה נחשב ככישלון
      else if ((trade.verification === t('failed') || trade.verification === 'נכשל' || trade.verification === 'Failed') &&
        (trade.verification1 === t('failed') || trade.verification1 === 'נכשל' || trade.verification1 === 'Failed') &&
        (trade.verification2 === t('failed') || trade.verification2 === 'נכשל' || trade.verification2 === 'Failed') &&
        (trade.verification3 === t('failed') || trade.verification3 === 'נכשל' || trade.verification3 === 'Failed')) {
        isSuccess = false;
      }
      // אם העסקה עדיין פעילה - לא סופרים אותה
      else if (trade.status === 'active') {
        continue;
      }

      if (isSuccess) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    // חישוב אחוז הצלחה
    const totalTrades = successCount + failureCount;
    const successRate = totalTrades > 0 ? Math.round((successCount / totalTrades) * 100) : 0;

    // עדכון ה-UI דרך Shadow DOM (אם $ כבר מוגדר)
    if ($ && $.shadow) {
      const successEl = $.shadow.getElementById('successCount');
      const failureEl = $.shadow.getElementById('failureCount');
      const headerRateEl = $.shadow.getElementById('headerSuccessRate');

      if (successEl) successEl.textContent = successCount;
      if (failureEl) failureEl.textContent = failureCount;
      if (headerRateEl) headerRateEl.textContent = `${successRate}%`;
    }
  }



  function resetSignalsTable() {
    // מחק את כל הנתונים מהטבלה
    $.signalsTbody.innerHTML = '';
    // מחק את הנתונים מ-localStorage
    try {
      localStorage.removeItem('po_signalsLog');
      localStorage.removeItem('po_lastSignals');
      // נקה את המערכים בזיכרון
      signalsLog.length = 0;
      lastSignals.length = 0;
      // אפס את המונים
      buyCount = 0;
      sellCount = 0;
      renderRecent();
      console.log('🗑️ טבלת האיתותים אופסה - כל הנתונים נמחקו מ-localStorage ומהזיכרון');
    } catch (e) {
      console.warn('שמירת נתונים נכשלה:', e);
    }
  }
  function renderSignalsTable() {
    const tb = $.signalsTbody;
    tb.innerHTML = '';
    for (const row of signalsLog.slice(0, 80)) {
      const tr = document.createElement('tr');

      // שעה
      const tdTime = document.createElement('td');
      tdTime.textContent = row.time || '—';

      // סימבול (עם אמוג'י)
      const tdSym = document.createElement('td');
      tdSym.innerHTML = `<span class="sym">${getSymbolEmoji(row.symbol)} <span>${row.symbol || '—'}</span></span>`;

      // סוג איתות (כולל NO_TRADE)
      const isBuy = row.kind === 'buy';
      const isSell = row.kind === 'sell';
      const isNone = !isBuy && !isSell;

      const tdKind = document.createElement('td');
      const kindLabel = isBuy ? t('buy') : isSell ? t('sell') : '—';
      const dotClass = isBuy ? 'green' : isSell ? 'red' : 'gray';
      tdKind.innerHTML = `
        <span class="pill ${isBuy ? 'buy' : isSell ? 'sell' : ''}">
          <span class="dot ${dotClass}"></span> ${kindLabel}
        </span>
      `;

      // מחיר
      const tdPrice = document.createElement('td');
      tdPrice.textContent = formatPrice(row.price);

      // משך (NO_TRADE → מקף)
      const tdDur = document.createElement('td');
      const durOk = Number.isFinite(row.duration) && row.duration > 0;
      tdDur.textContent = (isNone || !durOk) ? '—' : `${row.duration}m`;

      tr.appendChild(tdSym);
      tr.appendChild(tdTime);
      tr.appendChild(tdKind);
      tr.appendChild(tdPrice);
      tr.appendChild(tdDur);

      tb.appendChild(tr);
    }
  }

  function getSymbolEmoji(sym) {
    const s = (sym || '').toUpperCase();

    // קריפטו
    if (s.includes('BTC')) return '₿';
    if (s.includes('ETH')) return '◆';

    // מניות
    if (s.includes('AAPL') || s.includes('APPLE')) return '🍎';
    if (s.includes('AXP') || s.includes('AMERICAN EXPRESS')) return '💳';
    if (s.includes('CSCO') || s.includes('CISCO')) return '🌐';
    if (s.includes('MCD') || s.includes("MCDONALD")) return '🍔';
    if (s.includes('MSFT') || s.includes('MICROSOFT')) return '🪟';
    if (s.includes('PFE') || s.includes('PFIZER')) return '💊';
    if (s.includes('XOM') || s.includes('EXXON')) return '🛢';
    if (s.includes('BABA') || s.includes('ALIBABA')) return '🛒';
    if (s.includes('COIN') || s.includes('COINBASE')) return '💰';
    if (s.includes('NFLX') || s.includes('NETFLIX')) return '🎬';
    if (s.includes('BA') || s.includes('BOEING')) return '🛩';
    if (s.includes('MARA') || s.includes('MARATHON')) return '⛏';
    if (s.includes('AMD') || s.includes('ADVANCED MICRO DEVICES')) return '🔧';
    if (s.includes('AMZN') || s.includes('AMAZON')) return '🛒';
    if (s.includes('INTC') || s.includes('INTEL')) return '💻';
    if (s.includes('GME') || s.includes('GAMESTOP')) return '🎮';
    if (s.includes('CITI') || s.includes('CITIGROUP')) return '🏦';
    if (s.includes('META') || s.includes('FB') || s.includes('FACEBOOK')) return '📘';
    if (s.includes('V') || s.includes('VISA')) return '💳';
    if (s.includes('FDX') || s.includes('FEDEX')) return '📦';
    if (s.includes('PLTR') || s.includes('PALANTIR')) return '🧬';
    if (s.includes('JNJ') || s.includes('JOHNSON')) return '💊';
    if (s.includes('TSLA') || s.includes('TESLA')) return '🚗';

    // ברירת מחדל
    return '❓';
  }

  /**********************
   * CLOCK
   **********************/
  function startClock() {
    if (clockTimer) clearInterval(clockTimer);
    const upd = () => {
      // קריאת שעה מהדף במקום מהמחשב
      const timeFromPage = getTimeFromDomAsText();
      const p = getPriceFromDom();
       
      if (timeFromPage && $.clock) {
        $.clock.textContent = timeFromPage;
      }

      updateSymbol();
      updateProfitPercent();

      if (p != null && $.price) $.price.textContent = formatPrice(p);

      // עדכון UI של Pending Signals
      uiTick();
    };
    upd();
    
    // MutationObserver - מגיב **מיידי** לשינויים ב-DOM
    const timeEl = document.querySelector('.current-time__time');
    if (timeEl) {
      const observer = new MutationObserver(upd);
      observer.observe(timeEl, { 
        childList: true, 
        characterData: true, 
        subtree: true 
      });
    }
    
    // גיבוי - interval קצר יותר
    clockTimer = setInterval(upd, 200);
  }

  /**********************
   * DRAGGING
   **********************/
  function enableDragging() {
    let isDown = false, offsetX = 0, offsetY = 0;
    $.dragHandle.addEventListener('mousedown', (e) => {
      isDown = true;
      const rect = $.host.getBoundingClientRect();
      $.host.style.left = rect.left + 'px';
      $.host.style.top = rect.top + 'px';
      $.host.style.right = 'auto';
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDown) return;

      // הגבלת גובה עליון - לא יעלה יותר מדי למעלה
      const minTop = 20; // גובה מינימלי מהחלק העליון (פחות הגבלה)
      const maxTop = window.innerHeight - 200; // גובה מקסימלי מהחלק העליון

      let newTop = e.clientY - offsetY;

      // הגבלת הגובה העליון (עם לוגים לבדיקה)
      if (newTop < minTop) {
        newTop = minTop;
      }
      if (newTop > maxTop) {
        newTop = maxTop;
      }

      $.host.style.left = (e.clientX - offsetX) + 'px';
      $.host.style.top = newTop + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (isDown) { isDown = false; savePosition(); }
    });
  }
  function savePosition() {
    try {
      const rect = $.host.getBoundingClientRect();
      localStorage.setItem(POS_KEY, JSON.stringify({ left: rect.left, top: rect.top }));
    } catch { }
  }
  function restorePosition() {
    try {
      // לא מחזירים מיקום ישן - תמיד מתחילים ממרכז הדף
      const centerLeft = (window.innerWidth - 380) / 2; // רוחב ה-UI הוא 380px
      const centerTop = 120; // גובה קבוע מהחלק העליון

      $.host.style.left = centerLeft + 'px';
      $.host.style.top = centerTop + 'px';
      $.host.style.right = 'auto';
    } catch { }
  }

  /**********************
   * HELPERS
   **********************/
  function floorToTfTs(ts) {
    const sec = TIMEFRAMES[currentTf].seconds;
    return Math.floor(ts / (sec * 1000)) * (sec * 1000);
  }
  function formatPrice(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    const s = n.toFixed(6).replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
    return s;
  }

  let priceTooltipIndex = -1

  function getPriceFromDom() {
    // נחפש את כל האלמנטים עם tooltip-text
    const allTooltips = document.querySelectorAll('.tooltip-text');

    try {
      if (priceTooltipIndex != -1) {
        const text = allTooltips[priceTooltipIndex].textContent?.trim();
        const val = isPriceMatch(text);
        if (val != null) {
          if (window.__poDebug) console.log('✅ מחיר נמצא (cached):', val);
          return Number.isFinite(val) ? val : null;
        }
      }
    } catch (err) {
      console.error('Error reading cached price tooltip index, falling back to full search:', err);
      priceTooltipIndex = -1;
    }

    // נחפש רק את הטקסט שמכיל "than" ו-"after" (מחיר)
    for (let i = 0; i < allTooltips.length; i++) {
      const text = allTooltips[i].textContent?.trim();
      const val = isPriceMatch(text)
      if (val != null) {
        priceTooltipIndex = i;
        if (window.__poDebug) console.log('✅ מחיר נמצא:', val);
        return Number.isFinite(val) ? val : null;
      }
    }

    if (window.__poDebug) console.log('❌ לא נמצא מחיר בכל ה-tooltips');
    return null;
  }

  function isPriceMatch(text){
          // נחפש את הטקסט שמכיל "than" ו-"after"
      if (text && text.includes('than') && text.includes('after')) {
        if (window.__poDebug) console.log('✅ מצאתי tooltip עם מחיר:', text);

        // חיפוש המחיר בטקסט - ננסה כמה דפוסים
        let priceMatch = text.match(/than\s+(\d+\.?\d*)\s+after/i);
        if (!priceMatch) {
          // ננסה דפוס אחר
          priceMatch = text.match(/than\s+(\d+\.\d+)\s+after/i);
        }
        if (!priceMatch) {
          // ננסה דפוס עם מספרים ארוכים יותר
          priceMatch = text.match(/than\s+(\d+\.\d{3,})\s+after/i);
        }

        if (priceMatch && priceMatch[1]) {
          const val = parseFloat(priceMatch[1]);
          if (window.__poDebug) console.log('✅ מחיר נמצא:', val);
          return Number.isFinite(val) ? val : null;
        }

        // אם לא נמצא, ננסה לחפש מספר עם נקודה עשרונית
        const fallbackMatch = text.match(/(\d+\.\d{3,})/);

        if (fallbackMatch && fallbackMatch[1]) {
          const val = parseFloat(fallbackMatch[1]);
          if (window.__poDebug) console.log('✅ מחיר נמצא ב-fallback:', val);
          return Number.isFinite(val) ? val : null;
        }
      }
      return null;
  }

  // קריאת שעה מהדף
  function getTimeFromDom() {
    let currentTime = new Date();
    
    const el = document.querySelector('.current-time__time');

    if (!el) return currentTime.getTime();
    const timeFromPage = (el.textContent || '').trim();
       
    if (timeFromPage && $.clock && (/^\d{2}:\d{2}:\d{2}$/.test(timeFromPage))) {
        // parse "HH:MM:SS" into a Date object (today with that time)
        const parts = (timeFromPage || '').split(':').map(p => parseInt(p, 10));
        if (parts.length === 3 && parts.every(n => Number.isFinite(n))) {
          const [hh, mm, ss] = parts;
          const d = new Date();
          d.setHours(hh, mm, ss, 0);
          currentTime = d;
        }
    } else {
        // נפילה לשעה מהמחשב אם לא ניתן לקרוא מהדף
    }
    const hh = String(currentTime.getHours()).padStart(2, '0');
    const mm = String(currentTime.getMinutes()).padStart(2, '0');
    const ss = String(currentTime.getSeconds()).padStart(2, '0');

    return currentTime.getTime();;
  }

  function getTimeFromDomAsText() {
    const d = new Date( getTimeFromDom());

    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;

  }

  // קריאת אחוז הרווח מהדף
  function getProfitPercentFromDom() {
    const el = document.querySelector('.value__val-start');
    if (!el) return null;
    const txt = el.textContent || '';
    const match = txt.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }
  function updateSymbol() {
    const el = document.querySelector(SELECTOR_SYMBOL);
    const sym = (el && el.textContent ? el.textContent.trim() : '') || '—';
    currentSymbol = sym;
    if ($.sym) $.sym.textContent = sym;
  }

  // עדכון אחוז הרווח בלבד (כל שנייה)
  function updateProfitPercent() {
    const profitPercent = getProfitPercentFromDom();
    if (profitPercent !== null) {
      $.profitPercent.textContent = `${profitPercent}%`;

      // עדכון צבעים בהתאם לאחוז
      $.profitPercent.classList.remove('profit-high', 'profit-low');
      if (profitPercent >= 89) {
        $.profitPercent.classList.add('profit-high'); // לבן
      } else {
        $.profitPercent.classList.add('profit-low');  // אדום זוהר
      }
    } else {
      $.profitPercent.textContent = '—';
      $.profitPercent.classList.remove('profit-high', 'profit-low');
    }
  }



  // עדכון אחוז הרווח
  function updateProfitInfo() {
    updateProfitPercent();
  }

  function renderRecent() {
    // הפונקציה הוסרה כי recentList כבר לא קיים
    return;
  }

  /**********************
   * SAMPLING & RSI
   **********************/
  function startSampling() {
    if (sampling) return;
    sampling = true;
    botStarted = false; // הבוט הופעל!

    // Show "pending" state until we hit the aligned boundary
    $.runState.classList.remove("green");
    $.runState.classList.add("orange");

    $.startBtn.textContent = t('stop');
    $.startBtn.classList.add('btn-stop');

    lastTfTs = null;

    // clear any existing timer (safe clear for timeout/interval)
    if (sampleTimer) {
      try { clearInterval(sampleTimer); } catch (e) { try { clearTimeout(sampleTimer); } catch (ee) { } }
      sampleTimer = null;
    }

    let secondsLeft = getSecondsToNextCandle()

    // inform user we're waiting for the aligned start (seconds logged only)
    console.log(`⏳ waiting for aligned start: ${secondsLeft}s`);
    setSignal(t('waitingForNextCandle'), null);

    $.runState.classList.remove("red");
    $.runState.classList.add("orange");

    // start sampling exactly at the aligned boundary
    sampleTimer = setTimeout(() => {
      botStarted = true; // הבוט רץ!
      console.log('▶️ starting sampling now');
      // first aligned sample immediately
      tickSample();

      // now we are truly running
      $.runState.classList.remove("orange");
      $.runState.classList.add("green");
      setSignal(t('waitingForSignal'), null);

      // replace timeout id with interval id for regular ticks
      sampleTimer = setInterval(tickSample, SAMPLE_MS);
    }, secondsLeft * 1000);
  }

  function stopSampling() {
    sampling = false;
    botStarted = false; // הבוט כבוי!
    candles = []; currentCandle = null; lastTfTs = null; lastSignalAt = 0;
    lastSignalBarTs = null;
    if ($.rsiVal) $.rsiVal.textContent = '—';
    if ($.count) $.count.textContent = '0';
    if (sampleTimer) clearInterval(sampleTimer);
    $.runState.classList.remove("green");
    $.runState.classList.add("red");
    $.startBtn.textContent = t('start');
    $.startBtn.classList.remove('btn-stop');
    setSignal(t('waitingForBotStart'), null); // הודעה מתאימה לכיבוי
  }

  function toggleSampling() { sampling ? stopSampling() : startSampling(); }
  function syncFirstCandle() {
    stopSampling();
    startSampling();
  }

  function tickSample() {
    updateSymbol();
    const price = getPriceFromDom();
    if (price == null) return;

    // עדכון משתנים גלובליים
    currentPrice = price;
    if ($.price) $.price.textContent = formatPrice(price);

    const nowTs = getTimeFromDom();
    buildOrRollCandle(price, nowTs);
  }

  function buildOrRollCandle(price, nowTs) {
    const tfTs = floorToTfTs(nowTs);
    if (!currentCandle || lastTfTs == null) {
      currentCandle = { t: tfTs, open: price, high: price, low: price, close: price };
      lastTfTs = tfTs;
      return;
    }
    if (tfTs !== lastTfTs) {
      candles.push(currentCandle);
      if ($.count) $.count.textContent = String(candles.length);
      lastCandleIndex++; // עדכון אינדקס הנר
      analyzeOnNewClose();
      currentCandle = { t: tfTs, open: price, high: price, low: price, close: price };
      lastTfTs = tfTs;
      return;
    }
    // עדכון הנר הנוכחי
    if (price > currentCandle.high) currentCandle.high = price;
    if (price < currentCandle.low) currentCandle.low = price;
    currentCandle.close = price;
  }

  async function analyzeOnNewClose() {
    const closes = candles.map(c => c.close);
    if (closes.length < RSI_PERIOD + 1) return;

    // ---- כאן מתבצעת הקריאה לשרת ----
    const decision = await decideOnServer();

    // עדכון RSI למסך מתוך השרת
    if (decision?.rsiCurrent != null) {
      currentRsi = Number(decision.rsiCurrent).toFixed(2);
      if ($.rsiVal) $.rsiVal.textContent = currentRsi;
    }

    if (!decision || !decision.action || decision?.rsiCurrent == null) {
      setSignal('ממתין לאיתות', null);
      uiTick();
      return;
    }

    // נר שנסגר עכשיו (האחרון במערך)
    const lastClosed = candles[candles.length - 1];
    
    if (decision.reason === 'cooldown_active') {
      // קולדאון: לא יותר מאיתות אחד בפרק זמן סביר
      const tfSec = TIMEFRAMES[currentTf].seconds;
      const cooldownMs = Math.max(MIN_COOLDOWN_SEC, tfSec) * 1000;
      if (lastSignalBarTs && (lastClosed.t - lastSignalBarTs) < cooldownMs) {
        // רק סטטוס למסך – אין ירי איתות
        const timeLeft = Math.ceil((cooldownMs - (lastClosed.t - lastSignalBarTs)) / 1000);
        if (curr <= 30) setSignal(`${t('oversoldCooldown')} ${timeLeft}s`, 'buy');
        else if (curr >= 70) setSignal(`${t('overboughtCooldown')} ${timeLeft}s`, 'sell');
        else setSignal(`${t('noSignalCooldown')} ${timeLeft}s`, null);
        return;
      }
    } else if (decision.action === 'BUY') {
      // ירי איתות קנייה  
      fireSignal('buy', currentRsi);
      lastSignalBarTs = lastClosed.t;
    } else if (decision.action === 'SELL') {
      // ירי איתות מכירה  
      fireSignal('sell', currentRsi);
      lastSignalBarTs = lastClosed.t;
    } else {
      // אין איתות – רק סטטוס למסך
      if (currentRsi <= 30) setSignal(t('oversoldWait'), 'buy');
      else if (currentRsi >= 70) setSignal(t('overboughtWait'), 'sell');
      else setSignal(t('noSignalRange'), null);
    }

    // בדיקת Pending Signals בכל סגירת נר
    onCandleCloseIntegration();

    // עדכון UI מיד
    uiTick();
  }

  
  async function decideOnServer() {
    try {
      const payload = {
        symbol: currentSymbol || "—",
        timeframe: currentTf || "1m",
        rsiPeriod: RSI_PERIOD, 
        candles: candles.map(c => ({ t: c.t, open: c.open, high: c.high, low: c.low, close: c.close })),
        profitPercent: getProfitPercentFromDom() || null,
        lastSignalBarTs: lastSignalBarTs || null
      };

      let resp = await sendToBackground("decision.decide", payload);

      // נחשוף שגיאה ולא נבלע
      if (!resp?.ok) {
        console.warn('decision.decide failed:', resp);

        // 401 → נבקש התחברות וננסה פעם אחת נוספת

        if (resp.error) {
          // await showLoginOverlay();
          await openLoginOverlayOnWidget();

        }

      }

      return resp.data; // DecideResponse
    } catch (e) {
      console.warn("Server decide error (catch):", e);
      setSignal('ממתין לאיתות', null);
      return { action: "NO_TRADE", reason: "exception" };
    }
  }

  function fireSignal(kind, rsiVal) {
    const now = new Date( getTimeFromDom());
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hh}:${mm}:${ss}`;
    const symbol = ($.sym.textContent || '—').trim();
    const priceNow = parseFloat((($.price.textContent || '').replace(/[^0-9.\-]/g, ''))) || null;

    // חישוב משך עסקה דינמי בהתאם לניתוח הטכני
    let duration = 0.5; // ברירת מחדל

    // קביעת משך עסקה לפי חוזק האיתות והטיימפריים
    if (currentTf === '0.5m') {
      duration = 0.5;
    } else if (currentTf === '1m') {
      duration = 1;
    } else if (currentTf === '5m') {
      duration = 3;
    }

    // מונים + 4 אחרונים
    if (kind === 'buy') buyCount++; else sellCount++;
    lastSignals.unshift({ kind, time: timeStr, rsi: rsiVal });
    if (lastSignals.length > 4) lastSignals.pop();
    renderRecent();

    // חישוב רמת ביטחון לפי חוזק ה-RSI
    let confidence = 5; // ברירת מחדל
    const rsiDistance = Math.abs(rsiVal - 50);

    if (rsiDistance >= 45) confidence = 9;
    else if (rsiDistance >= 40) confidence = 8;
    else if (rsiDistance >= 35) confidence = 7;
    else if (rsiDistance >= 30) confidence = 6;
    else confidence = 5;

    // לוג מודאל
    const indicatorsText = kind === 'buy'
      ? `RSI(${RSI_PERIOD}) חצה מעל 30`
      : `RSI(${RSI_PERIOD}) חצה מתחת 70`;

      signalsLog.unshift({
        time: timeStr,
        symbol,
        kind,
        duration: duration,
        indicators: indicatorsText,
        rsi: rsiVal,
        price: priceNow,
        confidence: confidence,
        source: 'בוט'
      });

    try {
      localStorage.setItem('po_signalsLog', JSON.stringify(signalsLog.slice(0, 80)));
      localStorage.setItem('po_lastSignals', JSON.stringify(lastSignals.slice(0, 4)));
    } catch (e) {
      console.warn("[fireSignal] שמירת היסטוריה נכשלה:", e);
    }

    // יצירת איתות בצורת טבלה מסודרת
    const signalKind = t(kind);
    const secondsToNext = getSecondsToNextCandle();
    const durationText = duration === 0.5 ?
      (currentLanguage === 'he' ? 'חצי דקה' : 'half a minute') :
      (currentLanguage === 'he' ? `${duration} דקות` : `${duration} minutes`);

    const inNextCandleText = currentLanguage === 'he' ? `בנר הבא בעוד ${secondsToNext} שניות` : `In the next candle in ${secondsToNext} seconds`;

    const message = `
      <div class="signal-message">
        <div class="row"><span class="label">${t('symbol')}</span> <span class="value">${symbol}</span></div>
        <div class="row"><span class="label">${t('signal')}</span> <span class="value">${signalKind}</span></div>
        <div class="row"><span class="label">${t('entryTime')}</span> <span class="value">${inNextCandleText}</span></div>
        <div class="row"><span class="label">${t('duration')}</span> <span class="value">${durationText}</span></div>
      </div>
    `;

    setSignal(message, kind);


    // ensure rsiVal is a number before calling toFixed
    const _rsiNum = (typeof rsiVal === 'number') ? rsiVal : (rsiVal != null ? Number(rsiVal) : NaN);
    const rsiText = (typeof _rsiNum === 'number' && isFinite(_rsiNum)) ? _rsiNum.toFixed(2) : (rsiVal == null ? '–' : String(rsiVal));
        $.signalMeta.textContent = `RSI ${rsiText} | ${t('confidence')}: ${confidence}/10 | TF ${currentTf}`;

    // הוספת עסקה חדשה לטבלת העסקאות
    addNewTrade(kind, duration, 'בוט', null, confidence, false); // תמיד ידני עבור איתותים רגילים

    // נגינת צליל נעים לאיתות
    playSuccessSound();
  }


  /**********************
   * INDICATORS PANEL UPDATE
   **********************/

  /**********************
   * SIGNAL VIEW
   **********************/
  function setSignal(html, kind) {
    // תרגום איתותים בסיסיים
    let translatedHtml = html;
    if (currentLanguage === 'en') {
      translatedHtml = html
        .replace(/ממתין לאיתות/g, 'Waiting for signal')
        .replace(/ממתין להפעלת הבוט/g, 'Waiting for bot activation')
        .replace(/קנייה/g, 'Buy')
        .replace(/מכירה/g, 'Sell')
        .replace(/ייתכן איתות בקרוב/g, 'Signal possible soon')
        .replace(/מערכת אוטומציה הופעלה/g, 'Automation system enabled')
        .replace(/מערכת אוטומציה כובתה/g, 'Automation system disabled')
        .replace(/עסקה אוטומטית/g, 'Automated trade')
        .replace(/עסקה הצליחה/g, 'Trade succeeded')
        .replace(/עסקה נכשלה/g, 'Trade failed')
        .replace(/מניה:/g, 'Stock:')
        .replace(/עסקה:/g, 'Trade:')
        .replace(/כניסה:/g, 'Entry:')
        .replace(/משך העסקה:/g, 'Trade Duration:')
        .replace(/בנר הבא בעוד/g, 'in the next candle in')
        .replace(/ שניות/g, ' seconds')
        .replace(/חצי דקה/g, 'half a minute')
        .replace(/ דקות/g, ' minutes');
    }

    $.signal.innerHTML = translatedHtml;
    $.signal.classList.remove('buy', 'sell');
    if (kind === 'buy') $.signal.classList.add('buy');
    if (kind === 'sell') $.signal.classList.add('sell');

    // אוטומטית נעלם אחרי 10 שניות
    setTimeout(() => {
      $.signal.textContent = botStarted ? t('waitingForSignal') : t('waitingForBotStart');
      $.signal.classList.remove('buy', 'sell');
    }, 10000); // 10 שניות
  }

  /**********************
   * TRADES MANAGEMENT
   **********************/


  // הזנת עסקה חדשה לטבלת העסקאות
  function addNewTrade(kind, duration, source = 'בוט', reasoning = null, confidence = null, isAutomated = false) {
    const now = new Date( getTimeFromDom());
    const entryTime = new Date(now.getTime() + getSecondsToNextCandle() * 1000);
    const closeTime = new Date(entryTime.getTime() + duration * 60 * 1000);

    const trade = {
      id: getTimeFromDom(), // מזהה ייחודי
      entryTime: entryTime.toISOString(),
      closeTime: closeTime.toISOString(),
      symbol: ($.sym.textContent || '—').trim(),
      signal: kind === 'buy' ? t('buy') : t('sell'),
      entryPrice: '—', // לא דוגמים מחיר עד הנר הבא
      duration: duration,
      closePrice: null, // יתעדכן בסיום העסקה
      verification: null, // יתעדכן בסיום העסקה
      source: source,
      action: isAutomated ? t('automatic') : t('manual'), // סוג הפעולה - אוטומטי או ידני
      reasoning: reasoning,
      confidence: confidence, // רמת ביטחון חדשה
      status: 'active', // active, completed
      // רמות גיבוי חדשות
      backup1Price: null, // מחיר כניסה לרמת גיבוי 1
      verification1: null, // אימות רמת גיבוי 1
      backup2Price: null, // מחיר כניסה לרמת גיבוי 2
      verification2: null, // אימות רמת גיבוי 2
      backup3Price: null, // מחיר כניסה לרמת גיבוי 3
      verification3: null, // אימות רמת גיבוי 3
      backupLevel: 0, // רמת הגיבוי הנוכחית (0, 1, 2, 3)
      // שדה חדש למחיר כניסה אמיתי
      actualEntryPrice: null, // יתעדכן בזמן הכניסה האמיתית לעסקה
      // שדה חדש לאחוז הרווח של העסקה
      profitPercent: null // יתעדכן בסיום העסקה
    };

    tradesLog.unshift(trade);

    // שמירה ל-localStorage
    try {
      localStorage.setItem('po_tradesLog', JSON.stringify(tradesLog.slice(0, 80)));
    } catch (e) {
      console.warn("שמירת עסקאות נכשלה:", e);
    }

    // בדיקת אוטומציה - אם הבוט נכנס לעסקה ידנית
    console.log('🔍 בדיקת אוטומציה מ-addNewTrade:', 'enabled=' + window.automationEnabled, 'kind=' + kind, 'isProcessingBackupLevels=' + window.automationSettings.isProcessingBackupLevels);

    // ביצוע עסקה אוטומטית אם המערכת מופעלת - עם בדיקת אחוז רווח
    if (window.automationEnabled && (kind === 'buy' || kind === 'sell')) {
      // בדיקת אחוז רווח לפני ביצוע אוטומטי
      const currentProfit = parseFloat((($.profitPercent.textContent || '').replace(/[^0-9.\-]/g, ''))) || null;
      if (currentProfit !== null && currentProfit < 89) {
        console.log('🚫 אחוז רווח נמוך מדי לביצוע אוטומטי:', currentProfit + '%');
        setSignal(`🚫 איתות תועד אבל בוט לא נכנס - אחוז רווח: ${currentProfit}% (מינימום: 89%)`, null);
        console.log('📊 העסקה תתועד בטבלה אבל הבוט לא ייכנס אליה');
        return trade.id; // העסקה כבר תועדה, אבל הבוט לא ייכנס
      }

      console.log('🤖 בוט נכנס לעסקה ידנית:', kind, '- מחכה לנר הבא...');

      // עדכון העסקה לאוטומטית
      const lastTrade = tradesLog.find(t => t.id === trade.id);
      if (lastTrade) {
        lastTrade.action = t('automatic');
        console.log('✅ עסקה עודכנה לאוטומטית:', lastTrade.id);
      }

      // סימון שהמערכת מתחילה לעבד איתות חדש
      window.automationSettings.isProcessingBackupLevels = true;
      window.automationSettings.backupLevel = 0;
      window.automationSettings.nextTradeAmount = window.automationSettings.entryAmount;
      window.automationSettings.lastDuration = duration; // שמירת duration לאיתות החדש

      const secondsToNext = getSecondsToNextCandle();
      console.log('⏰ יתבצע בעוד', secondsToNext, 'שניות');

      setTimeout(() => {
        console.log('🚀 מבצע עסקה אוטומטית מ-addNewTrade:', kind);
        if (window.executeAutomatedTrade) {
          window.executeAutomatedTrade(kind, duration);
        } else {
          console.log('❌ פונקציית executeAutomatedTrade לא מוגדרת עדיין');
        }
      }, (secondsToNext * 1000) - 400); // ביצוע בדיוק בתחילת הנר הבא!
    } else if (window.automationSettings.isProcessingBackupLevels) {
      console.log('⏸️ המערכת עדיין מעבדת רמות גיבוי - מדלג על איתות חדש');
    } else {
      console.log('❌ אוטומציה לא מופעלת או kind לא מתאים:', kind);
    }

    // שמירה נפרדת לסטטיסטיקה (לא תימחק כשמאפסים עסקאות)
    try {
      const statsEntry = {
        id: trade.id,
        entryTime: trade.entryTime,
        symbol: trade.symbol,
        signal: trade.signal,
        source: trade.source,
        status: 'active'
      };
      statsLog.unshift(statsEntry);
      localStorage.setItem('po_statsLog', JSON.stringify(statsLog.slice(0, 200))); // שמירה ל-200 עסקאות
    } catch (e) {
      console.warn("שמירת סטטיסטיקה נכשלה:", e);
    }

    // שמירה נפרדת לאינדיקטור (לא תימחק כשמאפסים עסקאות)
    try {
      const indicatorEntry = {
        id: trade.id,
        source: trade.source,
        status: 'active'
      };
      indicatorLog.unshift(indicatorEntry);
      localStorage.setItem('po_indicatorLog', JSON.stringify(indicatorLog.slice(0, 200))); // שמירה ל-200 עסקאות
    } catch (e) {
      console.warn("שמירת אינדיקטור נכשלה:", e);
    }

    // עדכון הטבלה
    renderTradesTable();

    // תזמון עדכון מחיר הכניסה האמיתי בנר הבא
    const secondsToNextCandle = getSecondsToNextCandle();

    console.log(`⏰ מתזמן עדכון מחיר כניסה אמיתי לעסקה ${trade.id} בעוד ${secondsToNextCandle} שניות`);

    setTimeout(() => {
      updateActualEntryPrice(trade.id);
    }, secondsToNextCandle * 1000);

    // תזמון עדכון העסקה בסיום הזמן (מרגע הכניסה לעסקה, לא מרגע קבלת האיתות!)
    const totalTimeToClose = secondsToNextCandle + (duration * 60); // זמן לכניסה + משך העסקה
    setTimeout(() => {
      completeTrade(trade.id);
    }, totalTimeToClose * 1000 - 400);

    if (window.__poDebug) {
      console.log('📊 עסקה חדשה נוספה:', trade);
      console.log(`⏰ מחיר כניסה אמיתי יתעדכן בעוד ${secondsToNextCandle} שניות (בנר הבא)`);
      console.log(`⏰ מחיר סגירה יתעדכן בעוד ${totalTimeToClose} שניות (מרגע הכניסה לעסקה)`);
    }
  }

  // השלמת עסקה בסיום הזמן
  function completeTrade(tradeId) {
    const trade = tradesLog.find(t => t.id === tradeId);
    if (!trade || trade.status !== 'active') return;

    // דגימת מחיר בסגירת הנר (לא מיד!)
    const closePrice = getPriceFromDom();
    // שימוש במחיר הכניסה האמיתי
    const entryPrice = trade.actualEntryPrice || trade.entryPrice;

    // חישוב האם העסקה הצליחה
    let verification = 'נכשל';

    // חישוב האם העסקה הצליחה

    if ((trade.signal === t('buy') || trade.signal === 'קנייה' || trade.signal === 'Buy') && closePrice > entryPrice) {
      verification = 'הצליח';
    } else if ((trade.signal === t('sell') || trade.signal === 'מכירה' || trade.signal === 'Sell') && closePrice < entryPrice) {
      verification = 'הצליח';
    }

    // עדכון העסקה
    trade.closePrice = closePrice;
    trade.verification = verification;

    // שמירת אחוז הרווח הנוכחי
    trade.profitPercent = getProfitPercentFromDom();

    // אם העסקה הצליחה - סוף סיפור
    if (verification === 'הצליח') {
      trade.status = 'completed';
    } else {
      // אם העסקה נכשלה - מתחיל רמת גיבוי 1
      trade.backupLevel = 1;

      // בדיקת תנאים לרמות גיבוי

      startBackupLevel(trade.id, 1);

      // אם זה עסקה אוטומטית - הפעלת רמת גיבוי 1 מיד!
      if (window.automationEnabled && window.automationSettings.isProcessingBackupLevels) {
        console.log('🔄 עסקה ראשונה נכשלה - מתחיל רמות גיבוי');
        setTimeout(() => {
          if (window.automationEnabled && window.automationSettings.isProcessingBackupLevels) {
            console.log('🚀 מפעיל רמת גיבוי 1 לעסקה אוטומטית');
            // עדכון רמת הגיבוי במערכת האוטומטית
            window.automationSettings.backupLevel = 1;
            window.automationSettings.nextTradeAmount = window.automationSettings.entryAmount * Math.pow(2, 1);
            console.log('🔍 DEBUG - עדכון לרמת גיבוי 1, סכום חדש:', window.automationSettings.nextTradeAmount);
            window.executeAutomatedTrade(trade.signal === t('buy') || trade.signal === 'קנייה' || trade.signal === 'Buy' ? 'buy' : 'sell', window.automationSettings.lastDuration || 0.5);
          }
        }, 10); // המתנה של שנייה לוודא שהמחיר התעדכן
      }
    }

    // שמירה ל-localStorage
    try {
      localStorage.setItem('po_tradesLog', JSON.stringify(tradesLog.slice(0, 80)));
    } catch (e) {
      console.warn("עדכון עסקאות נכשל:", e);
    }

    // עדכון הסטטיסטיקה ב-statsLog
    try {
      const statsEntry = statsLog.find(s => s.id === tradeId);
      if (statsEntry) {
        statsEntry.status = 'completed';
        statsEntry.verification = verification;
        localStorage.setItem('po_statsLog', JSON.stringify(statsLog.slice(0, 200)));
      }
    } catch (e) {
      console.warn("עדכון סטטיסטיקה נכשל:", e);
    }

    // עדכון האינדיקטור ב-indicatorLog
    try {
      const indicatorEntry = indicatorLog.find(i => i.id === tradeId);
      if (indicatorEntry) {
        indicatorEntry.status = 'completed';
        indicatorEntry.verification = verification;
        localStorage.setItem('po_indicatorLog', JSON.stringify(indicatorLog.slice(0, 200)));
      }
    } catch (e) {
      console.warn("עדכון אינדיקטור נכשל:", e);
    }

    // עדכון הטבלה
    renderTradesTable();

    // עדכון סטטיסטיקות
    updateTradesStats();



    console.log(`🎯 עסקה הושלמה: ${trade.signal} ${verification}`, trade);

    // אם זה עסקה אוטומטית - עדכון המערכת האוטומטית
    if (window.automationEnabled && window.automationSettings.isProcessingBackupLevels) {
      console.log('🔄 מעדכן מערכת אוטומציה על סיום עסקה');
      if (verification === 'הצליח') {
        // עסקה הצליחה - איפוס המערכת
        window.automationSettings.isProcessingBackupLevels = false;
        window.automationSettings.backupLevel = 0;
        window.automationSettings.nextTradeAmount = window.automationSettings.entryAmount;
        window.automationSettings.lastDuration = null;
        console.log('✅ מערכת אוטומציה אופסה אחרי הצלחה');
      } else {
        // עסקה נכשלה - אבל זה כבר מטופל ברמות הגיבוי
        // לא מאפסים את isProcessingBackupLevels כי אנחנו עדיין צריכים רמות גיבוי!
        console.log('❌ עסקה נכשלה - רמות הגיבוי ימשיכו לפעול');
      }
    }
  }

  // עדכון מחיר הכניסה האמיתי (קריאה בזמן הכניסה האמיתית לעסקה)
  function updateActualEntryPrice(tradeId) {
    const trade = tradesLog.find(t => t.id === tradeId);
    if (trade && trade.status === 'active') {
      const actualPrice = getPriceFromDom();
      trade.actualEntryPrice = actualPrice;
      trade.entryPrice = actualPrice; // עדכון גם את השדה הראשי

      if (window.__poDebug) {
        console.log(`💰 מחיר כניסה אמיתי עודכן: ${actualPrice} לעסקה ${tradeId}`);
        console.log(`📊 מחיר כניסה בנר הבא: ${actualPrice}`);
      }

      // עדכון הטבלה כדי להראות את השינוי
      renderTradesTable();

      // שמירה ל-localStorage
      try {
        localStorage.setItem('po_tradesLog', JSON.stringify(tradesLog.slice(0, 80)));
      } catch (e) {
        console.warn("שמירת מחיר כניסה אמיתי נכשלה:", e);
      }
    }
  }

  // התחלת רמת גיבוי
  function startBackupLevel(tradeId, level) {
    const trade = tradesLog.find(t => t.id === tradeId);
    if (!trade || trade.status === 'completed') return;

    console.log(`🔄 מתחיל רמת גיבוי ${level} לעסקה ${tradeId}`);

    // דגימת מחיר בדיוק בסוף הזמן של הרמה הקודמת
    const backupPrice = getPriceFromDom();

    // עדכון המחיר לרמת הגיבוי המתאימה
    if (level === 1) {
      trade.backup1Price = backupPrice;
      if (window.__poDebug) console.log(`💰 רמת גיבוי 1: מחיר כניסה ${backupPrice}`);
    } else if (level === 2 && (MAX_BACKUP_LEVEL >= 2)) {
      trade.backup2Price = backupPrice;
      if (window.__poDebug) console.log(`💰 רמת גיבוי 2: מחיר כניסה ${backupPrice}`);
    } else if (level === 3 && (MAX_BACKUP_LEVEL >= 3)) {
      trade.backup3Price = backupPrice;
      if (window.__poDebug) console.log(`💰 רמת גיבוי 3: מחיר כניסה ${backupPrice}`);
    }

    // תזמון בדיקת אימות בסוף הזמן של רמת הגיבוי
    setTimeout(() => {
      checkBackupLevel(tradeId, level);
    }, trade.duration * 60 * 1000 - 400);

    console.log(`⏰ רמת גיבוי ${level} תיבדק בעוד ${trade.duration} דקות`);
  }

  // בדיקת אימות רמת גיבוי
  function checkBackupLevel(tradeId, level) {
    const trade = tradesLog.find(t => t.id === tradeId);
    if (!trade || trade.status === 'completed') return;

    const closePrice = getPriceFromDom();
    let backupPrice;

    // קבלת המחיר של רמת הגיבוי
    if (level === 1) {
      backupPrice = trade.backup1Price;
    } else if (level === 2 && (MAX_BACKUP_LEVEL >= 2)) {
      backupPrice = trade.backup2Price;
    } else if (level === 3 && (MAX_BACKUP_LEVEL >= 3)) {
      backupPrice = trade.backup3Price;
    }

    if (!backupPrice) return;

    // חישוב האם רמת הגיבוי הצליחה
    let verification = 'נכשל';

    // בדיקת רמת גיבוי

    if ((trade.signal === t('buy') || trade.signal === 'קנייה' || trade.signal === 'Buy') && closePrice > backupPrice) {
      verification = 'הצליח';
    } else if ((trade.signal === t('sell') || trade.signal === 'מכירה' || trade.signal === 'Sell') && closePrice < backupPrice) {
      verification = 'הצליח';
    }

    // עדכון האימות של רמת הגיבוי
    if (level === 1) {
      trade.verification1 = verification;
    } else if (level === 2 && (MAX_BACKUP_LEVEL >= 2)) {
      trade.verification2 = verification;
    } else if (level === 3 && (MAX_BACKUP_LEVEL >= 3)) {
      trade.verification3 = verification;
    }

    // שמירת אחוז הרווח הנוכחי (אם זה הרמה האחרונה)
    if (verification === 'הצליח' || level === MAX_BACKUP_LEVEL) {
      trade.profitPercent = getProfitPercentFromDom();
    }

    // אם רמת הגיבוי הצליחה - סוף סיפור
    if (verification === 'הצליח') {
      trade.status = 'completed';
      console.log(`✅ רמת גיבוי ${level} הצליחה - העסקה הושלמה`);
    } else {
      // אם רמת הגיבוי נכשלה - ממשיך לרמה הבאה
      if (level < MAX_BACKUP_LEVEL) {
        trade.backupLevel = level + 1;
        startBackupLevel(tradeId, level + 1);
        console.log(`🔄 רמת גיבוי ${level} נכשלה - ממשיך לרמה ${level + 1}`);

        // אם זה עסקה אוטומטית - הפעלת הרמה הבאה מיד!
        if (window.automationEnabled && window.automationSettings.isProcessingBackupLevels) {
          const nextLevel = level + 1;
          setTimeout(() => {
            if (window.automationEnabled && window.automationSettings.isProcessingBackupLevels) {
              console.log(`🚀 מפעיל רמת גיבוי ${nextLevel} לעסקה אוטומטית`);
              // עדכון רמת הגיבוי במערכת האוטומטית
              window.automationSettings.backupLevel = nextLevel;

              if (nextLevel <= DUPLICATE_MAX_LEVEL) {
                window.automationSettings.nextTradeAmount = window.automationSettings.entryAmount * Math.pow(2, nextLevel);
              } else if (nextLevel > DUPLICATE_MAX_LEVEL) {
                window.automationSettings.nextTradeAmount = window.automationSettings.entryAmount * Math.pow(2, DUPLICATE_MAX_LEVEL);
              } else{
              // keep the same amount as at the configured cap level (no further doubling)
                window.automationSettings.nextTradeAmount = window.automationSettings.entryAmount;
              }
              console.log(`🔍 DEBUG - עדכון לרמת גיבוי ${nextLevel}, סכום חדש:`, window.automationSettings.nextTradeAmount);
              window.executeAutomatedTrade(trade.signal === t('buy') || trade.signal === 'קנייה' || trade.signal === 'Buy' ? 'buy' : 'sell', window.automationSettings.lastDuration || 0.5);
            }
          }, 10); // המתנה של שנייה לוודא שהמחיר התעדכן
        }
      } else {
        // זה הרמה האחרונה - העסקה נכשלה סופית
        trade.status = 'completed';
        console.log(`❌ כל רמות הגיבוי נכשלו - העסקה נכשלה סופית`);

        // אם זה עסקה אוטומטית - איפוס המערכת
        if (window.automationEnabled && window.automationSettings.isProcessingBackupLevels) {
          window.automationSettings.isProcessingBackupLevels = false;
          window.automationSettings.backupLevel = 0;
          window.automationSettings.nextTradeAmount = window.automationSettings.entryAmount;
          window.automationSettings.lastDuration = null;
          console.log('🔄 מערכת אוטומציה אופסה אחרי כישלון כל רמות הגיבוי');
        }
      }
    }

    // שמירה ל-localStorage
    try {
      localStorage.setItem('po_tradesLog', JSON.stringify(tradesLog.slice(0, 80)));
    } catch (e) {
      console.warn("עדכון עסקאות נכשל:", e);
    }

    // עדכון הסטטיסטיקה ב-statsLog
    try {
      const statsEntry = statsLog.find(s => s.id === tradeId);
      if (statsEntry) {
        if (level === 1) {
          statsEntry.verification1 = verification;
        } else if (level === 2 && (MAX_BACKUP_LEVEL >= 2)) {
          statsEntry.verification2 = verification;
        } else if (level === 3 && (MAX_BACKUP_LEVEL >= 3)) {
          statsEntry.verification3 = verification;
        }
        localStorage.setItem('po_statsLog', JSON.stringify(statsLog.slice(0, 200)));
      }
    } catch (e) {
      console.warn("עדכון סטטיסטיקה נכשל:", e);
    }

    // עדכון האינדיקטור ב-indicatorLog
    try {
      const indicatorEntry = indicatorLog.find(i => i.id === tradeId);
      if (indicatorEntry) {
        if (level === 1) {
          indicatorEntry.verification1 = verification;
        } else if (level === 2 && (MAX_BACKUP_LEVEL >= 2)) {
          indicatorEntry.verification2 = verification;
        } else if (level === 3 && (MAX_BACKUP_LEVEL >= 3)) {
          indicatorEntry.verification3 = verification;
        }
        localStorage.setItem('po_indicatorLog', JSON.stringify(indicatorLog.slice(0, 200)));
      }
    } catch (e) {
      console.warn("עדכון אינדיקטור נכשל:", e);
    }

    // עדכון הטבלה
    renderTradesTable();

    // עדכון סטטיסטיקות
    updateTradesStats();


  }

  /**********************
   * INIT
   **********************/
  function init() {

    (async () => {
      // טעינת שפה מ-localStorage
      loadLanguage();
      await ensureAuthGateAndMount();

      // --- שחזור היסטוריה מ-localStorage ---
      try {
        const savedLog = JSON.parse(localStorage.getItem('po_signalsLog') || "[]");
        const savedLast = JSON.parse(localStorage.getItem('po_lastSignals') || "[]");
        const savedTrades = JSON.parse(localStorage.getItem('po_tradesLog') || "[]");
        const savedStats = JSON.parse(localStorage.getItem('po_statsLog') || "[]");
        const savedIndicator = JSON.parse(localStorage.getItem('po_indicatorLog') || "[]");
        const savedSoundEnabled = JSON.parse(localStorage.getItem('po_soundEnabled') || "true");
        if (Array.isArray(savedLog)) signalsLog.push(...savedLog);
        if (Array.isArray(savedLast)) lastSignals.push(...savedLast);
        if (Array.isArray(savedTrades)) tradesLog.push(...savedTrades);
        if (Array.isArray(savedStats)) statsLog.push(...savedStats);
        if (Array.isArray(savedIndicator)) indicatorLog.push(...savedIndicator);
        soundEnabled = savedSoundEnabled;

        renderRecent();       // מציג את ה־4 האחרונים
        renderSignalsTable(); // מציג את הטבלה
        renderTradesTable();  // מציג את טבלת העסקאות

        // עדכון אחוז הצלחה מהנתונים הקיימים
        updateTradesStats();

        // עדכון סטטיסטיקה אם החלון פתוח
        if ($.statsModal && $.statsModal.classList.contains('show')) {
          renderStatsChart();
        }



        // עדכון אייקון הצליל
        updateSoundIcon();

        console.log('📊 נתונים נטענו בהצלחה:', {
          signals: signalsLog.length,
          trades: tradesLog.length,
          stats: statsLog.length,
          indicator: indicatorLog.length,
          sound: soundEnabled
        });

      } catch (e) {
        console.warn("שחזור היסטוריה נכשל:", e);
      }
    })();

  }

  // --- הפעלה של init ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // פונקציה לנגינת צליל נעים
  function playSuccessSound() {
    // בדיקה אם הצליל מופעל
    if (!soundEnabled) return;

    try {
      // יצירת צליל נעים עם Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // חיבור הצלילים
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // הגדרת הצליל - צליל נעים וקצר
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // תו גבוה ונעים
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1); // עלייה בטון
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2); // ירידה בטון

      // עוצמת הצליל
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // עוצמה נמוכה ונעימה
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      // הפעלת הצליל
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

      console.log('🎵 צליל נעים נוגן!');
    } catch (error) {
      console.log('⚠️ לא ניתן לנגן צליל:', error);
    }
  }

  // פונקציה להחלפת מצב הצליל
  function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundIcon();

    // שמירה ל-localStorage
    try {
      localStorage.setItem('po_soundEnabled', JSON.stringify(soundEnabled));
    } catch (e) {
      console.warn("שמירת מצב צליל נכשלה:", e);
    }

    console.log(`🔊 צליל ${soundEnabled ? 'הופעל' : 'כובה'}`);
  }

  // עדכון אייקון הצליל
  function updateSoundIcon() {
    if ($.soundIcon) {
      if (soundEnabled) {
        $.soundIcon.textContent = '🔊'; // רמקול ירוק (מופעל)
        $.soundIcon.style.color = '#00e676'; // צבע ירוק
      } else {
        $.soundIcon.textContent = '🔇'; // רמקול אדום (כבוי)
        $.soundIcon.style.color = '#ff5252'; // צבע אדום
      }
    }
  }

  /**********************
   * MODAL STATISTICS
   **********************/
  function openStatsModal() {
    if (!$.statsModal) {
      console.error('statsModal not found');
      return;
    }
    renderStatsChart();
    $.statsModal.classList.add('show');
    $.statsModal.setAttribute('aria-hidden', 'false');
  }

  function closeStatsModal() {
    if (!$.statsModal) {
      console.error('statsModal not found');
      return;
    }
    $.statsModal.classList.remove('show');
    $.statsModal.setAttribute('aria-hidden', 'true');
  }

  // פונקציה לחישוב סטטיסטיקות בוט בלבד
  function calculateBotStats() {
    let firstEntrySuccess = 0;
    let backup1Success = 0;
    let backup2Success = 0;
    let backup3Success = 0;
    let totalFailure = 0;

    for (const trade of statsLog) {
      // רק עסקאות שהסתיימו (לא פעילות) ורק עסקאות בוט
      if (trade.status !== 'completed' || trade.source !== 'בוט') continue;

      // אם העסקה המקורית הצליחה
      if (trade.verification === t('succeeded') || trade.verification === 'הצליח' || trade.verification === 'Succeeded') {
        firstEntrySuccess++;
      }
      // אם רמת גיבוי 1 הצליחה
      else if (trade.verification1 === t('succeeded') || trade.verification1 === 'הצליח' || trade.verification1 === 'Succeeded') {
        backup1Success++;
      }
      // אם רמת גיבוי 2 הצליחה
      else if (trade.verification2 === t('succeeded') || trade.verification2 === 'הצליח' || trade.verification2 === 'Succeeded') {
        backup2Success++;
      }
      // אם רמת גיבוי 3 הצליחה
      else if (trade.verification3 === t('succeeded') || trade.verification3 === 'הצליח' || trade.verification3 === 'Succeeded') {
        backup3Success++;
      }
      // אם העסקה נכשלה סופית (כל הרמות נכשלו)
      else if ((trade.verification === t('failed') || trade.verification === 'נכשל' || trade.verification === 'Failed') &&
        (trade.verification1 === t('failed') || trade.verification1 === 'נכשל' || trade.verification1 === 'Failed') &&
        (trade.verification2 === t('failed') || trade.verification2 === 'נכשל' || trade.verification2 === 'Failed') &&
        (trade.verification3 === t('failed') || trade.verification3 === 'נכשל' || trade.verification3 === 'Failed')) {
        totalFailure++;
      }
    }

    return {
      firstEntrySuccess,
      backup1Success,
      backup2Success,
      backup3Success,
      totalFailure
    };
  }



  // פונקציה ליצירת גרף הנרות
  function renderStatsChart() {
    const statsContent = $.statsModal.querySelector('.stats-content');

    if (!statsContent) {
      console.error('statsContent not found!');
      return;
    }

    // יצירת גרף (רק בוט)
    const botStats = calculateBotStats();
    const botCanvas = createChart(botStats, `🤖 ${t('technicalBotSuccessRate')}`);

    // יצירת מיכל לגרף יחיד (ממורכז)
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    container.style.width = '100%';


    // מיכל לגרף בוט (ממורכז)
    const botChartContainer = document.createElement('div');
    botChartContainer.style.cssText = `
      background: linear-gradient(180deg, #081a30, #0a2342);
      border: 1px solid rgba(0, 180, 255, 0.28);
      border-radius: 14px;
      padding: 15px;
      box-shadow: inset 0 0 18px rgba(0, 200, 255, 0.06);
      color: #e6f6ff;
      max-width: 380px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    `;

    // כותרת גרף בוט
    const botChartTitle = document.createElement('div');
    botChartTitle.style.cssText = `
      font-size: 16px;
      font-weight: bold;
      font-family: Arial, sans-serif;
      color: #c9fffe;
      text-align: center;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    `;
    botChartTitle.textContent = `🤖 ${t('technicalBotSuccessRate')}`;
    botChartContainer.appendChild(botChartTitle);

    // הוספת גרף בוט
    botChartContainer.appendChild(botCanvas);

    // הוספת סטטיסטיקות מתחת לגרף בוט
    const botTotalTrades = botStats.firstEntrySuccess + botStats.backup1Success + botStats.backup2Success + botStats.backup3Success + botStats.totalFailure;
    const botSuccessRate = botTotalTrades > 0 ? Math.round(((botStats.firstEntrySuccess + botStats.backup1Success + botStats.backup2Success + botStats.backup3Success) / botTotalTrades) * 100) : 0;

    const botStatsDiv = document.createElement('div');
    botStatsDiv.style.cssText = `
      color: #9fdfff;
      font-size: 14px;
      margin-top: 16px;
      text-align: center;
      padding: 12px;
      background: rgba(0, 180, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(0, 180, 255, 0.1);
    `;
    botStatsDiv.innerHTML = `
      <strong>${t('totalTrades')}:</strong> ${botTotalTrades} | 
      <strong>${t('successRate')}:</strong> ${botSuccessRate}%
    `;
    botChartContainer.appendChild(botStatsDiv);


    // יצירת מיכל לאינדיקטור (למעלה)
    const indicatorContainer = document.createElement('div');
    indicatorContainer.style.width = '100%';
    indicatorContainer.style.marginBottom = '20px';
    indicatorContainer.style.display = 'flex';
    indicatorContainer.style.justifyContent = 'center';

    // יצירת האינדיקטור
    createStatsIndicator(indicatorContainer);

    // ניקוי התוכן הקיים והוספת האינדיקטור והגרפים
    statsContent.innerHTML = '';
    statsContent.appendChild(indicatorContainer);

    // הוספת רווח בין האינדיקטור לגרפים
    const spacer = document.createElement('div');
    spacer.style.cssText = `
      height: 15px;
      width: 100%;
    `;
    statsContent.appendChild(spacer);

    statsContent.appendChild(container);
    container.appendChild(botChartContainer);  // בוט (ממורכז)
  }

  // פונקציה ליצירת האינדיקטור היפה
  function createStatsIndicator(container) {
    // חישוב נתוני האיתותים לפי העסקאות שהסתיימו ב-indicatorLog
    const botTrades = indicatorLog.filter(t => t.source === 'בוט' && t.status === 'completed');

    const botTotal = botTrades.length;
    const botSuccess = botTrades.filter(trade =>
      trade.verification === t('succeeded') || trade.verification === 'הצליח' || trade.verification === 'Succeeded' ||
      trade.verification1 === t('succeeded') || trade.verification1 === 'הצליח' || trade.verification1 === 'Succeeded' ||
      trade.verification2 === t('succeeded') || trade.verification2 === 'הצליח' || trade.verification2 === 'Succeeded' ||
      trade.verification3 === t('succeeded') || trade.verification3 === 'הצליח' || trade.verification3 === 'Succeeded'
    ).length;
    const botFailure = botTotal - botSuccess;



    // יצירת האינדיקטור (יחיד ממורכז)
    const indicator = document.createElement('div');
    indicator.style.cssText = `
      background: linear-gradient(180deg, #081a30, #0a2342);
      border: 1px solid rgba(0, 180, 255, 0.28);
      border-radius: 14px;
      padding: 12px;
      box-shadow: inset 0 0 18px rgba(0, 200, 255, 0.06);
      color: #e6f6ff;
      max-width: 350px;
      margin: 0 auto;
      min-height: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
    `;





    // סקציית בוט (יחיד ממורכז)
    const botTitle = currentLanguage === 'en' ? '🤖 Bot Signals' : '🤖 איתותי בוט';
    const botSection = createSignalSection(botTitle, botTotal, botSuccess, botFailure, '#00e676');
    indicator.appendChild(botSection);



    container.appendChild(indicator);
  }

  // פונקציה עזר ליצירת סקציית איתותים
  function createSignalSection(title, total, success, failure, color) {
    const section = document.createElement('div');
    section.style.display = 'flex';
    section.style.flexDirection = 'column';
    section.style.alignItems = 'center';
    section.style.flex = '1';

    // כותרת הסקציה
    const sectionTitle = document.createElement('div');
    sectionTitle.style.cssText = `
      font-size: 14px;
      font-weight: 700;
      color: #9fdfff;
      margin-bottom: 16px;
      text-align: center;
      padding: 8px;
      background: rgba(0, 180, 255, 0.1);
      border-radius: 6px;
      border: 1px solid rgba(0, 180, 255, 0.2);
    `;
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);

    // מרווח נוסף אחרי הכותרת
    const spacer = document.createElement('div');
    spacer.style.height = '8px';
    section.appendChild(spacer);

    // סה"כ איתותים
    const totalLabel = currentLanguage === 'en' ? 'Total' : 'סה"כ';
    const totalRow = createStatRow(totalLabel, total, '#e6f6ff');
    section.appendChild(totalRow);

    // איתותים שהצליחו
    const successLabel = currentLanguage === 'en' ? 'Succeeded' : 'הצליחו';
    const successRow = createStatRow(successLabel, success, color);
    section.appendChild(successRow);

    // איתותים שנכשלו
    const failureLabel = currentLanguage === 'en' ? 'Failed' : 'נכשלו';
    const failureRow = createStatRow(failureLabel, failure, '#ff5252');
    section.appendChild(failureRow);

    return section;
  }

  // פונקציה עזר ליצירת שורת סטטיסטיקה
  function createStatRow(label, value, color) {
    const row = document.createElement('div');
    row.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      background: rgba(0, 180, 255, 0.05);
      border-radius: 8px;
      margin-bottom: 8px;
      border: 1px solid rgba(0, 180, 255, 0.1);
      min-width: 120px;
      direction: rtl;
    `;

    const valueEl = document.createElement('span');
    valueEl.style.cssText = `
      font-size: 14px;
      color: ${color};
      font-weight: 900;
      text-shadow: 0 0 8px ${color}40;
      min-width: 20px;
      text-align: left;
    `;
    valueEl.textContent = value;

    const labelEl = document.createElement('span');
    labelEl.style.cssText = `
      font-size: 13px;
      color: #9fdfff;
      font-weight: 600;
      margin-left: 8px;
    `;
    labelEl.textContent = label;

    row.appendChild(valueEl);
    row.appendChild(labelEl);

    return row;
  }

  // פונקציה לאיפוס נתוני הסטטיסטיקה
  function resetStatsData() {
    // מחק רק את נתוני הסטטיסטיקה והאינדיקטור מ-localStorage
    try {
      localStorage.removeItem('po_statsLog');
      localStorage.removeItem('po_indicatorLog');
      // נקה רק את המערכים של הסטטיסטיקה והאינדיקטור בזיכרון
      statsLog.length = 0;
      indicatorLog.length = 0;
      // עדכון הגרף
      renderStatsChart();
      console.log('🗑️ נתוני הסטטיסטיקה והאינדיקטור אופסו - רק הם נמחקו, שאר הנתונים נשארו');
    } catch (e) {
      console.warn('שמירת נתונים נכשלה:', e);
    }
  }

  // פונקציה ליצירת גרף עם נתונים נתונים
  function createChart(stats, title) {
    // יצירת גרף נרות עם Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 320;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    canvas.style.maxWidth = '400px';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';

    const ctx = canvas.getContext('2d');

    // נתונים לגרף
    const labels = currentLanguage === 'en'
      ? ['Entry', 'Backup 1', 'Backup 2', 'Backup 3', 'Failure']
      : ['כניסה', 'גיבוי 1', 'גיבוי 2', 'גיבוי 3', 'כשלון'];
    const data = [
      stats.firstEntrySuccess,
      stats.backup1Success,
      stats.backup2Success,
      stats.backup3Success,
      stats.totalFailure
    ];

    // צבעים לכל סוג
    const colors = ['#00e676', '#00c853', '#64dd17', '#76ff03', '#ff5252'];

    // מציאת הערך המקסימלי לקנה מידה
    const maxValue = Math.max(...data);
    const chartHeight = 220;
    const chartWidth = 350;
    const barWidth = 50;
    const barSpacing = 15;
    const startX = 25;
    const startY = 270;

    // ניקוי Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ציור רקע
    ctx.fillStyle = 'rgba(0, 180, 255, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ציור ציר Y
    ctx.strokeStyle = 'rgba(0, 180, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY - chartHeight);
    ctx.stroke();

    // ציור ציר X
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + chartWidth, startY);
    ctx.stroke();

    // ציור סרגלים אופקיים
    ctx.strokeStyle = 'rgba(0, 180, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const y = startY - (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(startX + chartWidth, y);
      ctx.stroke();

      // מספרים על ציר Y
      ctx.fillStyle = '#9fdfff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(maxValue > 0 ? Math.round(maxValue * i / 5) : 0, startX - 10, y + 4);
    }

    // ציור העמודות
    for (let i = 0; i < data.length; i++) {
      // טיפול במקרה שבו אין נתונים
      const barHeight = maxValue > 0 ? (data[i] / maxValue) * chartHeight : 0;
      const x = startX + (barWidth + barSpacing) * i + barSpacing;
      const y = startY - barHeight;

      // ציור העמודה
      ctx.fillStyle = colors[i];
      ctx.fillRect(x, y, barWidth, barHeight);

      // הוספת צל
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // מסגרת לעמודה
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // איפוס הצל
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // מספר על העמודה
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data[i], x + barWidth / 2, y - 10);

      // תווית מתחת לעמודה
      ctx.fillStyle = '#9fdfff';
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barWidth / 2, startY + 15);
    }

    return canvas;
  }
})();

// === LIGHTBOX (חלון הגדלה) ===
// הפונקציות האלה צריכות להיות מוגדרות אחרי שה-$ מוגדר
// הן יוגדרו בתוך ensureWidget
