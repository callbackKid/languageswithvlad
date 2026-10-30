import type { ReactNode } from "react";
import type { Bank } from "../lib/bank";
import { plural } from "../lib/util";

export default function PageHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section className="page-head">
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </section>
  );
}

/** Says when some lessons aren't in the cross-lesson pages yet: still preparing, failed, or never opened. */
export function BankNote({ bank }: { bank: Bank }) {
  if (bank.pending) return <div className="note info"><span className="spinner" /><p>Preparing {plural(bank.pending, "more lesson")}. Their words appear here as they’re ready.</p></div>;
  if (bank.failed) return <div className="note err"><p>{plural(bank.failed, "lesson")} couldn’t be prepared. Open {bank.failed === 1 ? "it" : "them"} under Lessons to try again.</p></div>;
  if (bank.waiting) return <div className="note info"><p>{plural(bank.waiting, "older lesson")} {bank.waiting === 1 ? "isn’t" : "aren’t"} included yet. Open a lesson under Lessons to add its words here.</p></div>;
  return null;
}
