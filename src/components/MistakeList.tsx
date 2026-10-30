import type { FormStat, WordStat } from "../lib/progress";
import Transcription from "./Transcription";

const times = (count: number) => (count === 1 ? "once" : `${count} times`);

/** Missed words and verb forms with how often each was missed. */
export default function MistakeList({ words = [], forms = [] }: { words?: WordStat[]; forms?: FormStat[] }) {
  return (
    <ul className="mistakes">
      {words.map(stat => (
        <li key={"w" + stat.fr}>
          <span className="fr" lang={stat.language ?? "fr"}>{stat.fr}{stat.tr && <> <Transcription tr={stat.tr} /></>}</span>
          <span className="ru" lang="ru">{stat.ru || "—"}</span>
          <span className="miss">missed {times(stat.wrong)}</span>
        </li>
      ))}
      {forms.map(stat => (
        <li key={"f" + stat.inf + stat.t + stat.p}>
          <span className="fr" lang="fr">{stat.p} {stat.f}</span>
          <span className="ru"><i lang="fr">{stat.inf}</i>, {stat.t}</span>
          <span className="miss">missed {times(stat.wrong)}</span>
        </li>
      ))}
    </ul>
  );
}
