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

figma.ui.onmessage = (msg) => {
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
  
  if (msg.type === 'send-chat-message') {
    // Handle AI chat message
    console.log('Chat message received:', msg.message);
    
    // TODO: Add AI integration here
    // For now, just acknowledge the message
    figma.ui.postMessage({
      type: 'chat-response',
      success: true,
      message: `Received: ${msg.message}`
    });
    
    figma.notify(`AI Chat: ${msg.message}`);
  }
}; 