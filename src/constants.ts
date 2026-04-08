export const DEFAULT_JSON = {
  "name": "baytix-jtree",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Baytix JTree is a JSON Tree visualizer built for developers. Part of the Baytix ecosystem including Forms, QuickTools, MediScribe, and more.",
  "homepage": "https://baytix.net",
  "author": {
    "name": "Baytix"
  },
  "keywords": [
    "json",
    "json viewer",
    "json tree",
    "visualizer",
    "developer tools",
    "react",
    "vite",
    "baytix",
    "jtree"
  ],
  "baytixApps": [
    {
      "name": "Forms",
      "url": "https://forms.baytix.net",
      "description": "Free online form builder powered by AI. Create surveys and lead forms instantly with advanced AI analytics for deeper insights."
    },
    {
      "name": "QuickTools",
      "url": "https://quicktools.baytix.net",
      "description": "A web-based collection of fast utility tools designed to simplify everyday digital tasks such as conversions, formatting, and productivity workflows."
    },
    {
      "name": "MediScribe",
      "url": "https://mediscribe.baytix.net",
      "description": "A medical-focused tool designed to assist with transcription and structured documentation for healthcare-related workflows."
    },
    {
      "name": "Explore More Apps",
      "url": "https://apps.baytix.net",
      "description": "Discover more apps and tools built under the Baytix ecosystem."
    }
  ],
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "clsx": "^2.1.1",
    "dagre": "^0.8.5",
    "framer-motion": "^12.38.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "reactflow": "^11.11.4",
    "tailwind-merge": "^3.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "autoprefixer": "^10.4.21",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
};

export const SHORTCUTS = [
  { key: 'Ctrl + S', desc: 'Save/Download' },
  { key: 'Ctrl + /', desc: 'Search Node' },
  { key: 'Ctrl + +', desc: 'Zoom In' },
  { key: 'Ctrl + -', desc: 'Zoom Out' },
  { key: 'Ctrl + R', desc: 'Reset Layout' },
  { key: 'Ctrl + Shift + [', desc: 'Fold All' },
  { key: 'Ctrl + Shift + ]', desc: 'Unfold All' },
  { key: 'Ctrl + B', desc: 'Toggle Sidebar' },
];
