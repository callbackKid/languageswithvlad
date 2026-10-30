import type { ReactNode } from "react";

export default function ExHead({ title, children, onClose, closeLabel = "Back to words" }: { title: string; children?: ReactNode; onClose?: () => void; closeLabel?: string }) {
  return (
    <div className="ex-head">
      <h2>{title}</h2>
      {children}
      {onClose && <button className="btn ghost" onClick={onClose}>{closeLabel}</button>}
    </div>
  );
}
