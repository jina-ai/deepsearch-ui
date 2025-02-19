// UI Strings
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
const themeToggle = document.getElementById('theme-toggle');
const themeLightIcon = document.getElementById('light-icon');
const themeDarkIcon = document.getElementById('dark-icon');
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
const dialogCloseBtns = document.querySelectorAll('.dialog-close');

const loadingSvg = `<svg id="thinking-animation-icon" width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_mHwL{animation:spinner_OeFQ .75s cubic-bezier(0.56,.52,.17,.98) infinite; fill:currentColor}.spinner_ote2{animation:spinner_ZEPt .75s cubic-bezier(0.56,.52,.17,.98) infinite;fill:currentColor}@keyframes spinner_OeFQ{0%{cx:4px;r:3px}50%{cx:9px;r:8px}}@keyframes spinner_ZEPt{0%{cx:15px;r:8px}50%{cx:20px;r:3px}}</style><defs><filter id="spinner-gF00"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="y"/><feColorMatrix in="y" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" result="z"/><feBlend in="SourceGraphic" in2="z"/></filter></defs><g filter="url(#spinner-gF00)"><circle class="spinner_mHwL" cx="4" cy="12" r="3"/><circle class="spinner_ote2" cx="15" cy="12" r="8"/></g></svg>`;
const BASE_ORIGIN = 'https://deepsearch.jina.ai';

// State variables
let isLoading = false;
let abortController = null;
let existingMessages = [];
let md;

// Theme toggle handler - fixed logic
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  // Show the opposite icon of new theme to indicate what you'll switch to next

  themeLightIcon.style.display = newTheme === 'dark' ? 'block' : 'none';
  themeDarkIcon.style.display = newTheme === 'light' ? 'block' : 'none';
  updateLogo(logo, newTheme);
  
  const hlTheme = newTheme === 'light' ? 'vs' : 'vs2015';
  const hlThemeElement = document.getElementById('hljs-theme');
  if (hlThemeElement) {
    hlThemeElement.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${hlTheme}.min.css`;
  }
});

// API Key Management
function initializeApiKey() {
  const savedKey = localStorage.getItem('api_key') || '';
  apiKeyInput.value = savedKey;
  getApiKeyBtn.style.display = savedKey ? 'none' : 'block';
  freeUserRPMInfo.style.display = savedKey ? 'none' : 'block';
  toggleApiKeyBtnText.textContent = savedKey ? UI_STRINGS.buttons.updateKey : UI_STRINGS.buttons.addKey;
}


// Initialize API key
initializeApiKey();


saveApiKeyBtn.addEventListener('click', handleApiKeySave);

// Message display functions
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
    thinkHeader.classList.add('expanded');
    thinkContent.classList.add('expanded');
    thinkContent.style.display = 'block';
  } else {
    thinkHeader.classList.add('collapsed');
    thinkContent.style.display = 'none';
  }

  thinkHeader.addEventListener('click', (e) => {
    e.stopPropagation();
    thinkContent.classList.toggle('expanded');

    if (thinkContent.classList.contains('expanded')) {
      thinkHeader.classList.add('expanded');
      thinkHeader.classList.remove('collapsed');
    } else {
      thinkHeader.classList.remove('expanded');
      thinkHeader.classList.add('collapsed');
    }

    thinkContent.style.display = thinkContent.classList.contains('expanded') ? 'block' : 'none';
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

  messageDiv.style.textAlign = role === 'user' ? 'right' : 'left';
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

if (window.markdownit) {
  md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre><code class="hljs">' +
                 hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                 '</code></pre>';
        } catch (__) {}
      }
  
      return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
  })
  .use(window.markdownitFootnote);
}

function renderMarkdown(content) {
  if (!md) {
    md = window.markdownit({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre><code class="hljs">' +
                   hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                   '</code></pre>';
          } catch (__) {}
        }
    
        return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
      }
    })
    .use(window.markdownitFootnote);
  }
  if (md) {
    return md.render(content);
  } else {
    return content;
  }
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
  if (window.updateLogo) {
    updateLogo(logo, document.documentElement.getAttribute('data-theme'));
  }
}


function clearMessages() {
  chatContainer.innerHTML = '';
  existingMessages = [];
  abortController?.abort();
  updateEmptyState();
}

async function sendMessage() {
  const query = messageInput.value.trim();

  if (!query || isLoading) return;

  abortController = new AbortController();
  isLoading = true;
  sendButton.disabled = true;

  displayMessage('user', query);
  existingMessages.push({ role: 'user', content: query });
  messageInput.value = '';

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

      while (true) {
        const { done, value } = await reader.read();

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
                const content = json.choices[0].delta.content;
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
                        thinkSectionElement.querySelector('.think-content').textContent = thinkContent;
                      }
                      inThinkSection = false;
                      tempContent = tempContent.substring(thinkEndIndex + "</think>".length);
                      if (thinkSectionElement) {
                        const thinkContentElement = thinkSectionElement.querySelector('.think-content');
                        thinkContentElement.style.display = 'none';
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
                        const animationElement = thinkSectionElement.querySelector('#thinking-animation');
                        if (!animationElement) {
                          thinkContentElement.appendChild(thinkingAnimation);
                        }
                        thinkContentElement.style.display = 'block';
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
                      thinkSectionElement.querySelector('.think-content').textContent = thinkContent;
                      const thinkContentElement = thinkSectionElement.querySelector('.think-content');
                      thinkContentElement.style.display = 'block';

                      if (thinkHeaderElement) {
                        thinkHeaderElement.textContent = UI_STRINGS.think.initial;
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
        markdownDiv.innerHTML = renderMarkdown(markdownContent);
        const copyButton = createCopyButton(markdownContent);
        assistantMessageDiv.appendChild(copyButton);
        existingMessages.push({
          role: 'assistant',
          content: markdownContent,
        });
      }
    } else {
      const jsonResult = await res.json();
      if (jsonResult) {
        assistantMessageDiv.textContent = jsonResult.choices[0].message.content;
        existingMessages.push({
          role: 'assistant',
          content: jsonResult.choices[0].message.content
        });
      } else {
        throw new Error('Empty response from server.');
      }
    }


  } catch (error) {
    if (error.name !== 'AbortError') {
        assistantMessageDiv.textContent = `Error: ${error.message || String(error)}`;
    } else {
      if (assistantMessageDiv) {
        assistantMessageDiv.textContent = "Request cancelled.";
      }
    }
  } finally {
    isLoading = false;
    sendButton.disabled = false;
  }
}

// Initialize empty state
updateEmptyState();


// Event Listeners
sendButton.addEventListener('click', sendMessage);
clearButton.addEventListener('click', clearMessages);
messageInput.addEventListener('keydown', (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// Help dialog event listeners
helpButton.addEventListener('click', () => {
  helpDialog.style.display = 'flex';
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
    messageInput.value = queryParam;
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

observer.observe(chatContainer, { childList: true, subtree: true });

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