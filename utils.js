const utilScripts = [
  { type: 'script', url: 'third-party/html2canvas.min.js' },
  { type: 'script', url: 'third-party/purify.min.js' },
];

async function loadResource(resource) {
    return new Promise((resolve) => {
        let element;
        if (resource.type === 'script') {
            element = document.createElement('script');
            element.src = resource.url;
        }
        // Add timeout to avoid hanging if resource never loads
        const timeout = setTimeout(() => {
            console.warn(`Utils resource load timeout: ${resource.url}`);
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
            console.warn(`Failed to load Utils resource: ${resource.url}`);
            resolve(); // Continue despite errors
        };
        document.body.appendChild(element);
    });
}

async function initializeApp() {
    // Load all resources in parallel
    const loadPromises = utilScripts.map(resource => loadResource(resource));
    await Promise.all(loadPromises);
    
    // Dispatch event to notify app.js that Utils is ready
    try {
        window.dispatchEvent(new Event('Utils-loaded'));
    } catch (error) {
        console.error('Error dispatching Utils-loaded event:', error);
    }
}

initializeApp().catch(error => {
    console.error('Unexpected error in Utils initialization:', error);
});