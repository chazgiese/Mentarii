/// <reference types="@figma/plugin-typings" />

figma.showUI(__html__, { 
  width: 400, 
  height: 500,
  themeColors: true
});

// Function to update selection count in UI
function updateSelectionCount() {
  const count = figma.currentPage.selection.length;
  figma.ui.postMessage({
    type: 'selection-update',
    count: count
  });
}

// Listen for selection changes
figma.on('selectionchange', () => {
  updateSelectionCount();
});

// ChatGPT API configuration
interface ChatGPTConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

const defaultConfig: ChatGPTConfig = {
  model: "gpt-3.5-turbo",
  temperature: 0.7,
  max_tokens: 1000,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
};

// Current configuration (can be updated by UI)
let currentConfig: ChatGPTConfig = Object.assign({}, defaultConfig);

// Function to call ChatGPT API
async function callChatGPT(apiKey: string, message: string, selectedTextCount: number = 0, config: ChatGPTConfig = currentConfig): Promise<{content: string, isArray: boolean, items: any[] | null}> {
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
        model: config.model,
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
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        top_p: config.top_p,
        frequency_penalty: config.frequency_penalty,
        presence_penalty: config.presence_penalty,
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

// Function to create text element in Figma
async function createTextElement(text: string) {
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
  // Load the font first
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  
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
    
    // Replace the text content
    textElement.characters = itemText;
  }
  
  return textElements;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-selection-count') {
    updateSelectionCount();
  }
  
  if (msg.type === 'save-api-key') {
    // Save API key to Figma's client storage
    figma.clientStorage.setAsync('openai-api-key', msg.apiKey);
    console.log('API key saved');
  }
  
  if (msg.type === 'get-api-key') {
    // Retrieve API key from Figma's client storage
    figma.clientStorage.getAsync('openai-api-key').then((apiKey) => {
      if (apiKey) {
        figma.ui.postMessage({
          type: 'api-key-loaded',
          apiKey: apiKey
        });
      }
    });
  }
  
  if (msg.type === 'save-config') {
    // Save configuration to Figma's client storage
    currentConfig = Object.assign({}, defaultConfig, msg.config);
    figma.clientStorage.setAsync('chatgpt-config', JSON.stringify(currentConfig));
    console.log('Configuration saved:', currentConfig);
  }
  
  if (msg.type === 'get-config') {
    // Retrieve configuration from Figma's client storage
    figma.clientStorage.getAsync('chatgpt-config').then((configStr) => {
      if (configStr) {
        try {
          const savedConfig = JSON.parse(configStr);
          currentConfig = Object.assign({}, defaultConfig, savedConfig);
          figma.ui.postMessage({
            type: 'config-loaded',
            config: currentConfig
          });
        } catch (error) {
          console.error('Error parsing saved config:', error);
        }
      }
    });
  }
  
  if (msg.type === 'send-chat-message') {
    try {
      // Get API key from storage
      const apiKey = await figma.clientStorage.getAsync('openai-api-key');
      
      if (!apiKey) {
        figma.ui.postMessage({
          type: 'chat-response',
          success: false,
          message: 'Please set your OpenAI API key first'
        });
        figma.notify('❌ Please set your OpenAI API key first');
        return;
      }
      
      // Show loading state
      figma.ui.postMessage({
        type: 'chat-response',
        success: true,
        message: '🤔 Thinking...',
        loading: true
      });
      
      // Check if text elements are selected
      const selection = figma.currentPage.selection;
      const textElements = selection.filter(node => node.type === 'TEXT') as TextNode[];
      
      // Call ChatGPT API with selected text count
      const aiResponse = await callChatGPT(apiKey, msg.message, textElements.length);
      
      let result;
      if (textElements.length > 0 && aiResponse.isArray && aiResponse.items) {
        // Check if we have enough items
        if (aiResponse.items.length >= textElements.length) {
          // Replace selected text elements with array items
          result = await replaceSelectedTextElements(aiResponse.items);
          figma.notify(`✅ Replaced ${textElements.length} text elements`);
        } else {
          // Not enough items - create new text element with the response
          result = await createTextElement(aiResponse.content);
          figma.notify(`⚠️ Only ${aiResponse.items.length} items received for ${textElements.length} text elements. Created new text element instead.`);
        }
      } else {
        // Create new text element
        result = await createTextElement(aiResponse.content);
        figma.notify('✅ AI response added to canvas');
      }
      
      // Send success response to UI
      figma.ui.postMessage({
        type: 'chat-response',
        success: true,
        message: aiResponse,
        loading: false
      });
      
      figma.notify('✅ AI response added to canvas');
      
    } catch (error) {
      console.error('Error processing chat message:', error);
      
      figma.ui.postMessage({
        type: 'chat-response',
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
        loading: false
      });
      
      figma.notify('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}; 