declare module "mammoth/mammoth.browser" {
  export type MammothHtmlResult = {
    value: string;            // HTML resultante
    messages: Array<{         // avisos/warnings de conversión
      type: string;
      message: string;
    }>;
  };

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer },
    options?: {
      styleMap?: string[];    // mapeo de estilos opcional
      includeDefaultStyleMap?: boolean;
    }
  ): Promise<MammothHtmlResult>;
}

