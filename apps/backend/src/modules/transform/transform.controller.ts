import * as babel from '@babel/core';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('transform')
export class TransformController {
  @Post()
  async transform(@Body() body: { code: string }) {
    try {
      let cleanedCode = body.code
        .replace(/import\s+[^;]+;?\s*\n?/g, '')
        .replace(/export\s+default\s+function\s+(\w+)/g, 'function $1')
        .replace(/export\s+default\s+/g, 'const App = ');

      const babelResult = babel.transform(cleanedCode, {
        presets: [
          ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
          '@babel/preset-react',
        ],
        plugins: [],
      });

      const transformedCode = babelResult?.code || cleanedCode;
      return { transformedCode, success: true };
    } catch (e) {
      console.error('Transform failed', e);
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Transform failed',
      };
    }
  }
}
