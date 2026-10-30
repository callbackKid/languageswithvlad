# Cahier de français

A study notebook for French lessons kept in a Google Doc. Every line like
`14.10.2026 1 Leçon` (or `14.10.2026 1 Lesson`) starts a lesson. Each lesson gets:

- **Words**: vocabulary extracted by Claude (missing Russian translations filled in and marked ✱), with flashcards, translation matching, synonym/antonym matching and fill-the-gap sentences.
- **Verbs**: six-tense conjugation tables, a typing drill per tense, and a quick quiz.
- **My notes**: a notepad per lesson, saved in the student's browser.
- **Original**: the lesson exactly as written.

React + TypeScript + Vite on the front, three small Vercel serverless functions in `api/` on the back. The Anthropic API key never reaches the browser.

## Deploy (about 10 minutes)

1. **Get an API key** at console.anthropic.com and add some credit.
2. **Push this folder to a GitHub repository.**
3. **Import it on vercel.com** (New Project → pick the repo). Vercel detects Vite; keep the defaults.
4. **Add environment variables** (Project → Settings → Environment Variables):
   - `ANTHROPIC_API_KEY`: your key (required)
   - `APP_ACCESS_CODE`: a class code students enter once (recommended, so strangers can’t spend your credit)
   - `CLAUDE_MODEL`, `CLAUDE_FAST_MODEL`: optional model overrides
5. **Deploy**, then redeploy once after adding variables so the functions pick them up.

### Optional: adding lessons from photos to the Google Doc

The **Photo** section can append what it read (underlined words, handwritten notes) to the document as a new lesson. Google only lets the app write with its own key, so this needs a one-time setup:

1. Open [console.cloud.google.com](https://console.cloud.google.com), create a project (any name), then search for **Google Docs API** and press **Enable**.
2. Go to **IAM & Admin → Service Accounts → Create service account**. Any name; skip the optional roles.
3. Open the new account → **Keys → Add key → Create new key → JSON**. A `.json` file downloads.
4. In Vercel, add the variable `GOOGLE_SERVICE_ACCOUNT` and paste the **whole contents** of that file as its value. Redeploy.
5. Copy the account's email (`…@….iam.gserviceaccount.com`, also shown in the app if something is missing) and, in Google Docs, **Share** the lesson document with it as **Editor**.

The key can edit only documents shared with that email. Keep the JSON file private and don't commit it.

## Using it with students

1. In Google Docs, set each lesson document to **Share → General access → Anyone with the link → Viewer**.
2. Open the app, paste the document link, then press **Copy student link**. The link looks like `https://your-app.vercel.app/?doc=DOCUMENT_ID`.
3. Send that link to the student (or the whole class, if they share one document). They open it, enter the class code once, and see every lesson.

When you add a new lesson to the document, students press **Sync** to get it.

## Costs

Claude is called when a lesson is first prepared, when a verb is first opened, and for each new set of gap sentences. Results for lessons and verbs are cached in each student’s browser, and warm server instances reuse identical answers, so a class sharing one document mostly pays for each lesson once per student device. Set a monthly spend limit in the Anthropic console.

## Local development

```bash
yarn install
echo "ANTHROPIC_API_KEY=your-key" > .env.local
yarn start                   # runs the UI and the api/ functions together (vercel dev)
yarn dev                     # UI only (vite); documents won't load
```

## Limits

- Notes, flashcard choices and cached results live in each browser (localStorage), so they don’t follow a student to another device.
- Private documents can’t be read; they must be shared by link.
