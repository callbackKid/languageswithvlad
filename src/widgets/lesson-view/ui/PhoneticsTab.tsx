import { useEffect, useRef, useState } from 'react';

import {
  type GrammarRule,
  GrammarRuleBox,
  type LessonPhonetics,
  normalizePhonetics,
} from '@/entities/lesson';
import { normalizeExercise, RoundLoader } from '@/features/make-exercise';
import { api, ApiError } from '@/shared/api';
import { getSettings, type Language } from '@/shared/config';
import { common, getUiLanguage, paper, translator, useTranslation } from '@/shared/i18n';
import { requestOnce } from '@/shared/lib/once';
import { canSpeak, hasVoice } from '@/shared/lib/speech';
import { save } from '@/shared/lib/storage';
import { Button } from '@/shared/ui/controls';
import WaitingFact from '@/shared/ui/WaitingFact';

import { phoneticsKey, readPhonetics } from '../model/phonetics';

/** The lesson's pronunciation points (sounds, reading rules, liaison, stress), each explained like
    a grammar rule with a round of questions. Read by Claude the first time the tab opens, apart
    from the Grammar tab's reading, and kept for this lesson text and interface language. */
export default function PhoneticsTab({
  body,
  hash,
  language,
  hasClaude,
  onRead,
}: {
  // the lesson's text and its hash, which names the copy kept on the device
  body: string;
  hash: string;
  // the language the lesson teaches, while Claude's answer hasn't said it yet
  language: Language;
  hasClaude: boolean;
  // told how many points Claude found, when the reading arrives (the tab's count)
  onRead?: (count: number) => void;
}) {
  const { t, language: uiLanguage } = useTranslation(paper);
  const commonText = useTranslation(common);
  const storageKey = phoneticsKey(hash, uiLanguage);
  const [phonetics, setPhonetics] = useState<LessonPhonetics | null>(() =>
    readPhonetics(storageKey)
  );
  // read when the answer arrives, so a new function from the parent doesn't ask again
  const latestOnRead = useRef(onRead);
  useEffect(() => {
    latestOnRead.current = onRead;
  });
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  // why the reading failed, in the interface language (a lesson too long, no access…)
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [practising, setPractising] = useState<GrammarRule | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const cached = readPhonetics(storageKey);
    setPhonetics(cached);
    setState('idle');
    if (cached || !hasClaude) return;
    let alive = true;
    setState('loading');
    requestOnce(storageKey, () => api.lessonPhonetics(body, getUiLanguage()))
      .then((raw) => {
        const read = normalizePhonetics(raw);
        // Claude's answer as it came, so it is read back the same way; kept even if the tab was
        // left meanwhile: the answer is paid for
        save(storageKey, raw);
        latestOnRead.current?.(read.topics.length);
        if (alive) {
          setPhonetics(read);
          setState('idle');
        }
      })
      .catch((failure: unknown) => {
        if (!alive) return;
        setState('error');
        setError(
          failure instanceof ApiError ? failure.message : translator(common).t('unreadable')
        );
      });
    return () => {
      alive = false;
    };
  }, [storageKey, body, hasClaude, attempt]);

  const lessonLanguage = phonetics?.language ?? language;
  if (practising)
    return (
      <RoundLoader
        key={round}
        title={practising.title}
        language={lessonLanguage}
        waiting={t('writingPhonetics')}
        load={async () => {
          const explainIn = getUiLanguage();
          const made = normalizeExercise(
            await api.phoneticsPractice({
              language: lessonLanguage,
              level: getSettings().levels[lessonLanguage],
              title: practising.title,
              summary: practising.summary,
              explainIn,
            }),
            lessonLanguage,
            explainIn
          );
          // only choices (a choice whose answer isn't among its options became a typed gap), and
          // no "what did you hear" question where nothing can be heard
          const canHear = canSpeak && hasVoice(lessonLanguage);
          const questions = made.questions.filter(
            (question) => question.type === 'choice' && (canHear || !question.heard)
          );
          if (!questions.length) throw new Error('empty');
          // the questions are asked in the interface language, the options are in the lesson's
          return { ...made, questions, promptIn: explainIn };
        }}
        onClose={() => setPractising(null)}
      />
    );

  if (!phonetics && !hasClaude) return <p className="empty">{commonText.t('needsClaude')}</p>;
  if (state === 'loading')
    return <WaitingFact language={lessonLanguage}>{t('readingPhonetics')}</WaitingFact>;
  if (state === 'error')
    return (
      <div className="note err" role="alert">
        <p>{error}</p>
        <Button onClick={() => setAttempt((previous) => previous + 1)}>
          {commonText.t('tryAgain')}
        </Button>
      </div>
    );
  if (!phonetics) return null;
  if (!phonetics.topics.length) return <p className="empty">{t('noPhonetics')}</p>;
  return (
    <div className="grammar-rules">
      {phonetics.topics.map((topic, index) => (
        <GrammarRuleBox
          key={topic.title}
          rule={topic}
          language={lessonLanguage}
          label={topic.title}
          // right under the lesson's title
          level={2}
          open={index === 0}
          formationLabel={t('phoneticsRules')}
        >
          <div className="row-actions">
            <Button
              variant="primary"
              onClick={() => {
                setPractising(topic);
                setRound((previous) => previous + 1);
              }}
            >
              {t('practisePhonetics')}
            </Button>
          </div>
        </GrammarRuleBox>
      ))}
    </div>
  );
}
