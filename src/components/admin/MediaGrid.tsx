"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, Trash2, GripVertical, Play } from "lucide-react";
import type { Media } from "@prisma/client";
import { cn } from "@/lib/utils";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/youtube";

interface MediaGridProps {
  media: Media[];
  coverMediaId: string | null;
  projectId: string;
  onReorder: (orderedIds: string[]) => void;
  onSetCover: (mediaId: string) => void;
  onDelete: (mediaId: string) => void;
}

function SortableMediaItem({
  item,
  isCover,
  onSetCover,
  onDelete,
}: {
  item: Media;
  isCover: boolean;
  onSetCover: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2",
        isDragging ? "opacity-50 border-accent" : "border-transparent",
        isCover && "ring-2 ring-accent ring-offset-2"
      )}
    >
      {(() => {
        const isYouTube = item.type === "VIDEO" && item.mimeType === "video/youtube";
        const thumbSrc = isYouTube
          ? item.thumbnailUrl || getYouTubeThumbnail(extractYouTubeId(item.url) || "")
          : item.thumbnailUrl || item.url;
        return (
          <>
            <Image
              src={thumbSrc}
              alt={item.altText || item.fileName}
              fill
              className="object-cover"
              sizes="150px"
            />
            {isYouTube && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rounded-full bg-red-600 p-2">
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastar para reordenar"
        className="absolute top-1 left-1 rounded bg-black/50 p-1 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3" />
      </button>

      {/* Cover badge */}
      {isCover && (
        <span className="absolute top-1 right-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
          CAPA
        </span>
      )}

      {/* Actions overlay */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-black/40 md:bg-black/60 py-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={onSetCover}
          aria-label="Definir como capa"
          className={cn(
            "rounded p-1.5 transition-colors",
            isCover
              ? "text-accent"
              : "text-white/70 hover:text-accent"
          )}
          title="Definir como capa"
        >
          <Star className="h-3.5 w-3.5" fill={isCover ? "currentColor" : "none"} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Excluir mídia"
          className="rounded p-1.5 text-white/70 hover:text-red-400 transition-colors"
          title="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function MediaGrid({
  media,
  coverMediaId,
  projectId,
  onReorder,
  onSetCover,
  onDelete,
}: MediaGridProps) {
  const [items, setItems] = useState(media);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(media);
  }, [media]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const newItems = [...items];
    const [removed] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, removed);

    setItems(newItems);
    onReorder(newItems.map((i) => i.id));
  }

  useEffect(() => setMounted(true), []);

  if (items.length === 0) return null;

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {items.map((item) => {
          const isYouTube = item.type === "VIDEO" && item.mimeType === "video/youtube";
          const thumbSrc = isYouTube
            ? item.thumbnailUrl || getYouTubeThumbnail(extractYouTubeId(item.url) || "")
            : item.thumbnailUrl || item.url;
          return (
            <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={thumbSrc}
                alt={item.altText || item.fileName}
                fill
                className="object-cover"
                sizes="150px"
              />
              {isYouTube && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-red-600 p-2">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {items.map((item) => (
            <SortableMediaItem
              key={item.id}
              item={item}
              isCover={coverMediaId === item.id}
              onSetCover={() => onSetCover(item.id)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
