/// <reference types="@figma/plugin-typings" />

// ============================================================================
// TYPES
// ============================================================================

// Configuration for ChatGPT API requests
interface ChatGPTConfig {
  model: string; // Model name (e.g., gpt-3.5-turbo)
  temperature: number; // Sampling temperature
  max_tokens: number; // Max tokens in response
  top_p: number; // Nucleus sampling parameter
  frequency_penalty: number; // Frequency penalty
  presence_penalty: number; // Presence penalty
}

// Structure of a ChatGPT API response
interface ChatGPTResponse {
  content: string; // Raw JSON string content
  isArray: boolean; // True if response is a JSON array
  items: any[] | null; // Parsed array items, or null if not an array
}

// Message sent from plugin to UI
interface UIMessage {
  type: string;
  [key: string]: any;
}

// Message sent from UI to plugin
interface PluginMessage {
  type: string;
  [key: string]: any;
}

// ============================================================================
// CHATGPT API
// ============================================================================

// Default configuration for ChatGPT API requests
const defaultConfig: ChatGPTConfig = {
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
};

// =====================
// callChatGPT: Handles API call and technical errors. Throws errors to be handled by the caller. Does NOT show user-facing messages here.
// =====================
/**
 * Calls the OpenAI ChatGPT API with a strict prompt to always return a flat JSON array.
 * Throws errors for the caller to handle (no user-facing messages here).
 * @param apiKey - OpenAI API key
 * @param message - User's prompt
 * @param selectedTextCount - Number of text elements to generate (minimum array length)
 * @returns ChatGPTResponse with content, isArray, and items
 */
async function callChatGPT(
  apiKey: string, 
  message: string, 
  selectedTextCount: number = 0
): Promise<ChatGPTResponse> {
  try {
    // Compose a strict system prompt to force plain array output
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

    // Read and log the raw response as text
    const rawText = await response.text();
    console.log('Raw ChatGPT API response:', rawText);

    if (!response.ok) {
      let errorMessage = 'Unknown error';
      try {
        const errorData = JSON.parse(rawText);
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

    const data = JSON.parse(rawText);
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
      // Handles JSON parsing errors internally, returns fallback result. Not user-facing.
      console.error('Error parsing JSON response:', parseError);
      return {
        content: jsonContent,
        isArray: false,
        items: null
      };
    }
  } catch (error) {
    // Error is thrown to the caller for user-facing handling.
    throw error;
  }
}

// ============================================================================
// FIGMA OPERATIONS
// ============================================================================

/**
 * Checks if the plugin has access to the current Figma page.
 * Shows a toast and returns false if not accessible.
 * @returns {Promise<boolean>} True if access is available, false otherwise.
 */
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

/**
 * Replaces the text content of selected text elements with items from the provided array.
 * Sorts text elements visually (top-to-bottom, left-to-right) for consistent replacement.
 * Loads the required font for each text node before replacement.
 * @param items Array of strings (or objects, which are stringified) to insert into text elements.
 * @returns {Promise<TextNode[] | null>} The updated text nodes, or null if none selected.
 */
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

  // Helper: Get ancestor chain for a node (from node up to root)
  function getAncestors(node: BaseNode): BaseNode[] {
    const ancestors: BaseNode[] = [];
    let current: BaseNode | null = node.parent;
    while (current) {
      ancestors.push(current);
      // @ts-ignore: Figma types
      current = current.parent || null;
    }
    return ancestors;
  }

  // Step 1: Build ancestor chains for all selected text nodes
  const ancestorChains = textElements.map(getAncestors);

  // Step 2: Find the lowest common ancestor (LCA) that is an auto layout frame
  function findLowestCommonAutoLayoutAncestor(chains: BaseNode[][]): FrameNode | null {
    if (chains.length === 0) return null;
    // Reverse chains so root is first
    const reversed = chains.map(chain => [...chain].reverse());
    let lca: BaseNode | null = null;
    for (let i = 0; ; i++) {
      const nodesAtLevel = reversed.map(chain => chain[i]);
      if (nodesAtLevel.some(n => n === undefined)) break;
      const first = nodesAtLevel[0];
      if (nodesAtLevel.every(n => n === first)) {
        lca = first;
      } else {
        break;
      }
    }
    // Check if LCA is an auto layout frame
    if (lca && lca.type === 'FRAME' && 'layoutMode' in lca && (lca as FrameNode).layoutMode !== 'NONE') {
      return lca as FrameNode;
    }
    return null;
  }

  const lcaAutoLayout = findLowestCommonAutoLayoutAncestor(ancestorChains);
  let orderedTextElements: TextNode[] = [];

  if (lcaAutoLayout) {
    // Step 3: Recursively collect selected text nodes in visual order within the LCA
    const selectedSet = new Set(textElements);
    function collectTextNodesInOrder(node: BaseNode): TextNode[] {
      let result: TextNode[] = [];
      if (node.type === 'TEXT' && selectedSet.has(node as TextNode)) {
        result.push(node as TextNode);
      } else if ('children' in node && Array.isArray((node as any).children)) {
        for (const child of (node as any).children) {
          result = result.concat(collectTextNodesInOrder(child));
        }
      }
      return result;
    }
    orderedTextElements = collectTextNodesInOrder(lcaAutoLayout);
  } else {
    // Fallback: previous logic
    const parents = textElements.map(t => t.parent).filter(Boolean);
    const uniqueParents = Array.from(new Set(parents));
    if (
      uniqueParents.length === 1 &&
      uniqueParents[0] !== null &&
      'layoutMode' in uniqueParents[0] &&
      (uniqueParents[0] as FrameNode).layoutMode !== 'NONE'
    ) {
      const parent = uniqueParents[0] as FrameNode;
      const selectedSet = new Set(textElements);
      orderedTextElements = parent.children.filter(
        node => node.type === 'TEXT' && selectedSet.has(node as TextNode)
      ) as TextNode[];
    } else {
      orderedTextElements = [...textElements].sort((a, b) => {
        if (Math.abs(a.y - b.y) < 10) {
          return a.x - b.x;
        }
        return a.y - b.y;
      });
    }
  }

  // Replace each text element with corresponding array item
  for (let i = 0; i < orderedTextElements.length && i < items.length; i++) {
    const textElement = orderedTextElements[i];
    const item = items[i];
    const itemText = typeof item === 'string' ? item : JSON.stringify(item);
    const currentFont = textElement.fontName as FontName;
    await figma.loadFontAsync(currentFont);
    textElement.characters = itemText;
  }

  return orderedTextElements;
}

/**
 * Counts the number of selected text elements on the current page.
 * @returns {Promise<number>} The count of selected text nodes.
 */
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

// Storage key for the OpenAI API key in Figma client storage
const API_KEY_STORAGE_KEY = 'openai-api-key';

/**
 * Saves the OpenAI API key to Figma's client storage.
 * @param apiKey The API key to store.
 */
async function saveApiKey(apiKey: string): Promise<void> {
  await figma.clientStorage.setAsync(API_KEY_STORAGE_KEY, apiKey);
  console.log('API key saved');
}

/**
 * Retrieves the OpenAI API key from Figma's client storage.
 * @returns {Promise<string | null>} The stored API key, or null if not set.
 */
async function getApiKey(): Promise<string | null> {
  return await figma.clientStorage.getAsync(API_KEY_STORAGE_KEY);
}

/**
 * Deletes the OpenAI API key from Figma's client storage.
 */
async function deleteApiKey(): Promise<void> {
  await figma.clientStorage.setAsync(API_KEY_STORAGE_KEY, undefined);
  console.log('API key deleted');
}

// ============================================================================
// MESSAGE HANDLERS
// ============================================================================

/**
 * Updates the UI with the current count of selected text elements.
 */
async function updateSelectionCount(): Promise<void> {
  const count = await getSelectedTextElementsCount();
  figma.ui.postMessage({
    type: 'selection-update',
    count: count
  });
}

/**
 * Sends the loaded API key to the UI (for display or masking).
 * @param apiKey The API key to send.
 */
function sendApiKeyLoaded(apiKey: string): void {
  figma.ui.postMessage({
    type: 'api-key-loaded',
    apiKey
  });
}

/**
 * Handles the message to save a new API key from the UI.
 * @param msg The message containing the API key.
 */
async function handleSaveApiKey(msg: any): Promise<void> {
  if (!msg.apiKey) {
    await deleteApiKey();
    await updateSelectionCount(); // Update selection state in UI after API key deletion
  } else {
    await saveApiKey(msg.apiKey);
  }
}

/**
 * Handles the message to retrieve the API key for the UI.
 */
async function handleGetApiKey(): Promise<void> {
  const apiKey = await getApiKey();
  if (apiKey) {
    sendApiKeyLoaded(apiKey);
  }
}

// =====================
// handleSendChatMessage: Catches errors from callChatGPT and sets user-facing error messages for the UI.
// =====================
/**
 * Handles the main chat message event from the UI.
 * Gets the API key, validates selection, calls ChatGPT, and manages user notifications.
 * Catches errors and displays user-friendly messages.
 * @param msg The message from the UI containing the user prompt.
 */
async function handleSendChatMessage(msg: any): Promise<void> {
  try {
    // Get API key from storage
    const apiKey = await getApiKey();
    
    if (!apiKey) {
      sendToastToUI('Missing valid API key', 'critical');
      figma.ui.postMessage({ type: 'chat-complete' });
      return;
    }
    
    // Get selected text elements count
    let selectedTextCount = await getSelectedTextElementsCount();
    if (selectedTextCount < 1) {
      sendToastToUI('No text selected', 'error');
      figma.ui.postMessage({ type: 'chat-complete' });
      return;
    }
    // Call ChatGPT API
    const aiResponse = await callChatGPT(apiKey, msg.message, selectedTextCount);
    let result;

    // Replace text in Figma with the response
    if (aiResponse.isArray && Array.isArray(aiResponse.items)) {
      result = await replaceSelectedTextElements(aiResponse.items);
    } else if (typeof aiResponse.content === 'string') {
      // If not an array, fill all selected text nodes with the same string
      const selection = figma.currentPage.selection.filter(node => node.type === 'TEXT');
      result = await replaceSelectedTextElements(Array(selection.length).fill(aiResponse.content));
    }

    // Show unified success toast if replacement was successful
    if (result) {
      sendToastToUI('Updated text', 'success');
    }
    figma.ui.postMessage({ type: 'chat-complete' });
  } catch (error) {
    // User-facing error handling and messaging happens here.
    console.error('Error processing chat message:', error);
    let userMessage = "An unexpected error occurred. Please try again.";
    if (error instanceof Error) {
      if (error.message.includes("Incorrect API key provided")) {
        userMessage = "Your OpenAI API key is incorrect. Please check your key and try again. You can find your API key at https://platform.openai.com/account/api-keys.";
      } else if (error.message.includes("401")) {
        userMessage = "Unauthorized: Please check your OpenAI API key.";
      } else {
        userMessage = "OpenAI error: " + error.message;
      }
    }
    sendToastToUI(userMessage, 'critical');
    figma.ui.postMessage({ type: 'chat-complete' });
  }
}

/**
 * Main message handler for all plugin messages from the UI.
 * Routes messages to the appropriate handler based on type.
 * @param msg The PluginMessage from the UI.
 */
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
    case 'deselect-all':
      figma.currentPage.selection = [];
      await updateSelectionCount();
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

// Initialize the plugin UI with specified dimensions and theme support
figma.showUI(__html__, { 
  width: 400, 
  height: 188,
  themeColors: true
});

// Send initial selection state to UI on plugin load
updateSelectionCount();
// Listen for selection changes and update UI accordingly
figma.on('selectionchange', async () => {
  await updateSelectionCount();
});

// Listen for messages from the UI and route to handler
figma.ui.onmessage = async (msg: PluginMessage) => {
  await handleMessage(msg);
}; 

/**
 * Sends a toast notification to the UI.
 * @param message The message to display.
 * @param toastType The type of toast ('success', 'error', 'critical').
 */
function sendToastToUI(message: string, toastType: 'success' | 'error' | 'critical' = 'success') {
  figma.ui.postMessage({
    type: 'show-toast',
    message,
    toastType
  });
} 