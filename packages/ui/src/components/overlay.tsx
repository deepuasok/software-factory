"use client";

import React, { useEffect } from "react";
import { Button, cx } from "./primitives";

/**
 * A modal. Used only for a decision that cannot be shown inline: creating a
 * record, or confirming something destructive. Never for information.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-secondary/40 flex items-start justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-overlay w-full mt-[10vh]"
        style={{ maxWidth: width }}
      >
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-edge">
          <h2 className="text-[15px] font-semibold text-secondary">{title}</h2>
          <div className="flex-1" />
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-secondary text-[18px] leading-none">
            ×
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-5 py-3.5 border-t border-edge">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Destructive actions are two clicks, never one, and the second click says
 * what will happen. No dialog for a single-row delete.
 */
export function ConfirmButton({
  onConfirm,
  label = "Delete",
  confirmLabel = "Really delete?",
  busy,
}: {
  onConfirm: () => void;
  label?: string;
  confirmLabel?: string;
  busy?: boolean;
}) {
  const [armed, setArmed] = React.useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <Button
      variant={armed ? "danger" : "ghost"}
      size="sm"
      disabled={busy}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
    >
      {armed ? confirmLabel : label}
    </Button>
  );
}

/** A short-lived confirmation in the corner. Never for errors that need action. */
export function Toast({ message, tone = "ok" }: { message: string; tone?: "ok" | "error" }) {
  if (!message) return null;
  return (
    <div
      className={cx(
        "fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-[12px] font-medium text-white shadow-overlay",
        tone === "ok" ? "bg-secondary" : "bg-error",
      )}
    >
      {message}
    </div>
  );
}
