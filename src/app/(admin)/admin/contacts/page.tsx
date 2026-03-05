"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import type { Contact } from "@prisma/client";

const typeOptions = [
  { value: "WHATSAPP", label: "WhatsApp", icon: MessageCircle },
  { value: "PHONE", label: "Telefone", icon: Phone },
  { value: "EMAIL", label: "E-mail", icon: Mail },
  { value: "INSTAGRAM", label: "Instagram", icon: Instagram },
  { value: "OTHER", label: "Outro", icon: ExternalLink },
] as const;

/** Aplica máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX */
function phoneMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Extrai só dígitos de um valor mascarado */
function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Gera URL automaticamente com base no tipo e valor */
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

/** Retorna label padrão para o tipo */
function defaultLabel(type: string): string {
  const opt = typeOptions.find((t) => t.value === type);
  return opt?.label || "";
}

/** Retorna placeholder para o campo Valor */
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

/** Verifica se o tipo usa máscara de telefone */
function isPhoneType(type: string): boolean {
  return type === "WHATSAPP" || type === "PHONE";
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editValue, setEditValue] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // New contact form
  const [newType, setNewType] = useState<string>("WHATSAPP");
  const [newLabel, setNewLabel] = useState("WhatsApp");
  const [newValue, setNewValue] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/contacts")
      .then((r) => r.json())
      .then(setContacts)
      .finally(() => setLoading(false));
  }, []);

  // Auto-generate URL when value changes (new contact)
  const updateNewValue = useCallback(
    (raw: string) => {
      const val = isPhoneType(newType) ? phoneMask(raw) : raw;
      setNewValue(val);
      setNewUrl(autoUrl(newType, val));
    },
    [newType]
  );

  // Auto-generate URL when value changes (edit contact)
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
    // Show masked value for phone types
    const val = isPhoneType(contact.type)
      ? phoneMask(contact.value)
      : contact.value;
    setEditValue(val);
    setEditUrl(contact.url || "");
  }

  function cancelEditing() {
    setEditingId(null);
  }

  /** Valor para salvar no banco (sem máscara para telefones) */
  function saveValue(type: string, displayValue: string): string {
    return isPhoneType(type) ? onlyDigits(displayValue) : displayValue;
  }

  async function saveEdit(contact: Contact) {
    if (!editLabel || !editValue) return;
    setSaving(contact.id);

    const cleanValue = saveValue(editType, editValue);

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
            ? {
                ...c,
                type: editType as Contact["type"],
                label: editLabel,
                value: cleanValue,
                url: editUrl || null,
              }
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

    const cleanValue = saveValue(newType, newValue);

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
      prev.map((c) =>
        c.id === contact.id ? { ...c, isVisible: !c.isVisible } : c
      )
    );
    setSaving(null);
  }

  /** Formata o valor para exibição na lista */
  function displayValue(contact: Contact): string {
    if (isPhoneType(contact.type)) return phoneMask(contact.value);
    return contact.value;
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
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        Contatos
      </h1>

      {/* Existing contacts */}
      <div className="space-y-2 mb-8">
        {contacts.map((contact) => {
          const typeOpt = typeOptions.find((t) => t.value === contact.type);
          const Icon = typeOpt?.icon || ExternalLink;
          const isEditing = editingId === contact.id;

          if (isEditing) {
            return (
              <div
                key={contact.id}
                className="bg-white rounded-xl p-4 border border-primary/30 shadow-sm space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Tipo
                    </label>
                    <select
                      value={editType}
                      onChange={(e) => handleEditTypeChange(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {typeOptions.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Label
                    </label>
                    <input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Valor
                    </label>
                    <input
                      value={editValue}
                      onChange={(e) => updateEditValue(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder={valuePlaceholder(editType)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      URL{" "}
                      <span className="text-gray-300">(auto-gerada)</span>
                    </label>
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary bg-gray-50 text-gray-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(contact)}
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
                    onClick={cancelEditing}
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
              key={contact.id}
              className="flex items-center gap-2 sm:gap-4 bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm"
            >
              <Icon className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">
                  {contact.label}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {displayValue(contact)}
                </p>
              </div>
              <button
                onClick={() => startEditing(contact)}
                className="rounded-lg p-2 text-gray-300 hover:bg-blue-50 hover:text-blue-500 transition-colors"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleVisibility(contact)}
                className={`text-xs px-2 py-1 rounded ${
                  contact.isVisible
                    ? "bg-green-50 text-green-600"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                {saving === contact.id
                  ? "..."
                  : contact.isVisible
                    ? "Visível"
                    : "Oculto"}
              </button>
              <button
                onClick={() => deleteContact(contact.id)}
                className="rounded-lg p-2 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add new */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Adicionar contato
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={newType}
              onChange={(e) => handleNewTypeChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
            >
              {typeOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="Ex: WhatsApp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor
            </label>
            <input
              value={newValue}
              onChange={(e) => updateNewValue(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder={valuePlaceholder(newType)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL{" "}
              <span className="text-gray-400 text-xs">(auto-gerada)</span>
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
