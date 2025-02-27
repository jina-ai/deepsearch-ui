const UI_STRINGS = {
    buttons: {
        send: 'Deep Search',
        clear: 'Clear',
        addKey: 'Upgrade',
        updateKey: 'Update Key',
        getKey: 'Get API Key',
        saveKey: 'Save',
        purchase: 'Purchase More Tokens',
        copy: 'Copy',
        copied: '✓ Copied!'
    },
    think: {
        initial: 'Thinking...',
        toggle: 'Thoughts',
        loading: 'Loading...'
    },
    errors: {
        invalidKey: 'Invalid API key. Please update your key by click the button below".',
        insufficientTokens: 'Insufficient tokens in your API key. Please purchase more tokens or swap to another key.',
        rateLimit: 'You have reached the rate limit. Please try again later. You can also upgrade to a higher plan by clicking the button below.'
    }
};

// DOM Elements - grouped at the top for better organization

const logo = document.getElementById('logo');
const mainContainer = document.getElementById('main-container');
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const clearButton = document.getElementById('clear-button');
const apiKeyInput = document.getElementById('api-key-input');
const saveApiKeyBtn = document.getElementById('save-api-key');
const toggleApiKeyBtn = document.getElementById('toggle-api-key');
const toggleApiKeyBtnText = toggleApiKeyBtn.querySelector('span');
const getApiKeyBtn = document.getElementById('get-api-key');
const freeUserRPMInfo = document.getElementById('free-user-rpm');
const apiKeyDialog = document.getElementById('api-key-dialog');
const helpButton = document.getElementById('help-button');
const helpDialog = document.getElementById('help-dialog');
const settingsButton = document.getElementById('settings-button');
const settingsDialog = document.getElementById('settings-dialog');
const searchBarBottom = document.getElementById('search-bar-bottom');
const dialogCloseBtns = document.querySelectorAll('.dialog-close');

const loadingSvg = `<svg id="thinking-animation-icon" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_mHwL{animation:spinner_OeFQ .75s cubic-bezier(0.56,.52,.17,.98) infinite; fill:currentColor}.spinner_ote2{animation:spinner_ZEPt .75s cubic-bezier(0.56,.52,.17,.98) infinite;fill:currentColor}@keyframes spinner_OeFQ{0%{cx:4px;r:3px}50%{cx:9px;r:8px}}@keyframes spinner_ZEPt{0%{cx:15px;r:8px}50%{cx:20px;r:3px}}</style><defs><filter id="spinner-gF00"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="y"/><feColorMatrix in="y" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="z"/><feBlend in="SourceGraphic" in2="z"/></filter></defs><g filter="url(#spinner-gF00)"><circle class="spinner_mHwL" cx="4" cy="12" r="3"/><circle class="spinner_ote2" cx="15" cy="12" r="8"/></g></svg>`;
const BASE_ORIGIN = 'https://deepsearch.jina.ai';

// State variables
let isLoading = false;
let abortController = null;
let existingMessages = [];
let md;


// API Key Management
function initializeApiKey() {
    const savedKey = localStorage.getItem('api_key') || '';
    apiKeyInput.value = savedKey;
    getApiKeyBtn.style.display = savedKey ? 'none' : 'block';
    freeUserRPMInfo.style.display = savedKey ? 'none' : 'block';
    toggleApiKeyBtnText.textContent = savedKey ? UI_STRINGS.buttons.updateKey : UI_STRINGS.buttons.addKey;
}

// Chat Message Persistence
function saveChatMessages() {
    localStorage.setItem('chat_messages', JSON.stringify(existingMessages));
}

function loadChatMessages() {
    const savedMessages = localStorage.getItem('chat_messages');
    try {
        return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (e) {
        console.error('Error parsing saved messages:', e);
        return [];
    }
}


// Initialize API key
initializeApiKey();


saveApiKeyBtn.addEventListener('click', handleApiKeySave);

// Message display functions
function createReferencesSection(content, visitedURLs = []) {
    // Don't create section if no content and no URLs
    if (!content && (!visitedURLs || visitedURLs.length === 0)) {
        return null;
    }

    const section = document.createElement('div');
    section.classList.add('references-section');

    const header = document.createElement('div');
    header.classList.add('references-header');
    header.classList.add('collapsed');
    header.textContent = 'References';

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('references-content');
    contentDiv.innerHTML = content;

    header.addEventListener('click', (e) => {
        e.stopPropagation();
        contentDiv.classList.toggle('expanded');
        header.classList.toggle('expanded');
        header.classList.toggle('collapsed');
    });

    section.appendChild(header);
    section.appendChild(contentDiv);

    // Add favicons section if URLs exist
    if (visitedURLs?.length > 0) {
        const faviconContainer = document.createElement('div');
        faviconContainer.classList.add('references-favicons');

        renderFaviconList(visitedURLs).then(faviconList => {
            faviconContainer.appendChild(faviconList);
            section.appendChild(faviconContainer);
        });

    }

    return section;
}

const renderFaviconList = async (visitedURLs) => {
    // Create DOM elements and data structures
    const faviconList = document.createElement('div');
    faviconList.classList.add('favicon-list');

    // Process URLs and create Map of domain -> {urls, element data}
    const domainMap = visitedURLs.reduce((map, url) => {
        try {
            const domain = new URL(url).hostname;
            if (!map.has(domain)) {
                const img = document.createElement('img');
                const item = document.createElement('div');

                img.src = 'favicon.ico';
                img.width = img.height = 16;
                img.alt = domain;

                item.classList.add('favicon-item');
                item.setAttribute('data-url', url);
                item.appendChild(img);

                // Add click handler for favicon
                item.addEventListener('click', () => {
                    window.open(url, '_blank');
                });

                // Add cursor pointer style
                item.style.cursor = 'pointer';

                faviconList.appendChild(item);

                map.set(domain, {
                    urls: [url],
                    img,
                    item
                });
            } else {
                map.get(domain).urls.push(url);
            }

            // Update tooltip with URL count
            const data = map.get(domain);
            data.item.setAttribute('title', `${domain}\n${data.urls.length} URLs`);
        } catch (e) {
            console.error('Invalid URL:', url);
        }
        return map;
    }, new Map());

    // Add sources count
    faviconList.appendChild(
        Object.assign(document.createElement('div'), {
            className: 'sources-count',
            textContent: `${visitedURLs.length} sources`
        })
    );

    // Favicon fetching function with retry support
    const fetchFavicons = async (domains) => {
        const failedDomains = [];
        try {
            const response = await fetch(
                `https://favicon-fetcher.jina.ai/?domains=${domains.join(',')}&timeout=3000`
            );
            if (!response.ok) throw new Error('Favicon fetch failed');

            const favicons = await response.json();
            favicons.forEach(({domain, favicon, type}) => {
                if (domainMap.has(domain) && favicon) {
                    domainMap.get(domain).img.src = `data:${type};base64,${favicon}`;
                } else {
                    failedDomains.push(domain);
                }
            });
        } catch (error) {
            console.error('Error fetching favicons:', error);
            failedDomains.push(...domains);
        }
        return failedDomains;
    };

    // Process domains in batches with retry
    const BATCH_SIZE = 16;
    const domains = Array.from(domainMap.keys());
    let failedDomains = [];

    // Initial batch processing
    for (let i = 0; i < domains.length; i += BATCH_SIZE) {
        failedDomains.push(
            ...await fetchFavicons(domains.slice(i, i + BATCH_SIZE))
        );
    }

    // Retry failed domains
    if (failedDomains.length > 0) {
        console.log(`Retrying ${failedDomains.length} failed domains...`);
        for (let i = 0; i < failedDomains.length; i += BATCH_SIZE) {
            await fetchFavicons(failedDomains.slice(i, i + BATCH_SIZE));
        }
    }

    return faviconList;
};

function createThinkSection(messageDiv) {
    const thinkSection = document.createElement('div');
    thinkSection.classList.add('think-section');

    const thinkHeader = document.createElement('div');
    thinkHeader.classList.add('think-header');
    thinkHeader.classList.add('expanded');

    thinkHeader.appendChild(document.createTextNode(UI_STRINGS.think.initial));
    thinkSection.appendChild(thinkHeader);

    const thinkContent = document.createElement('div');
    thinkContent.classList.add('think-content');

    const expanded = localStorage.getItem('think_section_expanded') === 'true';
    if (expanded) {
        thinkHeader.classList.remove('collapsed');
        thinkContent.classList.add('expanded');
    } else {
        thinkHeader.classList.remove('expanded');
        thinkHeader.classList.add('collapsed');
    }

    thinkSection.addEventListener('click', (e) => {
        e.stopPropagation();
        thinkContent.classList.toggle('expanded');
        thinkHeader.classList.toggle('expanded');
        thinkHeader.classList.toggle('collapsed');
        localStorage.setItem('think_section_expanded', thinkContent.classList.contains('expanded'));
    });

    // thinkSection.appendChild(thinkHeader);
    thinkSection.appendChild(thinkContent);
    messageDiv.prepend(thinkSection);
    return thinkSection;
}

function scrollToBottom() {
    mainContainer.scrollTop = mainContainer.scrollHeight;
}

function createCopyButton(content) {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('buttons-container');
    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-button');
    copyButton.innerHTML = UI_STRINGS.buttons.copy;
    const copyIcon = `<svg class="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    const checkIcon = `<svg class="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    copyButton.innerHTML = copyIcon;

    buttonContainer.appendChild(copyButton);

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(content)
            .then(() => {
                copyButton.innerHTML = checkIcon;
                setTimeout(() => {
                    copyButton.innerHTML = copyIcon;
                }, 2000);
            });
    });

    return buttonContainer;
}

function displayMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${role}-message`);

    if (role === 'assistant') {
        messageDiv.innerHTML = `<div id="loading-indicator">${loadingSvg}</div>`;
    } else {
        messageDiv.textContent = content;
    }

    chatContainer.appendChild(messageDiv);
    updateEmptyState();
    scrollToBottom();
    return messageDiv;
}

function removeLoadingIndicator(messageDiv) {
    const loadingIndicator = messageDiv.querySelector('#loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

function showErrorWithAction(message, buttonText, onClick) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'assistant-message');

    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';

    const errorIcon = `<svg id="error-icon" class="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    const errorText = document.createElement('span');
    errorText.innerHTML = errorIcon + message;

    const actionButton = document.createElement('button');
    actionButton.textContent = buttonText;
    actionButton.className = 'action-button';
    actionButton.addEventListener('click', onClick);

    errorContainer.appendChild(errorText);
    errorContainer.appendChild(actionButton);
    messageDiv.appendChild(errorContainer);
    chatContainer.appendChild(messageDiv);

    scrollToBottom();
}


function initializeMarkdown() {
    if (window.markdownit) {
        md = window.markdownit({
            html: true,
            linkify: true,
            typographer: true,
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre><code class="hljs">' +
                            hljs.highlight(str, {language: lang, ignoreIllegals: true}).value +
                            '</code></pre>';
                    } catch (__) {
                    }
                }

                return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        })
            .use(window.markdownitFootnote).use(markdownItTableWrapper);
    }
}

initializeMarkdown();

function markdownItTableWrapper(md) {
    const defaultTableRenderer = md.renderer.rules.table_open || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options, env, self);
    };

    md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
        return '<div id="table-container">\n' + defaultTableRenderer(tokens, idx, options, env, self);
    };

    const defaultTableCloseRenderer = md.renderer.rules.table_close || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options, env, self);
    };

    md.renderer.rules.table_close = function (tokens, idx, options, env, self) {
        return defaultTableCloseRenderer(tokens, idx, options, env, self) + '\n</div>';
    };
}

function renderMarkdown(content, returnElement = false, visitedURLs = []) {
    if (!md) {
        initializeMarkdown();
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    if (md) {
        const rendered = md.render(content);
        tempDiv.innerHTML = rendered;

        const footnotes = tempDiv.querySelector('.footnotes');
        const footnoteContent = footnotes ? footnotes.innerHTML : '';

        // Create references section if there are footnotes or visitedURLs
        const referencesSection = createReferencesSection(footnoteContent, visitedURLs);
        if (referencesSection) {
            if (footnotes) {
                footnotes.replaceWith(referencesSection);
            } else {
                tempDiv.appendChild(referencesSection);
            }
        } else if (footnotes) {
            footnotes.remove();
        }
    }
    return returnElement ? tempDiv : tempDiv.innerHTML;
}

// Message handling functions
// Update empty state class
function updateEmptyState() {
    const chatApp = document.getElementById('chat-app');
    if (chatContainer.innerHTML.trim() === '') {
        chatApp.classList.add('empty-chat');
    } else {
        chatApp.classList.remove('empty-chat');
    }
}


function clearMessages() {
    chatContainer.innerHTML = '';
    existingMessages = [];
    abortController?.abort();
    // Clear messages from localStorage
    localStorage.removeItem('chat_messages');
    updateEmptyState();
}

const makeAllLinksOpenInNewTab = () => {
    // Select all <a> tags on the page
    const links = document.querySelectorAll('a');

    // Add target="_blank" to each link
    links.forEach(link => {
        link.setAttribute('target', '_blank');

        // Add rel="noopener" for security best practices
        link.setAttribute('rel', 'noopener');
    });
};

async function sendMessage() {
    const query = messageInput.value.trim();

    if (!query || isLoading) return;

    abortController = new AbortController();
    isLoading = true;
    sendButton.disabled = true;

    displayMessage('user', query);
    existingMessages.push({role: 'user', content: query});
    messageInput.value = '';
    // To clear the badge
    clearFaviconBadge();
    // Save messages to localStorage
    saveChatMessages();

    const assistantMessageDiv = displayMessage('assistant', '');

    let markdownContent = '';
    let thinkContent = '';
    let inThinkSection = false;
    let thinkSectionElement = null;
    let thinkHeaderElement = null;

    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        const apiKey = localStorage.getItem('api_key');
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const res = await fetch(`${BASE_ORIGIN}/v1/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                messages: existingMessages,
                stream: true,
                reasoning_effort: 'medium',
            }),
            signal: abortController.signal,
        });

        if (!res.ok) {
            const errorResponse = await res.json().catch(() => ({}));
            const errorMsg = errorResponse.message || 'Unknown error occurred';

            assistantMessageDiv.remove();

            switch (res.status) {
                case 401:
                    showErrorWithAction(
                        UI_STRINGS.errors.invalidKey,
                        UI_STRINGS.buttons.updateKey,
                        () => apiKeyDialog.classList.add('visible')
                    );
                    break;
                case 402:
                    showErrorWithAction(
                        UI_STRINGS.errors.insufficientTokens,
                        UI_STRINGS.buttons.purchase,
                        () => window.open('https://jina.ai/api-dashboard/key-manager?login=true', '_blank')
                    );
                    break;
                case 429:
                    showErrorWithAction(
                        UI_STRINGS.errors.rateLimit,
                        UI_STRINGS.buttons.addKey,
                        () => apiKeyDialog.classList.add('visible')
                    );
                    break;
                default:
                    const errorMessageDiv = document.createElement('div');
                    errorMessageDiv.classList.add('message', 'assistant-message');
                    errorMessageDiv.textContent = `Error: ${errorMsg}`;
                    chatContainer.appendChild(errorMessageDiv);
            }

            throw new Error(errorMsg);
        }

        const markdownDiv = document.createElement('div');
        markdownDiv.classList.add('markdown');
        assistantMessageDiv.appendChild(markdownDiv);

        if (res.headers.get('content-type')?.includes('text/event-stream')) {
            const reader = res.body?.getReader();
            if (!reader) throw new Error('No readable stream available');

            const decoder = new TextDecoder();
            let partialBrokenData = '';
            let visitedURLs = [];

            while (true) {
                const {done, value} = await reader.read();

                if (done) break;

                if (value) {
                    const streamData = decoder.decode(value);
                    const events = streamData.split('\n\ndata:').filter(Boolean);

                    for (const event of events) {
                        const data = event.replace(/data: /, '').trim();
                        partialBrokenData += data;

                        try {
                            if (partialBrokenData) {
                                const json = JSON.parse(partialBrokenData);
                                partialBrokenData = '';
                                const content = json.choices[0]?.delta?.content || '';
                                // Store visitedURLs from the final chunk if provided
                                if (json.visitedURLs) {
                                    visitedURLs = json.visitedURLs;
                                }
                                removeLoadingIndicator(assistantMessageDiv);

                                let tempContent = content;
                                const thinkingAnimation = document.createElement('span');
                                thinkingAnimation.id = 'thinking-animation';
                                thinkingAnimation.innerHTML = loadingSvg;
                                while (tempContent.length > 0) {
                                    if (inThinkSection) {
                                        const thinkEndIndex = tempContent.indexOf("</think>");
                                        if (thinkEndIndex !== -1) {
                                            thinkContent += tempContent.substring(0, thinkEndIndex);
                                            if (thinkSectionElement) {
                                                const thinkContentElement = thinkSectionElement.querySelector('.think-content');
                                                thinkContentElement.textContent = thinkContent;
                                                thinkContentElement.classList.add('auto-scrolling');
                                                thinkContentElement.scrollTop = thinkContentElement.scrollHeight;
                                                setTimeout(() => thinkContentElement.classList.remove('auto-scrolling'), 1000);
                                            }
                                            inThinkSection = false;
                                            tempContent = tempContent.substring(thinkEndIndex + "</think>".length);
                                            if (thinkSectionElement) {
                                                const thinkContentElement = thinkSectionElement.querySelector('.think-content');
                                                thinkContentElement.classList.remove('expanded');

                                                if (thinkHeaderElement) {
                                                    thinkHeaderElement.textContent = UI_STRINGS.think.toggle;
                                                    thinkHeaderElement.classList.remove('expanded');
                                                }
                                            }
                                        } else {
                                            thinkContent += tempContent;
                                            if (thinkSectionElement) {
                                                const thinkContentElement = thinkSectionElement.querySelector('.think-content');
                                                thinkContentElement.textContent = thinkContent;
                                                thinkContentElement.classList.add('auto-scrolling');
                                                thinkContentElement.scrollTop = thinkContentElement.scrollHeight;
                                                const animationElement = thinkSectionElement.querySelector('#thinking-animation');
                                                if (!animationElement) {
                                                    thinkContentElement.appendChild(thinkingAnimation);
                                                }
                                                thinkContentElement.classList.add('expanded');
                                                setTimeout(() => thinkContentElement.classList.remove('auto-scrolling'), 1000);
                                            }
                                            tempContent = "";
                                        }
                                    } else {
                                        const thinkStartIndex = tempContent.indexOf("<think>");
                                        if (thinkStartIndex !== -1) {
                                            markdownContent += tempContent.substring(0, thinkStartIndex);
                                            markdownDiv.innerHTML = renderMarkdown(markdownContent);

                                            inThinkSection = true;
                                            thinkContent = "";
                                            tempContent = tempContent.substring(thinkStartIndex + "<think>".length);
                                            thinkSectionElement = createThinkSection(assistantMessageDiv);
                                            thinkHeaderElement = thinkSectionElement.querySelector('.think-header');
                                            const thinkContentElement = thinkSectionElement.querySelector('.think-content');
                                            thinkContentElement.textContent = thinkContent;
                                            thinkContentElement.scrollTop = thinkContentElement.scrollHeight;
                                            thinkContentElement.classList.add('expanded');

                                            if (thinkHeaderElement) {
                                                thinkHeaderElement.textContent = UI_STRINGS.think.initial;
                                            }
                                            const animationElement = thinkSectionElement.querySelector('#thinking-animation');
                                            if (!animationElement) {
                                                thinkContentElement.appendChild(thinkingAnimation);
                                            }
                                        } else {
                                            markdownContent += tempContent;
                                            markdownDiv.innerHTML = renderMarkdown(markdownContent);
                                            tempContent = "";
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                        }
                    }
                }
            }

            if (markdownContent) {
                const markdown = renderMarkdown(markdownContent, true, visitedURLs);
                markdownDiv.replaceChildren(markdown);
                const copyButton = createCopyButton(markdownContent);
                assistantMessageDiv.appendChild(copyButton);
                
                existingMessages.push({
                    role: 'assistant',
                    content: markdownContent,
                    think: thinkContent
                });

                // Save messages to localStorage
                saveChatMessages();
                // Check if the Favicon Badge API is supported
                setFaviconBadge();
                playNotificationSound();
            }
        } else {
            const jsonResult = await res.json();
            if (jsonResult) {
                assistantMessageDiv.textContent = jsonResult.choices[0].message.content;
                existingMessages.push({
                    role: 'assistant',
                    content: jsonResult.choices[0].message.content
                });
                // Save messages to localStorage
                saveChatMessages();
            } else {
                throw new Error('Empty response from server.');
            }
        }


    } catch (error) {
        removeLoadingIndicator(assistantMessageDiv);
        const errorText = document.createElement('span');
        const errorIcon = `<svg id="error-icon" class="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        if (error.name !== 'AbortError') {
            errorText.innerHTML = errorIcon + `Error: ${error.message || String(error)}`;

        } else {
            if (assistantMessageDiv) {
                errorText.innerHTML = errorIcon + `Error: Request cancelled.`;
            }
        }
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-message';
        errorContainer.appendChild(errorText);
        assistantMessageDiv.appendChild(errorContainer);
    } finally {
        isLoading = false;
        sendButton.disabled = false;
        makeAllLinksOpenInNewTab();
    }
}

// Load and display saved messages
function loadAndDisplaySavedMessages() {
    existingMessages = loadChatMessages();
    
    if (existingMessages.length > 0) {
        // Display saved messages
        existingMessages.forEach(message => {
            const messageDiv = displayMessage(message.role, message.content);
            
            if (message.role === 'assistant') {
                // Remove loading indicator
                removeLoadingIndicator(messageDiv);
                
                // Create markdown div
                const markdownDiv = document.createElement('div');
                markdownDiv.classList.add('markdown');
                messageDiv.appendChild(markdownDiv);
                
                // Render markdown content
                const markdown = renderMarkdown(message.content, true);
                markdownDiv.replaceChildren(markdown);
                
                // Add copy button
                const copyButton = createCopyButton(message.content);
                messageDiv.appendChild(copyButton);
                
                // Check for think content
                if (message.think) {
                    const thinkSectionElement = createThinkSection(messageDiv);
                    const thinkContentElement = thinkSectionElement.querySelector('.think-content');
                    thinkContentElement.textContent = message.think;
                    
                    const thinkHeaderElement = thinkSectionElement.querySelector('.think-header');
                    if (thinkHeaderElement) {
                        thinkHeaderElement.textContent = UI_STRINGS.think.toggle;
                    }
                }
            } else if (message.role === 'user') {
                // Ensure user message content is displayed
                messageDiv.textContent = message.content;
            }
        });
        makeAllLinksOpenInNewTab();
    
        // Scroll to bottom
        scrollToBottom();
    }
}

// Call the function to load and display saved messages
loadAndDisplaySavedMessages();

// Initialize empty state
updateEmptyState();

// Settings functionality
function initializeSettings() {
    // Initialize search bar position
    const isSearchBarBottom = localStorage.getItem('search_bar_bottom') === 'true';
    searchBarBottom.checked = isSearchBarBottom;
    document.body.classList.toggle('search-bar-bottom', isSearchBarBottom);

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || getCurrentColorScheme();
    const themeToggleInput = document.getElementById('theme-toggle-input');
    themeToggleInput.checked = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

settingsButton.addEventListener('click', () => {
    settingsDialog.classList.add('visible');
});

// Close dialog when clicking close button
dialogCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const dialog = btn.closest('.dialog-overlay');
        dialog.classList.remove('visible');
    });
});

searchBarBottom.addEventListener('change', (e) => {
    const isBottom = e.target.checked;
    localStorage.setItem('search_bar_bottom', isBottom);
    document.body.classList.toggle('search-bar-bottom', isBottom);
});

const themeToggleInput = document.getElementById('theme-toggle-input');
themeToggleInput.addEventListener('change', (e) => {
    const theme = e.target.checked ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    const hlTheme = theme === 'light' ? 'vs' : 'vs2015';
    const hlThemeElement = document.getElementById('hljs-theme');
    if (hlThemeElement) {
        hlThemeElement.href = `third-party/${hlTheme}.min.css`;
    }
});

// Initialize settings on load
initializeSettings();


// Event Listeners
sendButton.addEventListener('click', sendMessage);
clearButton.addEventListener('click', clearMessages);
messageInput.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Close dialogs when clicking outside
[apiKeyDialog, helpDialog].forEach(dialog => {
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.classList.remove('visible');
        }
    });
});


// URL Parameter handling
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');

    if (queryParam && messageInput) {
        messageInput.value = decodeURIComponent(queryParam);
        clearMessages();
        sendMessage();
    }
});

let autoScrollEnabled = true; // Flag to track auto-scroll state
// Auto-scroll setup
const observer = new MutationObserver((mutations) => {
    if (!autoScrollEnabled) return;
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            scrollToBottom();
        }
    });
});

observer.observe(chatContainer, {childList: true, subtree: true});

mainContainer.addEventListener('scroll', () => {
    // Check if the user has scrolled up from the bottom
    const isAtBottom = mainContainer.scrollTop + mainContainer.clientHeight >= mainContainer.scrollHeight;

    // If the user has scrolled up, disable auto-scroll
    if (!isAtBottom) {
        autoScrollEnabled = false;
    } else {
        // If the user scrolls back to the bottom, re-enable auto-scroll
        autoScrollEnabled = true;
        scrollToBottom(); // Ensure it's scrolled to the bottom when re-enabled
    }
});

// Update toggleApiKeyBtn click handler
toggleApiKeyBtn.addEventListener('click', () => {
    apiKeyDialog.classList.add('visible');
});

// Update dialog close handlers
dialogCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const dialog = btn.closest('.dialog-overlay');
        if (dialog) {
            dialog.classList.remove('visible');
        }
    });
});


// Update help button click handler
helpButton.addEventListener('click', () => {
    helpDialog.classList.add('visible');
});

// Update handleApiKeySave function
function handleApiKeySave() {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('api_key', key);
        getApiKeyBtn.style.display = 'none';
        freeUserRPMInfo.style.display = 'none';
        toggleApiKeyBtnText.textContent = UI_STRINGS.buttons.updateKey;
    } else {
        localStorage.removeItem('api_key');
        getApiKeyBtn.style.display = 'block';
        freeUserRPMInfo.style.display = 'block';
        toggleApiKeyBtnText.textContent = UI_STRINGS.buttons.addKey;
    }
    apiKeyDialog.classList.remove('visible');
}

// Set up event listeners for visibility and focus changes
document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('focus', clearFaviconBadge);

// Function to handle visibility change
function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        clearFaviconBadge();
    }
}


function setFaviconBadge() {
    if (document.visibilityState === 'visible') {
        clearFaviconBadge();
        return;
    }

    const favicon = document.querySelector('link[rel="icon"]');
    clearFaviconBadge();

    // Organic double-pulse heartbeat pattern
    const pattern = [400, 700, 400, 1500];  // pulse, pause, pulse, rest
    let step = 0;

    favicon.pulseInterval = setInterval(() => {
        favicon.href = step % 2 ? '/favicon.ico' : '/favicon-empty.ico';
        step = (step + 1) % pattern.length;
    }, pattern[0]);
}

function clearFaviconBadge() {
    const favicon = document.querySelector('link[rel="icon"]');
    clearInterval(favicon.pulseInterval);
    favicon.href = '/favicon.ico';
}


function playNotificationSound() {
    if (document.visibilityState === 'visible') {
        // dont play sound if the tab is already visible
        return;
    }
    // Create audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    // Create two oscillators for a pleasant harmonious sound
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();

    // Create gain node for volume control
    const gainNode = audioCtx.createGain();

    // Configure oscillators
    osc1.type = 'sine';
    osc2.type = 'sine';

    // Apple-like gentle ascending perfect fifth (C6 to G6)
    osc1.frequency.setValueAtTime(1046.50, audioCtx.currentTime); // C6
    osc2.frequency.setValueAtTime(1567.98, audioCtx.currentTime); // G6

    // Connect nodes
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Create a subtle, gentle envelope
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02); // Gentle attack
    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35); // Smooth release

    // Play sound
    osc1.start(audioCtx.currentTime);
    osc2.start(audioCtx.currentTime + 0.05); // Slight delay for second note

    osc1.stop(audioCtx.currentTime + 0.4);
    osc2.stop(audioCtx.currentTime + 0.4);
}


// Function to handle footnote clicks
function handleFootnoteClick(event) {
    // Check if the clicked element is a footnote reference
    if (event.target.matches('.footnote-ref a') || event.target.matches('.footnote-backref')) {
        event.preventDefault();

        // Extract the footnote ID from the href
        const href = event.target.getAttribute('href');
        const footnoteId = href.replace('#', '');

        // Find the references section
        const referencesSection = event.target.closest('.message').querySelector('.references-section');
        if (!referencesSection) return;

        // Get the header and content elements
        const referencesHeader = referencesSection.querySelector('.references-header');
        const referencesContent = referencesSection.querySelector('.references-content');

        // Expand the references section if it's not already expanded
        if (!referencesHeader.classList.contains('expanded')) {
            referencesHeader.classList.toggle('expanded');
            referencesHeader.classList.toggle('collapsed');
            referencesContent.classList.toggle('expanded');
        }

        // Find and highlight the target footnote
        const targetFootnote = referencesContent.querySelector(`#${footnoteId}`);
        if (targetFootnote) {
            // Remove any existing highlights
            const existingHighlights = referencesContent.querySelectorAll('.footnote-highlight');
            existingHighlights.forEach(el => el.classList.remove('footnote-highlight'));

            // Add highlight class to trigger animation
            targetFootnote.classList.add('footnote-highlight');

            // Scroll the footnote into view
            targetFootnote.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    }
}

// Add the event listener to the chat container to handle all footnote clicks
document.getElementById('chat-container').addEventListener('click', handleFootnoteClick);

