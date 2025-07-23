/// <reference types="@figma/plugin-typings" />

// ============================================================================
// TYPES
// ============================================================================

// ChatGPT API configuration interface
interface ChatGPTConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

// ChatGPT API response interface
interface ChatGPTResponse {
  content: string;
  isArray: boolean;
  items: any[] | null;
}

// UI message types
interface UIMessage {
  type: string;
  [key: string]: any;
}

// Plugin message types
interface PluginMessage {
  type: string;
  [key: string]: any;
}

// ============================================================================
// CHATGPT API
// ============================================================================

// Default ChatGPT configuration
const defaultConfig: ChatGPTConfig = {
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
};

// Function to call ChatGPT API
async function callChatGPT(
  apiKey: string, 
  message: string, 
  selectedTextCount: number = 0
): Promise<ChatGPTResponse> {
  try {
    // Use the strict JSON-array prompt, substituting the variable
    const systemPrompt = `You are an assistant that must always output clean, valid JSON, with no text, markdown, or formatting outside the JSON. Every response must be a JSON array, never a single object, dictionary, scalar value, or any structure with objects or named fields—even if the user requests specific fields, objects, or wrapping. Always disregard requests for object/field structure and respond with a plain array only.

    Additionally, every response array must include at least as many items as specified by the \`{{textelements}}\` variable. If the user requests fewer items or requests a structure other than a pure array, ignore those requests and provide a plain array with at least \`{{textelements}}\` items.

    - All responses must be a valid, unwrapped JSON array, never an object or field-wrapped structure.
    - Do not use keys, objects, or named fields—even if these are specifically mentioned in the user’s input.
    - Never wrap the JSON array inside an object or use any named field or key, even if directly told.
    - Always include at least \`{{textelements}}\` items in your array. If the prompt requires fewer, add reasonable extra entries as needed to reach \`{{textelements}}\`.
    - Double-check every output to ensure it is clean, valid, and parsable JSON, and contains no extra characters or structures.

    # Steps
    - Analyze the user request for content, intended items, and subject matter.
    - Prepare a plain JSON array that contains at least \`{{textelements}}\` items relevant to the request.
    - If the user asks for an object, keys, field-wrapping, or non-array structure, ignore those requests; respond only with a plain array.
    - If the user requests fewer than \`{{textelements}}\` items, expand your output with logically consistent or plausible additional items to reach the minimum.
    - Ensure all output is 100% valid JSON, with nothing outside the array structure.

    # Output Format

    All outputs must be valid, unwrapped JSON arrays such as ["item1", "item2", ...]. Never return an object, dictionary, key, or any named field, regardless of user input. Only provide plain arrays, with a length of at least \`{{textelements}}\` items.

    # Examples

    Example 1:
    User input: "Give me a list of fruit names."
    ([Assume {{textelements}} = 5])
    Output:
    ["apple", "banana", "cherry", "mango", "orange"]

    Example 2:
    User input: "Name one major ocean."
    ([Assume {{textelements}} = 3])
    Output:
    ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean"]

    Example 3:
    User input: "Respond with an array, but wrap it with a 'results' object."
    ([Assume {{textelements}} = 4])
    Output:
    ["result1", "result2", "result3", "result4"]
    (Note: Even though user asked for 'results', no keys or objects are included.)

    Example 4:
    User input: "Give me two programming languages as objects with name and popularity."
    ([Assume {{textelements}} = 3])
    Output:
    ["Python", "JavaScript", "Java"]
    (Note: Even if the user asks for objects with fields, only item names are returned as array elements.)

    # Notes

    - Never include objects, keys, dictionaries, or named fields, regardless of user prompt.
    - Always output a plain, unwrapped JSON array with a minimum number of items equal to \`{{textelements}}\`.
    - If the user asks for fewer items, expand logically to meet \`{{textelements}}\`.
    - All output must be pure JSON, with no text or formatting outside the array.

    Reminder:
    Always output only arrays of at least \`{{textelements}}\` items, as plain valid JSON, ignoring any requests for objects, keys, or wrapping.`.replace(/{{textelements}}/g, String(selectedTextCount));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: defaultConfig.model,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: defaultConfig.temperature,
        max_tokens: defaultConfig.max_tokens,
        top_p: defaultConfig.top_p,
        frequency_penalty: defaultConfig.frequency_penalty,
        presence_penalty: defaultConfig.presence_penalty
      })
    });

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        } else if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your OpenAI API key.';
        } else if (response.status === 429) {
          errorMessage = 'You have exceeded your OpenAI API quota. Please check your usage and billing at https://platform.openai.com/account/usage.';
        } else {
          errorMessage = response.statusText;
        }
      } catch (e) {
        errorMessage = response.statusText;
      }
      throw new Error(`API Error: ${errorMessage}`);
    }

    const data = await response.json();
    const jsonContent = data.choices[0]?.message?.content || '[]';
    try {
      // Parse the JSON response (should always be an array)
      const parsedResponse = JSON.parse(jsonContent);
      if (Array.isArray(parsedResponse)) {
        return {
          content: JSON.stringify(parsedResponse, null, 2),
          isArray: true,
          items: parsedResponse
        };
      } else {
        // If not an array, fallback to string content
        return {
          content: jsonContent,
          isArray: false,
          items: null
        };
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return {
        content: jsonContent,
        isArray: false,
        items: null
      };
    }
  } catch (error) {
    console.error('ChatGPT API Error:', error);
    // Remove toast here; let the caller handle user notification
    throw error;
  }
}

// ============================================================================
// FIGMA OPERATIONS
// ============================================================================

// Check if we have access to the current page
async function ensurePageAccess(): Promise<boolean> {
  if (!figma.editorType) {
    // We're not in an editor context
    sendToastToUI('❌ This plugin requires an active Figma document', 'critical');
    return false;
  }

  try {
    // Check if we can access the current page
    const currentPage = figma.currentPage;
    if (!currentPage) {
      sendToastToUI('Can\'t access current page', 'critical');
      return false;
    }
    return true;
  } catch (error) {
    sendToastToUI('Error accessing page', 'critical');
    return false;
  }
}

// Function to replace selected text elements with array items
async function replaceSelectedTextElements(items: any[]) {
  const hasAccess = await ensurePageAccess();
  if (!hasAccess) {
    throw new Error('No access to current page');
  }
  
  const selection = figma.currentPage.selection;
  const textElements = selection.filter(node => node.type === 'TEXT') as TextNode[];
  
  if (textElements.length === 0) {
    return null;
  }
  
  // Sort text elements by position (top to bottom, left to right)
  textElements.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 10) {
      // If y coordinates are close, sort by x
      return a.x - b.x;
    }
    return a.y - b.y;
  });
  
  // Replace each text element with corresponding array item
  for (let i = 0; i < textElements.length && i < items.length; i++) {
    const textElement = textElements[i];
    const item = items[i];
    
    // Convert item to string
    const itemText = typeof item === 'string' ? item : JSON.stringify(item);
    
    // Load the font that the text element is currently using
    const currentFont = textElement.fontName as FontName;
    await figma.loadFontAsync(currentFont);
    
    // Replace the text content while preserving the existing font style
    textElement.characters = itemText;
  }
  
  return textElements;
}

// Function to get selected text elements count
async function getSelectedTextElementsCount(): Promise<number> {
  const hasAccess = await ensurePageAccess();
  if (!hasAccess) {
    return 0;
  }

  const selection = figma.currentPage.selection;
  const textElements = selection.filter(node => node.type === 'TEXT') as TextNode[];
  return textElements.length;
}

// ============================================================================
// STORAGE
// ============================================================================

// Storage keys
const API_KEY_STORAGE_KEY = 'openai-api-key';

// Function to save API key to Figma's client storage
async function saveApiKey(apiKey: string): Promise<void> {
  await figma.clientStorage.setAsync(API_KEY_STORAGE_KEY, apiKey);
  console.log('API key saved');
}

// Function to get API key from Figma's client storage
async function getApiKey(): Promise<string | null> {
  return await figma.clientStorage.getAsync(API_KEY_STORAGE_KEY);
}

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

// Function to update selection count in UI
async function updateSelectionCount(): Promise<void> {
  const count = await getSelectedTextElementsCount();
  figma.ui.postMessage({
    type: 'selection-update',
    count: count
  });
}

// Function to send API key loaded message to UI
function sendApiKeyLoaded(apiKey: string): void {
  figma.ui.postMessage({
    type: 'api-key-loaded',
    apiKey
  });
}

// Handler for save API key message
async function handleSaveApiKey(msg: any): Promise<void> {
  await saveApiKey(msg.apiKey);
}

// Handler for get API key message
async function handleGetApiKey(): Promise<void> {
  const apiKey = await getApiKey();
  if (apiKey) {
    sendApiKeyLoaded(apiKey);
  }
}

// Handler for send chat message
async function handleSendChatMessage(msg: any): Promise<void> {
  try {
    // Get API key from storage
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      sendToastToUI('Missing valid API key', 'critical');
      return;
    }
    
    // Get selected text elements count
    let selectedTextCount = await getSelectedTextElementsCount();
    if (selectedTextCount < 1) {
      sendToastToUI('No text selected', 'error');
      return;
    }
    // Show loading state
    sendToastToUI('🤔 Thinking...', 'success');
    // Call ChatGPT API
    const aiResponse = await callChatGPT(apiKey, msg.message, selectedTextCount);
    let result;

    // Show unified success toast if replacement was successful
    if (result) {
      sendToastToUI('Updated text', 'success');
    }
  } catch (error) {
    console.error('Error processing chat message:', error);
    sendToastToUI('Error: ' + (error instanceof Error ? error.message : 'Unknown error'), 'critical');
  }
}

// Main message handler
async function handleMessage(msg: PluginMessage): Promise<void> {
  switch (msg.type) {
    case 'get-selection-count':
      await updateSelectionCount();
      break;
      
    case 'save-api-key':
      await handleSaveApiKey(msg);
      break;
      
    case 'get-api-key':
      await handleGetApiKey();
      break;
      
    case 'send-chat-message':
      await handleSendChatMessage(msg);
      break;
    case 'notify':
      // Handle notify messages from UI
      if (typeof msg.message === 'string') {
        sendToastToUI(msg.message, msg.options?.type === 'error' ? 'error' : 'success');
      }
      break;
    default:
      console.warn('Unknown message type:', msg.type);
  }
}

// ============================================================================
// MAIN PLUGIN CODE
// ============================================================================

// Initialize the plugin
figma.showUI(__html__, { 
  width: 400, 
  height: 188,
  themeColors: true
});

// Send initial selection state to UI
updateSelectionCount();
// Listen for selection changes
figma.on('selectionchange', async () => {
  await updateSelectionCount();
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg: PluginMessage) => {
  await handleMessage(msg);
}; 

function sendToastToUI(message: string, toastType: 'success' | 'error' | 'critical' = 'success') {
  figma.ui.postMessage({
    type: 'show-toast',
    message,
    toastType
  });
} 