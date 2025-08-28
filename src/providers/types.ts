export type DocumentKind = 'pdf' | 'docx' | 'epub';

export interface LoadedDocument {
  kind: DocumentKind;
  content: string; // HTML a renderizar
  meta?: {
    title?: string;
    author?: string;
    pages?: number;
  };
}

export interface DocumentProvider {
  kind: DocumentKind;
  load(filePath: string): Promise<LoadedDocument>;
}
