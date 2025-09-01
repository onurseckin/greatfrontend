// Simple buffer to capture final rendered output from preview iframe
interface PreviewOutput {
  projectId: string;
  projectName: string;
  finalHTML: string;
  timestamp: string;
}

class PreviewBuffer {
  private outputs: Map<string, PreviewOutput> = new Map();

  // Store the final rendered HTML output
  setOutput(projectId: string, projectName: string, finalHTML: string): void {
    this.outputs.set(projectId, {
      projectId,
      projectName,
      finalHTML,
      timestamp: new Date().toISOString(),
    });

    // Also write to a file via API
    this.writeOutputToFile(projectId, projectName, finalHTML);
  }

  // Write output to actual file
  private async writeOutputToFile(
    projectId: string,
    projectName: string,
    finalHTML: string
  ): Promise<void> {
    try {
      const content = `/* Final rendered output for ${projectName} */
/* Project ID: ${projectId} */
/* Timestamp: ${new Date().toISOString()} */

${finalHTML}`;

      await fetch('http://localhost:3000/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `debug/final-output-${projectId}.html`,
          content: content,
        }),
      });
    } catch (error) {
      console.error('Failed to write output file:', error);
    }
  }

  // Get the final output for a project
  getOutput(projectId: string): PreviewOutput | null {
    return this.outputs.get(projectId) || null;
  }

  // Export all outputs as readable format
  exportAll(): string {
    const outputs = Array.from(this.outputs.values());
    return outputs
      .map(
        output =>
          `=== ${output.projectName} (${output.projectId}) - ${output.timestamp} ===\n${output.finalHTML}\n`
      )
      .join('\n');
  }
}

export const previewBuffer = new PreviewBuffer();
