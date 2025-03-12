// Load i18n translations
let i18n = {};
let currentLanguage = 'en';
let UI_STRINGS = {
    buttons: {
        send: () => 'Send',
        addKey: () => 'Upgrade',
        updateKey: () => 'Update Key',
        getKey: () => 'Get API Key',
        purchase: () => 'Purchase More Token',
    },
    think: {
        initial: () => 'Thinking...',
        toggle: () => 'Thoughts',
    },
    references: {
        title: () => 'References',
        sources: () => 'Sources'
    },
    errors: {
        invalidKey: () => 'Invalid API key. Please update your key by click the button below.',
        insufficientTokens: () => 'Insufficient tokens in your API key. Please purchase more tokens or swap to another key.',
        rateLimit: () => 'You have reached the rate limit. Please try again later. You can also upgrade to a higher plan by clicking the button below.'
    }
};

// Function to load i18n translations
async function loadTranslations() {
  try {
    const response = await fetch('i18n.json');
    i18n = await response.json();
    applyTranslations();
  } catch (error) {
    console.error('Error loading translations:', error);
  }
}

// Function to get translation for a key
function t(key, replacements = {}, fallbackLanguage = 'en') {
    const keys = key.split('.');
    let value = i18n[currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = value[k];
      } else if (value && Array.isArray(value) && !isNaN(parseInt(k)) && parseInt(k) >= 0 && parseInt(k) < value.length) {
        value = value[parseInt(k)];
      } else {
        let fallback = i18n[fallbackLanguage];
        if (!fallback) {
          fallback = i18n['en']; //ultimate fallback to English
        }
        let fallbackValue = fallback;
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fallbackValue !== null && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk];
          } else if (fallbackValue && Array.isArray(fallbackValue) && !isNaN(parseInt(fk)) && parseInt(fk) >= 0 && parseInt(fk) < fallbackValue.length) {
            fallbackValue = fallbackValue[parseInt(fk)];
          } else {
            return key; // Return the key if no translation found in either language
          }
        }
        value = fallbackValue;
        break;
      }
    }

    // Apply replacements if provided
    if (typeof value === 'string' && replacements) {
      for (const replacementKey in replacements) {
        if (replacements.hasOwnProperty(replacementKey)) {
          const replacementValue = replacements[replacementKey];
          const regex = new RegExp(`{{${replacementKey}}}`, 'g');
          value = value.replace(regex, replacementValue);
        }
      }
    }

    return value;
}


// Function to apply translations to the UI
function applyTranslations() {

    if (!i18n || !i18n[currentLanguage]) {
        console.error('No translations found for current language:', currentLanguage);
        return;
    }

    // Update document title and meta tags
    document.title = t('title');

    // Update meta tags
    const metaTags = [
        'meta[name="title"]',
        'meta[name="description"]',
        'meta[property="og:title"]',
        'meta[property="og:description"]',
        'meta[property="twitter:title"]',
        'meta[property="twitter:description"]'
    ];

    metaTags.forEach(selector => {
        const tag = document.querySelector(selector);
        if (tag) {
            const key = selector.includes('description') ? 'description' : 'title';

            tag.content = t(key);
        }
    });

    // Update all elements with data-label attributes
    document.querySelectorAll('[data-label]').forEach(element => {
        const labelKey = element.getAttribute('data-label');
        const newVal = t(labelKey);
        if (newVal !== labelKey) {
            element.textContent = newVal;
        }
    });

    // Update input placeholders
    document.querySelectorAll('[data-placeholder]').forEach(input => {
        const placeholderKey = input.getAttribute('data-placeholder');
        input.placeholder = t(placeholderKey);
    });

    // Update all elements with data-html attributes
    document.querySelectorAll('[data-html]').forEach(element => {
        const htmlKey = element.getAttribute('data-html');
        element.innerHTML = t(htmlKey);
    });

    // Update all elements with data-tooltip attributes
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        const tooltipElement = element.querySelector('.tooltip');
        if (tooltipElement) {
            tooltipElement.textContent = t(element.getAttribute('data-tooltip'));
        }
    });

    // Update UI_STRINGS with translations
    UI_STRINGS = {
        buttons: {
          send: () => t('buttons.send'),
          addKey: () => t('buttons.addKey'),
          updateKey: () => t('buttons.updateKey'),
          getKey: () => t('buttons.getKey'),
          purchase: () => t('buttons.purchase'),
        },
        think: {
          initial: () => t('think.initial'),
          toggle: () => t('think.toggle'),
        },
        references: {
          title: () => t('references.title'),
          sources: () => t('references.sources')
        },
        errors: {
          invalidKey: () => t('errors.invalidKey'),
          insufficientTokens: () => t('errors.insufficientTokens'),
          rateLimit: () => t('errors.rateLimit')
        }
    };
}

// DOM Elements - grouped at the top for better organization

const logo = document.getElementById('logo');
const mainContainer = document.getElementById('main-container');
const chatContainer = document.getElementById('chat-container');
const messageForm = document.getElementById('input-area');
const messageInput = document.getElementById('message-input');
const newChatButton = document.getElementById('new-chat-button');
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
const dialogCloseBtns = document.querySelectorAll('.dialog-close');
const fileUploadButton = document.getElementById('file-upload-button');
const fileInput = document.getElementById('file-input');
const filePreviewContainer = document.getElementById('file-preview-container');
const inputErrorMessage = document.getElementById('input-error-message');

const loadingSvg = `<svg id="thinking-animation-icon" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_mHwL{animation:spinner_OeFQ .75s cubic-bezier(0.56,.52,.17,.98) infinite; fill:currentColor}.spinner_ote2{animation:spinner_ZEPt .75s cubic-bezier(0.56,.52,.17,.98) infinite;fill:currentColor}@keyframes spinner_OeFQ{0%{cx:4px;r:3px}50%{cx:9px;r:8px}}@keyframes spinner_ZEPt{0%{cx:15px;r:8px}50%{cx:20px;r:3px}}</style><defs><filter id="spinner-gF00"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="y"/><feColorMatrix in="y" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="z"/><feBlend in="SourceGraphic" in2="z"/></filter></defs><g filter="url(#spinner-gF00)"><circle class="spinner_mHwL" cx="4" cy="12" r="3"/><circle class="spinner_ote2" cx="15" cy="12" r="8"/></g></svg>`;
const BASE_ORIGIN = 'https://deepsearch.jina.ai';
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const docIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
const imgIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-image"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
const SUPPORTED_FILE_TYPES = {
    'application/pdf': docIcon,
    'text/plain': docIcon,
    'text/csv': docIcon,
    'image/jpeg': imgIcon,
    'image/png': imgIcon,
    'image/webp': imgIcon,
    'image/gif': imgIcon,
};

// State variables
let isLoading = false;
let abortController = null;
let existingMessages = [];
let md;

// Composing state variables for handling IME input
let isComposing = false;
let compositionEnded = false;

// File upload state
let uploadedFiles = [];

// API Key Management
function initializeApiKey() {
    const savedKey = localStorage.getItem('api_key') || '';
    apiKeyInput.value = savedKey;
    getApiKeyBtn.style.display = savedKey ? 'none' : 'block';
    freeUserRPMInfo.style.display = savedKey ? 'none' : 'block';
    toggleApiKeyBtnText.textContent = savedKey ? UI_STRINGS.buttons.updateKey() : UI_STRINGS.buttons.addKey();
}

// Chat Message Persistence
function saveChatMessages() {
    const thinMessage = existingMessages.map(m => {
        return {
            role: m.role,
            content: typeof m.content === 'string' ? m.content : m.content.map(c => ({ type: c.type, text: c.text, mimeType: c.mimeType, fileName: c.fileName })),
            id: m.id,
            think: m.think,
        };
    });

    localStorage.setItem('chat_messages', JSON.stringify(thinMessage));
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


// File upload functions
function handleFileUpload(files) {
    if (!files || files.length === 0) return;

    // Check total size
    let totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    for (const file of files) {
        totalSize += file.size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
        inputErrorMessage.textContent = t('errors.fileSizeLimit');
        inputErrorMessage.style.display = 'block';
        return;
    }

    // Process each file
    for (const file of files) {
        // Check file type
        if (!isSupportedFileType(file.type)) {
            inputErrorMessage.textContent = t('errors.fileTypeNotSupported') + ': ' + file.name;
            inputErrorMessage.style.display = 'block';
            continue;
        }

        // Add file to uploaded files
        uploadedFiles.push(file);

        // Create file preview
        createFilePreview(file);
    }

    // Reset file input
    fileInput.value = '';
}

// Check if file type is supported
function isSupportedFileType(mimeType) {
    return mimeType in SUPPORTED_FILE_TYPES;
}

// Create file preview
function createFilePreview(file) {
    const reader = new FileReader();
    const previewItem = document.createElement('div');
    previewItem.classList.add('file-preview-item');

    // Create remove button
    const removeButton = document.createElement('div');
    removeButton.classList.add('remove-file');
    removeButton.innerHTML = '×';
    removeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedFiles = uploadedFiles.filter(f => f !== file);
        previewItem.remove();
    });

    // Create file name element
    const fileName = document.createElement('div');
    fileName.classList.add('file-name');
    fileName.textContent = file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name;
    fileName.title = file.name;

    previewItem.appendChild(removeButton);

    // Handle different file types
    if (file.type.startsWith('image/')) {
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            previewItem.appendChild(img);
            previewItem.appendChild(fileName);
        };
        reader.readAsDataURL(file);
    } else {
        // For non-image files, show an icon
        const fileTypeIcon = document.createElement('div');
        fileTypeIcon.classList.add('file-type-icon');
        fileTypeIcon.innerHTML = getFileTypeDisplay(file.type);
        previewItem.appendChild(fileTypeIcon);
        previewItem.appendChild(fileName);
    }

    filePreviewContainer.appendChild(previewItem);
}

// Helper function to get file type display
function getFileTypeDisplay(mimeType) {
    return SUPPORTED_FILE_TYPES[mimeType] || 'FILE';
}

// Initialize API key
initializeApiKey();

// File upload event listeners
fileUploadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', e => handleFileUpload(e.target.files));

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
    header.setAttribute('data-label', 'references.title');
    header.textContent = UI_STRINGS.references.title();

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

                item.classList.add('favicon-item', 'tooltip-container');
                item.setAttribute('data-tooltip', url);
                item.appendChild(img);

                // Add click handler for favicon
                item.addEventListener('click', () => {
                    window.open(url, '_blank');
                });
                handleTooltipEvent(item, 'top');

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
    const sourceCount = document.createElement('div');
    sourceCount.classList.add('sources-count');
    sourceCount.textContent = `${visitedURLs.length} `;

    const label = document.createElement('span');
    label.setAttribute('data-label', 'references.sources');
    label.textContent = UI_STRINGS.references.sources();

    sourceCount.appendChild(label);
    faviconList.appendChild(sourceCount);

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
    thinkHeader.setAttribute('data-label', 'think.toggle');

    thinkHeader.appendChild(document.createTextNode(UI_STRINGS.think.initial()));
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

function handleTooltipEvent (triggerElement, orientation = 'bottom' | 'top' | 'left' | 'right') {
    let tooltip = triggerElement.querySelector('.tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.textContent = t(triggerElement.getAttribute('data-tooltip'));
        triggerElement.appendChild(tooltip);
    }

    triggerElement.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';

        switch (orientation) {
            case 'top':
                tooltip.style.bottom = '125%';
                tooltip.style.top = 'unset';
                adjustHorizontalPosition(triggerElement, tooltip);
                break;
            case 'left':
                tooltip.style.right = `calc(100% + 10px)`;
                tooltip.style.left = 'unset';
                tooltip.style.top = '50%';
                tooltip.style.bottom = 'unset';
                tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'right':
                tooltip.style.left = `calc(100% + 10px)`;
                tooltip.style.right = 'unset';
                tooltip.style.top = '0';
                tooltip.style.bottom = 'unset';
                tooltip.style.transform = 'translateY(-50%)';
                break;
            case 'bottom':
            default:
                tooltip.style.top = '125%';
                tooltip.style.bottom = 'unset';
                adjustHorizontalPosition(triggerElement, tooltip);
                break;
        }
    });

    const adjustHorizontalPosition = (triggerElement,  tooltip) => {
        const rect = triggerElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        if (rect.left < tooltipRect.width / 2) {
            tooltip.style.left = '0';
            tooltip.style.right = 'unset';
            tooltip.style.transform = 'unset';
        } else if (window.innerWidth - rect.right < tooltipRect.width / 2) {
            tooltip.style.right = '0';
            tooltip.style.left = 'unset';
            tooltip.style.transform = 'unset';
        } else {
            tooltip.style.left = '50%';
            tooltip.style.right = 'unset';
            tooltip.style.transform = 'translateX(-50%)';
        }
    };

    triggerElement.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
}

function handleReDoEvent (redoButton) {
    if (isLoading) return;

    // Find the current message element
    const messageElement = redoButton.closest('.message');
    if (!messageElement) {
        console.error('Current message not found');
        return;
    };

    const currentMessageId = messageElement.getAttribute('id');
    const currentMessageIndex = existingMessages.findIndex(m => m.id === currentMessageId);

    if (currentMessageIndex < 0) {
        console.error('Current message not found in existing messages');
        return;
    };

    // Get the previous user message
    let userMessageIndex = currentMessageIndex - 1;
    while (userMessageIndex >= 0 && existingMessages[userMessageIndex].role !== 'user') {
        userMessageIndex--;
    }
    const userMessage = existingMessages[userMessageIndex]?.content;
    if (!userMessage) {
        console.error('No user message found to redo');
        return;
    };

    const allMessages = Array.from(chatContainer.querySelectorAll('.message'));
    const startIndex = allMessages.findIndex(m => m.id === currentMessageId);
    if (startIndex < 0) return;

    // Remove all messages after the current message
    allMessages.slice(startIndex).forEach(m => m.remove());

    // Remove messages from existingMessages and localStorage
    existingMessages.splice(currentMessageIndex);
    saveChatMessages();

    sendMessage(true);
}

function handleCopyEvent (copyButton, copyIcon, content) {
    const checkIcon = `<svg class="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    if (!navigator.clipboard) {
        console.error('Clipboard API not available');
        return
    }

    navigator.clipboard.writeText(content.trim())
    .then(() => {
        copyButton.innerHTML = checkIcon;
        setTimeout(() => {
            copyButton.innerHTML = copyIcon;
        }, 2000);
    });
}

function handleStopEvent (stopButton) {
    stopButton.addEventListener('click', () => {
        if (abortController) {
            abortController.abort();
            isLoading = false;
            stopButton.remove();
            const animationElement = document.querySelector('#thinking-animation');
            if (animationElement) {
                animationElement.remove();
            }
        }
    });
}

function createActionButton(content) {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action-buttons-container');

    // redo button
    const redoButton = document.createElement('button');
    redoButton.classList.add('redo-button', 'tooltip-container');
    redoButton.setAttribute('data-tooltip', 'tooltips.redo');
    const redoIcon = `<svg class="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-refresh-cw"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`;
    redoButton.innerHTML = redoIcon;

    // copy button
    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-button', 'tooltip-container');
    copyButton.setAttribute('data-tooltip', 'tooltips.copy');
    const copyIcon = `<svg class="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
    copyButton.innerHTML = copyIcon;

    buttonContainer.appendChild(redoButton);
    buttonContainer.appendChild(copyButton);

    redoButton.addEventListener('click', () => {
        handleReDoEvent(redoButton);
    });

    copyButton.addEventListener('click', () => {
        handleCopyEvent(copyButton, copyIcon, content);
    });

    [redoButton, copyButton].forEach(button => {
        handleTooltipEvent(button);
    });

    return buttonContainer;
}

function createStopButton() {
    if (!isLoading) return;
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action-buttons-container');

    const stopButton = document.createElement('button');
    stopButton.classList.add('stop-button', 'tooltip-container');
    stopButton.setAttribute('data-tooltip', 'tooltips.stop');
    const stopIcon = `<svg id="stop-message" class="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-pause"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    stopButton.innerHTML = stopIcon;

    buttonContainer.appendChild(stopButton);

    handleStopEvent(stopButton);
    handleTooltipEvent(stopButton);

    return buttonContainer;
}

function createMessage(role, content, messageId = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${role}-message`)
    const id = messageId || `message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    messageDiv.id = id;

    if (role === 'assistant') {
        messageDiv.innerHTML = `<div id="loading-indicator">${loadingSvg}</div>`;
    } else {
        // Handle user message with potential file content
        if (typeof content === 'string') {
            // Simple text message
            messageDiv.replaceChildren(renderMarkdown(content, true, [], role));
        } else if (Array.isArray(content)) {
            // Complex message with text and files
            const messageContent = document.createElement('div');

            // Process each part
            content.forEach(part => {
                switch (part.type) {
                    case 'image':
                    case 'file':
                        const fileContainer = document.createElement('div');
                        fileContainer.classList.add('message-file-container');

                        const fileLink = document.createElement('div');
                        fileLink.classList.add('message-file-link');

                        const fileIcon = document.createElement('span');
                        fileIcon.classList.add('message-file-icon');
                        fileIcon.innerHTML = getFileTypeDisplay(part.mimeType);

                        let fileName;
                        if (part.fileName) {
                            fileName = document.createElement('span');
                            fileName.classList.add('message-file-name');
                            fileName.textContent = part.fileName;
                        }

                        fileLink.appendChild(fileIcon);
                        if (fileName) {
                            fileLink.appendChild(fileName);
                        }
                        fileContainer.appendChild(fileLink);
                        messageContent.appendChild(fileContainer);
                        break;
                    case 'text':
                    default:
                        const textElement = renderMarkdown(part.text, true, [], role);
                        messageContent.appendChild(textElement);
                        break;
                }
            });

            messageDiv.appendChild(messageContent);
        }
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

function createErrorMessage(message, buttonText, onClick) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'assistant-message');

    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-message';

    const errorIcon = `<svg id="error-icon" class="action-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    const errorText = document.createElement('span');
    errorText.innerHTML = errorIcon + message;

    const actionButton = document.createElement('button');
    actionButton.textContent = buttonText;
    actionButton.className = 'error-action-button';
    actionButton.addEventListener('click', onClick);

    errorContainer.appendChild(errorText);
    errorContainer.appendChild(actionButton);
    messageDiv.appendChild(errorContainer);
    chatContainer.appendChild(messageDiv);

    scrollToBottom();
}


function initializeMarkdown() {
    if (window.markdownit) {
        const options = {
            html: true,
            linkify: true,
            typographer: true
        };

        // Only add highlighting if hljs is available
        if (window.hljs) {
            options.highlight = function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre><code class="hljs">' +
                            hljs.highlight(str, {language: lang, ignoreIllegals: true}).value +
                            '</code></pre>';
                    } catch (__) {
                    }
                }
                return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
            };
        }

        md = window.markdownit(options)
            .use(window.markdownitFootnote)
            .use(markdownItTableWrapper);
    }
}


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

function renderMarkdown(content, returnElement = false, visitedURLs = [], role = 'assistant') {
    if (!md) {
        initializeMarkdown();
    }
    const tempDiv = document.createElement('div');
    tempDiv.classList.add('markdown-inner');
    tempDiv.innerHTML = content;
    if (md) {
        const rendered = md.render(content);
        tempDiv.innerHTML = rendered;

        const footnoteAnchors = tempDiv.querySelectorAll('.footnote-ref a');
        footnoteAnchors.forEach(a => {
            const text = a.textContent.replace(/[\[\]]/g, '');
            a.textContent = text;
        });

        if (role === 'assistant') {
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
        } else {
            const blockElements = tempDiv.querySelectorAll('p', 'span');
            blockElements.forEach(el => {
                el.innerHTML = el.innerHTML.replace(/\n/g, '<br>');
            });
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
        messageInput.focus();
    } else {
        chatApp.classList.remove('empty-chat');
    }
    // blur the input if the chat is loading, incase the keyboard is open on mobile
    if (isLoading && new URLSearchParams(window.location.search).get('q')) {
        messageInput.blur();
    }
}

function clearMessages() {
    chatContainer.innerHTML = '';
    existingMessages = [];
    abortController?.abort();
    // Clear messages from localStorage
    localStorage.removeItem('chat_messages');
    // Clear uploaded files
    uploadedFiles = [];
    filePreviewContainer.innerHTML = '';
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

async function sendMessage(redo = false) {
    inputErrorMessage.style.display = 'none';
    const queryText = messageInput.value.trim();

    if (isLoading) return;
    if (!queryText && !redo) return;
    if (redo && existingMessages.length === 0) return;

    abortController = new AbortController();
    isLoading = true;

    let messageContent;

    // Create message content based on text and files
    if (uploadedFiles.length > 0) {
        messageContent = [];

        // Add text part if there's text
        if (queryText) {
            messageContent.push({
                type: 'text',
                text: queryText
            });
        }

        // Process files
        const filePromises = uploadedFiles.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64Data = reader.result;

                    if (file.type.startsWith('image/')) {
                        resolve({
                            type: 'image',
                            image: base64Data,
                            mimeType: file.type,
                            fileName: file.name
                        });
                    } else {
                        resolve({
                            type: 'file',
                            data: base64Data,
                            mimeType: file.type,
                            fileName: file.name
                        });
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        // Wait for all files to be processed
        const fileParts = await Promise.all(filePromises);
        messageContent.push(...fileParts);
    } else {
        // Just text
        messageContent = queryText;
    }

    if (!redo) {
        const userMessageId = `message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        createMessage('user', messageContent, userMessageId);
        existingMessages.push({role: 'user', content: messageContent, id: userMessageId});
    }

    // Clear input and files
    messageInput.value = '';
    messageInput.style.height = 'auto';
    uploadedFiles = [];
    filePreviewContainer.innerHTML = '';

    // To clear the badge
    clearFaviconBadge();
    // Save messages to localStorage
    saveChatMessages();

    const assistantMessageId = `message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const assistantMessageDiv = createMessage('assistant', '', assistantMessageId);

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
                messages: existingMessages.filter(({content}) => content).map(({role, content}) => ({role, content: typeof content === 'string' ? content : content.filter(c => c.text || c.image || c.data)})),
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
                    createErrorMessage(
                        UI_STRINGS.errors.invalidKey(),
                        UI_STRINGS.buttons.updateKey(),
                        () => apiKeyDialog.classList.add('visible')
                    );
                    break;
                case 402:
                    createErrorMessage(
                        UI_STRINGS.errors.insufficientTokens(),
                        UI_STRINGS.buttons.purchase(),
                        () => window.open('https://jina.ai/api-dashboard/key-manager?login=true', '_blank')
                    );
                    break;
                case 429:
                    createErrorMessage(
                        UI_STRINGS.errors.rateLimit(),
                        UI_STRINGS.buttons.addKey(),
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
        const stopButton = createStopButton();
        if (stopButton) {
            assistantMessageDiv.appendChild(stopButton);
        }

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
                                                    thinkHeaderElement.textContent = UI_STRINGS.think.toggle();
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
                                                thinkHeaderElement.textContent = UI_STRINGS.think.initial();
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
            
            stopButton?.remove();

            if (markdownContent) {
                const markdown = renderMarkdown(markdownContent, true, visitedURLs);
                markdownDiv.replaceChildren(markdown);

                const copyButton = createActionButton(markdownContent);
                const referencesSection = markdownDiv.querySelector('.references-section');
                if (referencesSection) {
                    referencesSection.insertAdjacentElement('beforebegin', copyButton);
                } else {
                    markdownDiv.appendChild(copyButton);
                }

                existingMessages.push({
                    role: 'assistant',
                    content: markdownContent,
                    think: thinkContent,
                    id: assistantMessageId,
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
                    content: jsonResult.choices[0].message.content,
                });
                // Save messages to localStorage
                saveChatMessages();
            } else {
                throw new Error('Empty response from server.');
            }
        }


    } catch (error) {
        removeLoadingIndicator(assistantMessageDiv);
        if (error.name === 'AbortError') {
            const actionButton = createActionButton(thinkContent + markdownContent);
            assistantMessageDiv.appendChild(actionButton);
            existingMessages.push({
                role: 'assistant',
                content: markdownContent,
                think: thinkContent,
                id: assistantMessageId,
            });
        } else {
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
        }
    } finally {
        isLoading = false;
        makeAllLinksOpenInNewTab();
    }
}

// Load and display saved messages
function loadAndDisplaySavedMessages() {
    existingMessages = loadChatMessages();

    if (existingMessages.length > 0) {
        // Display saved messages
        existingMessages.forEach(message => {
            if (!message.id) {
                message.id = `message-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            }
            const messageDiv = createMessage(message.role, message.content, message.id);

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
                const copyButton = createActionButton(message.content);
                const referencesSection = markdownDiv.querySelector('.references-section');
                if (referencesSection) {
                    referencesSection.insertAdjacentElement('beforebegin', copyButton);
                } else {
                    markdownDiv.appendChild(copyButton);
                }

                // Check for think content
                if (message.think) {
                    const thinkSectionElement = createThinkSection(messageDiv);
                    const thinkContentElement = thinkSectionElement.querySelector('.think-content');
                    thinkContentElement.textContent = message.think;

                    const thinkHeaderElement = thinkSectionElement.querySelector('.think-header');
                    if (thinkHeaderElement) {
                        thinkHeaderElement.textContent = UI_STRINGS.think.toggle();
                    }
                }
            }
            // User messages are already handled in displayMessage
        });
        saveChatMessages();
        makeAllLinksOpenInNewTab();

        // Scroll to bottom
        messageInput.focus();
        scrollToBottom();
    }
}


// Settings functionality
function initializeSettings() {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || (window.getCurrentColorScheme && getCurrentColorScheme());
    const themeToggleInput = document.getElementById('theme-toggle-input');
    themeToggleInput.checked = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Initialize language
    currentLanguage = localStorage.getItem('language') || (window.getBrowserLanguage && getBrowserLanguage()) || 'en';
    const languageSelect = document.getElementById('language-select');
    languageSelect.value = currentLanguage;

    // Initialize chirp on done setting (default to true)
    const chirpOnDone = localStorage.getItem('chirp_on_done') !== 'false';
    const chirpOnDoneToggleInput = document.getElementById('chirp-on-done-toggle-input');
    if (chirpOnDoneToggleInput) {
        chirpOnDoneToggleInput.checked = chirpOnDone;
    }
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

const languageSelect = document.getElementById('language-select');
languageSelect.addEventListener('change', (e) => {
    const language = e.target.value;
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('data-language', language);
    currentLanguage = language;
    applyTranslations();
});

const chirpOnDoneToggleInput = document.getElementById('chirp-on-done-toggle-input');
chirpOnDoneToggleInput?.addEventListener('change', (e) => {
    const chirpOnDone = e.target.checked;
    localStorage.setItem('chirp_on_done', chirpOnDone);
});

// Initialize settings on load
initializeSettings();


// Event Listeners
newChatButton.addEventListener('click', clearMessages);

messageInput.addEventListener('compositionstart', () => {
  console.log('composition start');
    isComposing = true;
    compositionEnded = false;
});

messageInput.addEventListener('compositionend', () => {
  console.log('composition end');
    isComposing = false;
    compositionEnded = true;
    setTimeout(() => {
      compositionEnded = false;
    }, 50);
});

messageInput.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        if (isComposing || compositionEnded) {
            event.preventDefault();
            event.stopPropagation();
            compositionEnded = false;
            return;
        }

        if (!event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }
});

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage();
});

messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = `${messageInput.scrollHeight - 28}px`;
    if (messageInput.value === '') {
        messageInput.style.height = 'unset';
    }

    const computedStyle = window.getComputedStyle(messageInput);
    const maxHeight = parseInt(computedStyle.maxHeight, 10);
    if (messageInput.scrollHeight >= maxHeight) {
        messageInput.style.overflowY = 'auto';
    } else {
        messageInput.style.overflowY = 'hidden';
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
async function handleURLParams (queryParam) {
    if (queryParam && messageInput) {
        messageInput.value = decodeURIComponent(queryParam);
        clearMessages();
        await sendMessage();
    }
};

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
        toggleApiKeyBtnText.textContent = UI_STRINGS.buttons.updateKey();
    } else {
        localStorage.removeItem('api_key');
        getApiKeyBtn.style.display = 'block';
        freeUserRPMInfo.style.display = 'block';
        toggleApiKeyBtnText.textContent = UI_STRINGS.buttons.addKey();
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
    const chirpOnDone = localStorage.getItem('chirp_on_done') !== 'false';
    if (document.visibilityState === 'visible' || chirpOnDone === false) {
        // dont play sound if the tab is already visible or chirp on done is disabled
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


// set up drag and drop file upload
function setupFileDrop() {

    const container = document.getElementById('message-input-container');
    const dropArea = document.getElementById('file-drop-area');
    // Prevent default to allow drop
    container.addEventListener('dragenter', (e) => {
        preventDefaults(e);
        displayDropArea();
    });

    container.addEventListener('dragleave', (e) => {
        preventDefaults(e);
        const rect = container.getBoundingClientRect();
        if (!rect) {
            hideDropArea();
            return;
        }
        if (e.x > rect.left + rect.width || e.x < rect.left ||
          e.y > rect.top + rect.height || e.y < rect.top) {
            hideDropArea();
        }
    });

    dropArea.addEventListener('dragover', (e) => {
        preventDefaults(e);
    });

    dropArea.addEventListener('drop', (e) => {
        preventDefaults(e);
        let files = [];
        const items = e.dataTransfer?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                const file = items[i].getAsFile();
                files.push(file);
            }
        }

        handleFileUpload(files);
        hideDropArea();
    });

    messageInput.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        let files = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file') {
                e.preventDefault();
                const file = items[i].getAsFile();
                files.push(file);
            }
        }
        handleFileUpload(files);
    });

    function displayDropArea() {
        dropArea.classList.add('drag-over');
        dropArea.style.display = 'block';
    }

    function hideDropArea() {
        dropArea.classList.remove('drag-over');
        dropArea.style.display = 'none';
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

function ensureHljsLoaded() {
    return new Promise((resolve) => {
        // If HLJS is already loaded, resolve immediately
        if (window.hljs) {
            resolve();
            return;
        }

        // Listen for the hljs-loaded event that's dispatched in hljs.js
        window.addEventListener('hljs-loaded', () => {
            resolve();
        }, { once: true });  // Use { once: true } to auto-remove the listener after it fires

        // Add a timeout as a fallback in case the event never fires
        setTimeout(() => {
            if (!window.hljs) {
                console.warn('HLJS did not load within the timeout period. Continuing without syntax highlighting.');
            }
            resolve(); // Resolve anyway after timeout to prevent blocking
        }, 2500);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // Initialize appearance first
    if (window.initializeAppearance) {
        window.initializeAppearance();
    }

    // Check for URL parameters first to determine initialization flow
    const urlParams = new URLSearchParams(window.location.search);
    const initPrompt = urlParams.get('q');

    // Promise chain for initialization
    Promise.resolve()
        .then(() => loadTranslations())
        .then(() => ensureHljsLoaded())
        .then(() => {
            // Initialize markdown
            try {
                initializeMarkdown();
            } catch (e) {
                console.warn('Failed to initialize markdown rendering:', e);
                // Continue without markdown rendering
            }

            if (initPrompt) {
                return handleURLParams(initPrompt);
            } else {
                return loadAndDisplaySavedMessages();
            }
        })
        .catch(error => {
            console.error('Error during application initialization:', error);

            // Attempt to render initial UI even if other features failed
            clearMessages();
        })
        .finally(() => {
            updateEmptyState();
        });

        [settingsButton, newChatButton, helpButton, toggleApiKeyBtn].forEach(button => {
            handleTooltipEvent(button, 'bottom');
        });

        handleTooltipEvent(fileUploadButton, 'top');
        setupFileDrop();
});
