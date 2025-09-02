import { Body, Controller, Post } from '@nestjs/common';
import { dirname, join } from 'node:path';

@Controller('files')
export class FilesController {
  @Post('read')
  async read(@Body() body: { path: string }): Promise<{ content?: string }> {
    try {
      const fullPath = join(process.cwd(), body.path);
      const file = Bun.file(fullPath);
      if (!(await file.exists())) {
        throw new Error('File not found');
      }
      const content = await file.text();
      return { content };
    } catch (e) {
      console.error('Failed to read file', e);
      throw e;
    }
  }

  @Post('write')
  async write(
    @Body() body: { path: string; content: string }
  ): Promise<{ success: true }> {
    try {
      const fullPath = join(process.cwd(), body.path);
      const dir = dirname(fullPath);
      await Bun.$`mkdir -p ${dir}`;
      await Bun.write(fullPath, body.content);
      return { success: true };
    } catch (e) {
      console.error('Failed to write file', e);
      throw e;
    }
  }
}
