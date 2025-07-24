# Mentarii - AI Ghostwriter for Figma

An AI-powered ghostwriter plugin for Figma that generates text content using OpenAI's ChatGPT API. Named after "Commentarii de Bello Gallico" by Julius Caesar, the first notable work thought to be ghostwritten.

## The Story Behind the Name

**Mentarii** (Latin: "commentaries" or "memoirs") draws inspiration from Julius Caesar's "Commentarii de Bello Gallico" - one of the first significant works believed to be ghostwritten. Just as Caesar's commentaries were crafted to present his campaigns in the most favorable light, Mentarii helps you craft the perfect text content for your designs.

## Features

- ✅ **AI Ghostwriting** - Generate text content with ChatGPT integration
- ✅ **Smart Text Replacement** - Replace selected text elements with AI-generated content
- ✅ **Precise Array Matching** - AI always generates a plain JSON array with at least as many items as you need
- ✅ **Strict JSON Output** - All AI responses are plain, unwrapped JSON arrays (never objects, never wrapped, never with keys)
- ✅ **Secure API Key Storage** - API keys stored locally in Figma's client storage
- ✅ **Position-Aware Replacement** - Maintains visual layout when replacing multiple elements
- ✅ **TypeScript Support** - Type safety with Figma plugin typings
- ✅ **Clean, Modern UI** - Simple interface with organized settings

---

## How to Use This Plugin (for Figma Users)

1. **Install Mentarii** from the Figma Community.
2. **Open your Figma file** and run the plugin from the Plugins menu.
3. **Set your OpenAI API key**:
   - Click the settings icon in the plugin window.
   - Paste your OpenAI API key (starts with `sk-`). The key is securely stored and auto-saved.
4. **Select one or more text elements** on your canvas that you want to update.
5. **Type your prompt** (e.g., "Generate 5 creative headlines") in the chat box.
6. **Click Send** (or press Enter). The plugin will replace the content of each selected text element with AI-generated results.
7. **Review your updated text**—each selected element is updated in place, preserving your layout.

> **Tip:** For best results, ask for a list or multiple items in your prompt. The plugin always generates a flat array of results matching your selection.

---

## AI Configuration

> **Note:** The AI model, temperature, and token settings are currently fixed in the code and are not user-configurable from the UI. (Defaults: `gpt-3.5-turbo`, temperature 0.7, max tokens 1000.)

## Smart Features

### Strict Array Output & Item Matching
- **Counts selected text elements** automatically
- **Instructs AI to generate a plain JSON array** with at least the required number of items
- **Never returns objects, keys, or wrapped content**—only a plain array
- **Handles all user prompts by expanding the array as needed** to meet the minimum item count

### Position-Aware Replacement
- **Sorts elements by position** (top to bottom, left to right)
- **Maintains visual layout** when replacing multiple elements
- **Uses 10px tolerance** for grouping elements on the same line

### Response Format
- **Always a plain, unwrapped JSON array** (e.g., `["item1", "item2", ...]`)
- **No objects, keys, or wrapper fields**—guaranteed by the system prompt
- **Automatic parsing and replacement** for selected text elements

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
├── code.ts                  # Main plugin code (TypeScript)
├── ui.html                  # Plugin UI with chat interface and settings
├── manifest.json            # Plugin manifest
├── package.json             # Dependencies and scripts
└── dist/code.js             # Compiled JavaScript (created after build)
```

> **Note:** The `dist/code.js` file is generated after running the build script and may not be present until you build the project.

## API Integration Details

The plugin integrates with OpenAI's Chat Completions API:

- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Authentication**: Bearer token with your API key
- **System Prompt**: Strictly enforces plain JSON array output and minimum item count
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