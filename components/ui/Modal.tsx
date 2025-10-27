"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Modal({ open, onClose, children, className }: { open: boolean; onClose: () => void; children: React.ReactNode; className?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn("relative z-10 w-full max-w-lg rounded-lg border bg-background p-4 shadow-xl", className)}>
        {children}
      </div>
    </div>
  );
}


