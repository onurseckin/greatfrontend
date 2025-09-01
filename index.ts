// Type declarations for Node.js and Bun globals
declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
};
declare const Bun: {
  serve(options: Record<string, unknown>): { port: number; hostname: string };
};

import * as babel from '@babel/core';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { cleanANSIFromBackend } from './src/components/utils';

const PROJECTS_DIR = join(process.cwd(), 'src', 'projects');

// Ensure projects directory exists
if (!existsSync(PROJECTS_DIR)) {
  mkdirSync(PROJECTS_DIR, { recursive: true });
}

// Helper functions
const getNextProjectId = (customId?: number): number => {
  if (!existsSync(PROJECTS_DIR)) {
    return customId || 1;
  }

  const existingFolders = readdirSync(PROJECTS_DIR)
    .filter(folder => statSync(join(PROJECTS_DIR, folder)).isDirectory())
    .map(folder => {
      const match = folder.match(/^(\d+)-/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(id => id > 0)
    .sort((a, b) => a - b);

  if (customId) {
    if (existingFolders.includes(customId)) {
      throw new Error(`Project ID ${customId} is already taken`);
    }
    return customId;
  }

  let nextId = 1;
  for (const id of existingFolders) {
    if (nextId < id) break;
    nextId = id + 1;
  }

  return nextId;
};

const generateFolderName = (projectId: number, name: string): string => {
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `${projectId}-${slug}`;
};

const generateMetaFile = (
  projectId: number,
  name: string,
  type: 'tsx' | 'jsx'
): string => {
  const now = new Date().toISOString();

  return `export const meta = {
  projectId: ${projectId},
  name: '${name}',
  type: '${type}' as const,
  createdAt: '${now}',
  updatedAt: '${now}',
  description: '${name} component',
  tags: [],
};`;
};

const generateAppFile = (name: string, type: 'tsx' | 'jsx'): string => {
  const isTypeScript = type === 'tsx';

  return isTypeScript
    ? `import React from 'react';

export default function App(): React.ReactElement {
  return (
    <div>
      <h1>Hello, ${name}!</h1>
      <p>Start building your component here.</p>
      <button onClick={() => alert('Hello from ${name}!')}>
        Click me!
      </button>
    </div>
  );
}`
    : `import React from 'react';

export default function App() {
  return (
    <div>
      <h1>Hello, ${name}!</h1>
      <p>Start building your component here.</p>
      <button onClick={() => alert('Hello from ${name}!')}>
        Click me!
      </button>
    </div>
  );
}`;
};

const generateStylesFile = (name: string): string => {
  return `/* Styles for ${name} */
body {
  font-family: sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #0f172a;
  color: #e2e8f0;
  min-height: 100vh;
}

div {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #60a5fa;
}

p {
  color: #cbd5e1;
}

button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background: #2563eb;
}`;
};

Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    // Only handle API routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(req, url);
    }

    // Return 404 for non-API routes (Vite will handle frontend)
    return new Response('Not Found', { status: 404 });
  },
  development: {
    hmr: true,
  },
});

async function handleApiRequest(req: Request, url: URL): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Transform code for preview
  if (url.pathname === '/api/transform') {
    const { code } = await req.json();

    try {
      // Clean up imports and exports
      let cleanedCode = code
        .replace(/import\s+[^;]+;?\s*\n?/g, '') // Remove all imports
        .replace(/export\s+default\s+function\s+(\w+)/g, 'function $1') // Handle export default function
        .replace(/export\s+default\s+/g, 'const App = '); // Handle other exports

      // Use Babel to transform TypeScript and JSX properly
      const babelResult = babel.transform(cleanedCode, {
        presets: [
          ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
          '@babel/preset-react',
        ],
        plugins: [],
      });

      const transformedCode = babelResult.code || cleanedCode;

      return new Response(
        JSON.stringify({
          transformedCode,
          success: true,
        }),
        { headers }
      );
    } catch (error) {
      // Clean ANSI escape codes from error message using utility function

      const errorMessage =
        error instanceof Error ? error.message : 'Transform failed';
      const cleanedError = cleanANSIFromBackend(errorMessage);

      return new Response(
        JSON.stringify({
          error: cleanedError,
          success: false,
        }),
        {
          status: 500,
          headers,
        }
      );
    }
  }

  try {
    // File operations
    if (url.pathname === '/api/files/read') {
      const { path: filePath } = await req.json();
      const fullPath = join(process.cwd(), filePath);

      if (!existsSync(fullPath)) {
        return new Response(JSON.stringify({ error: 'File not found' }), {
          status: 404,
          headers,
        });
      }

      const content = readFileSync(fullPath, 'utf-8');
      return new Response(JSON.stringify({ content }), { headers });
    }

    if (url.pathname === '/api/files/write') {
      const { path: filePath, content } = await req.json();
      const fullPath = join(process.cwd(), filePath);

      // Ensure directory exists
      const dir = dirname(fullPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(fullPath, content, 'utf-8');
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // Project operations
    if (url.pathname === '/api/projects/list') {
      const projects = [];

      if (existsSync(PROJECTS_DIR)) {
        const folders = readdirSync(PROJECTS_DIR).filter(folder =>
          statSync(join(PROJECTS_DIR, folder)).isDirectory()
        );

        for (const folder of folders) {
          const match = folder.match(/^(\d+)-(.+)$/);
          if (match) {
            const projectId = parseInt(match[1]);
            const slug = match[2];

            // Try to read meta.ts to get the real name
            let name = slug
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            let type: 'tsx' | 'jsx' = 'tsx';

            const metaPath = join(PROJECTS_DIR, folder, 'meta.ts');
            if (existsSync(metaPath)) {
              try {
                const metaContent = readFileSync(metaPath, 'utf-8');
                const nameMatch = metaContent.match(/name: '([^']+)'/);
                const typeMatch = metaContent.match(/type: '(tsx|jsx)'/);

                if (nameMatch) name = nameMatch[1];
                if (typeMatch) type = typeMatch[1] as 'tsx' | 'jsx';
              } catch (e) {
                console.warn(`Failed to parse meta.ts for ${folder}:`, e);
              }
            }

            projects.push({
              id: folder,
              projectId,
              name,
              type,
              folderPath: `src/projects/${folder}`,
            });
          }
        }
      }

      return new Response(JSON.stringify(projects), { headers });
    }

    if (url.pathname === '/api/projects/create') {
      const { name, type, customId } = await req.json();

      const projectId = getNextProjectId(customId);
      const folderName = generateFolderName(projectId, name);
      const projectDir = join(PROJECTS_DIR, folderName);

      // Create project directory
      mkdirSync(projectDir, { recursive: true });

      // Create files
      writeFileSync(
        join(projectDir, 'meta.ts'),
        generateMetaFile(projectId, name, type)
      );
      writeFileSync(
        join(projectDir, `App.${type}`),
        generateAppFile(name, type)
      );
      writeFileSync(join(projectDir, 'styles.css'), generateStylesFile(name));

      return new Response(
        JSON.stringify({
          id: folderName,
          projectId,
          name,
          type,
          folderPath: `src/projects/${folderName}`,
        }),
        { headers }
      );
    }

    if (url.pathname === '/api/projects/delete') {
      const { projectId } = await req.json();
      const projectPath = join(PROJECTS_DIR, projectId);
      const debugFilePath = join(
        process.cwd(),
        'debug',
        `final-output-${projectId}.html`
      );

      // Delete project folder
      if (existsSync(projectPath)) {
        rmSync(projectPath, { recursive: true, force: true });
      }

      // Delete debug output file if it exists
      if (existsSync(debugFilePath)) {
        rmSync(debugFilePath);
      }

      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers,
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers,
      }
    );
  }
}
