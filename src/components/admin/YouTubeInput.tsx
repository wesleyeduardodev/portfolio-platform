"use client";

import { useState } from "react";
import { Youtube, Plus, Loader2 } from "lucide-react";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

interface YouTubeInputProps {
  projectId: string;
  onAdded: () => void;
}

export function YouTubeInput({ projectId, onAdded }: YouTubeInputProps) {
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    setError("");
    const videoId = extractYouTubeId(url);

    if (!videoId) {
      setError("Link do YouTube inválido");
      return;
    }

    setAdding(true);

    const res = await fetch(`/api/projects/${projectId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url.trim(),
        fileName: `youtube-${videoId}`,
        fileSize: 0,
        mimeType: "video/youtube",
        width: 1920,
        height: 1080,
        type: "VIDEO",
        thumbnailUrl: getYouTubeThumbnail(videoId),
      }),
    });

    if (res.ok) {
      setUrl("");
      onAdded();
    } else {
      setError("Erro ao adicionar vídeo");
    }
    setAdding(false);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          placeholder="Cole o link do YouTube aqui"
          className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
      </div>
      <button
        onClick={handleAdd}
        disabled={adding || !url.trim()}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition shrink-0"
      >
        {adding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Adicionar vídeo
      </button>
      {error && <p className="text-xs text-red-500 sm:hidden">{error}</p>}
      {error && (
        <p className="text-xs text-red-500 hidden sm:block absolute mt-12">
          {error}
        </p>
      )}
    </div>
  );
}
