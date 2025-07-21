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
    // Create system prompt based on whether text elements are selected
    let systemPrompt = "You are a helpful assistant that responds ONLY with valid JSON. Do not include any text, markdown, or formatting outside of the JSON. If the user asks for a list or array, respond with just the JSON array (e.g., [\"item1\", \"item2\"]). If they ask for text content, include it in a 'content' field. If they ask for multiple items, use an array. Always respond with clean, valid JSON only. Do not wrap arrays in objects with field names unless specifically requested.";
    
    if (selectedTextCount > 0) {
      systemPrompt += ` IMPORTANT: The user has ${selectedTextCount} text elements selected. If they ask for a list, array, or multiple items, you MUST respond with exactly ${selectedTextCount} items in a JSON array. Do not include more or fewer items.`;
    }
    
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
        presence_penalty: defaultConfig.presence_penalty,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const jsonContent = data.choices[0]?.message?.content || '{"content": "No response from AI"}';
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(jsonContent);
      
      // Extract the actual content to display on canvas
      if (parsedResponse.content) {
        // If it's a content field, return the content and whether it's an array
        const content = parsedResponse.content;
        return {
          content: content,
          isArray: Array.isArray(content),
          items: Array.isArray(content) ? content : null
        };
      } else if (Array.isArray(parsedResponse)) {
        // If it's directly an array, return it
        return {
          content: JSON.stringify(parsedResponse, null, 2),
          isArray: true,
          items: parsedResponse
        };
      } else if (typeof parsedResponse === 'string') {
        // If it's a string, return it directly
        return {
          content: parsedResponse,
          isArray: false,
          items: null
        };
      } else if (typeof parsedResponse === 'object') {
        // If it's an object, find the first array or string value
        const keys = Object.keys(parsedResponse);
        for (const key of keys) {
          const value = parsedResponse[key];
          if (Array.isArray(value)) {
            // Return just the array
            return {
              content: JSON.stringify(value, null, 2),
              isArray: true,
              items: value
            };
          } else if (typeof value === 'string') {
            // Return just the string value
            return {
              content: value,
              isArray: false,
              items: null
            };
          }
        }
        // If no array or string found, return the whole object
        return {
          content: JSON.stringify(parsedResponse, null, 2),
          isArray: false,
          items: null
        };
      } else {
        // For other types (number, boolean, etc.), return as string
        return {
          content: String(parsedResponse),
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
      }; // Fallback to raw content if JSON parsing fails
    }
  } catch (error) {
    console.error('ChatGPT API Error:', error);
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
    figma.notify('❌ This plugin requires an active Figma document');
    return false;
  }

  try {
    // Check if we can access the current page
    const currentPage = figma.currentPage;
    if (!currentPage) {
      figma.notify('❌ Unable to access current page');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error accessing page:', error);
    figma.notify('❌ Error accessing page');
    return false;
  }
}

// Function to create text element in Figma
async function createTextElement(text: string) {
  const hasAccess = await ensurePageAccess();
  if (!hasAccess) {
    throw new Error('No access to current page');
  }

  // Load the font first
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  
  const textNode = figma.createText();
  
  // Set text content
  textNode.characters = text;
  
  // Style the text
  textNode.fontSize = 16;
  textNode.fontName = { family: "Inter", style: "Regular" };
  textNode.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  
  // Position the text element
  const centerX = figma.viewport.center.x;
  const centerY = figma.viewport.center.y;
  textNode.x = centerX - (textNode.width / 2);
  textNode.y = centerY - (textNode.height / 2);
  
  // Select the new text element
  figma.currentPage.selection = [textNode];
  
  // Focus on the new element
  figma.viewport.scrollAndZoomIntoView([textNode]);
  
  return textNode;
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

// Function to send chat response to UI
function sendChatResponse(
  success: boolean, 
  message: string, 
  loading: boolean = false
): void {
  figma.ui.postMessage({
    type: 'chat-response',
    success,
    message,
    loading
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
      sendChatResponse(false, 'Please set your OpenAI API key first');
      figma.notify('❌ Please set your OpenAI API key first');
      return;
    }
    
    // Show loading state
    sendChatResponse(true, '🤔 Thinking...', true);
    
    // Get selected text elements count
    const selectedTextCount = await getSelectedTextElementsCount();
    
    // Call ChatGPT API
    const aiResponse = await callChatGPT(apiKey, msg.message, selectedTextCount);
    
    let result;
    if (selectedTextCount > 0) {
      if (aiResponse.isArray && aiResponse.items && aiResponse.items.length >= selectedTextCount) {
        // Replace selected text elements with array items
        result = await replaceSelectedTextElements(aiResponse.items);
        figma.notify(`✅ Replaced ${selectedTextCount} text elements`);
      } else if (!aiResponse.isArray && selectedTextCount === 1) {
        // Single text element selected, and response is a string: replace it
        result = await replaceSelectedTextElements([aiResponse.content]);
        figma.notify('✅ Replaced 1 text element');
      } else {
        // Not enough items or unexpected response - create new text element
        result = await createTextElement(aiResponse.content);
        figma.notify('✅ AI response added to canvas');
      }
    } else {
      // No text elements selected, create new text element
      result = await createTextElement(aiResponse.content);
      figma.notify('✅ AI response added to canvas');
    }
    
    // Send success response to UI
    sendChatResponse(true, aiResponse.content, false);
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    
    sendChatResponse(
      false, 
      error instanceof Error ? error.message : 'An error occurred', 
      false
    );
    
    figma.notify('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
  height: 500,
  themeColors: true
});

// Listen for selection changes
figma.on('selectionchange', async () => {
  await updateSelectionCount();
});

// Listen for messages from the UI
figma.ui.onmessage = async (msg: PluginMessage) => {
  await handleMessage(msg);
}; 