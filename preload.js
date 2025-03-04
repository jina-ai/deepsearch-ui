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

// Execute immediately for preload
if (typeof window !== 'undefined') {
  initializeAppearance();

  // Export for app.js
  window.initializeAppearance = initializeAppearance;
  window.getCurrentColorScheme = getCurrentColorScheme;
}