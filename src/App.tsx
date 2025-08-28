import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { getProvider } from "./providers/index";
import PdfViewer from "./components/PdfViewer.tsx";
import { useCallback } from "react";
import { useFileDrop } from "./hooks/useFileDrop";

// ⬇️ file picker nativo de Tauri v2
import { open } from "@tauri-apps/plugin-dialog";

// helper sencillo para sacar extensión
function extOf(path: string): string {
  const idx = path.lastIndexOf(".");
  return idx >= 0 ? path.slice(idx + 1).toLowerCase() : "";
}

// placeholder mínimo (para EPUB por ahora)
function placeholderHTML(path: string, kind: "pdf" | "docx" | "epub") {
  return `
    <article style="max-width: 72ch; margin: 2rem auto; line-height: 1.7; font-size: 1.05rem;">
      <h2 style="margin-bottom: 0.25rem;">${kind.toUpperCase()} cargado</h2>
      <p style="margin-top: 0; opacity: 0.8;">${path}</p>
      <hr style="margin: 1rem 0;" />
      <p>Vista de demostración. Próximo paso: conectar el motor real de ${kind}.</p>
      <ul>
        <li>PDF → pdf.js (render por página)</li>
        <li>DOCX → mammoth (HTML refluido)</li>
        <li>EPUB → epub.js (capítulos)</li>
      </ul>
    </article>
  `;
}

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  // estado de lectura
  const [readerHtml, setReaderHtml] = useState<string>("");
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [selectedKind, setSelectedKind] = useState<
    "" | "pdf" | "docx" | "epub"
  >("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  // ⬇️ NUEVO: manejar archivos soltados en la ventana de Tauri
  const handleDrop = useCallback(async (paths: string[]) => {
    const path = paths[0];
    if (!path) return;

    const ext = extOf(path);
    const kind: "pdf" | "docx" | "epub" =
      ext === "pdf" ? "pdf" : ext === "epub" ? "epub" : "docx";

    setSelectedPath(path);
    setSelectedKind(kind);

    if (kind === "pdf") {
      setReaderHtml(""); // PDF se renderiza con <PdfViewer />
      return;
    }

    if (kind === "docx") {
      const provider = getProvider("docx");
      const doc = await provider.load(path);
      setReaderHtml(doc.content);
      return;
    }

    // EPUB (placeholder por ahora)
    setReaderHtml(placeholderHTML(path, "epub"));
  }, []);

  // ⬇️ NUEVO: registra el hook de drag & drop (solo funciona en la ventana Tauri)
  useFileDrop(handleDrop);

  // abre un archivo y decide cómo mostrarlo
  async function handleOpenFile() {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Documentos", extensions: ["pdf", "docx", "epub"] }],
    });
    if (!selected || Array.isArray(selected)) return;

    const path = selected as string;
    const ext = extOf(path);
    const kind: "pdf" | "docx" | "epub" =
      ext === "pdf" ? "pdf" : ext === "epub" ? "epub" : "docx";

    setSelectedPath(path);
    setSelectedKind(kind);

    if (kind === "pdf") {
      // PDF se renderiza en <PdfViewer />
      setReaderHtml("");
      return;
    }

    if (kind === "docx") {
      // DOCX: usamos el provider real (mammoth) para convertir a HTML
      const provider = getProvider("docx");
      const doc = await provider.load(path);
      setReaderHtml(doc.content);
      return;
    }

    // EPUB (placeholder de momento)
    setReaderHtml(placeholderHTML(path, "epub"));
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>

      {/* sección de lectura */}
      <hr style={{ margin: "2rem 0" }} />
      <div className="row" style={{ gap: 12, alignItems: "center" }}>
        <button onClick={handleOpenFile}>Abrir archivo…</button>
        <span style={{ opacity: 0.7 }}>elige un PDF/DOCX/EPUB</span>
      </div>

      {/* contenedor de visualización */}
      <div
        style={{
          minHeight: "200px",
          marginTop: "1rem",
          background: "rgba(0,0,0,0.03)",
          borderRadius: 12,
          padding: "0.5rem",
        }}
      >
        {selectedKind === "pdf" && selectedPath ? (
          <PdfViewer filePath={selectedPath} />
        ) : readerHtml ? (
          <div dangerouslySetInnerHTML={{ __html: readerHtml }} />
        ) : (
          <p style={{ opacity: 0.7, textAlign: "center", padding: "1rem" }}>
            (Aún no has abierto ningún documento)
          </p>
        )}
      </div>
    </main>
  );
}

export default App;
