import { open } from "@tauri-apps/plugin-dialog";
import { getProvider } from "../providers/index";

export default function OpenFileButton({
  onLoaded,
}: {
  onLoaded: (html: string) => void;
}) {
  function extOf(path: string): string {
    const idx = path.lastIndexOf(".");
    return idx >= 0 ? path.slice(idx + 1).toLowerCase() : "";
  }

  const handleOpen = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Documentos", extensions: ["pdf", "docx", "epub"] }],
    });
    if (!selected || Array.isArray(selected)) return;

    const path = selected as string;
    const ext = extOf(path);
    const kind = ext === "pdf" ? "pdf" : ext === "epub" ? "epub" : "docx";
    const provider = getProvider(kind as any);

    const doc = await provider.load(path);
    onLoaded(doc.content);
  };

  return (
    <button
      onClick={handleOpen}
      className="px-3 py-2 rounded-lg border text-sm hover:bg-black/5 dark:hover:bg-white/10"
    >
      Abrir archivo…
    </button>
  );
}
