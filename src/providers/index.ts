import type { DocumentKind, DocumentProvider } from './types';
import { PdfProvider } from './PdfProvider';
import { DocxProvider } from './DocxProvider';
import { EpubProvider } from './EpubProvider';

const providers: Record<DocumentKind, DocumentProvider> = {
  pdf: PdfProvider,
  docx: DocxProvider,
  epub: EpubProvider,
};

export function getProvider(kind: DocumentKind): DocumentProvider {
  return providers[kind];
}

export * from './types';
