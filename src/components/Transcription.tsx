/** A word's transcription, shown right after the French. */
export default function Transcription({ tr }: { tr: string }) {
  return <span className="tr" title="Transcription">[{tr}]</span>;
}
