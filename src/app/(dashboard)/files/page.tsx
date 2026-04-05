"use client";

import * as React from "react";
import { FileIcon } from "lucide-react";
export default function FilesPage() {
  const [files, setFiles] = React.useState<{ id: string; name: string; url: string }[]>([]);

  React.useEffect(() => {
    void fetch("/api/files")
      .then((r) => r.json())
      .then((d) => setFiles(d.files ?? []));
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {files.map((f) => (
        <a
          key={f.id}
          href={f.url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center rounded-md border border-heritage-gold/20 p-4 text-center text-sm hover:bg-white/5"
        >
          <FileIcon className="mb-2 h-8 w-8 text-heritage-gold" />
          {f.name}
        </a>
      ))}
    </div>
  );
}
