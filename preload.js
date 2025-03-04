function initializeAppearance() {
  const savedTheme = localStorage.getItem('theme') || getCurrentColorScheme();
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Check the current color scheme
function getCurrentColorScheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')?.matches) {
    return 'dark';
  } else {
    return 'light'; // Default is light
  }
}

// Initialize language preference
function initializeLanguage() {
  const savedLanguage = localStorage.getItem('language') || getBrowserLanguage();
  document.documentElement.setAttribute('data-language', savedLanguage);
}

// Get browser language
function getBrowserLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('zh')) return 'zh-CN';
  if (browserLang.startsWith('ja')) return 'jp';
  return 'en'; // Default is English
}

// Execute immediately for preload
if (typeof window !== 'undefined') {
  initializeAppearance();
  initializeLanguage();

  // Export for app.js
  window.initializeAppearance = initializeAppearance;
  window.getCurrentColorScheme = getCurrentColorScheme;
  window.initializeLanguage = initializeLanguage;
  window.getBrowserLanguage = getBrowserLanguage;
}
