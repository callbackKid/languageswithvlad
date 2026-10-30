import { useState } from "react";

export default function CodeGate({ onDone, onClear }: { onDone: (code: string) => void; onClear: () => void }) {
  const [code, setCode] = useState("");
  return (
    <div className="connect">
      <h1>Class code</h1>
      <p>Your teacher gave you a code for this notebook. You only need to enter it once on this device.</p>
      <form className="field" onSubmit={event => { event.preventDefault(); if (code.trim()) { onClear(); onDone(code.trim()); } }}>
        <input value={code} onChange={event => setCode(event.target.value)} placeholder="Class code" aria-label="Class code" autoComplete="off" autoFocus />
        <button className="btn primary big" type="submit" disabled={!code.trim()}>Continue</button>
      </form>
    </div>
  );
}
