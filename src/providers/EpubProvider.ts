import type { DocumentProvider, LoadedDocument } from './types';

export const EpubProvider: DocumentProvider = {
  kind: 'epub',
  async load(filePath: string): Promise<LoadedDocument> {
    return {
      kind: 'epub',
      content: `<div><p>[EPUB placeholder: ${filePath}]</p></div>`,
      meta: { title: 'EPUB demo' }
    };
  }
};
