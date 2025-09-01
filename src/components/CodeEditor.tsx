import Editor, { type BeforeMount } from '@monaco-editor/react';
import { useRef } from 'react';

interface CodeEditorProps {
  value: string;
  language: 'typescript' | 'javascript' | 'css';
  onChange: (value: string) => void;
  title: string;
}

export default function CodeEditor({
  value,
  language,
  onChange,
  title,
}: CodeEditorProps) {
  const editorRef = useRef<unknown>(null);

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const getLanguageForMonaco = () => {
    if (language === 'typescript') return 'typescript';
    if (language === 'javascript') return 'typescript'; // Use typescript for JSX support
    return 'css';
  };

  const handleEditorWillMount: BeforeMount = monaco => {
    // Simple configuration - let Monaco auto-discover @types/react
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      allowJs: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      skipLibCheck: true,
      strict: false,
      lib: ['es2020', 'dom'],
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      jsx: monaco.languages.typescript.JsxEmit.React,
      jsxFactory: 'React.createElement',
      allowJs: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      lib: ['es2020', 'dom'],
    });

    // Minimal diagnostics - just syntax checking
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
  };

  return (
    <div className="code-editor">
      <div className="editor-header">
        <h3>{title}</h3>
        <span className="language-badge">{language.toUpperCase()}</span>
      </div>
      <div className="editor-container">
        <Editor
          height="100%"
          language={getLanguageForMonaco()}
          value={value}
          onChange={handleEditorChange}
          beforeMount={handleEditorWillMount}
          onMount={(editor, monaco) => {
            editorRef.current = editor;

            // Force the model to use TypeScript language for TSX/JSX files
            if (language === 'typescript' || language === 'javascript') {
              const model = editor.getModel();
              if (model) {
                monaco.editor.setModelLanguage(model, 'typescript');
              }
            }
          }}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
          }}
        />
      </div>
    </div>
  );
}
