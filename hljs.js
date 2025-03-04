const theme = localStorage.getItem('theme') || 'light';
const hlTheme = theme === 'light' ? 'vs' : 'vs2015';
const scripts = [
  { type: 'style', url: `third-party/${hlTheme}.min.css` },
  { type: 'script', url: 'third-party/highlight.min.js' }
];

async function loadResource(resource) {
    return new Promise((resolve) => {
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
        // Add timeout to avoid hanging if resource never loads
        const timeout = setTimeout(() => {
            console.warn(`Resource load timeout: ${resource.url}`);
            resolve();
        }, 5000);

        // Handle successful load
        element.onload = () => {
            clearTimeout(timeout);
            resolve();
        };
        
        // Handle loading error
        element.onerror = () => {
            clearTimeout(timeout);
            console.warn(`Failed to load resource: ${resource.url}`);
            resolve(); // Continue despite errors
        };
        document.body.appendChild(element);
    });
}

async function initializeApp() {
    // Load all resources in parallel
    const loadPromises = scripts.map(resource => loadResource(resource));
    await Promise.all(loadPromises);
    
    // Dispatch event to notify app.js that HLJS is ready
    try {
        window.dispatchEvent(new Event('hljs-loaded'));
    } catch (error) {
        console.error('Error dispatching hljs-loaded event:', error);
    }
}

initializeApp().catch(error => {
    console.error('Unexpected error in HLJS initialization:', error);
});