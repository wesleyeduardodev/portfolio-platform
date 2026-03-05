"use client";

import { useEffect, useState, useCallback } from "react";
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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  ExternalLink,
  Pencil,
  X,
  GripVertical,
} from "lucide-react";
import type { Contact } from "@prisma/client";

const typeOptions = [
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
  { value: "PHONE", label: "Telefone", icon: Phone },
  { value: "EMAIL", label: "E-mail", icon: Mail },
  { value: "INSTAGRAM", label: "Instagram", icon: Instagram },
  { value: "OTHER", label: "Outro", icon: ExternalLink },
] as const;

function phoneMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function autoUrl(type: string, value: string): string {
  const digits = onlyDigits(value);
  switch (type) {
    case "WHATSAPP":
      return digits ? `https://wa.me/55${digits}` : "";
    case "PHONE":
      return digits ? `tel:+55${digits}` : "";
    case "EMAIL":
      return value ? `mailto:${value}` : "";
    case "INSTAGRAM": {
      const handle = value.replace(/^@/, "").trim();
      return handle ? `https://instagram.com/${handle}` : "";
    }
    default:
      return "";
  }
}

function defaultLabel(type: string): string {
  const opt = typeOptions.find((t) => t.value === type);
  return opt?.label || "";
}

function valuePlaceholder(type: string): string {
  switch (type) {
    case "WHATSAPP":
    case "PHONE":
      return "(11) 99999-9999";
    case "EMAIL":
      return "contato@email.com";
    case "INSTAGRAM":
      return "@usuario";
    default:
      return "Valor";
  }
}

function isPhoneType(type: string): boolean {
  return type === "WHATSAPP" || type === "PHONE";
}

function displayValue(contact: Contact): string {
  if (isPhoneType(contact.type)) return phoneMask(contact.value);
  return contact.value;
}

// Sortable contact item
function SortableContactItem({
  contact,
  isEditing,
  saving,
  editType,
  editLabel,
  editValue,
  editUrl,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onToggleVisibility,
  onDelete,
  onEditTypeChange,
  onEditLabelChange,
  onEditValueChange,
  onEditUrlChange,
}: {
  contact: Contact;
  isEditing: boolean;
  saving: string | null;
  editType: string;
  editLabel: string;
  editValue: string;
  editUrl: string;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveEdit: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onEditTypeChange: (type: string) => void;
  onEditLabelChange: (label: string) => void;
  onEditValueChange: (value: string) => void;
  onEditUrlChange: (url: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: contact.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeOpt = typeOptions.find((t) => t.value === contact.type);
  const Icon = typeOpt?.icon || ExternalLink;

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white rounded-xl p-4 border border-primary/30 shadow-sm space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
            <select
              value={editType}
              onChange={(e) => onEditTypeChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {typeOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
            <input
              value={editLabel}
              onChange={(e) => onEditLabelChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Valor</label>
            <input
              value={editValue}
              onChange={(e) => onEditValueChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder={valuePlaceholder(editType)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              URL <span className="text-gray-300">(auto-gerada)</span>
            </label>
            <input
              value={editUrl}
              onChange={(e) => onEditUrlChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary bg-gray-50 text-gray-500"
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSaveEdit}
            disabled={saving === contact.id || !editLabel || !editValue}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {saving === contact.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Salvar
          </button>
          <button
            onClick={onCancelEditing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            <X className="h-3.5 w-3.5" />
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm ${
        isDragging ? "opacity-50 border-accent" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="rounded p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors shrink-0"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Icon className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{contact.label}</p>
        <p className="text-xs text-gray-500 truncate">{displayValue(contact)}</p>
      </div>
      <button
        onClick={onStartEditing}
        className="rounded-lg p-2 text-gray-300 hover:bg-blue-50 hover:text-blue-500 transition-colors"
        title="Editar"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onToggleVisibility}
        className={`text-xs px-2 py-1 rounded ${
          contact.isVisible
            ? "bg-green-50 text-green-600"
            : "bg-gray-50 text-gray-400"
        }`}
      >
        {saving === contact.id ? "..." : contact.isVisible ? "Visível" : "Oculto"}
      </button>
      <button
        onClick={onDelete}
        className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const [newType, setNewType] = useState<string>("WHATSAPP");
  const [newLabel, setNewLabel] = useState("WhatsApp");
  const [newValue, setNewValue] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then(setContacts)
      .finally(() => setLoading(false));
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = contacts.findIndex((c) => c.id === active.id);
    const newIndex = contacts.findIndex((c) => c.id === over.id);

    const newContacts = [...contacts];
    const [removed] = newContacts.splice(oldIndex, 1);
    newContacts.splice(newIndex, 0, removed);

    setContacts(newContacts);

    const items = newContacts.map((c, i) => ({ id: c.id, sortOrder: i }));
    await fetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }

  const updateNewValue = useCallback(
    (raw: string) => {
      const val = isPhoneType(newType) ? phoneMask(raw) : raw;
      setNewValue(val);
      setNewUrl(autoUrl(newType, val));
    },
    [newType]
  );

  const updateEditValue = useCallback(
    (raw: string) => {
      const val = isPhoneType(editType) ? phoneMask(raw) : raw;
      setEditValue(val);
      setEditUrl(autoUrl(editType, val));
    },
    [editType]
  );

  function handleNewTypeChange(type: string) {
    setNewType(type);
    setNewLabel(defaultLabel(type));
    setNewValue("");
    setNewUrl("");
  }

  function handleEditTypeChange(type: string) {
    setEditType(type);
    setEditLabel(defaultLabel(type));
    setEditValue("");
    setEditUrl("");
  }

  function startEditing(contact: Contact) {
    setEditingId(contact.id);
    setEditType(contact.type);
    setEditLabel(contact.label);
    const val = isPhoneType(contact.type) ? phoneMask(contact.value) : contact.value;
    setEditValue(val);
    setEditUrl(contact.url || "");
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function saveCleanValue(type: string, displayVal: string): string {
    return isPhoneType(type) ? onlyDigits(displayVal) : displayVal;
  }

  async function saveEdit(contact: Contact) {
    if (!editLabel || !editValue) return;
    setSaving(contact.id);

    const cleanValue = saveCleanValue(editType, editValue);

    const res = await fetch("/api/contacts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: contact.id,
        type: editType,
        label: editLabel,
        value: cleanValue,
        url: editUrl || "",
        isVisible: contact.isVisible,
      }),
    });

    if (res.ok) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contact.id
            ? { ...c, type: editType as Contact["type"], label: editLabel, value: cleanValue, url: editUrl || null }
            : c
        )
      );
      setEditingId(null);
    }
    setSaving(null);
  }

  async function addContact() {
    if (!newLabel || !newValue) return;
    setAdding(true);

    const cleanValue = saveCleanValue(newType, newValue);

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newType,
        label: newLabel,
        value: cleanValue,
        url: newUrl || undefined,
        isVisible: true,
      }),
    });

    if (res.ok) {
      const contact = await res.json();
      setContacts((prev) => [...prev, contact]);
      setNewValue("");
      setNewUrl("");
    }
    setAdding(false);
  }

  async function deleteContact(id: string) {
    if (!confirm("Excluir este contato?")) return;
    await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (editingId === id) setEditingId(null);
  }

  async function toggleVisibility(contact: Contact) {
    setSaving(contact.id);
    await fetch("/api/contacts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: contact.id,
        type: contact.type,
        label: contact.label,
        value: contact.value,
        url: contact.url || "",
        isVisible: !contact.isVisible,
      }),
    });
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, isVisible: !c.isVisible } : c))
    );
    setSaving(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Contatos</h1>

      {/* Sortable contacts */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={contacts.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 mb-8">
            {contacts.map((contact) => (
              <SortableContactItem
                key={contact.id}
                contact={contact}
                isEditing={editingId === contact.id}
                saving={saving}
                editType={editType}
                editLabel={editLabel}
                editValue={editValue}
                editUrl={editUrl}
                onStartEditing={() => startEditing(contact)}
                onCancelEditing={cancelEditing}
                onSaveEdit={() => saveEdit(contact)}
                onToggleVisibility={() => toggleVisibility(contact)}
                onDelete={() => deleteContact(contact.id)}
                onEditTypeChange={handleEditTypeChange}
                onEditLabelChange={setEditLabel}
                onEditValueChange={updateEditValue}
                onEditUrlChange={setEditUrl}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add new */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Adicionar contato</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={newType}
              onChange={(e) => handleNewTypeChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {typeOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="Ex: WhatsApp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
            <input
              value={newValue}
              onChange={(e) => updateNewValue(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder={valuePlaceholder(newType)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL <span className="text-gray-400 text-xs">(auto-gerada)</span>
            </label>
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary bg-gray-50 text-gray-500"
              placeholder="https://..."
            />
          </div>
        </div>
        <button
          onClick={addContact}
          disabled={adding || !newLabel || !newValue}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition"
        >
          {adding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Adicionar
        </button>
      </div>
    </div>
  );
}
