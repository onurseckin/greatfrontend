# React + Vite + TypeScript + Bun

A modern React application setup with Vite, TypeScript support, Bun package manager, and integrated ESLint + Prettier configuration.

## Features

- ⚡ **Vite** - Fast build tool and dev server
- ⚛️ **React 19** - Latest React with concurrent features
- 🟦 **TypeScript** - Full TypeScript support with strict configuration
- 🐰 **Bun** - Fast JavaScript runtime and package manager
- 🎯 **ESLint** - Code linting with React and TypeScript rules
- 💅 **Prettier** - Code formatting (integrated with ESLint)
- 📦 **Latest versions** - All packages updated to their latest versions

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun run dev
```

The development server will start at `http://localhost:3000`

### Building

```bash
# Build for production (with TypeScript checking)
bun run build

# Build for production (JavaScript only, no TypeScript checking)
bun run build:js
```

### Linting

```bash
# Run ESLint (includes Prettier formatting)
bun run lint

# Auto-fix linting issues
bun run lint -- --fix
```

### Preview Production Build

```bash
# Preview the production build locally
bun run preview
```

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
├── App.tsx        # Main App component (TypeScript)
├── App.js         # Main App component (JavaScript)
├── main.tsx       # Entry point (TypeScript)
├── main.js        # Entry point (JavaScript)
└── index.css      # Global styles
```

## TypeScript vs JavaScript

This setup supports both TypeScript and JavaScript:

### Using TypeScript (default)

- Entry point: `src/main.tsx`
- App component: `src/App.tsx`
- Full type checking and IntelliSense support

### Using JavaScript

- Entry point: `src/main.js`
- App component: `src/App.js`
- No type checking, pure JavaScript

To switch between TypeScript and JavaScript:

1. Update the script import in `index.html`:
   - For TypeScript: `<script type="module" src="/src/main.tsx"></script>`
   - For JavaScript: `<script type="module" src="/src/main.js"></script>`

2. Update the build script in `package.json`:
   - For TypeScript: `"build": "tsc && vite build"`
   - For JavaScript: `"build": "vite build"`

## Configuration

### Modern ESM Configuration

The project uses modern ES modules (ESM) with the latest ESLint flat config format:

- **`eslint.config.mjs`** - Modern flat configuration with ESM syntax
- **`.prettierrc.json`** - Prettier configuration for editor integration
- **`vite.config.ts`** - Vite configuration with TypeScript

**ESLint config features:**

- Loose configuration with minimal restrictions
- React and TypeScript support
- Prettier integration for consistent formatting
- Single quotes, semicolons required, 2-space indentation
- Modern flat config format for better performance
- Dual Prettier config (ESLint + editor) for consistency

### TypeScript

TypeScript is configured for:

- React JSX transform (no React import needed)
- Strict type checking
- Path mapping with `@/*` alias
- Modern ESNext features
- Full ESM support

### Vite

Vite is configured for:

- React plugin support
- Development server on port 3000
- Source maps in production
- Optimized build output
- Latest Vite 7.1.3 with full ESM support

## Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production (with TypeScript)
- `bun run build:js` - Build for production (JavaScript only)
- `bun run lint` - Run ESLint
- `bun run preview` - Preview production build

## Technologies Used

- **React 19.1.1** - UI library
- **Vite 7.1.3** - Latest build tool with full ESM support
- **TypeScript 5.9.2** - Type checking
- **Bun** - Runtime and package manager
- **ESLint 9.34.0** - Linting with modern ESM config
- **Prettier 3.6.2** - Code formatting with ESM config

## Modern ESM Setup

This project uses modern ES modules throughout:

- **Configuration files**: All config files use `.mjs` extension with ESM syntax
- **Package.json**: `"type": "module"` for full ESM support
- **Latest packages**: All dependencies updated to their latest versions
- **Performance**: ESM provides better tree-shaking and performance

## Troubleshooting

### ESLint Diagnostics Issues

If you encounter "eslint request diagnostics failed" errors in AstroNvim:

1. The project uses modern `eslint.config.mjs` flat configuration
2. All config files are in ESM format for consistency
3. Run `bun run lint -- --fix` to auto-format your code

### Format-on-Save Issues

If your editor's format-on-save is changing quotes back to double quotes:

1. **Check your editor settings** - Ensure Prettier is using the project config
2. **Restart your editor** - Sometimes config changes need a restart
3. **Use the dual config** - Both `.prettierrc.json` and ESLint rules are now in sync
4. **Run manually** - Use `bun run lint -- --fix` to format with ESLint

### Build Issues

If you encounter build failures:

- All packages are at their latest versions
- Clear cache with `rm -rf node_modules/.vite` if needed
- Use `bun run build:js` for JavaScript-only builds
- Vite 7.1.3 provides excellent stability and performance

## Development Tips

1. **Hot Module Replacement**: Vite provides instant updates during development
2. **Type Safety**: Use TypeScript for better development experience
3. **Code Formatting**: ESLint will automatically format your code with Prettier rules
4. **Fast Refresh**: React components will hot reload without losing state

## License

This project is private and for personal use.
