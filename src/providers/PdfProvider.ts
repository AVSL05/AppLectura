import type { DocumentProvider, LoadedDocument } from './types';

export const PdfProvider: DocumentProvider = {
  kind: 'pdf',
  async load(filePath: string): Promise<LoadedDocument> {
    return {
      kind: 'pdf',
      content: `<div><p>[PDF placeholder: ${filePath}]</p></div>`,
      meta: { title: 'PDF demo' }
    };
  }
};
