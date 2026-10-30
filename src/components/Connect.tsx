import { useState } from "react";
import { docIdFrom } from "../lib/parse";

export default function Connect({ current, onConnect, onCancel }: { current: string | null; onConnect: (id: string) => void; onCancel?: () => void }) {
  const [value, setValue] = useState(current ? `https://docs.google.com/document/d/${encodeURIComponent(current)}/edit` : "");
  const [error, setError] = useState("");
  return (
    <div className="connect">
      <h1>Language lessons, ready to practise</h1>
      <p>Paste the link to the Google Doc with the lesson notes. Every line like <span className="example">14.10.2026 1 Leçon</span> or <span className="example">14.10.2026 1 Lesson</span> starts a new lesson, with its own words, verbs and notes.</p>
      <p>The document must be shared as <b>Anyone with the link can view</b>.</p>
      {/* noValidate: a bare document id is fine too, and our message is clearer than the browser's */}
      <form className="field" noValidate onSubmit={event => {
        event.preventDefault();
        const id = docIdFrom(value);
        if (!id) { setError("That doesn’t look like a Google Docs link."); return; }
        onConnect(id);
      }}>
        <input type="url" inputMode="url" placeholder="Paste a Google Docs link" aria-label="Google Docs link"
          value={value} onChange={event => { setValue(event.target.value); setError(""); }} />
        <button className="btn primary big" type="submit">Load lessons</button>
        {onCancel && <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>}
      </form>
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}
