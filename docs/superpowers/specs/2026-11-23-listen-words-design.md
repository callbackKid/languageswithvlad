# Listen: the ticked words read aloud, each followed by its translation — design

## Why

The owner wants a hands-off way to revise: the student ticks words and phrases, presses a button, and hears each one in the language learned, then, after a short pause to repeat it, its translation. The screen stays open (a laptop or a phone).

## Goals

- A **Listen** button next to Dictation in every word list (a lesson, Words to learn, Downloaded lessons), on the ticked words, shown only when the browser can speak.
- Word → pause → translation → pause → next word. One pause length for both, chosen on the screen (1 · 2 · 3 · 5 s, 2 by default), kept on the device. The speed is Settings → speech speed.
- The screen shows the word, and its translation once it is read; Pause / Continue, Next, ✕; “Shuffle” (list order by default); at the end, how many words were heard and Listen again.
- The speech helper reads the translation languages too (Russian and the other interface languages). With no voice for a language, its text is only shown.

## Non-goals

- Reading with the screen locked or the browser in the background (the browser's voice stops; a server-side voice would be a paid service).
- Counting it as practice in the progress (nothing is answered).
- Looping forever.

## Approaches

- **Browser voices with a wait-for-the-end helper (chosen):** `speakAndWait` resolves on the utterance's `end`, with a timer by length for browsers that drop it. Free, no server.
- **A server text-to-speech service:** better voices and background play, but paid and a new secret; left for later.

## Design

- `src/shared/lib/speech.ts`: `LOCALES` keyed by `UiLanguage` (adds `ru-RU`); `speak` takes a `UiLanguage`; new `speakAndWait(text, language): Promise<void>`, `hasVoice(language)`, and `unlockSpeech()` (a silent utterance on the tap, which iPhone Safari needs before speech started from a timer).
- `src/widgets/word-list/model/listen.ts`: `LISTEN_PAUSES = [1, 2, 3, 5]`, `readListenPause()`, `saveListenPause()`.
- `src/widgets/word-list/ui/Listen.tsx`: the player; one effect reads the current word or translation, waits the pause, then moves on; it guards a late end and stops the voice on cleanup.
- `WordsTab.tsx`: the Listen button and the exercise.
- Texts in `exercises` (seven languages), a Tutorial tip, README, News.
