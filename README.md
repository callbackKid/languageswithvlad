# Cahier de français

A study app for French, English and German lessons kept in a Google Doc or a Notion page. The teacher writes lessons in the document; the app turns each lesson into vocabulary, verb tables and exercises for the student.

React + TypeScript + Vite in the browser, small Vercel serverless functions in `api/`. The Anthropic API key stays on the server and never reaches the browser.

## Contents

- [Features](#features)
- [How to write the lesson document](#how-to-write-the-lesson-document)
- [Deploy](#deploy)
- [Using it with students](#using-it-with-students)
- [Optional: adding lessons from photos to the Google Doc](#optional-adding-lessons-from-photos-to-the-google-doc)
- [Pages](#pages)
- [Local development](#local-development)
- [Project structure](#project-structure)
- [Costs](#costs)
- [Limits](#limits)

## Features

**Lessons**

- **Words**: vocabulary extracted by Claude, with Russian translations (ones Claude added are marked ✱), pronunciation 🔊, and ☆ to save a word to My words.
- **Exercises**: quiz, flashcards, translation matching, synonym/antonym matching, fill-the-gap sentences, dictation. Words can be exported for Anki.
- **Verbs**: tables in six tenses, affirmative and negative, a typing drill per tense, and a quick quiz.
- **My notes** (a notepad per lesson) and **Original** (the lesson exactly as written).

**Practice across lessons**

- **Home**: a daily round of 10 mixed questions, a 🔥 streak and a daily goal.
- **All lessons**, **My words**, **Mistakes** and **Stats**.

**From paper**

- **Photo → underlined words**: a photo of a book page gives a translation, dictionary form, tense and short explanation for every underlined word.
- **Photo → handwritten notes**: photos of handwritten notes become a lesson with the same exercises.
- **Photo → textbook PDF**: the pages of a textbook chapter become lesson notes (words, phrases, grammar, examples) and then a lesson.
- Both can be added to the Google Doc as a new lesson (optional setup).

**Around the lessons**

- **Discuss**: a discussion question for the start of a lesson, for a chosen level, a vocabulary topic from the list or the student’s own (“the TV series Dexter”) and a grammar point, with follow-up questions, sentence starters, useful words and a fold-out explanation of the grammar rule.
- **Document**: the Google Docs editor inside the app.
- **Next lesson** date and **Join call** button in the top bar, read from the document.
- **Lesson mode** (`/call`): the call, the teacher’s notes and the lesson’s words on one screen. Google Meet opens as a small window beside the app (Google doesn’t allow Meet inside other sites); Zoom runs inside the page (optional setup). The notes go into the Google Doc as a new lesson with one button. Below them, a **board** (Excalidraw) to write and draw on; the student sees it through screen sharing.
- **Tutorial**: a guide to every section, written for students.
- **Settings** (your picture in the top bar): interface language (English, Russian, French, German; the browser’s by default), light or dark theme, the languages you learn and your level in each (practice and Discuss then show only those), name and picture, daily goal, speech speed, and which sections the menu shows. Word translations stay in Russian.

## How to write the lesson document

| What           | Write in the document                               | Notes                                                             |
| -------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| Start a lesson | `14.10.2026 1 Leçon`, `… 1 Lesson` or `… 1 Lektion` | Everything below it belongs to that lesson.                       |
| A word         | `bonjour — привет`                                  | Messier notes work too; this is clearest.                         |
| Pronunciation  | `bonjour [bɔ̃ʒuʁ] — привет`                          | In square brackets, IPA or Cyrillic.                              |
| Next lesson    | `le cours prochain: 22.11.2026 18:00 de Paris`      | Or `next lesson: …`, `nächste Stunde: …`. The newest line counts. |
| Video call     | `https://meet.google.com/abc-defg-hij`              | Anywhere; the newest link is used.                                |

With a city after the time (`de Paris`, `Moscow`…), students see the next lesson in their own time.

## Deploy

About 10 minutes.

1. **Get an Anthropic API key** at console.anthropic.com and add some credit.
2. **Push this folder to a GitHub repository.**
3. **Import it on vercel.com** (New Project → pick the repo). Vercel detects Vite; keep the defaults.
4. **Add environment variables** (Project → Settings → Environment Variables):

   | Variable                                 | Required    | What it is                                                              |
   | ---------------------------------------- | ----------- | ----------------------------------------------------------------------- |
   | `ANTHROPIC_API_KEY`                      | yes         | Your Anthropic key.                                                     |
   | `APP_ACCESS_CODE`                        | recommended | A class code students enter once, so strangers can’t spend your credit. |
   | `CLAUDE_MODEL`, `CLAUDE_FAST_MODEL`      | no          | Model overrides.                                                        |
   | `GOOGLE_SERVICE_ACCOUNT`                 | no          | Lets the app add lessons to the Google Doc (setup below).               |
   | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | no          | Sends students’ bug reports and ideas to your Telegram (setup below).   |
   | `ZOOM_SDK_KEY`, `ZOOM_SDK_SECRET`        | no          | Runs Zoom calls inside the app, in lesson mode (setup below).           |
   | `NOTION_TOKEN`                           | no          | Reads lessons from Notion pages instead of a Google Doc (setup below).  |

5. **Deploy**, then redeploy once after adding variables so the functions pick them up.

## Using it with students

1. In Google Docs, set the lesson document to **Share → General access → Anyone with the link → Viewer**.
2. Open the app, paste the document link, then press **Copy student link**. It looks like `https://your-app.vercel.app/?doc=DOCUMENT_ID`.
3. Send that link to the student (or the whole class, if they share one document). They open it, enter the class code once, and see every lesson.

When you add a lesson to the document, students press **Sync** to get it. The **Tutorial** page explains the rest of the app to them.

## Optional: adding lessons from photos to the Google Doc

The **Photo** section can append what it read (underlined words, handwritten notes) to the end of the document as a new lesson. Google lets the app write only with its own key, so this needs a one-time setup:

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

Instead of a Google Doc, the app can read a Notion page: paste its link on the first screen (or in **Change document**). The lessons are written the same way, `12.11.2026 1 Leçon` and everything under it, and the page can hold them in any of these shapes:

- one under another on the page;
- as **sub-pages**, each titled like `12.11.2026 1 Leçon`;
- as rows of a **database**: a row titled `12.11.2026 1 Leçon`, or any title plus a **Date** column (the app builds the heading from the date).

Tables become “word — translation — transcription” lines, toggles and columns are read too, and a Meet or Zoom link hidden behind text still counts for **Join call**. Notion pages can’t be edited inside the app; the Document page links to Notion instead.

Notion only lets apps read pages through an integration, so this needs a one-time setup:

1. Open [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration**, type **Internal**, any name (for example “Cahier”), your workspace.
2. Under **Capabilities**, keep **Read content**, and turn on **Insert content** if lessons from photos and lesson notes should be added to the page.
3. Copy the **Internal Integration Secret** and add it in Vercel as `NOTION_TOKEN`. Redeploy.
4. In Notion, open the lesson page → **•••** (top right) → **Connections** → add the integration. Sub-pages and databases inside it are included.

Every student link for that page (**Copy student link**) works like the Google Doc one. If the app says it can’t see the page, step 4 was skipped for that page.

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

## Pages

Every section has its own address, so links can be shared and the browser’s Back button works.

| Page        | Address                                                   |
| ----------- | --------------------------------------------------------- |
| Home        | `/`                                                       |
| Lessons     | `/lessons` (newest), `/lessons/2026-11-12_7` (one lesson) |
| All lessons | `/all-lessons`                                            |
| My words    | `/my-words`                                               |
| Mistakes    | `/mistakes`                                               |
| Stats       | `/stats`                                                  |
| Photo       | `/photo`                                                  |
| Discuss     | `/discuss`                                                |
| Document    | `/document`                                               |
| Tutorial    | `/tutorial`                                               |
| Settings    | `/settings`                                               |
| Lesson mode | `/call` (opened by **Join call**, not in the menu)        |

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

In VS Code, the workspace settings in `.vscode/` format and fix files on save (needs the ESLint and Prettier extensions, which VS Code suggests).

## Project structure

```
api/                serverless functions (Vercel)
  _lib/claude.ts    calls to Claude, access code check, photo checks
  _lib/google.ts    writing to Google Docs with the service account
  _lib/prompts.ts   every prompt sent to Claude
  _lib/telegram.ts  sending feedback to the teacher’s Telegram
  _lib/zoom.ts      signing Zoom Meeting SDK joins
  _lib/notion.ts    reading a Notion page as lesson text, adding lessons to it
  doc.ts            reads the Google Doc (or the Notion page)
  analyze.ts        prepares a lesson: words, pairs, verbs
  conjugate.ts      a verb’s tables
  gaps.ts           fill-the-gap sentences
  photo.ts          underlined words on a photo
  transcribe.ts     handwritten notes on photos
  textbook.ts       a textbook chapter (PDF pages) as lesson notes
  discussion.ts     a discussion question for the start of a lesson
  append.ts         adds a lesson to the Google Doc
  feedback.ts       bug reports and ideas from students, to Telegram
  zoom-signature.ts a signature for joining a Zoom call inside the app
  health.ts         what the server is set up for
src/
  App.tsx           top bar, menu and pages
  components/       one file per page or exercise
  i18n/             interface languages: core.tsx, and messages/ with every text in en, ru, fr, de
  lib/              logic without UI: parsing, grading, progress, routing, speech
```

## Costs

Claude is called when a lesson is first prepared, when a verb is first opened, for each new set of gap sentences, and for each photo or PDF. Lessons and verbs are cached in each student’s browser, and warm server instances reuse identical answers, so a class sharing one document mostly pays for each lesson once per student device. Set a monthly spend limit in the Anthropic console.

## Limits

- Progress, stars, notes, streaks and lessons from photos or PDFs live in each browser (localStorage), so they don’t follow a student to another device.
- Private documents can’t be read; they must be shared by link.
- A textbook PDF is read 20 pages at a time; scanned pages are heavy, so a long scanned chapter may need to be split.
- The Google Docs editor in **Document** may not load in browsers that block third-party cookies (often Safari); the page links to the document in a new tab instead.
