import { useEffect, useRef, useState } from "react";
import { readFile } from "@tauri-apps/plugin-fs";

// pdf.js (build ESM)
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
GlobalWorkerOptions.workerSrc = workerSrc;

type Props = { filePath: string };

export default function PdfViewer({ filePath }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function renderPdf() {
      setError("");
      const container = containerRef.current;
      if (!container) return;

      container.innerHTML = "";

      try {
        // Lee bytes locales con el plugin FS de Tauri
        const bytes = await readFile(filePath); // Uint8Array

        const loadingTask = getDocument({ data: bytes });
        const pdf: PDFDocumentProxy = await loadingTask.promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) break;

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.25 });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = "block";
          canvas.style.margin = "0 auto 16px auto";
          canvas.style.boxShadow = "0 1px 6px rgba(0,0,0,.1)";

          container.appendChild(canvas);

          // 👇 pdf.js v5: incluye 'canvas' además de 'canvasContext' y 'viewport'
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        }
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "No se pudo abrir el PDF.");
      }
    }

    renderPdf();
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  return (
    <div style={{ padding: 12 }}>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <div ref={containerRef} />
    </div>
  );
}
