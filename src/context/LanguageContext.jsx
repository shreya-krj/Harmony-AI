import React, { createContext, useContext, useMemo, useState } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {},
  hi: {
    language: 'भाषा',
    english: 'अंग्रेज़ी',
    hindi: 'हिंदी',
    kannada: 'कन्नड़',
    dashboard: 'डैशबोर्ड',
    reportIncident: 'घटना दर्ज करें',
    aiChat: 'एआई चैट',
    analytics: 'विश्लेषण',
    profile: 'प्रोफाइल',
    moderatorHub: 'मॉडरेटर हब',
    platformAnalytics: 'प्लेटफ़ॉर्म विश्लेषण',
    menu: 'मेनू',
    logout: 'लॉगआउट',
    notifications: 'सूचनाएं',
    viewAllNotifications: 'सभी सूचनाएं देखें',
    userDashboard: 'यूज़र डैशबोर्ड',
    myIncidentHistory: 'मेरी घटना हिस्ट्री',
    liveNearbyIncidents: 'आस-पास की लाइव घटनाएं',
    viewIncident: 'घटना देखें',
    hideIncident: 'घटना छुपाएं',
    verify: 'सत्यापित करें',
    closed: 'बंद',
    awaitingConfirmation: 'पुष्टि की प्रतीक्षा',
    inProgress: 'प्रगति में',
    reopened: 'फिर से खोला गया',
    pending: 'लंबित',
    openInGoogleMaps: 'Google Maps में खोलें',
    commandCenter: 'कमांड सेंटर',
    active: 'सक्रिय',
    closedTab: 'बंद',
    liveIncidentQueue: 'लाइव घटना कतार',
    historicalArchive: 'ऐतिहासिक अभिलेख',
    latestFirst: 'नवीनतम पहले',
    allPriorities: 'सभी प्राथमिकताएं',
    allDepartments: 'सभी विभाग',
    high: 'उच्च',
    moderate: 'मध्यम',
    low: 'कम',
    reportAnIncident: 'घटना दर्ज करें',
    incidentDetails: 'घटना विवरण',
    submitReport: 'रिपोर्ट सबमिट करें',
    submitting: 'सबमिट हो रहा है...',
    issueResolved: 'समस्या हल',
    issuePending: 'समस्या लंबित',
    role: 'भूमिका',
    user: 'यूज़र',
    moderator: 'मॉडरेटर',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    processing: 'प्रोसेस हो रहा है...',
    logIn: 'लॉग इन',
    getStarted: 'शुरू करें',
  },
  kn: {
    language: 'ಭಾಷೆ',
    english: 'ಇಂಗ್ಲಿಷ್',
    hindi: 'ಹಿಂದಿ',
    kannada: 'ಕನ್ನಡ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    reportIncident: 'ಘಟನೆ ವರದಿ',
    aiChat: 'ಎಐ ಚಾಟ್',
    analytics: 'ವಿಶ್ಲೇಷಣೆ',
    profile: 'ಪ್ರೊಫೈಲ್',
    moderatorHub: 'ಮೋಡರೇಟರ್ ಹಬ್',
    platformAnalytics: 'ಪ್ಲಾಟ್ಫಾರ್ಮ್ ವಿಶ್ಲೇಷಣೆ',
    menu: 'ಮೆನು',
    logout: 'ಲಾಗ್‌ಔಟ್',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    viewAllNotifications: 'ಎಲ್ಲಾ ಅಧಿಸೂಚನೆಗಳನ್ನು ನೋಡಿ',
    userDashboard: 'ಬಳಕೆದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    myIncidentHistory: 'ನನ್ನ ಘಟನೆಗಳ ಇತಿಹಾಸ',
    liveNearbyIncidents: 'ಹತ್ತಿರದ ಲೈವ್ ಘಟನೆಗಳು',
    viewIncident: 'ಘಟನೆ ನೋಡಿ',
    hideIncident: 'ಘಟನೆ ಮುಚ್ಚಿ',
    verify: 'ಪರಿಶೀಲಿಸಿ',
    closed: 'ಮುಚ್ಚಲಾಗಿದೆ',
    awaitingConfirmation: 'ದೃಢೀಕರಣಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ',
    inProgress: 'ಪ್ರಗತಿಯಲ್ಲಿ',
    reopened: 'ಮರುತೆರೆದಿದೆ',
    pending: 'ಬಾಕಿ',
    openInGoogleMaps: 'Google Maps ನಲ್ಲಿ ತೆರೆಯಿರಿ',
    commandCenter: 'ಕಮಾಂಡ್ ಸೆಂಟರ್',
    active: 'ಸಕ್ರಿಯ',
    closedTab: 'ಮುಚ್ಚಲಾಗಿದೆ',
    liveIncidentQueue: 'ಲೈವ್ ಘಟನೆ ಸರತಿ',
    historicalArchive: 'ಐತಿಹಾಸಿಕ ದಾಖಲೆ',
    latestFirst: 'ಇತ್ತೀಚಿನದು ಮೊದಲು',
    allPriorities: 'ಎಲ್ಲಾ ಆದ್ಯತೆಗಳು',
    allDepartments: 'ಎಲ್ಲಾ ಇಲಾಖೆ',
    high: 'ಹೆಚ್ಚು',
    moderate: 'ಮಧ್ಯಮ',
    low: 'ಕಡಿಮೆ',
    reportAnIncident: 'ಘಟನೆ ವರದಿ',
    incidentDetails: 'ಘಟನೆ ವಿವರಗಳು',
    submitReport: 'ವರದಿ ಸಲ್ಲಿಸಿ',
    submitting: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
    issueResolved: 'ಸಮಸ್ಯೆ ಪರಿಹರಿಸಲಾಗಿದೆ',
    issuePending: 'ಸಮಸ್ಯೆ ಬಾಕಿ',
    role: 'ಪಾತ್ರ',
    user: 'ಬಳಕೆದಾರ',
    moderator: 'ಮೋಡರೇಟರ್',
    signIn: 'ಸೈನ್ ಇನ್',
    signUp: 'ಸೈನ್ ಅಪ್',
    processing: 'ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...',
    logIn: 'ಲಾಗ್ ಇನ್',
    getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');

  const value = useMemo(() => {
    const t = (key, fallback) => translations[language]?.[key] || fallback || key;
    const setLang = (nextLang) => {
      setLanguage(nextLang);
      localStorage.setItem('lang', nextLang);
    };
    return { language, setLanguage: setLang, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
