import './ConjugationTable.css';

import { type Language } from '@/shared/config';
import { keepBracketsTogether } from '@/shared/lib/util';
import Speak from '@/shared/ui/Speak';

import { type Form } from '../model/types';

// One tense of a verb as a table: person and form, each form read aloud with 🔊.
const ConjugationTable = ({ rows, language }: { rows: Form[]; language: Language }) => {
  return (
    <table className="conj" lang={language}>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            <td className="p">{row.p}</td>
            <td className="f">
              <div className="conj-form">
                <span>{keepBracketsTogether(row.f)}</span>
                <Speak text={`${row.p} ${row.f}`} language={language} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ConjugationTable;
