function initializeAppearance() {
  const savedTheme = localStorage.getItem('theme') || getCurrentColorScheme();
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const logo = document.getElementById('logo');
  const themeLightIcon = document.getElementById('light-icon');
  const themeDarkIcon = document.getElementById('dark-icon');
  if (logo) {
    updateLogo(logo, savedTheme);
  }
  if (themeLightIcon) {
    themeLightIcon.style.display = savedTheme === 'dark' ? 'block' : 'none';
  }
  if (themeDarkIcon) {
    themeDarkIcon.style.display = savedTheme === 'light' ? 'block' : 'none';
  }
}

// Update the logo
function updateLogo(logo, theme) {
  const isNotEmptyChat = !document.getElementById('chat-app').classList.contains('empty-chat');
  const largeLogoSrc = `jina-${theme}.svg`;
  const smallLogoSrc = `j-${theme}.svg`;

  logo.src = isNotEmptyChat ? smallLogoSrc : largeLogoSrc;
}

// Check the current color scheme
function getCurrentColorScheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  } else {
    return 'light'; // Default is light
  }
}

// Execute immediately for preload
if (typeof window !== 'undefined') {
  initializeAppearance();
}

// Export for app.js
window.initializeAppearance = initializeAppearance;
window.updateLogo = updateLogo;