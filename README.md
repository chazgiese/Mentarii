# Figma Plugin Boilerplate

A simple, clean Figma plugin boilerplate using vanilla JavaScript and TypeScript.

## Features

- ✅ **Vanilla JavaScript** - No complex build tools or frameworks
- ✅ **TypeScript support** - Type safety with Figma plugin typings
- ✅ **Clean UI** - Simple, modern interface
- ✅ **Working examples** - Create rectangles, circles, and text
- ✅ **Easy to extend** - Simple structure to build upon

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. In Figma:
   - Go to Plugins → Development → "Import plugin from manifest..."
   - Select the `manifest.json` file
   - Run the plugin

## Development

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Watch for changes and rebuild automatically
- `npm run typecheck` - Type check without building

## File Structure

```
├── code.ts              # Plugin entry point (Figma backend)
├── ui.html              # Plugin UI (HTML + CSS + JS)
├── manifest.json        # Plugin manifest
├── dist/code.js         # Compiled JavaScript
└── package.json         # Dependencies and scripts
```

## How it Works

1. **code.ts** - Contains the Figma plugin logic that runs in the Figma environment
2. **ui.html** - The user interface that appears in the plugin window
3. **manifest.json** - Tells Figma how to load and run the plugin

## Adding Features

### New UI Elements
Add buttons or inputs to `ui.html` and handle them in the `<script>` section.

### New Plugin Actions
Add new message handlers in `code.ts` to perform actions in Figma.

### Styling
Modify the CSS in `ui.html` to customize the appearance.

## Example Usage

The plugin currently includes three example actions:
- **Create Rectangle** - Adds a 100x100 rectangle to the canvas
- **Create Circle** - Adds a 100x100 circle to the canvas  
- **Create Text** - Adds text saying "Hello from Figma Plugin!"

## Troubleshooting

- **Plugin not loading**: Make sure you've run `npm run build` and imported the manifest
- **TypeScript errors**: Run `npm run typecheck` to see detailed error messages
- **UI not showing**: Check that `ui.html` exists and is referenced correctly in `manifest.json`

## Next Steps

This boilerplate provides a solid foundation for building Figma plugins. You can:
- Add more UI components
- Implement complex Figma operations
- Add state management
- Integrate with external APIs
- Create more sophisticated designs 