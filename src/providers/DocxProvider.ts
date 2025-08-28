import type { DocumentProvider, LoadedDocument } from './types';
import { readFile } from '@tauri-apps/plugin-fs';
// 👇 build para navegador
import * as mammoth from 'mammoth/mammoth.browser';

export const DocxProvider: DocumentProvider = {
  kind: 'docx',
  async load(filePath: string): Promise<LoadedDocument> {
    // Leemos bytes locales con el plugin FS de Tauri
    const bytes = await readFile(filePath); // Uint8Array

    // Convertimos Uint8Array -> ArrayBuffer que pide mammoth
    const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

    // mammoth devuelve { value: string (HTML), messages: [...] }
    const result = await mammoth.convertToHtml({ arrayBuffer }, {
      styleMap: [
        // Opcional: mapeos de estilo (puedes ajustar más tarde)
        "p[style-name='Title'] => h1:fresh",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
      ]
    });

    const html = `
      <article style="max-width: 72ch; margin: 1.5rem auto; line-height: 1.7; font-size: 1.05rem;">
        ${result.value}
      </article>
    `;

    return {
      kind: 'docx',
      content: html,
      meta: { title: 'DOCX' }
    };
  }
};
