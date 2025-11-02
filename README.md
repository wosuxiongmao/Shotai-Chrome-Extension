# ShotAI Chrome Extension

Generate AI images on any webpage with multiple models. Get shareable links instantly.

## Features

- 🎨 **Multi-Model Generation**: Compare results from Midjourney V7, FLUX, Imagen4, and more
- ⚡ **Quick Access**: Right-click menu, keyboard shortcut (Ctrl+Shift+S), or floating button
- When used with [https://shotai.org](https://shotai.org/), you can quickly copy text into prmpt and generate photos of multiple models!

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` directory from this project

### Development Workflow

1. Make changes to source files in `src/`
2. Vite will automatically rebuild
3. Click the "Reload" button in Chrome extensions page to see changes

### Build for Production

```bash
# Build extension
npm run build

# Output will be in dist/ directory
# Zip the dist/ folder to upload to Chrome Web Store
cd dist
zip -r ../shotai-extension.zip .
```

## Project Structure

src/
├── background/          # Service Worker (background script)
├── content/             # Content Scripts (injected into pages)
├── popup/               # Extension icon popup
├── sidebar/             # Main generation interface
│   ├── api/            # API client
│   ├── components/     # Reusable components
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # State management (Zustand)
│   └── utils/          # Utility functions
└── styles/             # Global styles

## Architecture

- **Background**: Handles context menus, keyboard shortcuts, and messaging
- **Content Script**: Injects sidebar and floating button into web pages
- **Popup**: Quick access panel when clicking extension icon
- **Sidebar**: Main interface for generation, shown on pages
- **API Client**: Communicates with ShotAI backend at https://shotai.org

## Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=https://shotai.org
```

## Tech Stack

- React 18
- TypeScript
- Vite + CRXJS
- Tailwind CSS
- Zustand (state management)
- TanStack Query (data fetching)
- Lucide React (icons)

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/mv3/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin/)
- [Design Document](/docs/20251029-01-chrome-extension-design.md)

## License

MIT
