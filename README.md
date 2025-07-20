# Figma Plugin with ChatGPT Integration

A Figma plugin that integrates with OpenAI's ChatGPT API to generate AI-powered text content directly in your Figma designs.

## Features

- ✅ **ChatGPT Integration** - Send messages to OpenAI's API and get AI responses
- ✅ **Secure API Key Storage** - API keys stored locally in Figma's client storage
- ✅ **Configurable AI Settings** - Adjust model, temperature, and token limits
- ✅ **Text Element Creation** - AI responses automatically added as text elements in Figma
- ✅ **Real-time UI Feedback** - Loading states and error handling
- ✅ **TypeScript Support** - Type safety with Figma plugin typings
- ✅ **Clean, Modern UI** - Simple interface with accordion sections for settings

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. Get your OpenAI API key:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

4. In Figma:
   - Go to Plugins → Development → "Import plugin from manifest..."
   - Select the `manifest.json` file
   - Run the plugin
   - Click "API Key" to expand the settings
   - Paste your OpenAI API key
   - The key is stored securely in Figma's client storage

## Usage

1. **Set up your API key** in the "API Key" section
2. **Configure AI settings** in the "AI Settings" section:
   - **Model**: Choose between GPT-3.5 Turbo, GPT-4, or GPT-4 Turbo
   - **Temperature**: Controls creativity (0 = focused, 2 = very creative)
   - **Max Tokens**: Maximum length of AI responses
3. **Type your message** in the chat input
4. **Click Send** or press Enter
5. **AI response** will be automatically added as a text element in your Figma canvas

## AI Configuration

### Models
- **GPT-3.5 Turbo**: Fast and cost-effective for most tasks
- **GPT-4**: More capable but slower and more expensive
- **GPT-4 Turbo**: Latest model with improved performance

### Temperature
- **0.0**: Very focused, consistent responses
- **0.7**: Balanced creativity (default)
- **1.0+**: More creative and varied responses

### Max Tokens
- **1000**: Good for most responses (default)
- **2000+**: For longer, more detailed responses
- **4000**: Maximum allowed

## Security

- **Local Storage**: API keys are stored securely in Figma's client storage
- **No Server Transmission**: API keys are never sent to any server except OpenAI's API
- **Client-side Only**: All processing happens in your Figma environment

## Development

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Watch for changes and rebuild automatically
- `npm run typecheck` - Type check without building

## File Structure

```
├── code.ts              # Plugin entry point with ChatGPT integration
├── ui.html              # Plugin UI with chat interface and settings
├── manifest.json        # Plugin manifest
├── dist/code.js         # Compiled JavaScript
└── package.json         # Dependencies and scripts
```

## API Integration Details

The plugin integrates with OpenAI's Chat Completions API:

- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Bearer token with your API key
- **System Prompt**: Configured for concise, creative responses
- **Error Handling**: Comprehensive error messages for API issues

## Troubleshooting

- **API Key Issues**: Make sure your key starts with `sk-` and is valid
- **Rate Limits**: OpenAI has rate limits; wait a moment and try again
- **Network Errors**: Check your internet connection
- **Plugin not loading**: Run `npm run build` and reimport the manifest

## Next Steps

This plugin provides a foundation for AI-powered design tools. You can extend it to:
- Generate design ideas and concepts
- Create content for UI mockups
- Automate copywriting tasks
- Build more sophisticated AI workflows
- Integrate with other AI services 