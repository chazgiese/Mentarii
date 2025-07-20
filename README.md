# Mentarii - AI Ghostwriter for Figma

An AI-powered ghostwriter plugin for Figma that generates text content using OpenAI's ChatGPT API. Named after "Commentarii de Bello Gallico" by Julius Caesar, the first notable work thought to be ghostwritten.

## The Story Behind the Name

**Mentarii** (Latin: "commentaries" or "memoirs") draws inspiration from Julius Caesar's "Commentarii de Bello Gallico" - one of the first significant works believed to be ghostwritten. Just as Caesar's commentaries were crafted to present his campaigns in the most favorable light, Mentarii helps you craft the perfect text content for your designs.

## Features

- ✅ **AI Ghostwriting** - Generate text content with ChatGPT integration
- ✅ **Smart Text Replacement** - Replace selected text elements with AI-generated content
- ✅ **Precise Item Matching** - AI generates exactly the number of items you need
- ✅ **Secure API Key Storage** - API keys stored locally in Figma's client storage
- ✅ **Configurable AI Settings** - Adjust model, temperature, and token limits
- ✅ **Position-Aware Replacement** - Maintains visual layout when replacing multiple elements
- ✅ **TypeScript Support** - Type safety with Figma plugin typings
- ✅ **Clean, Modern UI** - Simple interface with organized settings

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
   - Click "Settings" to expand the configuration
   - Paste your OpenAI API key
   - The key is stored securely in Figma's client storage

## Usage

### Basic Text Generation
1. **Set up your API key** in the Settings section
2. **Configure AI settings** (model, temperature, max tokens)
3. **Type your prompt** in the chat input
4. **Click Send** or press Enter
5. **AI response** will be added as a new text element in your Figma canvas

### Smart Text Replacement
1. **Select existing text elements** on your canvas
2. **Ask for a list or multiple items** (e.g., "a list of dates in descending order")
3. **AI generates exactly the right number** of items to match your selection
4. **Each selected text element** gets replaced with a corresponding item
5. **Order is preserved** based on the position of your selected elements

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

## Smart Features

### Intelligent Item Matching
- **Counts selected text elements** automatically
- **Instructs AI to generate exactly** the right number of items
- **Handles insufficient responses** gracefully with fallback behavior

### Position-Aware Replacement
- **Sorts elements by position** (top to bottom, left to right)
- **Maintains visual layout** when replacing multiple elements
- **Uses 10px tolerance** for grouping elements on the same line

### Response Format
- **JSON-only responses** from ChatGPT
- **Clean array output** without wrapper objects
- **Automatic content extraction** for display

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
├── code.ts                  # Main plugin code (bundled)
├── ui.html                  # Plugin UI with chat interface and settings
├── manifest.json            # Plugin manifest
├── dist/code.js             # Compiled JavaScript
└── package.json             # Dependencies and scripts
```

## API Integration Details

The plugin integrates with OpenAI's Chat Completions API:

- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Bearer token with your API key
- **System Prompt**: Configured for JSON responses and item count matching
- **Error Handling**: Comprehensive error messages for API issues

## Troubleshooting

- **API Key Issues**: Make sure your key starts with `sk-` and is valid
- **Rate Limits**: OpenAI has rate limits; wait a moment and try again
- **Network Errors**: Check your internet connection
- **Plugin not loading**: Run `npm run build` and reimport the manifest

## Use Cases

Mentarii is perfect for:
- **UI/UX Design**: Generate placeholder text, labels, and content
- **Content Creation**: Create headlines, descriptions, and copy
- **Data Visualization**: Generate lists, categories, and labels
- **Prototyping**: Quickly populate designs with realistic content
- **Localization**: Generate content in different languages

## Next Steps

This plugin provides a foundation for AI-powered design tools. You can extend it to:
- Generate design ideas and concepts
- Create content for UI mockups
- Automate copywriting tasks
- Build more sophisticated AI workflows
- Integrate with other AI services

---

*"I came, I saw, I designed" - Let Mentarii help you craft the perfect content for your designs.* 