# Cahier de français

A study app for French, English, German, Spanish, Portuguese and Italian lessons kept in a Google Doc or a Notion page. The teacher writes lessons in the document; the app turns each lesson into vocabulary, verb tables and exercises for the student.

React + TypeScript + Vite in the browser, small Vercel serverless functions in `api/`. The Anthropic API key stays on the server and never reaches the browser.

## Contents

- [Features](#features)
- [How to write the lesson document](#how-to-write-the-lesson-document)
- [Deploy](#deploy)
- [Using it with students](#using-it-with-students)
- [Optional: adding lessons from photos to the Google Doc](#optional-adding-lessons-from-photos-to-the-google-doc)
- [Optional: feedback from students in Telegram](#optional-feedback-from-students-in-telegram)
- [Optional: lessons in Notion](#optional-lessons-in-notion)
- [Optional: Zoom calls inside the app](#optional-zoom-calls-inside-the-app)
- [Optional: video calls on Jitsi inside the app](#optional-video-calls-on-jitsi-inside-the-app)
- [Optional: a live board for teacher and student](#optional-a-live-board-for-teacher-and-student)
- [Pages](#pages)
- [Local development](#local-development)
- [Project structure](#project-structure)
- [Costs](#costs)
- [Limits](#limits)

## Features

**Lesson history**

- **Words**: vocabulary extracted by Claude, with Russian translations (ones Claude added are marked ✱), pronunciation 🔊, and ☆ to save a word to Words to learn.
- **Grammar**: every grammar point of the lesson explained in the interface language (how it's formed, when it's used, examples, the usual mistake), with **Practise this rule** for gap sentences on it.
- **Homework**: the tasks the teacher set, with what each asks; ticked off on the device.
- **Book exercises**: exercises from the student's book in the lesson. **Import from the book** reads photos or PDF pages and writes what is ticked (the exercises, the reading text and/or the grammar) under that lesson in the document (a block starting with 📖), so the teacher and the student both see it. Answers are never copied, even when the page or a photo shows them: the student does the exercises. Needs the same one-time setup as adding lessons from photos.
- **My notes** also shows the lesson board and the lesson-mode notes from that day, as saved on the device.
- **Exercises**: quiz, flashcards, translation matching, synonym/antonym matching, fill-the-gap sentences, dictation. Words can be exported for Anki.
- **Verbs** (every language but English): conjugation tables in the language's main tenses (French in six, affirmative and negative; German, Spanish, Italian and European Portuguese in five or six), a typing drill per tense, and a quick quiz.
- **My notes** (a notepad per lesson) and **Original** (the lesson exactly as written).
- **Word menu**, everywhere outside exercises: select a word or phrase in a language being learned (double-click; on a phone, hold it) and choose **Translate** (in its sentence, with the dictionary form, tense and a short note), **Define** (in that language, with Russian), **Examples** or **Conjugate**, plus 🔊 and ☆. One Claude answer covers all four and is kept on the device. On a lesson's pages and in lesson mode, **Add to lesson N** writes `word — translation` under that lesson in the document, so the word joins the lesson's exercises after the sync. On the Text page a single click on a word opens it too, and the words looked up there are listed under the text. On Words to learn, **Look up a word** opens it for a word typed by hand.

**Practice across lessons**

- **Home**: a daily round of 10 mixed questions, a 🔥 streak and a daily goal. On the day of a lesson and the day after, a **summary** of it (new words, verbs, grammar) with **Start revising**; in the 24 hours before the next lesson, **Revise before the lesson** (the last lesson's words and the hard words). Above it, the **homework** the teacher wrote in the newest lesson (`Devoirs: …`) as a checklist with the days left until the next lesson; each task opens its exercise (the words of a lesson, gap sentences, verb forms, or a written answer that Claude corrects and explains like a tutor), and finishing it ticks the task. Lesson mode shows the corrected written answers to the teacher. In a lesson's **Homework** tab, **Make homework with Claude** writes such a block from the lesson's words and grammar (key words ★ first), with as many sentences to translate (2–8) and at the level the teacher picks, for the teacher to check and add under the lesson; it is a teacher's tool, shown only after the teacher code is entered in Settings (see `APP_TEACHER_CODE`). **Send to the teacher** (under the homework and in Stats) adds a short report under the lesson in the document: the homework done, answers and mistakes since the lesson, and the corrected written answers. Its lines start with 📝 and emojis, and lesson analysis skips them.
- **Downloaded lessons** (the second tab of Lesson history: the exercises on all lessons or the ones picked), **Words to learn**, **Mistakes** and **Stats**.

**From paper**

- **Photo parsing → underlined words**: photos of book pages (up to 10 at once, read one by one) give a translation, dictionary form, tense and short explanation for every underlined word, in one table without repeats. They can go into the document as a new lesson or under a lesson you pick.
- **Photo parsing → handwritten notes**: photos of handwritten notes (up to 10 pages, read 4 at a time) become a lesson with the same exercises.
- **Photo parsing → textbook PDF**: the pages of a textbook chapter become lesson notes (words, phrases, grammar, examples) and then a lesson.
- Both can be added to the Google Doc as a new lesson (optional setup).

**From a text you found**

- **Text analysis**: paste an article or any text and read it in the app. Click a word or select a phrase for the word menu (the words looked up are listed under the text); translate the whole text paragraph by paragraph; and get words worth learning (with all the usual exercises), questions about the text and a true-or-false exercise.

**Around the lessons**

- **A question for discussion**: a discussion question for the start of a lesson, for a chosen level, a vocabulary topic from the list or the student’s own (“the TV series Dexter”) and a grammar point, with follow-up questions, sentence starters, useful words and a fold-out explanation of the grammar rule; **Ask a question** writes another with the same choices. In the menu it sits with Words to learn and Mistakes.
- **Document** (`/document`, hidden from the menu until it is redone): the Google Docs editor inside the app.
- **Top bar:** your picture and the document's name with **↻** (sync) on the left, the **next lesson** widget with **Enter the lesson** in the middle (both read from the document; while it says **Lesson now**, the app syncs by itself every minute, so the teacher's new words reach the student with their exercises), **Feedback** and **⚙️ Settings** on the right. The menu is a column on the left: **«** folds it to a thin strip, **☰** opens it again, and the choice is remembered. On a phone it is a drop-down list that closes once a section is picked. Its sections are grouped: lessons, words, reading tools, and help.
- **News**: what changed in the app, day by day, on two tabs (**What’s new** and **Bug fixes**); a dot in the menu marks news not seen yet. A student of several languages picks one and sees its news plus the news for every language (a student of one sees only that); the teacher also picks students’ or teachers’ news. An entry about some languages only lists them in `languages`, and one about the teacher’s tools has `audience: 'teacher'`. Add an entry to `src/lib/news.ts` (all seven interface languages) with every change students will notice.
- **Lesson mode** (`/call`): the call, the teacher’s notes and the lesson’s words on one screen. Every card folds by its title, and a folded card stays folded on that device. **A question for discussion** comes after the warm-up and the quiz game, as on its own page. **Create an exercise** (for the teacher and the student alike) makes a round on a grammar point and/or the newest lesson's words, at a chosen level and number of questions (choose the answer, fill the gap, translate), which the student does right there, each answer checked and explained; the last one is kept on the device. A **Homework** card at the end takes the tasks one per line and adds them as a homework block (`Devoirs:` and a `- ` line per task) under the lesson picked, the newest at first. A **quiz game** plays 10 questions on the lesson's words against the clock (15 seconds each, more points for a fast answer) and keeps a records table on the device. A **warm-up** starts the lesson: about 5 minutes of questions on the previous lesson and on the student's mistakes since, ending with a list of what didn't stick for the teacher to see on the shared screen (run it on the student's device, where the mistakes are kept). Google Meet opens as a small window beside the app (Google doesn’t allow Meet inside other sites); Zoom runs inside the page (optional setup). The notes go into the Google Doc as a new lesson with one button. Below them, a **board** (Excalidraw) to write and draw on, shared live between the teacher and the student (optional setup), or shown through screen sharing.
- **Tutorial**: a guide to every section, written for students.
- **On a phone's home screen**: Share → Add to Home Screen (iPhone) or ⋮ → Add to home screen (Android) puts the app there with its icon (two people over one book: the teacher and the student), and it opens without the browser's bars. The tab icon is `public/icon.svg` (white on black, or black on white in a dark browser); the PNGs next to it (iPhone, Android) are drawn from it, so redraw them when it changes. `public/manifest.webmanifest` names the app and lists them.
- **Settings** (⚙️ on the right of the top bar): the document (open it, copy the student link, change it), interface language (English, Russian, French, German, Spanish, Portuguese, Italian; the browser’s by default), light or dark theme, the languages you learn and your level in each (practice and Discuss then show only those), the tenses quizzes ask verb forms in (those of the level, unless ticked by hand), name and picture, daily goal, speech speed, which sections the menu shows, and which tabs a lesson page shows (Words, Verbs, Grammar, Homework, Book exercises, My notes, Original; at least one stays). Word translations stay in Russian.

## How to write the lesson document

| What           | Write in the document                                                                        | Notes                                                                                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Start a lesson | `14.10.2026 1 Leçon`, or `Lesson`, `Lektion`, `Lección`, `Clase`, `Lição`, `Aula`, `Lezione` | Everything below it belongs to that lesson.                                                                                                                                    |
| A word         | `bonjour — привет`                                                                           | Messier notes work too; this is clearest.                                                                                                                                      |
| Pronunciation  | `bonjour [bɔ̃ʒuʁ] — привет`                                                                   | In square brackets, IPA or Cyrillic.                                                                                                                                           |
| Key word       | `★ la boulangerie — пекарня`                                                                 | Asked more often in exercises and the warm-up, with a **key** badge. `⭐` works too.                                                                                           |
| Homework       | `Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé`      | Shown on Home as a checklist. Or `Homework:`, `Hausaufgaben:`, `Deberes:`, `Trabalho de casa:`, `Compiti:`, `ДЗ:`; items split by `;` or one per line under the label (`- …`). |
| Next lesson    | `le cours prochain: 22.11.2026 18:00 de Paris`                                               | Or `next lesson: …`, `nächste Stunde: …`, `próxima clase: …`, `próxima aula: …`, `prossima lezione: …`. The newest line counts.                                                |
| Video call     | `https://meet.google.com/abc-defg-hij`                                                       | Anywhere; the newest link is used.                                                                                                                                             |

With a city after the time (`de Paris`, `Moscow`…), students see the next lesson in their own time.

## Deploy

About 10 minutes.

1. **Get an Anthropic API key** at console.anthropic.com and add some credit.
2. **Push this folder to a GitHub repository.**
3. **Import it on vercel.com** (New Project → pick the repo). Vercel detects Vite; keep the defaults.
4. **Add environment variables** (Project → Settings → Environment Variables):

   | Variable                                         | Required    | What it is                                                                                                                                                |
   | ------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `ANTHROPIC_API_KEY`                              | yes         | Your Anthropic key.                                                                                                                                       |
   | `APP_ACCESS_CODE`                                | recommended | A class code students enter once, so strangers can’t spend your credit.                                                                                   |
   | `APP_TEACHER_CODE`                               | no          | The teacher's own code, entered once in **Settings → Teacher**; it unlocks the teacher's tools (Make homework with Claude). Without it, nobody sees them. |
   | `CLAUDE_MODEL`, `CLAUDE_FAST_MODEL`              | no          | Model overrides.                                                                                                                                          |
   | `GOOGLE_SERVICE_ACCOUNT`                         | no          | Lets the app add lessons to the Google Doc (setup below).                                                                                                 |
   | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`         | no          | Sends students’ bug reports and ideas to your Telegram (setup below).                                                                                     |
   | `ZOOM_SDK_KEY`, `ZOOM_SDK_SECRET`                | no          | Runs Zoom calls inside the app, in lesson mode (setup below).                                                                                             |
   | `JAAS_APP_ID`, `JAAS_KEY_ID`, `JAAS_PRIVATE_KEY` | no          | Video calls on Jitsi inside the app, in lesson mode, with nothing to install (setup below).                                                               |
   | `SUPABASE_URL`, `SUPABASE_ANON_KEY`              | no          | Shares the lesson board live between teacher and student (setup below).                                                                                   |
   | `NOTION_TOKEN`                                   | no          | Reads lessons from Notion pages instead of a Google Doc (setup below).                                                                                    |

5. **Deploy**, then redeploy once after adding variables so the functions pick them up.

## Using it with students

1. In Google Docs, set the lesson document to **Share → General access → Anyone with the link → Viewer**.
2. Open the app, paste the document link, then open **⚙️ Settings → Document** and press **Copy student link**. It looks like `https://your-app.vercel.app/?doc=DOCUMENT_ID`.
3. Send that link to the student (or the whole class, if they share one document). They open it, enter the class code once, and see every lesson.
4. On your own device, open **⚙️ Settings → Teacher** and enter the teacher code (`APP_TEACHER_CODE`) to turn on the teacher's tools. Don't give this code to students.

When you add a lesson to the document, students press **↻** (sync) next to the document's name to get it. The **Tutorial** page explains the rest of the app to them.

## Optional: adding lessons from photos to the Google Doc

The **Photo parsing** section can append what it read (underlined words, handwritten notes) to the end of the document as a new lesson. Google lets the app write only with its own key, so this needs a one-time setup:

1. Open [console.cloud.google.com](https://console.cloud.google.com), create a project (any name), search for **Google Docs API** and press **Enable**.
2. Go to **IAM & Admin → Service Accounts → Create service account**. Any name; skip the optional roles.
3. Open the new account → **Keys → Add key → Create new key → JSON**. A `.json` file downloads.
4. In Vercel, add the variable `GOOGLE_SERVICE_ACCOUNT` with the **whole contents** of that file as its value. Redeploy.
5. Copy the account’s email (`…@….iam.gserviceaccount.com`; the app also shows it if something is missing) and **Share** the lesson document with it as **Editor**.

The key can edit only documents shared with that email. Keep the JSON file private and never commit it.

## Optional: feedback from students in Telegram

With these two variables set, a **Feedback** button appears in the top bar. Students can report a bug, suggest a change or write anything, with up to 3 screenshots (attached, pasted or dropped). Each message arrives in your Telegram with the page it was sent from and the browser. Without them, the button is hidden.

1. In Telegram, open [@BotFather](https://t.me/BotFather), send `/newbot` and follow the steps. It gives you a token like `123456789:AA…`: that is `TELEGRAM_BOT_TOKEN`.
2. Open your new bot and press **Start** (a bot can't write to you first).
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser, with your token in place of `<TOKEN>`. Find `"chat":{"id":…}`: that number is `TELEGRAM_CHAT_ID`. To get reports in a group instead, add the bot to the group, send a message there, and use the group's id (it starts with `-`).
4. Add both variables in Vercel and redeploy.

Keep the token private: anyone with it can send messages as the bot.

## Optional: lessons in Notion

Instead of a Google Doc, the app can read a Notion page: paste its link on the first screen (or in **Settings → Change document**). The lessons are written the same way, `12.11.2026 1 Leçon` and everything under it, and the page can hold them in any of these shapes:

- one under another on the page;
- as **sub-pages**, each titled like `12.11.2026 1 Leçon`;
- as rows of a **database**: a row titled `12.11.2026 1 Leçon`, or any title plus a **Date** column (the app builds the heading from the date).

Tables become “word — translation — transcription” lines, toggles and columns are read too, and a Meet or Zoom link hidden behind text still counts for **Enter the lesson**. Notion pages can’t be edited inside the app; the Document page links to Notion instead.

Notion only lets apps read pages through an integration, so this needs a one-time setup:

1. Open [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration**, type **Internal**, any name (for example “Cahier”), your workspace.
2. Under **Capabilities**, keep **Read content**, and turn on **Insert content** if lessons from photos and lesson notes should be added to the page.
3. Copy the **Internal Integration Secret** and add it in Vercel as `NOTION_TOKEN`. Redeploy.
4. In Notion, open the lesson page → **•••** (top right) → **Connections** → add the integration. Sub-pages and databases inside it are included.

Every student link for that page (**Settings → Copy student link**) works like the Google Doc one. If the app says it can’t see the page, step 4 was skipped for that page.

## Optional: Zoom calls inside the app

Google Meet links always open in a small separate window: Google doesn’t let Meet run inside other websites. Zoom can run inside the page with Zoom’s Meeting SDK, which needs a free Zoom developer app:

1. Sign in at [marketplace.zoom.us](https://marketplace.zoom.us) with your Zoom account → **Develop → Build App → General App**.
2. Under **Features → Embed**, turn on **Meeting SDK**.
3. Copy the app’s **Client ID** and **Client Secret** (under **App Credentials**).
4. In Vercel, add `ZOOM_SDK_KEY` (the Client ID) and `ZOOM_SDK_SECRET` (the Client Secret). Redeploy.

Then a Zoom link in the document (`https://…zoom.us/j/12345678901?pwd=…`, with `Passcode: …` next to it if the meeting has one) shows **Join here** in lesson mode. Without these variables, Zoom links simply open in Zoom.

Limits to know:

- The app joins as a **participant**. Start the meeting as host from the Zoom app, or turn on **Allow participants to join before host** for the meeting. Hosting from the app would need a Zoom sign-in (OAuth), which isn’t built yet.
- Zoom only lets an unpublished developer app join meetings of its **own account**. For students joining your meetings that’s fine; joining other people’s meetings needs Zoom’s app review.
- The SDK is large (about 1 MB compressed), so it downloads only when someone presses **Join here**.

## Optional: video calls on Jitsi inside the app

Lesson mode can run the call itself, on Jitsi as a Service (JaaS, by 8x8): the teacher and the student open lesson mode on the same document and press **Join the call**, with nothing to install and no account. Both land in the same room, a new one each day; the teacher (with the teacher code on that device) joins as its moderator. The free **Developer** plan covers **25 monthly active users** (everyone who joins at least one call that month, the teacher included) with unlimited minutes; above that, plans start at $99 a month for 300 (see 8x8's prices).

1. Create a free account at [jaas.8x8.vc](https://jaas.8x8.vc) and copy the **AppID** (`vpaas-magic-cookie-…`).
2. Make a key pair on your computer:
   `ssh-keygen -t rsa -b 4096 -m PEM -f jaas-key` and then `openssl rsa -in jaas-key -pubout -outform PEM -out jaas-key.pub`.
3. In the JaaS console, **API Keys → Add API key**: upload `jaas-key.pub`, and copy the **Key ID** it shows (`vpaas-magic-cookie-…/1a2b3c`).
4. In Vercel, add `JAAS_APP_ID`, `JAAS_KEY_ID` and `JAAS_PRIVATE_KEY` (the whole content of `jaas-key`, from `-----BEGIN` to `-----END`). Redeploy. Keep `jaas-key` private and out of the repository.

Without these variables lesson mode shows the document's Meet or Zoom link as before; with them, the Jitsi call comes first and the document's link stays below it. Recording, streaming and phone dial-in are off: they cost extra on JaaS.

## Optional: a live board for teacher and student

The board in lesson mode works on its own device without any setup; the student sees it when the teacher shares the screen. With [Supabase](https://supabase.com) connected, the teacher and the student draw on **the same board at once** and see each other's pointer and name. Strokes travel through Supabase Realtime and are merged on each device, so drawing at the same time loses nothing; nothing is stored at Supabase.

1. Create a free account at [supabase.com](https://supabase.com) and a **New project** (any name, any region close to you; the database password isn't needed by the app).
2. Open **Project Settings → API** (or **API Keys**) and copy the **Project URL** and the **anon** / **publishable** key. That key is public by design: it is sent to the browser.
3. In Vercel, add `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Redeploy.

Then both open lesson mode (**Enter the lesson**) and press **Open the board**; the line above it turns green and lists who is there. Everyone with the student link to the same document joins the same board, one board a day. The free plan's limits (hundreds of people at once, millions of messages a month) are far above a class's needs. Pictures over about 180 KB stay on the device that pasted them.

During local development without Supabase, two tabs of the same browser share the board, to try it out.

## Pages

Every section has its own address, so links can be shared and the browser’s Back button works.

| Page                      | Address                                                   |
| ------------------------- | --------------------------------------------------------- |
| Home                      | `/`                                                       |
| Lesson history            | `/lessons` (newest), `/lessons/2026-11-12_7` (one lesson) |
| Downloaded lessons        | `/all-lessons` (a tab of Lesson history)                  |
| A question for discussion | `/discuss`                                                |
| Document                  | `/document`                                               |
| Words to learn            | `/my-words`                                               |
| Mistakes                  | `/mistakes`                                               |
| Stats                     | `/stats`                                                  |
| Text analysis             | `/text`                                                   |
| Photo parsing             | `/photo`                                                  |
| Tutorial                  | `/tutorial`                                               |
| News                      | `/news`                                                   |
| Settings                  | `/settings`                                               |
| Lesson mode               | `/call` (opened by **Enter the lesson**, not in the menu) |

`vercel.json` sends every address except `/api/…` to the app, so refreshing any page works.

## Local development

```bash
yarn install
echo "ANTHROPIC_API_KEY=your-key" > .env.local
yarn start   # the UI and the api/ functions together (vercel dev)
```

| Command                             | What it does                                                  |
| ----------------------------------- | ------------------------------------------------------------- |
| `yarn start`                        | Runs the app with its API functions (needs `.env.local`).     |
| `yarn dev`                          | UI only (Vite); documents won’t load without the API.         |
| `yarn build`                        | Type-checks and builds into `dist/`.                          |
| `yarn typecheck`                    | Type-checks the app and the API functions.                    |
| `yarn lint` / `yarn lint:fix`       | ESLint (with Prettier as a rule); `:fix` repairs what it can. |
| `yarn format` / `yarn format:check` | Prettier on every file, or only a check.                      |
| `yarn verify`                       | Lint, format check and typecheck in one go.                   |

In VS Code, the workspace settings in `.vscode/` format and fix files on save (needs the ESLint and Prettier extensions, which VS Code suggests).

### Code style

The rules for the code are in [CODE_STYLE.md](CODE_STYLE.md). A pre-commit hook (`.husky/pre-commit`, installed by `yarn install`) enforces the checkable ones: it fixes and lints the staged files, then type-checks the whole project. A commit that fails is refused; fix what it reports, or run `yarn lint:fix`, and commit again.

### Claude Code

How to work with Claude Code on this project without long, costly sessions: [WORKING-WITH-CLAUDE.md](WORKING-WITH-CLAUDE.md).

Already set up in `.claude/`: the rules in `CLAUDE.md`, hooks (format after each edit, guard, typecheck and News reminder at the end of a turn, session briefing), a permission allowlist, the skills `run-languageswithvlad`, `check-a11y`, `audit-app` (a whole-app pass for bugs, exercise and text mistakes, and UI/UX problems), `commit-message` and `commit-and-push`, and the `translator` subagent (`.claude/agents/translator.md`), which fills in and reviews the seven interface languages.

Set up personally, in `~/.claude/` (not in the repo): the status line in the terminal (folder, branch, model, how full the context is, session age, the 5-hour usage limit; context and age turn yellow, then red), the session-age reminder and notifications.

Not used yet, most useful first:

1. **`/code-review` and `/security-review`** on a change before committing it. `/security-review` matters most for `api/`, which holds the Anthropic key, the class-code check and the Google service account.
2. **Plan mode** (Shift+Tab) for the big TODO items: the exercise builder, the student roadmap, translation languages beyond Russian.
3. **The Notion connector**, authorised through `/mcp`, so Claude can read lessons from Notion while debugging. Google Docs and Drive are already connected.
4. **Worktrees** for working on two independent TODO items at the same time.
5. **Automation:** `/schedule` for a weekly check of outdated or vulnerable dependencies; `claude -p` in GitHub Actions to review every pull request.
6. **Rewind** (Esc Esc): rolls the conversation and file changes back to an earlier point.

## Project structure

```
api/                serverless functions (Vercel)
  _lib/http.ts      what every endpoint shares: class code check, input reading, errors
  _lib/claude.ts    calls to Claude, photo checks
  _lib/google.ts    writing to Google Docs with the service account
  _lib/prompts.ts   every prompt sent to Claude
  _lib/telegram.ts  sending feedback to the teacher’s Telegram
  _lib/zoom.ts      signing Zoom Meeting SDK joins
  _lib/jitsi.ts     signing Jitsi (JaaS) call tokens
  _lib/notion.ts    reading a Notion page as lesson text, adding lessons to it
  _lib/lessons.ts   finding one lesson's heading in a document, to write under it
  doc.ts            reads the Google Doc (or the Notion page)
  analyze.ts        prepares a lesson: words, pairs, verbs
  conjugate.ts      a verb’s tables
  gaps.ts           fill-the-gap sentences
  paper.ts          from paper: underlined words on a photo, handwritten notes, textbook pages
  text.ts           a selected word's card (the word menu); a pasted text translated, exercises
  discussion.ts     a discussion question for the start of a lesson
  append.ts         adds a lesson to the Google Doc
  feedback.ts       bug reports and ideas from students, to Telegram
  call-token.ts     a Zoom signature or a Jitsi (JaaS) token for joining a call inside the app
  health.ts         what the server is set up for
src/
  App.tsx           top bar, menu and pages
  components/       one file per page or exercise
  i18n/             interface languages: core.tsx, and messages/ with every text in en, ru, fr, de, es, pt, it
  lib/              logic without UI: parsing, grading, progress, routing, speech
public/             the app icon (icon.svg and the PNGs drawn from it) and manifest.webmanifest
```

## Costs

Claude is called when a lesson is first prepared, when a verb is first opened, for each new set of gap sentences, for each photo or PDF, for each discussion question, and on the Text page for each explained word, each translation and each set of exercises; for each written homework answer checked and each homework made from a lesson. Lessons and verbs are cached in each student’s browser, and warm server instances reuse identical answers, so a class sharing one document mostly pays for each lesson once per student device. Set a monthly spend limit in the Anthropic console.

## Limits

- Progress, stars, notes, streaks and lessons from photos or PDFs live in each browser (localStorage), so they don’t follow a student to another device.
- Private documents can’t be read; they must be shared by link.
- A textbook PDF is read 20 pages at a time; scanned pages are heavy, so a long scanned chapter may need to be split.
- The Google Docs editor in **Document** may not load in browsers that block third-party cookies (often Safari); the page links to the document in a new tab instead.
