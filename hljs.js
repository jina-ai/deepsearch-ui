
const theme = localStorage.getItem('theme') || 'light';
const hlTheme = theme === 'light' ? 'vs' : 'vs2015';
const scripts = [
  { type: 'style', url: `third-party/${hlTheme}.min.css` },
  { type: 'script', url: 'third-party/highlight.min.js' }
];

async function loadResource(resource) {
    return new Promise((resolve, reject) => {
        let element;
        if (resource.type === 'script') {
            element = document.createElement('script');
            element.src = resource.url;
        } else {
            element = document.createElement('link');
            element.rel = 'stylesheet';
            element.id = 'hljs-theme';
            element.href = resource.url;
        }
        
        element.onload = () => resolve();
        element.onerror = () => reject();
        document.body.appendChild(element);
    });
}

async function initializeApp() {
    try {
        for (const resource of scripts) {
            await loadResource(resource);
        }
    } catch (error) {
        console.error('Failed to load resources:', error);
    }
}

// Start loading
initializeApp();