import { useEffect, useRef, useState } from 'react';
import type { Project } from '../types/project';
import { previewBuffer } from '../utils/previewBuffer';
import {
  cleanErrorMessage,
  getErrorType,
  hasPotentialSyntaxErrors,
} from './utils';

interface LiveRendererProps {
  project: Project;
}

export default function LiveRenderer({ project }: LiveRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [iframeKey, setIframeKey] = useState(0); // Force iframe refresh

  useEffect(() => {
    if (!iframeRef.current) return;

    // Start recovery process but keep existing errors visible
    setIsRecovering(true);

    // Force iframe refresh for significant code changes
    const codeLength = project.tsxContent.length + project.cssContent.length;
    if (codeLength < 50 || Math.random() < 0.1) {
      // Refresh on very short code or randomly
      setIframeKey(prev => prev + 1);
    }

    // Listen for messages from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.projectId === project.id) {
        if (event.data.type === 'FINAL_OUTPUT') {
          // Capture the final rendered HTML
          previewBuffer.setOutput(project.id, project.name, event.data.html);
          // Clear both error and recovery state on successful render
          setError(null);
          setIsRecovering(false);

          // Clear any error styling from iframe
          const iframe = iframeRef.current;
          if (iframe) {
            iframe.className = iframe.className.replace('has-error', '').trim();
          }
        } else if (event.data.type === 'PREVIEW_ERROR') {
          // Update error state with cleaned error from iframe
          const cleanedError = cleanErrorMessage(event.data.error);
          setError(cleanedError);
          setIsRecovering(false);

          // Immediately show error in iframe to prevent stale content
          const iframe = iframeRef.current;
          if (iframe) {
            const errorHtml = `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Runtime Error</title>
                <style>
                  body {
                    margin: 0;
                    padding: 20px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    background: #fef2f2;
                    color: #dc2626;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    text-align: center;
                  }
                  .error-message {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    border: 2px solid #fecaca;
                    max-width: 90%;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                  }
                  h2 {
                    margin: 0 0 15px 0;
                    color: #991b1b;
                    font-size: 18px;
                  }
                  pre {
                    margin: 10px 0 0 0;
                    font-size: 14px;
                    white-space: pre-wrap;
                    word-break: break-word;
                    text-align: left;
                    background: #f9f9f9;
                    padding: 10px;
                    border-radius: 4px;
                    border: 1px solid #e5e5e5;
                  }
                </style>
              </head>
              <body>
                <div class="error-message">
                  <h2>💥 Runtime Error</h2>
                  <pre>${cleanedError.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </div>
              </body>
              </html>
            `;
            iframe.srcdoc = errorHtml;
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    const renderPreview = async () => {
      try {
        // Clear error state when starting new render attempt
        setError(null);
        setIsRecovering(true);

        // Transform code using the backend API (direct to avoid proxy issues)
        const response = await fetch('/api/transform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: project.tsxContent }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Transform failed: ${response.statusText} - ${errorText}`
          );
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Transform failed');
        }

        // Create simple HTML that uses CDN React for reliability
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <style>
    body { margin: 0; padding: 10px; font-family: sans-serif; }
    ${project.cssContent}

    .preview-error {
      color: #dc2626;
      padding: 20px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 4px;
      margin: 10px;
    }
    .preview-error h3 {
      margin: 0 0 10px 0;
      color: #991b1b;
    }
    .preview-error pre {
      background: white;
      padding: 10px;
      border-radius: 4px;
      overflow: auto;
      margin: 0;
      border: 1px solid #f3f4f6;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    function renderError(title, message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'preview-error';
      errorDiv.innerHTML = '<h3>' + title + '</h3><pre>' + message + '</pre>';
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = '';
        root.appendChild(errorDiv);
      }

      // Send error to parent window for debugging
      try {
        window.parent.postMessage({
          type: 'PREVIEW_ERROR',
          projectId: '${project.id}',
          error: title + ': ' + message
        }, '*');
      } catch (e) {
        console.warn('Could not send error to parent:', e);
      }
    }

    function renderApp() {
      try {
        // Make React hooks available globally for the transformed code
        window.useState = React.useState;
        window.useEffect = React.useEffect;
        window.useRef = React.useRef;

        // Execute the transformed code
        ${result.transformedCode}

        // Render the component
        const rootElement = document.getElementById('root');
        if (rootElement && typeof App === 'function') {
          const root = ReactDOM.createRoot(rootElement);
          root.render(React.createElement(App));

          // Wait a bit for React to render, then capture the final output
          setTimeout(() => {
            const finalHTML = document.body.innerHTML;
            window.parent.postMessage({
              type: 'FINAL_OUTPUT',
              projectId: '${project.id}',
              html: finalHTML
            }, '*');
          }, 100);
        } else {
          renderError('Component Error', 'App component not found or not a function. Available: ' + Object.keys(window).filter(k => typeof window[k] === 'function').join(', '));
        }

      } catch (error) {
        renderError('Runtime Error', error.message + (error.stack ? '\\n\\nStack:\\n' + error.stack : ''));

        // Also capture the error state as final output
        setTimeout(() => {
          const finalHTML = document.body.innerHTML;
          window.parent.postMessage({
            type: 'FINAL_OUTPUT',
            projectId: '${project.id}',
            html: finalHTML
          }, '*');
        }, 100);
      }
    }

    // Wait for React to load, then render
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
      renderApp();
    } else {
      let attempts = 0;
      const checkReact = () => {
        attempts++;
        if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
          renderApp();
        } else if (attempts < 50) {
          setTimeout(checkReact, 100);
        } else {
          renderError('Setup Error', 'React failed to load after 5 seconds');
        }
      };
      checkReact();
    }

    // Global error handling
    window.addEventListener('error', function(e) {
      renderError('Global Error', e.message + '\\nFile: ' + (e.filename || 'unknown') + '\\nLine: ' + (e.lineno || 'unknown'));
    });

    window.addEventListener('unhandledrejection', function(e) {
      renderError('Promise Rejection', e.reason?.toString() || 'Unknown promise rejection');
    });
  </script>
</body>
</html>`;

        // Use srcdoc to render the iframe
        const iframe = iframeRef.current;
        if (iframe) {
          iframe.srcdoc = htmlContent;
        }

        // Clear recovery state after successful setup
        setTimeout(() => setIsRecovering(false), 500);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred';
        const cleanedError = cleanErrorMessage(errorMessage);

        // Set error state and clear iframe content immediately
        setError(cleanedError);
        setIsRecovering(false);

        // Clear iframe content to prevent showing stale successful content
        const iframe = iframeRef.current;
        if (iframe) {
          iframe.srcdoc = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Error</title>
              <style>
                body {
                  margin: 0;
                  padding: 20px;
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                  background: #fef2f2;
                  color: #dc2626;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  text-align: center;
                }
                .error-message {
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  border: 1px solid #fecaca;
                  max-width: 80%;
                }
                h2 {
                  margin: 0 0 10px 0;
                  color: #991b1b;
                }
                pre {
                  margin: 10px 0 0 0;
                  font-size: 14px;
                  white-space: pre-wrap;
                  word-break: break-word;
                }
              </style>
            </head>
            <body>
              <div class="error-message">
                <h2>🚫 Code Error</h2>
                <pre>${cleanedError.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
              </div>
            </body>
            </html>
          `;
        }

        console.error(
          '❌ Preview setup error for',
          project.name,
          ':',
          cleanedError
        );
      }
    };

    renderPreview();

    // Cleanup message listener
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [
    project.tsxContent,
    project.cssContent,
    project.id,
    project.name,
    project.type,
  ]);

  return (
    <div className="live-renderer">
      {/* Recovery indicator */}
      {isRecovering && (
        <div className="recovery-indicator">
          <div className="recovery-spinner"></div>
          <span>Rendering...</span>
        </div>
      )}

      {/* Always show iframe - errors are displayed within it */}
      <iframe
        key={iframeKey}
        ref={iframeRef}
        title="Live Preview"
        sandbox="allow-scripts"
        className={`preview-iframe ${error ? 'has-error' : ''} ${isRecovering ? 'recovering' : ''}`}
      />

      {/* Error summary with specific error details */}
      {error && (
        <div className="error-summary">
          <small>
            ⚠️ {getErrorType(error)}
            {hasPotentialSyntaxErrors(project.tsxContent) &&
              ' - Unmatched brackets/braces detected'}
            {isRecovering ? ' - Rendering...' : ' - Fix syntax to recover'}
          </small>
        </div>
      )}
    </div>
  );
}
