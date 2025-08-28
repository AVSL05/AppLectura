import { useEffect } from "react";
import { getCurrentWindow, type DragDropEvent } from "@tauri-apps/api/window";
import type { Event } from "@tauri-apps/api/event";

type DropHandler = (paths: string[]) => void;

export function useFileDrop(onDrop: DropHandler) {
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    (async () => {
      const win = getCurrentWindow();
      // v2: el callback recibe Event<DragDropEvent> y los datos van en .payload
      unlisten = await win.onDragDropEvent((e: Event<DragDropEvent>) => {
        if (e.payload.type === "drop") {
          const paths = e.payload.paths ?? [];
          if (paths.length) onDrop(paths);
        }
      });
    })();

    return () => {
      if (unlisten) unlisten();
    };
  }, [onDrop]);
}
