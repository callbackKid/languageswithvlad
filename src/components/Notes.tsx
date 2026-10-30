import { useEffect, useRef, useState } from "react";
import { load, save } from "../lib/storage";

export default function Notes({ storageKey }: { storageKey: string }) {
  const [text, setText] = useState(() => load<string>(storageKey) || "");
  const [status, setStatus] = useState("");
  const timer = useRef<number>();
  const pending = useRef<string | null>(null);

  // Save anything still pending when the student switches lesson or tab.
  useEffect(() => () => {
    window.clearTimeout(timer.current);
    if (pending.current !== null) save(storageKey, pending.current);
  }, [storageKey]);

  return (
    <>
      <textarea className="notes" value={text} aria-label="My notes for this lesson"
        placeholder="Write anything you want to remember about this lesson."
        onChange={event => {
          const value = event.target.value;
          setText(value); setStatus("Saving…"); pending.current = value;
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => { save(storageKey, value); pending.current = null; setStatus("Saved on this device"); }, 500);
        }} />
      <div className="notes-status" role="status">{status}</div>
    </>
  );
}
