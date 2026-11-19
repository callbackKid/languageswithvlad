import { defineMessages } from '../core';

/* The Tutorial page. Tags inside the texts: <b> bold, <ex> an example line from the document,
   <btn> / <pbtn> a drawn (primary) button, <key> a keyboard key, <added> the ✱ mark,
   <lessons> / <mine> / <home> a link that opens that section. */
export const tutorial = defineMessages({
  en: {
    title: 'Tutorial',
    intro: 'How the app works, in a few minutes. Every section below has a link that opens it.',
    quickStart: 'Quick start',
    map: 'What’s where',
    howTo: 'How to use it',
    goodToKnow: 'Good to know',
    backToMap: '↑ Back to the map',
    open: 'Open {section}',
    pictureOf: 'Picture of {label}',
    storageTitle: 'Where your data lives',
    storageText:
      'Progress, stars, notes, streaks and handwritten notes are saved in this browser only. They don’t follow you to another device or browser, and clearing the browser’s site data removes them.',
    'quick1.title': 'Open your lesson document',
    'quick1.text': 'Use the link from your teacher. Enter the class code if asked (only once).',
    'quick2.title': 'Pick a lesson',
    'quick2.text': 'In <lessons>Lesson history</lessons>, choose a lesson and look at its words.',
    'quick3.title': 'Practise',
    'quick3.text':
      'Start with <b>Flashcards</b>, then the <b>Quiz</b>. Missed words go to <mine>Words to learn</mine>.',
    'quick4.title': 'Come back every day',
    'quick4.text':
      'A round on <home>Home</home> takes a few minutes and keeps your 🔥 streak going.',

    'header.title': 'The top bar',
    'header.summary': 'Your picture, the document, sync, the next lesson, feedback and Settings',
    'header.intro':
      'The bar at the top is always there. It shows which Google Doc the app reads and when it last synced, plus the next lesson and the video call.',
    'header.step1':
      '<b>↻</b> next to the document’s name syncs: it reads the document again. Press it after the teacher adds a lesson. During a lesson (“Lesson now”) the app does it by itself every minute.',
    'header.step2':
      '<b>Next lesson</b> shows the date from the newest line like <ex>le cours prochain: 22.11.2026 18:00 de Paris</ex>. A time given for a city is converted to yours. When the date has passed it says “not confirmed yet”.',
    'header.step3':
      '<b>Enter the lesson</b> sits in the next-lesson widget when the document has a Google Meet or Zoom link, and opens lesson mode: the call next to the lesson and your notes.',
    'header.step4':
      '<b>Open document</b>, <b>Copy student link</b> and <b>Change document</b> are in <b>Settings</b>, under Document.',
    'header.step5':
      '<b>Feedback</b> sends a message to the teacher: a bug, an idea or anything else. Add up to 3 screenshots, or paste one with Ctrl+V / ⌘V. The page you were on is added automatically.',
    'header.step6':
      '<b>⚙️ Settings</b> on the far right: the document, the language of the app, the colour theme, the languages you learn and your level. Your picture, set there, shows on the far left.',
    'header.tip1':
      'A lesson in the document starts with a line like <ex>14.10.2026 1 Leçon</ex> (or <ex>Lesson</ex>, <ex>Lektion</ex>, <ex>Lección</ex>, <ex>Lição</ex>, <ex>Lezione</ex>). Everything under it, up to the next such line, belongs to that lesson.',
    'header.mock': 'the top bar',

    'home.title': 'Home',
    'home.summary': 'A daily round of 10 mixed questions',
    'home.intro':
      'The quickest way to practise every day: 10 questions from all your lessons, with the words you miss coming back more often.',
    'home.step1':
      'Answer each question: pick a translation, pick the word in the language you learn, type it, or write what you hear.',
    'home.step2':
      'After each answer press <pbtn>Next</pbtn>. At the end you see your score and <pbtn>Next round</pbtn>.',
    'home.step3':
      'Answer at least once a day to keep your 🔥 streak; 20 answers complete the day’s goal.',
    'home.tip1':
      'When the teacher writes the homework in the lesson (<ex>Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé</ex>), Home shows it as a checklist, with how long until the next lesson. <btn>Practise the words</btn>, <btn>Fill the gaps</btn> and <btn>Conjugate</btn> open the task’s exercise, and finishing it ticks the task.',
    'home.tip2':
      'A written task (<ex>5 phrases au passé composé</ex>, a translation, “describe your day”) has <btn>Write</btn>: write your answer and press <pbtn>Check</pbtn>. Claude fixes the mistakes, explains each one like a tutor and says whether the answer does what the task asks. In lesson mode, <b>Written homework</b> shows the corrected answers to the teacher.',
    'home.tip3':
      '<btn>Prepare the report</btn> under the homework (and at the bottom of Stats) writes a short report for the teacher: the homework done, answers and mistakes since the lesson, your written answers as Claude corrected them. Read it, change it if you like, and <pbtn>Add to the document</pbtn> puts it under the lesson.',
    'home.tip4':
      'On the day of a lesson and the day after, Home sums it up: “Today, lesson 7: 12 new words, 2 verbs”, its words (key words first) and grammar, with <pbtn>Start revising</pbtn>. ✕ hides it.',
    'home.tip5':
      'In the 24 hours before a lesson (when the document gives its time), Home offers <pbtn>Revise before the lesson</pbtn>: a round on the last lesson’s words and your hard words.',
    'home.mock': 'the streak and daily goal on Home',

    'lessons.title': 'Lesson history',
    'lessons.summary': 'Words, verbs and notes for each lesson',
    'lessons.intro':
      'Every lesson from the document, newest selected. Claude reads it once and prepares the vocabulary with translations, synonym and antonym pairs, and the verbs.',
    'lessons.step1':
      'Pick a lesson in the list on the left (each lesson has its own link you can share).',
    'lessons.step2':
      'Stay on the <b>Words</b> tab. Every word is ticked; untick the ones you don’t want, or use <b>Pick all</b>, <b>Clear</b> and the filter box.',
    'lessons.step3':
      'Start an exercise from the row of buttons: <pbtn>Quiz</pbtn> <btn>Flashcards</btn> <btn>Match translations</btn> <btn>Synonyms & antonyms</btn> <btn>Fill the gap</btn> <btn>Dictation</btn>',
    'lessons.step4': 'Press 🔊 to hear a word and ☆ to put it on <b>Words to learn</b>.',
    'lessons.step5':
      'Double-click any word or phrase in the language you learn (on a phone, hold it) for its menu: <b>Translate</b> in that sentence, <b>Define</b>, <b>Examples</b> and, for a verb, <b>Conjugate</b>. <btn>Add to lesson 1</btn> writes it under the lesson, and it joins the exercises.',
    'lessons.tip1': '<added>✱</added> marks a translation Claude added that isn’t in the notes.',
    'lessons.tip2':
      '<b>Flashcards</b>: <key>Space</key> flips the card, <key>←</key> means “again”, <key>→</key> means “I know it”. The toggle on top switches the direction.',
    'lessons.tip3':
      'At the bottom: <b>Export words for Anki</b> saves the ticked words as a file (in Anki: File → Import), and <b>Prepare this lesson again</b> asks Claude to re-read an edited lesson.',
    'lessons.tip4':
      '<b>My notes</b> is your notepad for the lesson, saved as you type. <b>Original</b> shows the lesson exactly as written.',
    'lessons.tip5':
      '<b>Grammar</b> explains every grammar point of the lesson, with <pbtn>Practise this rule</pbtn> for sentences on it. <b>Homework</b> lists what to do; tick tasks off as you finish. <b>Book exercises</b> shows exercises from the book, and imports new ones from photos or a PDF into the lesson in the document. Under <b>My notes</b> you find the board and the lesson-mode notes from that day.',
    'lessons.tip6':
      'A word the teacher marks with ★ in the document (<ex>★ la boulangerie — пекарня</ex>) is a <b>key word</b>: it has a <b>key</b> badge and comes up more often in exercises.',
    'lessons.tip7':
      'For the teacher: under <b>Homework</b>, <btn>Make homework with Claude</btn> writes a <ex>Devoirs:</ex> block from the lesson’s words and grammar (key words first). Check it, press <pbtn>Add to this lesson</pbtn>, and the student finds it on Home as a checklist.',
    'lessons.mock': 'the Words tab of a lesson',

    'verbs.title': 'Verbs',
    'verbs.summary': 'Conjugation tables and drills (Verbs tab of a lesson)',
    'verbs.intro':
      'The <b>Verbs</b> tab of a lesson in any language but English has a conjugation table for every verb in it: French in six tenses, affirmative and negative; German, Spanish, Italian and Portuguese in their five or six main tenses.',
    'verbs.step1': 'Press a verb to open its table.',
    'verbs.step2':
      'Choose a tense (présent, passé composé, imparfait, futur simple, conditionnel présent, impératif) and <b>affirmative</b> or <b>negative</b>. 🔊 reads each form.',
    'verbs.step3':
      'Press <pbtn>Practise this tense</pbtn>, fill in every person, then <pbtn>Check answers</pbtn>. Wrong forms show the right one underneath.',
    'verbs.step4': '<btn>Quick quiz</btn> asks random forms of every verb you’ve opened.',
    'verbs.tip1':
      'Type a form with or without the pronoun: both “nous réveillons” and “réveillons” count.',
    'verbs.tip2':
      'Capital letters and punctuation don’t matter. A missing accent counts as “almost”, not wrong.',
    'verbs.tip3':
      'If a table looks wrong, <b>Conjugate again</b> (next to the past participle) asks for a fresh one.',
    'verbs.mock': 'a verb table',

    'all-lessons.title': 'Downloaded lessons',
    'all-lessons.summary': 'The same exercises, on several lessons at once',
    'all-lessons.intro': 'Every word and verb exercise, on all prepared lessons together.',
    'all-lessons.step1':
      'Leave <b>All</b> selected, or tap lesson chips to practise only a few lessons.',
    'all-lessons.step2':
      'Use the <b>Words</b> and <b>Verbs</b> tabs exactly as in a single lesson.',
    'all-lessons.mock': 'lesson chips',

    'my-words.title': 'Words to learn',
    'my-words.summary': 'Your personal list of words to work on',
    'my-words.intro':
      'Words you starred with ☆ and words you got wrong in any exercise. The number next to <b>Words to learn</b> in the menu shows how many there are.',
    'my-words.step1': 'Practise them with the same exercises as in a lesson.',
    'my-words.step2':
      'A word leaves the list after <b>3 right answers in a row</b> in any exercise (<b>I know it</b> on a flashcard counts too), or when you take its ★ off. The dots next to it, like ●●○, show how far it has got; a mistake starts the count again.',

    'mistakes.title': 'Mistakes',
    'mistakes.summary': 'The words and verb forms you miss most',
    'mistakes.intro':
      'Your most frequent mistakes, words and verb forms, with how often you missed each.',
    'mistakes.step1': 'Press <pbtn>Practise my mistakes</pbtn> for a round made only of them.',

    'stats.title': 'Stats',
    'stats.summary': 'Your progress and weak spots',
    'stats.intro':
      'How many words you’ve learned, which lessons, kinds of words and tenses are hardest for you, and your most common mistakes.',
    'stats.step1': 'Check it now and then to choose what to review next.',

    'photo.title': 'Photo parsing',
    'photo.summary': 'Underlined words, handwritten notes, or a textbook PDF',
    'photo.intro':
      'Three ways to bring words in from paper. Choose one with the switch at the top.',
    'photo.step1':
      '<b>Underlined words</b>: underline words in a book, press <pbtn>Choose or take photos</pbtn> (up to 10 pages at once), and get one table with the translation in context, the dictionary form, the tense and a short explanation.',
    'photo.step2':
      '<b>Handwritten notes</b>: photograph up to 4 pages of notes, fix anything misread (unreadable words are marked [?]), then press <pbtn>Prepare lesson</pbtn> to get words, verbs and exercises as for any lesson.',
    'photo.step3':
      '<b>Textbook PDF</b>: press <pbtn>Choose a PDF</pbtn>, enter the pages of one chapter (up to 20), then <pbtn>Read these pages</pbtn>. Claude writes lesson notes: words, phrases, grammar and examples. Check them and press <pbtn>Prepare lesson</pbtn>.',
    'photo.step4':
      '<btn>Add to the document as Leçon 8</btn> adds what was read to the end of the document as a new lesson (needs a one-time setup on the server, see the README). For underlined words, <b>Add to</b> can also put them under one of your lessons instead.',
    'photo.tip1':
      'Take the photo straight on, in good light, with the whole marked line in the frame.',
    'photo.tip2': '☆ next to a word puts its dictionary form on Words to learn.',
    'photo.mock': 'the result of a photo with underlined words',

    'text.title': 'Text analysis',
    'text.summary': 'Paste an article: explanations, a translation and exercises',
    'text.intro':
      'For a text you found yourself: an article, a story, a post. Paste it instead of taking a screenshot, and work with it here.',
    'text.step1':
      'Paste the text and press <pbtn>Read this text</pbtn>. It is saved on this device, with everything you do with it.',
    'text.step2':
      'Click a word, or select a few words with the mouse or your finger, then press <pbtn>Explain</pbtn>: you get the translation in this sentence, the dictionary form, the tense and a short explanation. ☆ puts the word on Words to learn.',
    'text.step3':
      '<btn>Translate the text</btn> shows a Russian translation under each paragraph; the same button hides it again.',
    'text.step4':
      '<pbtn>Make questions and exercises</pbtn>: Claude picks the words worth learning (with the usual Quiz, Flashcards and the other exercises), writes questions about the text, and a true-or-false exercise.',
    'text.tip1': 'Words you already asked about are underlined with dots in the text.',
    'text.tip2': 'The words are chosen for your level in that language, set in Settings.',
    'discuss.title': 'A question for discussion',
    'discuss.summary': 'A discussion question to start the lesson',
    'discuss.intro':
      'A question to talk about at the start of a lesson, written for your level and the grammar you are practising.',
    'discuss.step1': 'Choose the language and your <b>level</b> (A1–C2).',
    'discuss.step2':
      'Pick a <b>vocabulary topic</b>: from the list or from your lessons, or write any topic of your own under <b>Or your own topic</b>: a TV series, a hobby, new slang words. Pick a <b>grammar topic</b>, or leave <b>Any</b>.',
    'discuss.step3':
      'Press <pbtn>Write a question</pbtn>. You get the question (🔊 reads it, <b>Show translation</b> shows it in Russian), follow-up questions, sentence beginnings that use the grammar, and useful words. With a grammar topic, <b>📘 The rule</b> opens an explanation with examples.',
    'discuss.step4': '<pbtn>Another question</pbtn> writes a new one with the same settings.',
    'discuss.tip1': '☆ next to a useful word puts it on Words to learn.',

    'settings.title': 'Settings',
    'settings.summary': 'Language, theme, what you learn, your level and the menu',
    'settings.intro':
      'Opens from <b>⚙️ Settings</b> on the right of the top bar. Everything saves straight away.',
    'settings.step1':
      '<b>Profile</b>: add a picture and your name; the name is used in Zoom calls and in messages to the teacher.',
    'settings.step2':
      '<b>Interface</b>: the language of the app (English, Russian, French, German, Spanish, Portuguese, Italian) and the colour theme: like the system, light or dark.',
    'settings.step3':
      '<b>Learning</b>: tick the languages you learn and choose your level in each. Exercises, Words to learn, Mistakes, Stats and the discussion questions then show only those languages, and the level is the default for discussion questions and in Fill the gap.',
    'settings.step4':
      'Also there: the daily goal for the 🔥 streak, the speed of 🔊, which sections the menu shows and which tabs a lesson page shows.',
    'settings.tip1': 'Translations of words stay in Russian whatever the interface language.',
    'call.title': 'Lesson mode',
    'call.summary': 'The call, notes and the lesson’s words on one screen',
    'call.intro':
      'Opens from <b>Enter the lesson</b> in the next-lesson widget at the top when the document has a Google Meet or Zoom link. Made for the lesson itself.',
    'call.step1':
      '<b>Google Meet</b>: press <pbtn>Open the call in a small window</pbtn>. Meet can’t run inside other websites, so it opens as a small window at the side of the screen.',
    'call.step2':
      '<b>Zoom</b>: enter your name and press <pbtn>Join here</pbtn>. The call runs inside the page, in a window you can move and resize (needs a one-time Zoom setup on the server, see the README).',
    'call.step3':
      'Write in <b>Lesson notes</b> during the lesson: new words as “mot — перевод”, mistakes, homework. <btn>⏱ Time</btn> marks when something came up.',
    'call.step4':
      'After the lesson, <btn>Add to the document as Leçon 8</btn> puts the notes into the document as a new lesson, ready for exercises.',
    'call.step5':
      '<pbtn>Open the board</pbtn> under the notes: write, draw and paste pictures. With live sharing set up, the teacher and the student draw on the same board at once and see each other’s pointer; otherwise share your screen in the call. <b>Full screen</b> and <b>Save as picture</b> are above it.',
    'call.step6':
      '<pbtn>Start the warm-up</pbtn> at the start of the lesson: about 5 minutes of questions on the previous lesson and on the student’s mistakes since. At the end, <b>Didn’t stick</b> lists every wrong answer for the teacher. Do it on the student’s device, where the mistakes are kept, and share the screen.',
    'call.step7':
      '<pbtn>Play</pbtn> under <b>Quiz game</b>: 10 questions on the lesson’s words, 15 seconds each, and a fast right answer scores more. Play it on the shared screen; the best rounds go into the <b>Records</b> table.',
    'call.tip3':
      '<btn>Side by side (half the screen)</btn> opens Meet over the right half of the screen, next to the app.',
    'call.tip1':
      'The notes are saved on this device for each day, so closing the page loses nothing.',
    'call.tip2':
      'In Chrome, Meet can float above every window: in Meet, open ⋮ and choose picture-in-picture.',
    'document.title': 'Document',
    'document.summary': 'Edit the Google Doc without leaving the app',
    'document.intro': 'The Google Docs editor inside the app, for writing lessons.',
    'document.step1': 'Edit as usual: changes save to Google Docs.',
    'document.step2': 'When you go to another section, the app syncs and the lessons update.',
    'document.tip1':
      'If the editor stays blank or asks you to sign in (often in Safari), use the link above it to open the document in a new tab.',
    'news.title': 'News',
    'news.summary': 'What changed in the app, by date',
    'news.intro': 'Every change to the app, newest first.',
    'news.step1':
      'Each day lists what is <b>New</b>, <b>Improved</b> and <b>Fixed</b>. A dot next to <b>News</b> in the menu means there is something you haven’t seen yet.',
    'news.step2':
      'New and improved features are on <b>What’s new</b>, bug fixes on <b>Bug fixes</b>. If you learn several languages, pick one under <b>Language</b>: you see its news and the news for every language.',
  },
  ru: {
    title: 'Инструкция',
    intro:
      'Как устроено приложение — за пару минут. У каждого раздела ниже есть ссылка, чтобы его открыть.',
    quickStart: 'Быстрый старт',
    map: 'Что где',
    howTo: 'Как пользоваться',
    goodToKnow: 'Полезно знать',
    backToMap: '↑ К списку разделов',
    open: 'Открыть «{section}»',
    pictureOf: 'Картинка: {label}',
    storageTitle: 'Где хранятся ваши данные',
    storageText:
      'Прогресс, звёздочки, заметки, серии и рукописные заметки хранятся только в этом браузере. На другое устройство или в другой браузер они не переносятся, а очистка данных сайта в браузере их удаляет.',
    'quick1.title': 'Откройте документ с уроками',
    'quick1.text':
      'Перейдите по ссылке от преподавателя. Если попросят, введите код класса (один раз).',
    'quick2.title': 'Выберите урок',
    'quick2.text':
      'В разделе <lessons>История уроков</lessons> выберите урок и посмотрите его слова.',
    'quick3.title': 'Тренируйтесь',
    'quick3.text':
      'Начните с <b>Карточек</b>, потом пройдите <b>Тест</b>. Слова с ошибками попадут в <mine>Слова на изучении</mine>.',
    'quick4.title': 'Возвращайтесь каждый день',
    'quick4.text':
      'Раунд на <home>Главной</home> занимает несколько минут и поддерживает вашу 🔥 серию.',

    'header.title': 'Верхняя панель',
    'header.summary':
      'Ваша картинка, документ, синхронизация, следующий урок, обратная связь и настройки',
    'header.intro':
      'Панель наверху видна всегда. На ней — какой Google-документ читает приложение и когда он синхронизировался, а также следующий урок и видеозвонок.',
    'header.step1':
      '<b>↻</b> рядом с названием документа синхронизирует: заново читает документ. Нажмите, когда преподаватель добавил урок. Во время урока («Урок идёт») приложение делает это само каждую минуту.',
    'header.step2':
      '<b>Следующий урок</b> показывает дату из самой новой строки вроде <ex>le cours prochain: 22.11.2026 18:00 de Paris</ex>. Время, указанное для города, переводится в ваше. Если дата прошла, будет написано «пока не подтверждена».',
    'header.step3':
      '<b>Войти в урок</b> появляется в виджете следующего урока, если в документе есть ссылка на Google Meet или Zoom, и открывает режим урока: звонок рядом с уроком и заметками.',
    'header.step4':
      '<b>Открыть документ</b>, <b>Ссылка для ученика</b> и <b>Сменить документ</b> находятся в <b>Настройках</b>, в разделе «Документ».',
    'header.step5':
      '<b>Обратная связь</b> отправляет сообщение преподавателю: ошибка, идея или что угодно. Можно приложить до 3 скриншотов или вставить скриншот через Ctrl+V / ⌘V. Страница, на которой вы были, добавится сама.',
    'header.step6':
      '<b>⚙️ Настройки</b> справа: документ, язык приложения, цветовая тема, изучаемые языки и уровень. Ваша картинка, выбранная там, видна слева.',
    'header.tip1':
      'Урок в документе начинается со строки вроде <ex>14.10.2026 1 Leçon</ex> (или <ex>Lesson</ex>, <ex>Lektion</ex>, <ex>Lección</ex>, <ex>Lição</ex>, <ex>Lezione</ex>). Всё ниже неё, до следующей такой строки, относится к этому уроку.',
    'header.mock': 'верхняя панель',

    'home.title': 'Главная',
    'home.summary': 'Ежедневный раунд из 10 вопросов вперемешку',
    'home.intro':
      'Самый быстрый способ заниматься каждый день: 10 вопросов из всех уроков, причём слова с ошибками возвращаются чаще.',
    'home.step1':
      'Отвечайте на каждый вопрос: выберите перевод, выберите слово на изучаемом языке, напечатайте его или запишите то, что услышали.',
    'home.step2':
      'После каждого ответа нажимайте <pbtn>Дальше</pbtn>. В конце вы увидите результат и <pbtn>Следующий раунд</pbtn>.',
    'home.step3':
      'Отвечайте хотя бы раз в день, чтобы не прервать 🔥 серию; 20 ответов — цель на день.',
    'home.tip1':
      'Когда преподаватель пишет в уроке домашнее задание (<ex>Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé</ex>), на Главной появляется чек-лист и сколько осталось до урока. <btn>Повторить слова</btn>, <btn>Вставить слова</btn> и <btn>Проспрягать</btn> открывают упражнение к заданию, а когда оно закончено, галочка ставится сама.',
    'home.tip2':
      'У письменного задания (<ex>5 phrases au passé composé</ex>, перевод, «опиши свой день») есть кнопка <btn>Написать</btn>: напишите ответ и нажмите <pbtn>Проверить</pbtn>. Claude исправит ошибки, коротко объяснит каждую, как репетитор, и скажет, выполнено ли задание. В режиме урока <b>Письменное домашнее задание</b> показывает преподавателю исправленные ответы.',
    'home.tip3':
      '<btn>Подготовить отчёт</btn> под домашним заданием (и внизу Статистики) собирает короткий отчёт для преподавателя: что сделано, ответы и ошибки с урока, письменные ответы, исправленные Claude. Прочитайте, при желании поправьте, и <pbtn>Добавить в документ</pbtn> поместит его под урок.',
    'home.tip4':
      'В день урока и на следующий день Главная подводит его итог: «Сегодня, урок 7: 12 новых слов, 2 глагола», его слова (сначала ключевые) и грамматика, с кнопкой <pbtn>Начать повторение</pbtn>. ✕ скрывает карточку.',
    'home.tip5':
      'За сутки до урока (если в документе указано его время) Главная предлагает <pbtn>Повторить перед уроком</pbtn>: раунд по словам прошлого урока и вашим сложным словам.',
    'home.mock': 'серия и цель дня на Главной',

    'lessons.title': 'История уроков',
    'lessons.summary': 'Слова, глаголы и заметки к каждому уроку',
    'lessons.intro':
      'Все уроки из документа, выбран самый новый. Claude один раз читает урок и готовит лексику с переводами, пары синонимов и антонимов и глаголы.',
    'lessons.step1':
      'Выберите урок в списке слева (у каждого урока своя ссылка, ею можно поделиться).',
    'lessons.step2':
      'Оставайтесь на вкладке <b>Слова</b>. Все слова отмечены; снимите галочки с ненужных или используйте <b>Выбрать все</b>, <b>Снять выбор</b> и поиск.',
    'lessons.step3':
      'Запустите упражнение кнопкой: <pbtn>Тест</pbtn> <btn>Карточки</btn> <btn>Найдите перевод</btn> <btn>Синонимы и антонимы</btn> <btn>Вставьте слово</btn> <btn>Диктант</btn>',
    'lessons.step4':
      'Нажмите 🔊, чтобы услышать слово, и ☆, чтобы добавить его в <b>Слова на изучении</b>.',
    'lessons.step5':
      'Дважды щёлкните по любому слову или фразе на изучаемом языке (на телефоне — удерживайте палец), чтобы открыть меню: <b>Перевести</b> в этом предложении, <b>Определение</b>, <b>Примеры</b> и, для глагола, <b>Проспрягать</b>. <btn>Добавить в урок 1</btn> добавляет слово в урок, и оно попадает в упражнения.',
    'lessons.tip1':
      '<added>✱</added> отмечает перевод, который добавил Claude: в записях его не было.',
    'lessons.tip2':
      '<b>Карточки</b>: <key>Пробел</key> переворачивает карточку, <key>←</key> — «ещё раз», <key>→</key> — «знаю». Переключатель сверху меняет направление.',
    'lessons.tip3':
      'Внизу: <b>Экспорт слов в Anki</b> сохраняет отмеченные слова в файл (в Anki: Файл → Импорт), а <b>Подготовить урок заново</b> просит Claude перечитать изменённый урок.',
    'lessons.tip4':
      '<b>Мои заметки</b> — ваш блокнот к уроку, сохраняется по мере набора. <b>Оригинал</b> показывает урок так, как он записан.',
    'lessons.tip5':
      '<b>Грамматика</b> объясняет каждую тему урока, а <pbtn>Потренировать это правило</pbtn> даёт предложения на неё. <b>Домашнее задание</b> — список того, что нужно сделать; отмечайте выполненное. <b>Упражнения из учебника</b> показывает упражнения из книги и добавляет новые с фото или PDF в урок в документе. В <b>Моих заметках</b> — доска и заметки из режима урока за тот день.',
    'lessons.tip6':
      'Слово, которое преподаватель отметил в документе звёздочкой (<ex>★ la boulangerie — пекарня</ex>), — <b>ключевое</b>: у него метка <b>ключевое</b>, и в упражнениях оно встречается чаще.',
    'lessons.tip7':
      'Для преподавателя: во вкладке <b>Домашнее задание</b> кнопка <btn>Составить с Claude</btn> пишет блок <ex>Devoirs:</ex> по словам и грамматике урока (сначала ключевые слова). Проверьте, нажмите <pbtn>Добавить в этот урок</pbtn>, и ученик увидит его на Главной чек-листом.',
    'lessons.mock': 'вкладка «Слова» в уроке',

    'verbs.title': 'Глаголы',
    'verbs.summary': 'Таблицы спряжения и тренировка (вкладка «Глаголы» в уроке)',
    'verbs.intro':
      'На вкладке <b>Глаголы</b> урока на любом языке, кроме английского, есть таблица спряжения для каждого глагола: французские — в шести временах, утвердительная и отрицательная формы; немецкие, испанские, итальянские и португальские — в пяти-шести основных временах.',
    'verbs.step1': 'Нажмите на глагол, чтобы открыть его таблицу.',
    'verbs.step2':
      'Выберите время (présent, passé composé, imparfait, futur simple, conditionnel présent, impératif) и <b>утверждение</b> или <b>отрицание</b>. 🔊 читает каждую форму.',
    'verbs.step3':
      'Нажмите <pbtn>Тренировать это время</pbtn>, заполните все лица, затем <pbtn>Проверить ответы</pbtn>. Под неверной формой появится правильная.',
    'verbs.step4': '<btn>Быстрый тест</btn> спрашивает случайные формы всех открытых глаголов.',
    'verbs.tip1':
      'Форму можно писать с местоимением или без: засчитаются и «nous réveillons», и «réveillons».',
    'verbs.tip2':
      'Заглавные буквы и знаки препинания не важны. Пропущенный диакритический знак — это «почти», а не ошибка.',
    'verbs.tip3':
      'Если таблица выглядит неправильно, <b>Проспрягать заново</b> (рядом с причастием) попросит новую.',
    'verbs.mock': 'таблица глагола',

    'all-lessons.title': 'Загруженные уроки',
    'all-lessons.summary': 'Те же упражнения сразу по нескольким урокам',
    'all-lessons.intro': 'Все упражнения на слова и глаголы по всем подготовленным урокам вместе.',
    'all-lessons.step1':
      'Оставьте выбранным <b>Все</b> или нажмите на нужные уроки, чтобы тренировать только их.',
    'all-lessons.step2':
      'Пользуйтесь вкладками <b>Слова</b> и <b>Глаголы</b> так же, как в отдельном уроке.',
    'all-lessons.mock': 'выбор уроков',

    'my-words.title': 'Слова на изучении',
    'my-words.summary': 'Ваш личный список слов для повторения',
    'my-words.intro':
      'Слова, отмеченные ☆, и слова, в которых вы ошиблись в любом упражнении. Число рядом с <b>Слова на изучении</b> в меню показывает, сколько их.',
    'my-words.step1': 'Тренируйте их теми же упражнениями, что и в уроке.',
    'my-words.step2':
      'Слово уходит из списка после <b>3 верных ответов подряд</b> в любом упражнении (<b>Знаю</b> на карточке тоже считается) или если снять с него ★. Точки рядом со словом, например ●●○, показывают, сколько уже пройдено; после ошибки счёт начинается заново.',

    'mistakes.title': 'Ошибки',
    'mistakes.summary': 'Слова и формы глаголов, в которых вы ошибаетесь чаще всего',
    'mistakes.intro':
      'Ваши самые частые ошибки — слова и формы глаголов — и сколько раз вы в них ошиблись.',
    'mistakes.step1': 'Нажмите <pbtn>Тренировать ошибки</pbtn>, чтобы пройти раунд только из них.',

    'stats.title': 'Статистика',
    'stats.summary': 'Ваш прогресс и слабые места',
    'stats.intro':
      'Сколько слов вы выучили, какие уроки, части речи и времена даются труднее всего и какие ошибки самые частые.',
    'stats.step1': 'Заглядывайте сюда время от времени, чтобы решить, что повторить.',

    'photo.title': 'Разбор фото',
    'photo.summary': 'Подчёркнутые слова, рукописные заметки или учебник в PDF',
    'photo.intro': 'Три способа перенести слова с бумаги. Выберите нужный переключателем сверху.',
    'photo.step1':
      '<b>Подчёркнутые слова</b>: подчеркните слова в книге, нажмите <pbtn>Выбрать или сделать фото</pbtn> (до 10 страниц за раз) — и получите одну таблицу с переводом в контексте, словарной формой, временем и коротким объяснением.',
    'photo.step2':
      '<b>Рукописные заметки</b>: сфотографируйте до 4 страниц записей, исправьте неверно прочитанное (неразборчивые слова отмечены [?]) и нажмите <pbtn>Подготовить урок</pbtn> — получите слова, глаголы и упражнения, как в любом уроке.',
    'photo.step3':
      '<b>Учебник (PDF)</b>: нажмите <pbtn>Выбрать PDF</pbtn>, укажите страницы одной главы (до 20), затем <pbtn>Прочитать эти страницы</pbtn>. Claude составит записи урока: слова, фразы, грамматику и примеры. Проверьте их и нажмите <pbtn>Подготовить урок</pbtn>.',
    'photo.step4':
      '<btn>Добавить в документ как Leçon 8</btn> добавляет прочитанное в конец документа новым уроком (нужна разовая настройка на сервере, см. README). Подчёркнутые слова можно вместо этого добавить к одному из ваших уроков: выберите его в списке <b>Куда добавить</b>.',
    'photo.tip1': 'Снимайте прямо, при хорошем свете, чтобы вся отмеченная строка попала в кадр.',
    'photo.tip2': '☆ рядом со словом добавляет его словарную форму в «Слова на изучении».',
    'photo.mock': 'результат фото с подчёркнутыми словами',

    'text.title': 'Разбор текста',
    'text.summary': 'Вставьте статью: объяснения, перевод и упражнения',
    'text.intro':
      'Для текста, который вы нашли сами: статья, рассказ, пост. Вставьте его вместо скриншота и работайте с ним здесь.',
    'text.step1':
      'Вставьте текст и нажмите <pbtn>Читать этот текст</pbtn>. Он сохраняется на этом устройстве вместе со всем, что вы с ним сделали.',
    'text.step2':
      'Нажмите на слово или выделите несколько слов мышью или пальцем, затем нажмите <pbtn>Объяснить</pbtn>: вы получите перевод в этом предложении, словарную форму, время и короткое объяснение. ☆ добавляет слово в «Слова на изучении».',
    'text.step3':
      '<btn>Перевести текст</btn> показывает русский перевод под каждым абзацем; та же кнопка его скрывает.',
    'text.step4':
      '<pbtn>Составить вопросы и упражнения</pbtn>: Claude выберет слова, которые стоит выучить (с обычными упражнениями — тест, карточки и остальные), составит вопросы по тексту и упражнение «верно или неверно».',
    'text.tip1': 'Слова, о которых вы уже спрашивали, подчёркнуты в тексте точками.',
    'text.tip2': 'Слова подбираются под ваш уровень в этом языке, он задаётся в «Настройках».',
    'discuss.title': 'Вопрос для обсуждения',
    'discuss.summary': 'Вопрос для разговора в начале урока',
    'discuss.intro':
      'Вопрос, чтобы поговорить в начале урока, под ваш уровень и грамматику, которую вы тренируете.',
    'discuss.step1': 'Выберите язык и свой <b>уровень</b> (A1–C2).',
    'discuss.step2':
      'Выберите <b>лексическую тему</b>: из списка или из ваших уроков — или впишите любую свою в поле <b>Или своя тема</b>: сериал, хобби, новые сленговые слова. Выберите <b>грамматическую тему</b> или оставьте <b>Любая</b>.',
    'discuss.step3':
      'Нажмите <pbtn>Придумать вопрос</pbtn>. Вы получите вопрос (🔊 прочитает его, <b>Показать перевод</b> покажет его по-русски), вопросы для продолжения разговора, начала фраз с нужной грамматикой и полезные слова. Если выбрана грамматика, <b>📘 Правило</b> раскрывает объяснение с примерами.',
    'discuss.step4': '<pbtn>Другой вопрос</pbtn> придумает новый с теми же настройками.',
    'discuss.tip1': '☆ рядом с полезным словом добавляет его в «Слова на изучении».',

    'settings.title': 'Настройки',
    'settings.summary': 'Язык, тема, что вы учите, уровень и меню',
    'settings.intro':
      'Открываются кнопкой <b>⚙️ Настройки</b> справа в верхней панели. Всё сохраняется сразу.',
    'settings.step1':
      '<b>Профиль</b>: добавьте картинку и имя; имя используется в звонках Zoom и в сообщениях преподавателю.',
    'settings.step2':
      '<b>Интерфейс</b>: язык приложения (английский, русский, французский, немецкий, испанский, португальский, итальянский) и цветовая тема: как в системе, светлая или тёмная.',
    'settings.step3':
      '<b>Обучение</b>: отметьте языки, которые учите, и выберите уровень для каждого. Упражнения, «Слова на изучении», «Ошибки», «Статистика» и «Вопрос для обсуждения» покажут только эти языки, а уровень подставится в «Вопрос для обсуждения» и «Вставьте слово».',
    'settings.step4':
      'Ещё там: цель на день для 🔥 серии, скорость озвучки 🔊, какие разделы показывать в меню и какие вкладки — на странице урока.',
    'settings.tip1': 'Переводы слов остаются на русском при любом языке интерфейса.',
    'call.title': 'Режим урока',
    'call.summary': 'Звонок, заметки и слова урока на одном экране',
    'call.intro':
      'Открывается кнопкой <b>Войти в урок</b> в виджете следующего урока наверху, если в документе есть ссылка на Google Meet или Zoom. Для самого урока.',
    'call.step1':
      '<b>Google Meet</b>: нажмите <pbtn>Открыть звонок в маленьком окне</pbtn>. Meet нельзя встроить в другие сайты, поэтому он открывается маленьким окном сбоку экрана.',
    'call.step2':
      '<b>Zoom</b>: введите своё имя и нажмите <pbtn>Подключиться здесь</pbtn>. Звонок идёт прямо на странице, в окне, которое можно двигать и менять по размеру (нужна разовая настройка Zoom на сервере, см. README).',
    'call.step3':
      'Во время урока пишите в <b>Заметки урока</b>: новые слова в виде «mot — перевод», ошибки, домашнее задание. <btn>⏱ Время</btn> отмечает, когда что-то прозвучало.',
    'call.step4':
      'После урока <btn>Добавить в документ как Leçon 8</btn> переносит заметки в документ новым уроком — сразу с упражнениями.',
    'call.step5':
      '<pbtn>Открыть доску</pbtn> под заметками: пишите, рисуйте, вставляйте картинки. Если настроен общий доступ, преподаватель и ученик рисуют на одной доске одновременно и видят указатель друг друга; иначе покажите экран в звонке. Над ней — <b>На весь экран</b> и <b>Сохранить картинкой</b>.',
    'call.step6':
      '<pbtn>Начать разминку</pbtn> в начале урока: минут 5 вопросов по прошлому уроку и ошибкам ученика с тех пор. В конце <b>Не закрепилось</b> показывает преподавателю все неверные ответы. Делайте на устройстве ученика, где хранятся ошибки, и покажите экран.',
    'call.step7':
      '<pbtn>Играть</pbtn> в карточке <b>Игра-квиз</b>: 10 вопросов по словам урока, на каждый 15 секунд, и чем быстрее верный ответ, тем больше очков. Играйте на общем экране; лучшие раунды попадают в таблицу <b>Рекорды</b>.',
    'call.tip3':
      '<btn>Рядом (половина экрана)</btn> открывает Meet на правой половине экрана, рядом с приложением.',
    'call.tip1':
      'Заметки сохраняются на этом устройстве отдельно на каждый день — если закрыть страницу, ничего не пропадёт.',
    'call.tip2':
      'В Chrome Meet может висеть поверх всех окон: в Meet откройте ⋮ и выберите «картинка в картинке».',
    'document.title': 'Документ',
    'document.summary': 'Редактирование Google-документа прямо в приложении',
    'document.intro': 'Редактор Google Docs внутри приложения, чтобы писать уроки.',
    'document.step1': 'Редактируйте как обычно: изменения сохраняются в Google Docs.',
    'document.step2':
      'Когда вы переходите в другой раздел, приложение синхронизируется и уроки обновляются.',
    'document.tip1':
      'Если редактор пустой или просит войти (часто в Safari), откройте документ в новой вкладке по ссылке над ним.',
    'news.title': 'Новости',
    'news.summary': 'Что изменилось в приложении, по датам',
    'news.intro': 'Все изменения в приложении, сначала самые новые.',
    'news.step1':
      'Для каждого дня указано, что <b>Новое</b>, что <b>Улучшено</b> и что <b>Исправлено</b>. Точка рядом с <b>Новостями</b> в меню значит, что есть что-то, чего вы ещё не видели.',
    'news.step2':
      'Новые и улучшенные возможности — во вкладке <b>Что нового</b>, исправленные ошибки — во вкладке <b>Исправления ошибок</b>. Если вы изучаете несколько языков, выберите один в поле <b>Язык</b>: вы увидите его новости и новости для всех языков.',
  },
  fr: {
    title: 'Guide',
    intro:
      'Comment marche l’application, en quelques minutes. Chaque section ci-dessous a un lien pour l’ouvrir.',
    quickStart: 'Pour commencer',
    map: 'Où trouver quoi',
    howTo: 'Mode d’emploi',
    goodToKnow: 'Bon à savoir',
    backToMap: '↑ Retour au plan',
    open: 'Ouvrir {section}',
    pictureOf: 'Image : {label}',
    storageTitle: 'Où sont vos données',
    storageText:
      'Progrès, étoiles, notes, séries et notes manuscrites sont enregistrés dans ce navigateur uniquement. Ils ne vous suivent pas sur un autre appareil ou navigateur, et effacer les données du site les supprime.',
    'quick1.title': 'Ouvrez votre document de cours',
    'quick1.text':
      'Utilisez le lien de votre professeur. Saisissez le code de la classe si on vous le demande (une seule fois).',
    'quick2.title': 'Choisissez une leçon',
    'quick2.text':
      'Dans <lessons>Historique des leçons</lessons>, choisissez une leçon et regardez ses mots.',
    'quick3.title': 'Entraînez-vous',
    'quick3.text':
      'Commencez par les <b>Cartes</b>, puis le <b>Quiz</b>. Les mots ratés vont dans les <mine>Mots à apprendre</mine>.',
    'quick4.title': 'Revenez chaque jour',
    'quick4.text':
      'Un tour sur l’<home>Accueil</home> prend quelques minutes et entretient votre 🔥 série.',

    'header.title': 'La barre du haut',
    'header.summary':
      'Votre image, le document, la synchronisation, le prochain cours, l’avis et les réglages',
    'header.intro':
      'La barre du haut est toujours là. Elle montre quel Google Doc l’application lit et quand il a été synchronisé, ainsi que le prochain cours et l’appel vidéo.',
    'header.step1':
      '<b>↻</b> à côté du nom du document synchronise : il relit le document. Appuyez dessus quand le professeur a ajouté une leçon. Pendant un cours (« Cours en cours »), l’application le fait seule chaque minute.',
    'header.step2':
      '<b>Prochain cours</b> affiche la date de la ligne la plus récente comme <ex>le cours prochain: 22.11.2026 18:00 de Paris</ex>. Une heure donnée pour une ville est convertie dans la vôtre. Une fois la date passée, il est écrit « pas encore confirmée ».',
    'header.step3':
      '<b>Entrer dans le cours</b> apparaît dans le widget du prochain cours quand le document contient un lien Google Meet ou Zoom et ouvre le mode cours : l’appel à côté de la leçon et de vos notes.',
    'header.step4':
      '<b>Ouvrir le document</b>, <b>Copier le lien élève</b> et <b>Changer de document</b> se trouvent dans les <b>Réglages</b>, sous Document.',
    'header.step5':
      '<b>Avis</b> envoie un message au professeur : un bug, une idée ou autre chose. Ajoutez jusqu’à 3 captures d’écran, ou collez-en une avec Ctrl+V / ⌘V. La page où vous étiez est ajoutée automatiquement.',
    'header.step6':
      '<b>⚙️ Réglages</b> tout à droite : le document, la langue de l’application, le thème, les langues apprises et votre niveau. Votre image, choisie là, s’affiche tout à gauche.',
    'header.tip1':
      'Une leçon commence dans le document par une ligne comme <ex>14.10.2026 1 Leçon</ex> (ou <ex>Lesson</ex>, <ex>Lektion</ex>, <ex>Lección</ex>, <ex>Lição</ex>, <ex>Lezione</ex>). Tout ce qui suit, jusqu’à la ligne de ce type suivante, appartient à cette leçon.',
    'header.mock': 'la barre du haut',

    'home.title': 'Accueil',
    'home.summary': 'Un tour quotidien de 10 questions variées',
    'home.intro':
      'Le moyen le plus rapide de pratiquer chaque jour : 10 questions de toutes vos leçons, et les mots ratés reviennent plus souvent.',
    'home.step1':
      'Répondez à chaque question : choisissez une traduction, choisissez le mot dans la langue apprise, tapez-le ou écrivez ce que vous entendez.',
    'home.step2':
      'Après chaque réponse, appuyez sur <pbtn>Suivant</pbtn>. À la fin, vous voyez votre score et <pbtn>Tour suivant</pbtn>.',
    'home.step3':
      'Répondez au moins une fois par jour pour garder votre 🔥 série ; 20 réponses remplissent l’objectif du jour.',
    'home.tip1':
      'Quand le professeur écrit les devoirs dans la leçon (<ex>Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé</ex>), l’accueil les affiche en liste à cocher, avec le temps restant avant le prochain cours. <btn>Réviser les mots</btn>, <btn>Compléter les trous</btn> et <btn>Conjuguer</btn> ouvrent l’exercice de la tâche, et le finir la coche.',
    'home.tip2':
      'Une tâche écrite (<ex>5 phrases au passé composé</ex>, une traduction, « décris ta journée ») a <btn>Écrire</btn> : écrivez votre réponse et appuyez sur <pbtn>Vérifier</pbtn>. Claude corrige les erreurs, explique chacune comme un professeur particulier et dit si la réponse fait ce que demande la tâche. Dans le mode cours, <b>Devoirs écrits</b> montre les réponses corrigées au professeur.',
    'home.tip3':
      '<btn>Préparer le rapport</btn> sous les devoirs (et en bas des Statistiques) rédige un court rapport pour le professeur : les devoirs faits, les réponses et les erreurs depuis le cours, vos réponses écrites corrigées par Claude. Relisez-le, modifiez-le si vous voulez, et <pbtn>Ajouter au document</pbtn> le place sous la leçon.',
    'home.tip4':
      'Le jour d’une leçon et le lendemain, l’accueil la résume : « Aujourd’hui, leçon 7 : 12 nouveaux mots, 2 verbes », ses mots (les mots clés d’abord) et sa grammaire, avec <pbtn>Commencer la révision</pbtn>. ✕ la masque.',
    'home.tip5':
      'Dans les 24 heures avant un cours (quand le document donne son heure), l’accueil propose <pbtn>Réviser avant le cours</pbtn> : un tour sur les mots de la dernière leçon et vos mots difficiles.',
    'home.mock': 'la série et l’objectif du jour sur l’Accueil',

    'lessons.title': 'Historique des leçons',
    'lessons.summary': 'Mots, verbes et notes de chaque leçon',
    'lessons.intro':
      'Toutes les leçons du document, la plus récente sélectionnée. Claude la lit une fois et prépare le vocabulaire avec les traductions, les paires de synonymes et d’antonymes, et les verbes.',
    'lessons.step1':
      'Choisissez une leçon dans la liste à gauche (chaque leçon a son propre lien, que vous pouvez partager).',
    'lessons.step2':
      'Restez sur l’onglet <b>Mots</b>. Tous les mots sont cochés ; décochez ceux dont vous ne voulez pas, ou utilisez <b>Tout choisir</b>, <b>Tout retirer</b> et le filtre.',
    'lessons.step3':
      'Lancez un exercice avec les boutons : <pbtn>Quiz</pbtn> <btn>Cartes</btn> <btn>Associer les traductions</btn> <btn>Synonymes et antonymes</btn> <btn>Texte à trous</btn> <btn>Dictée</btn>',
    'lessons.step4':
      'Appuyez sur 🔊 pour entendre un mot et sur ☆ pour l’ajouter aux <b>Mots à apprendre</b>.',
    'lessons.step5':
      'Double-cliquez sur un mot ou une expression dans la langue que vous apprenez (sur un téléphone, maintenez le doigt dessus) pour ouvrir son menu : <b>Traduire</b> dans cette phrase, <b>Définir</b>, <b>Exemples</b> et, pour un verbe, <b>Conjuguer</b>. <btn>Ajouter à la leçon 1</btn> l’inscrit sous la leçon, et il rejoint les exercices.',
    'lessons.tip1': '<added>✱</added> marque une traduction ajoutée par Claude, absente des notes.',
    'lessons.tip2':
      '<b>Cartes</b> : <key>Espace</key> retourne la carte, <key>←</key> veut dire « encore », <key>→</key> « je sais ». Le bouton du haut change le sens.',
    'lessons.tip3':
      'En bas : <b>Exporter les mots pour Anki</b> enregistre les mots cochés dans un fichier (dans Anki : Fichier → Importer), et <b>Préparer de nouveau cette leçon</b> demande à Claude de relire une leçon modifiée.',
    'lessons.tip4':
      '<b>Mes notes</b> est votre bloc-notes pour la leçon, enregistré pendant la saisie. <b>Original</b> montre la leçon telle qu’elle est écrite.',
    'lessons.tip5':
      '<b>Grammaire</b> explique chaque point de grammaire de la leçon, avec <pbtn>S’entraîner sur cette règle</pbtn> pour des phrases dessus. <b>Devoirs</b> liste ce qu’il faut faire ; cochez au fur et à mesure. <b>Exercices du manuel</b> affiche les exercices du livre et en importe de nouveaux depuis des photos ou un PDF dans la leçon du document. Sous <b>Mes notes</b>, vous trouvez le tableau et les notes du mode cours de ce jour-là.',
    'lessons.tip6':
      'Un mot que le professeur marque d’une ★ dans le document (<ex>★ la boulangerie — пекарня</ex>) est un <b>mot clé</b> : il porte l’étiquette <b>clé</b> et revient plus souvent dans les exercices.',
    'lessons.tip7':
      'Pour le professeur : sous <b>Devoirs</b>, <btn>Préparer les devoirs avec Claude</btn> rédige un bloc <ex>Devoirs:</ex> à partir des mots et de la grammaire de la leçon (mots clés d’abord). Vérifiez-le, appuyez sur <pbtn>Ajouter à cette leçon</pbtn>, et l’élève le trouve sur l’accueil en liste à cocher.',
    'lessons.mock': 'l’onglet Mots d’une leçon',

    'verbs.title': 'Verbes',
    'verbs.summary': 'Tableaux de conjugaison et exercices (onglet Verbes d’une leçon)',
    'verbs.intro':
      'L’onglet <b>Verbes</b> d’une leçon dans toute langue sauf l’anglais contient un tableau de conjugaison pour chaque verbe : le français à six temps, à l’affirmatif et au négatif ; l’allemand, l’espagnol, l’italien et le portugais à leurs cinq ou six temps principaux.',
    'verbs.step1': 'Appuyez sur un verbe pour ouvrir son tableau.',
    'verbs.step2':
      'Choisissez un temps (présent, passé composé, imparfait, futur simple, conditionnel présent, impératif) et <b>affirmatif</b> ou <b>négatif</b>. 🔊 lit chaque forme.',
    'verbs.step3':
      'Appuyez sur <pbtn>Travailler ce temps</pbtn>, remplissez toutes les personnes, puis <pbtn>Vérifier les réponses</pbtn>. La bonne forme s’affiche sous chaque erreur.',
    'verbs.step4':
      '<btn>Quiz rapide</btn> demande des formes au hasard de tous les verbes ouverts.',
    'verbs.tip1':
      'Tapez la forme avec ou sans le pronom : « nous réveillons » et « réveillons » comptent tous les deux.',
    'verbs.tip2':
      'Majuscules et ponctuation ne comptent pas. Un accent oublié compte comme « presque », pas comme une erreur.',
    'verbs.tip3':
      'Si un tableau semble faux, <b>Conjuguer de nouveau</b> (à côté du participe passé) en demande un nouveau.',
    'verbs.mock': 'un tableau de conjugaison',

    'all-lessons.title': 'Leçons téléchargées',
    'all-lessons.summary': 'Les mêmes exercices, sur plusieurs leçons à la fois',
    'all-lessons.intro':
      'Tous les exercices de mots et de verbes, sur toutes les leçons préparées.',
    'all-lessons.step1':
      'Laissez <b>Toutes</b> sélectionné, ou touchez des leçons pour n’en travailler que quelques-unes.',
    'all-lessons.step2':
      'Utilisez les onglets <b>Mots</b> et <b>Verbes</b> comme dans une seule leçon.',
    'all-lessons.mock': 'le choix des leçons',

    'my-words.title': 'Mots à apprendre',
    'my-words.summary': 'Votre liste personnelle de mots à travailler',
    'my-words.intro':
      'Les mots marqués d’une ☆ et les mots ratés dans un exercice. Le nombre à côté de <b>Mots à apprendre</b> dans le menu indique combien il y en a.',
    'my-words.step1': 'Travaillez-les avec les mêmes exercices que dans une leçon.',
    'my-words.step2':
      'Un mot quitte la liste après <b>3 bonnes réponses d’affilée</b> dans n’importe quel exercice (<b>Je sais</b> sur une carte compte aussi), ou quand vous retirez son ★. Les points à côté, comme ●●○, montrent où il en est ; une erreur remet le compteur à zéro.',

    'mistakes.title': 'Erreurs',
    'mistakes.summary': 'Les mots et formes verbales que vous ratez le plus',
    'mistakes.intro':
      'Vos erreurs les plus fréquentes, mots et formes verbales, avec le nombre de fois où vous les avez ratés.',
    'mistakes.step1':
      'Appuyez sur <pbtn>Travailler mes erreurs</pbtn> pour un tour fait uniquement d’elles.',

    'stats.title': 'Statistiques',
    'stats.summary': 'Vos progrès et vos points faibles',
    'stats.intro':
      'Combien de mots vous avez appris, quelles leçons, quels types de mots et quels temps vous posent le plus de problèmes, et vos erreurs les plus fréquentes.',
    'stats.step1': 'Consultez-les de temps en temps pour choisir quoi réviser.',

    'photo.title': 'Analyse de photo',
    'photo.summary': 'Mots soulignés, notes manuscrites ou manuel en PDF',
    'photo.intro':
      'Trois façons de passer du papier aux mots. Choisissez-en une avec le sélecteur en haut.',
    'photo.step1':
      '<b>Mots soulignés</b> : soulignez des mots dans un livre, appuyez sur <pbtn>Choisir ou prendre des photos</pbtn> (jusqu’à 10 pages à la fois), et obtenez un seul tableau avec la traduction en contexte, la forme du dictionnaire, le temps et une courte explication.',
    'photo.step2':
      '<b>Notes manuscrites</b> : photographiez jusqu’à 4 pages de notes, corrigez ce qui a été mal lu (les mots illisibles sont marqués [?]), puis appuyez sur <pbtn>Préparer la leçon</pbtn> pour obtenir mots, verbes et exercices comme pour toute leçon.',
    'photo.step3':
      '<b>Manuel en PDF</b> : appuyez sur <pbtn>Choisir un PDF</pbtn>, indiquez les pages d’un chapitre (jusqu’à 20), puis <pbtn>Lire ces pages</pbtn>. Claude rédige des notes de cours : mots, expressions, grammaire et exemples. Vérifiez-les et appuyez sur <pbtn>Préparer la leçon</pbtn>.',
    'photo.step4':
      '<btn>Ajouter au document comme Leçon 8</btn> ajoute ce qui a été lu à la fin du document comme nouvelle leçon (une configuration unique du serveur est nécessaire, voir le README). Pour les mots soulignés, <b>Ajouter à</b> permet aussi de les placer plutôt sous l’une de vos leçons.',
    'photo.tip1':
      'Prenez la photo bien en face, avec une bonne lumière, toute la ligne marquée dans le cadre.',
    'photo.tip2': '☆ à côté d’un mot ajoute sa forme du dictionnaire aux Mots à apprendre.',
    'photo.mock': 'le résultat d’une photo de mots soulignés',

    'text.title': 'Analyse de texte',
    'text.summary': 'Collez un article : explications, traduction et exercices',
    'text.intro':
      'Pour un texte que vous avez trouvé vous-même : un article, une histoire, un post. Collez-le au lieu de faire une capture d’écran, et travaillez-le ici.',
    'text.step1':
      'Collez le texte et appuyez sur <pbtn>Lire ce texte</pbtn>. Il est enregistré sur cet appareil, avec tout ce que vous en faites.',
    'text.step2':
      'Cliquez sur un mot, ou sélectionnez quelques mots à la souris ou au doigt, puis appuyez sur <pbtn>Expliquer</pbtn> : vous obtenez la traduction dans cette phrase, la forme du dictionnaire, le temps et une courte explication. ☆ ajoute le mot aux Mots à apprendre.',
    'text.step3':
      '<btn>Traduire le texte</btn> affiche une traduction russe sous chaque paragraphe ; le même bouton la masque.',
    'text.step4':
      '<pbtn>Créer des questions et des exercices</pbtn> : Claude choisit les mots à retenir (avec le Quiz, les Cartes et les autres exercices habituels), écrit des questions sur le texte et un exercice « vrai ou faux ».',
    'text.tip1':
      'Les mots sur lesquels vous avez déjà posé une question sont soulignés en pointillé dans le texte.',
    'text.tip2': 'Les mots sont choisis pour votre niveau dans cette langue, réglé dans Réglages.',
    'discuss.title': 'Une question à discuter',
    'discuss.summary': 'Une question de discussion pour commencer le cours',
    'discuss.intro':
      'Une question à discuter en début de cours, écrite pour votre niveau et la grammaire que vous travaillez.',
    'discuss.step1': 'Choisissez la langue et votre <b>niveau</b> (A1–C2).',
    'discuss.step2':
      'Choisissez un <b>thème de vocabulaire</b> : dans la liste ou dans vos leçons, ou écrivez n’importe quel thème sous <b>Ou votre propre thème</b> : une série, un loisir, des mots d’argot. Choisissez un <b>point de grammaire</b>, ou laissez <b>Peu importe</b>.',
    'discuss.step3':
      'Appuyez sur <pbtn>Écrire une question</pbtn>. Vous obtenez la question (🔊 la lit, <b>Afficher la traduction</b> la montre en russe), des questions de relance, des débuts de phrase avec la grammaire, et des mots utiles. Avec un point de grammaire, <b>📘 La règle</b> ouvre une explication avec des exemples.',
    'discuss.step4':
      '<pbtn>Une autre question</pbtn> en écrit une nouvelle avec les mêmes réglages.',
    'discuss.tip1': '☆ à côté d’un mot utile l’ajoute aux Mots à apprendre.',

    'settings.title': 'Réglages',
    'settings.summary': 'Langue, thème, ce que vous apprenez, votre niveau et le menu',
    'settings.intro':
      'S’ouvrent avec <b>⚙️ Réglages</b> à droite de la barre du haut. Tout est enregistré tout de suite.',
    'settings.step1':
      '<b>Profil</b> : ajoutez une image et votre nom ; le nom sert dans les appels Zoom et les messages au professeur.',
    'settings.step2':
      '<b>Interface</b> : la langue de l’application (anglais, russe, français, allemand, espagnol, portugais, italien) et le thème : comme le système, clair ou sombre.',
    'settings.step3':
      '<b>Apprentissage</b> : cochez les langues que vous apprenez et choisissez votre niveau pour chacune. Les exercices, Mots à apprendre, Erreurs, Statistiques et les questions à discuter n’affichent alors que ces langues, et le niveau est choisi par défaut pour les questions à discuter et dans le Texte à trous.',
    'settings.step4':
      'Aussi : l’objectif du jour pour la 🔥 série, la vitesse de 🔊, les sections affichées dans le menu et les onglets affichés sur la page d’une leçon.',
    'settings.tip1':
      'Les traductions des mots restent en russe, quelle que soit la langue de l’interface.',
    'call.title': 'Mode cours',
    'call.summary': 'L’appel, les notes et les mots de la leçon sur un seul écran',
    'call.intro':
      'S’ouvre avec <b>Entrer dans le cours</b> dans le widget du prochain cours, en haut, quand le document contient un lien Google Meet ou Zoom. Pensé pour le cours lui-même.',
    'call.step1':
      '<b>Google Meet</b> : appuyez sur <pbtn>Ouvrir l’appel dans une petite fenêtre</pbtn>. Meet ne peut pas s’afficher dans d’autres sites : il s’ouvre dans une petite fenêtre sur le côté de l’écran.',
    'call.step2':
      '<b>Zoom</b> : saisissez votre nom et appuyez sur <pbtn>Rejoindre ici</pbtn>. L’appel se déroule dans la page, dans une fenêtre que vous pouvez déplacer et redimensionner (une configuration Zoom unique est nécessaire sur le serveur, voir le README).',
    'call.step3':
      'Pendant le cours, écrivez dans <b>Notes du cours</b> : les nouveaux mots sous la forme « mot — перевод », les erreurs, les devoirs. <btn>⏱ Heure</btn> marque le moment.',
    'call.step4':
      'Après le cours, <btn>Ajouter au document comme Leçon 8</btn> met les notes dans le document comme nouvelle leçon, prête pour les exercices.',
    'call.step5':
      '<pbtn>Ouvrir le tableau</pbtn> sous les notes : écrivez, dessinez, collez des images. Avec le partage en direct configuré, le professeur et l’élève dessinent sur le même tableau en même temps et voient le pointeur de l’autre ; sinon, partagez votre écran dans l’appel. <b>Plein écran</b> et <b>Enregistrer en image</b> sont au-dessus.',
    'call.step6':
      '<pbtn>Commencer l’échauffement</pbtn> au début du cours : environ 5 minutes de questions sur la leçon précédente et sur les erreurs de l’élève depuis. À la fin, <b>Pas encore acquis</b> liste toutes les mauvaises réponses pour le professeur. Faites-le sur l’appareil de l’élève, où ses erreurs sont gardées, et partagez l’écran.',
    'call.step7':
      '<pbtn>Jouer</pbtn> sous <b>Quiz chrono</b> : 10 questions sur les mots de la leçon, 15 secondes chacune, et une bonne réponse rapide rapporte plus. Jouez sur l’écran partagé ; les meilleurs tours vont dans le tableau <b>Records</b>.',
    'call.tip3':
      '<btn>Côte à côte (moitié de l’écran)</btn> ouvre Meet sur la moitié droite de l’écran, à côté de l’application.',
    'call.tip1':
      'Les notes sont enregistrées sur cet appareil pour chaque jour : fermer la page ne fait rien perdre.',
    'call.tip2':
      'Dans Chrome, Meet peut rester au-dessus de toutes les fenêtres : dans Meet, ouvrez ⋮ et choisissez l’image dans l’image.',
    'document.title': 'Document',
    'document.summary': 'Modifier le Google Doc sans quitter l’application',
    'document.intro': 'L’éditeur Google Docs dans l’application, pour écrire les leçons.',
    'document.step1':
      'Modifiez comme d’habitude : les changements sont enregistrés dans Google Docs.',
    'document.step2':
      'Quand vous passez à une autre section, l’application se synchronise et les leçons se mettent à jour.',
    'document.tip1':
      'Si l’éditeur reste vide ou demande de se connecter (souvent dans Safari), utilisez le lien au-dessus pour ouvrir le document dans un nouvel onglet.',
    'news.title': 'Nouveautés',
    'news.summary': 'Ce qui a changé dans l’application, par date',
    'news.intro': 'Tous les changements de l’application, du plus récent au plus ancien.',
    'news.step1':
      'Chaque jour indique ce qui est <b>Nouveau</b>, <b>Amélioré</b> et <b>Corrigé</b>. Un point à côté de <b>Nouveautés</b> dans le menu signale quelque chose que vous n’avez pas encore vu.',
    'news.step2':
      'Les fonctions nouvelles et améliorées sont dans <b>Quoi de neuf</b>, les corrections de bugs dans <b>Corrections de bugs</b>. Si vous apprenez plusieurs langues, choisissez-en une sous <b>Langue</b> : vous voyez ses nouveautés et celles qui concernent toutes les langues.',
  },
  de: {
    title: 'Anleitung',
    intro:
      'So funktioniert die App, in ein paar Minuten. Jeder Bereich unten hat einen Link, der ihn öffnet.',
    quickStart: 'Schnellstart',
    map: 'Was ist wo',
    howTo: 'So geht’s',
    goodToKnow: 'Gut zu wissen',
    backToMap: '↑ Zurück zur Übersicht',
    open: '{section} öffnen',
    pictureOf: 'Bild: {label}',
    storageTitle: 'Wo deine Daten liegen',
    storageText:
      'Fortschritt, Sterne, Notizen, Serien und handschriftliche Notizen werden nur in diesem Browser gespeichert. Sie wandern nicht auf ein anderes Gerät oder in einen anderen Browser mit, und wenn du die Websitedaten löschst, sind sie weg.',
    'quick1.title': 'Öffne dein Unterrichtsdokument',
    'quick1.text':
      'Nutze den Link deiner Lehrkraft. Gib den Klassencode ein, falls er verlangt wird (nur einmal).',
    'quick2.title': 'Wähle eine Lektion',
    'quick2.text':
      'Wähle unter <lessons>Lektionsverlauf</lessons> eine Lektion und sieh dir ihre Wörter an.',
    'quick3.title': 'Übe',
    'quick3.text':
      'Fang mit den <b>Karteikarten</b> an, dann mach das <b>Quiz</b>. Falsche Wörter landen in den <mine>Lernwörtern</mine>.',
    'quick4.title': 'Komm jeden Tag wieder',
    'quick4.text':
      'Eine Runde auf der <home>Startseite</home> dauert ein paar Minuten und hält deine 🔥 Serie am Leben.',

    'header.title': 'Die obere Leiste',
    'header.summary':
      'Dein Bild, das Dokument, Synchronisierung, nächste Stunde, Feedback und Einstellungen',
    'header.intro':
      'Die Leiste oben ist immer da. Sie zeigt, welches Google-Dokument die App liest und wann zuletzt synchronisiert wurde, dazu die nächste Stunde und den Videoanruf.',
    'header.step1':
      '<b>↻</b> neben dem Namen des Dokuments synchronisiert: Es liest das Dokument neu. Tippe darauf, wenn die Lehrkraft eine Lektion hinzugefügt hat. Während der Stunde („Stunde läuft“) macht die App das jede Minute von selbst.',
    'header.step2':
      '<b>Nächste Stunde</b> zeigt das Datum aus der neuesten Zeile wie <ex>nächste Stunde: 22.11.2026 18:00 Berlin</ex>. Eine Uhrzeit für eine Stadt wird in deine umgerechnet. Ist das Datum vorbei, steht dort „noch nicht bestätigt“.',
    'header.step3':
      '<b>Zur Stunde</b> erscheint im Widget der nächsten Stunde, wenn das Dokument einen Google-Meet- oder Zoom-Link enthält, und öffnet den Unterrichtsmodus: den Anruf neben der Lektion und deinen Notizen.',
    'header.step4':
      '<b>Dokument öffnen</b>, <b>Schülerlink kopieren</b> und <b>Dokument wechseln</b> findest du in den <b>Einstellungen</b> unter Dokument.',
    'header.step5':
      '<b>Feedback</b> schickt der Lehrkraft eine Nachricht: einen Fehler, eine Idee oder etwas anderes. Hänge bis zu 3 Screenshots an oder füge einen mit Strg+V / ⌘V ein. Die Seite, auf der du warst, wird automatisch mitgeschickt.',
    'header.step6':
      '<b>⚙️ Einstellungen</b> ganz rechts: das Dokument, die Sprache der App, das Farbschema, die Sprachen, die du lernst, und dein Niveau. Dein Bild, dort gewählt, steht ganz links.',
    'header.tip1':
      'Eine Lektion beginnt im Dokument mit einer Zeile wie <ex>14.10.2026 1 Lektion</ex> (oder <ex>Leçon</ex>, <ex>Lesson</ex>, <ex>Lección</ex>, <ex>Lição</ex>, <ex>Lezione</ex>). Alles darunter bis zur nächsten solchen Zeile gehört zu dieser Lektion.',
    'header.mock': 'die obere Leiste',

    'home.title': 'Startseite',
    'home.summary': 'Eine tägliche Runde mit 10 gemischten Fragen',
    'home.intro':
      'Der schnellste Weg, jeden Tag zu üben: 10 Fragen aus allen Lektionen, und Wörter, bei denen du Fehler machst, kommen öfter.',
    'home.step1':
      'Beantworte jede Frage: Wähle eine Übersetzung, wähle das Wort in der Lernsprache, tippe es oder schreib, was du hörst.',
    'home.step2':
      'Tippe nach jeder Antwort auf <pbtn>Weiter</pbtn>. Am Ende siehst du dein Ergebnis und <pbtn>Nächste Runde</pbtn>.',
    'home.step3':
      'Antworte mindestens einmal am Tag, damit deine 🔥 Serie hält; 20 Antworten erfüllen das Tagesziel.',
    'home.tip1':
      'Wenn die Lehrkraft die Hausaufgaben in die Lektion schreibt (<ex>Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé</ex>), zeigt die Startseite sie als Checkliste, dazu die Zeit bis zur nächsten Stunde. <btn>Wörter üben</btn>, <btn>Lücken füllen</btn> und <btn>Konjugieren</btn> öffnen die Übung zur Aufgabe; ist sie fertig, wird die Aufgabe abgehakt.',
    'home.tip2':
      'Eine schriftliche Aufgabe (<ex>5 phrases au passé composé</ex>, eine Übersetzung, „beschreib deinen Tag“) hat <btn>Schreiben</btn>: Schreib deine Antwort und drück auf <pbtn>Prüfen</pbtn>. Claude korrigiert die Fehler, erklärt jeden wie ein Nachhilfelehrer und sagt, ob die Antwort die Aufgabe erfüllt. Im Unterrichtsmodus zeigt <b>Schriftliche Hausaufgaben</b> der Lehrkraft die korrigierten Antworten.',
    'home.tip3':
      '<btn>Bericht vorbereiten</btn> unter den Hausaufgaben (und unten in der Statistik) schreibt einen kurzen Bericht für die Lehrkraft: erledigte Hausaufgaben, Antworten und Fehler seit der Stunde, deine schriftlichen Antworten, wie Claude sie korrigiert hat. Lies ihn, ändere ihn bei Bedarf, und <pbtn>Ins Dokument einfügen</pbtn> setzt ihn unter die Lektion.',
    'home.tip4':
      'Am Tag einer Lektion und am Tag danach fasst die Startseite sie zusammen: „Heute, Lektion 7: 12 neue Wörter, 2 Verben“, ihre Wörter (Schlüsselwörter zuerst) und Grammatik, mit <pbtn>Wiederholung starten</pbtn>. ✕ blendet sie aus.',
    'home.tip5':
      'In den 24 Stunden vor einer Stunde (wenn das Dokument die Uhrzeit nennt) bietet die Startseite <pbtn>Vor der Stunde wiederholen</pbtn> an: eine Runde mit den Wörtern der letzten Lektion und deinen schweren Wörtern.',
    'home.mock': 'Serie und Tagesziel auf der Startseite',

    'lessons.title': 'Lektionsverlauf',
    'lessons.summary': 'Wörter, Verben und Notizen zu jeder Lektion',
    'lessons.intro':
      'Alle Lektionen aus dem Dokument, die neueste ist ausgewählt. Claude liest sie einmal und bereitet den Wortschatz mit Übersetzungen, Synonym- und Antonympaaren und die Verben vor.',
    'lessons.step1':
      'Wähle links eine Lektion aus der Liste (jede Lektion hat einen eigenen Link zum Teilen).',
    'lessons.step2':
      'Bleib auf dem Tab <b>Wörter</b>. Alle Wörter sind angehakt; entferne die Haken bei denen, die du nicht willst, oder nutze <b>Alle auswählen</b>, <b>Auswahl aufheben</b> und das Suchfeld.',
    'lessons.step3':
      'Starte eine Übung über die Knöpfe: <pbtn>Quiz</pbtn> <btn>Karteikarten</btn> <btn>Übersetzungen zuordnen</btn> <btn>Synonyme & Antonyme</btn> <btn>Lückentext</btn> <btn>Diktat</btn>',
    'lessons.step4':
      'Tippe auf 🔊, um ein Wort zu hören, und auf ☆, um es zu den <b>Lernwörtern</b> hinzuzufügen.',
    'lessons.step5':
      'Doppelklicke auf ein Wort oder eine Wendung in der Sprache, die du lernst (auf dem Handy: gedrückt halten), um das Menü zu öffnen: <b>Übersetzen</b> in diesem Satz, <b>Definieren</b>, <b>Beispiele</b> und bei einem Verb <b>Konjugieren</b>. <btn>Zu Lektion 1 hinzufügen</btn> schreibt es unter die Lektion, und es kommt in die Übungen.',
    'lessons.tip1':
      '<added>✱</added> markiert eine Übersetzung, die Claude ergänzt hat und die nicht in den Notizen steht.',
    'lessons.tip2':
      '<b>Karteikarten</b>: <key>Leertaste</key> dreht die Karte um, <key>←</key> heißt „nochmal“, <key>→</key> „weiß ich“. Der Schalter oben ändert die Richtung.',
    'lessons.tip3':
      'Unten: <b>Wörter für Anki exportieren</b> speichert die angehakten Wörter als Datei (in Anki: Datei → Importieren), und <b>Lektion neu vorbereiten</b> lässt Claude eine geänderte Lektion neu lesen.',
    'lessons.tip4':
      '<b>Meine Notizen</b> ist dein Notizblock zur Lektion, wird beim Tippen gespeichert. <b>Original</b> zeigt die Lektion so, wie sie geschrieben ist.',
    'lessons.tip5':
      '<b>Grammatik</b> erklärt jedes Grammatikthema der Lektion, mit <pbtn>Diese Regel üben</pbtn> für Sätze dazu. <b>Hausaufgaben</b> zeigt, was zu tun ist; hake Erledigtes ab. <b>Übungen aus dem Lehrbuch</b> zeigt Übungen aus dem Buch und importiert neue aus Fotos oder einem PDF in die Lektion im Dokument. Unter <b>Meine Notizen</b> findest du die Tafel und die Notizen aus dem Unterrichtsmodus von diesem Tag.',
    'lessons.tip6':
      'Ein Wort, das die Lehrkraft im Dokument mit ★ markiert (<ex>★ la boulangerie — пекарня</ex>), ist ein <b>Schlüsselwort</b>: Es trägt das Etikett <b>Schlüsselwort</b> und kommt in den Übungen öfter dran.',
    'lessons.tip7':
      'Für die Lehrkraft: Unter <b>Hausaufgaben</b> schreibt <btn>Mit Claude erstellen</btn> einen Block <ex>Devoirs:</ex> aus den Wörtern und der Grammatik der Lektion (Schlüsselwörter zuerst). Prüfe ihn, drück auf <pbtn>Zu dieser Lektion hinzufügen</pbtn>, und die Schülerin oder der Schüler findet ihn auf der Startseite als Checkliste.',
    'lessons.mock': 'der Tab Wörter einer Lektion',

    'verbs.title': 'Verben',
    'verbs.summary': 'Konjugationstabellen und Übungen (Tab Verben einer Lektion)',
    'verbs.intro':
      'Der Tab <b>Verben</b> einer Lektion in jeder Sprache außer Englisch hat für jedes Verb eine Konjugationstabelle: Französisch in sechs Zeitformen, bejaht und verneint; Deutsch, Spanisch, Italienisch und Portugiesisch in ihren fünf oder sechs wichtigsten Zeitformen.',
    'verbs.step1': 'Tippe auf ein Verb, um seine Tabelle zu öffnen.',
    'verbs.step2':
      'Wähle eine Zeitform (présent, passé composé, imparfait, futur simple, conditionnel présent, impératif) und <b>bejaht</b> oder <b>verneint</b>. 🔊 liest jede Form vor.',
    'verbs.step3':
      'Tippe auf <pbtn>Diese Zeitform üben</pbtn>, fülle alle Personen aus und tippe dann auf <pbtn>Antworten prüfen</pbtn>. Unter falschen Formen steht die richtige.',
    'verbs.step4': '<btn>Schnellquiz</btn> fragt zufällige Formen aller geöffneten Verben ab.',
    'verbs.tip1':
      'Tippe eine Form mit oder ohne Pronomen: „nous réveillons“ und „réveillons“ zählen beide.',
    'verbs.tip2':
      'Groß- und Kleinschreibung und Satzzeichen sind egal. Ein fehlender Akzent zählt als „fast“, nicht als falsch.',
    'verbs.tip3':
      'Wenn eine Tabelle falsch aussieht, holt <b>Neu konjugieren</b> (neben dem Partizip) eine neue.',
    'verbs.mock': 'eine Verbtabelle',

    'all-lessons.title': 'Geladene Lektionen',
    'all-lessons.summary': 'Dieselben Übungen, für mehrere Lektionen auf einmal',
    'all-lessons.intro': 'Alle Wort- und Verbübungen für alle vorbereiteten Lektionen zusammen.',
    'all-lessons.step1':
      'Lass <b>Alle</b> ausgewählt oder tippe auf einzelne Lektionen, um nur diese zu üben.',
    'all-lessons.step2':
      'Nutze die Tabs <b>Wörter</b> und <b>Verben</b> wie in einer einzelnen Lektion.',
    'all-lessons.mock': 'die Lektionsauswahl',

    'my-words.title': 'Lernwörter',
    'my-words.summary': 'Deine persönliche Liste mit Wörtern zum Üben',
    'my-words.intro':
      'Wörter, die du mit ☆ markiert hast, und Wörter, die du in einer Übung falsch hattest. Die Zahl neben <b>Lernwörter</b> im Menü zeigt, wie viele es sind.',
    'my-words.step1': 'Übe sie mit denselben Übungen wie in einer Lektion.',
    'my-words.step2':
      'Ein Wort verlässt die Liste nach <b>3 richtigen Antworten in Folge</b> in einer beliebigen Übung (auch <b>Weiß ich</b> auf einer Karteikarte zählt) oder wenn du den ★ entfernst. Die Punkte daneben, etwa ●●○, zeigen, wie weit es schon ist; nach einem Fehler geht es von vorn los.',

    'mistakes.title': 'Fehler',
    'mistakes.summary': 'Die Wörter und Verbformen, die du am häufigsten falsch machst',
    'mistakes.intro':
      'Deine häufigsten Fehler, Wörter und Verbformen, und wie oft du sie falsch hattest.',
    'mistakes.step1': 'Tippe auf <pbtn>Meine Fehler üben</pbtn> für eine Runde nur mit ihnen.',

    'stats.title': 'Statistik',
    'stats.summary': 'Dein Fortschritt und deine Schwachstellen',
    'stats.intro':
      'Wie viele Wörter du gelernt hast, welche Lektionen, Wortarten und Zeitformen dir am schwersten fallen, und deine häufigsten Fehler.',
    'stats.step1': 'Schau ab und zu hinein, um zu entscheiden, was du als Nächstes wiederholst.',

    'photo.title': 'Fotoanalyse',
    'photo.summary': 'Unterstrichene Wörter, handschriftliche Notizen oder ein Lehrbuch-PDF',
    'photo.intro': 'Drei Wege, Wörter vom Papier zu holen. Wähle einen mit dem Schalter oben.',
    'photo.step1':
      '<b>Unterstrichene Wörter</b>: Unterstreiche Wörter in einem Buch, tippe auf <pbtn>Fotos auswählen oder aufnehmen</pbtn> (bis zu 10 Seiten auf einmal) und bekomme eine einzige Tabelle mit der Übersetzung im Kontext, der Grundform, der Zeitform und einer kurzen Erklärung.',
    'photo.step2':
      '<b>Handschriftliche Notizen</b>: Fotografiere bis zu 4 Seiten Notizen, korrigiere Falschgelesenes (Unleserliches ist mit [?] markiert) und tippe auf <pbtn>Lektion vorbereiten</pbtn>, um Wörter, Verben und Übungen wie bei jeder Lektion zu bekommen.',
    'photo.step3':
      '<b>Lehrbuch-PDF</b>: Tippe auf <pbtn>PDF auswählen</pbtn>, gib die Seiten eines Kapitels an (bis zu 20) und tippe dann auf <pbtn>Diese Seiten lesen</pbtn>. Claude schreibt Unterrichtsnotizen: Wörter, Wendungen, Grammatik und Beispiele. Prüfe sie und tippe auf <pbtn>Lektion vorbereiten</pbtn>.',
    'photo.step4':
      '<btn>Als Leçon 8 zum Dokument hinzufügen</btn> hängt das Gelesene als neue Lektion ans Ende des Dokuments (braucht eine einmalige Einrichtung auf dem Server, siehe README). Unterstrichene Wörter kann <b>Hinzufügen zu</b> stattdessen auch unter eine deiner Lektionen setzen.',
    'photo.tip1':
      'Fotografiere gerade von vorn, bei gutem Licht, mit der ganzen markierten Zeile im Bild.',
    'photo.tip2': '☆ neben einem Wort fügt seine Grundform zu den Lernwörtern hinzu.',
    'photo.mock': 'das Ergebnis eines Fotos mit unterstrichenen Wörtern',

    'text.title': 'Textanalyse',
    'text.summary': 'Einen Artikel einfügen: Erklärungen, Übersetzung und Übungen',
    'text.intro':
      'Für einen Text, den du selbst gefunden hast: einen Artikel, eine Geschichte, einen Post. Füge ihn ein, statt einen Screenshot zu machen, und arbeite hier damit.',
    'text.step1':
      'Füge den Text ein und tippe auf <pbtn>Diesen Text lesen</pbtn>. Er wird auf diesem Gerät gespeichert, mit allem, was du damit machst.',
    'text.step2':
      'Klicke auf ein Wort oder markiere ein paar Wörter mit der Maus oder dem Finger und tippe dann auf <pbtn>Erklären</pbtn>: Du bekommst die Übersetzung in diesem Satz, die Grundform, die Zeitform und eine kurze Erklärung. ☆ fügt das Wort zu den Lernwörtern hinzu.',
    'text.step3':
      '<btn>Text übersetzen</btn> zeigt eine russische Übersetzung unter jedem Absatz; derselbe Knopf blendet sie wieder aus.',
    'text.step4':
      '<pbtn>Fragen und Übungen erstellen</pbtn>: Claude wählt die Wörter, die sich zu lernen lohnen (mit Quiz, Karteikarten und den anderen Übungen), schreibt Fragen zum Text und eine Richtig-oder-falsch-Übung.',
    'text.tip1': 'Wörter, nach denen du schon gefragt hast, sind im Text gepunktet unterstrichen.',
    'text.tip2':
      'Die Wörter werden für dein Niveau in dieser Sprache gewählt; es steht in den Einstellungen.',
    'discuss.title': 'Eine Frage zum Diskutieren',
    'discuss.summary': 'Eine Gesprächsfrage für den Stundenbeginn',
    'discuss.intro':
      'Eine Frage zum Reden am Anfang der Stunde, passend zu deinem Niveau und der Grammatik, die du übst.',
    'discuss.step1': 'Wähle die Sprache und dein <b>Niveau</b> (A1–C2).',
    'discuss.step2':
      'Wähle ein <b>Wortschatzthema</b>: aus der Liste oder aus deinen Lektionen, oder schreib unter <b>Oder ein eigenes Thema</b> ein beliebiges: eine Serie, ein Hobby, neue Slangwörter. Wähle ein <b>Grammatikthema</b> oder lass <b>Beliebig</b>.',
    'discuss.step3':
      'Tippe auf <pbtn>Frage schreiben</pbtn>. Du bekommst die Frage (🔊 liest sie vor, <b>Übersetzung zeigen</b> zeigt sie auf Russisch), Anschlussfragen, Satzanfänge mit der Grammatik und nützliche Wörter. Mit einem Grammatikthema öffnet <b>📘 Die Regel</b> eine Erklärung mit Beispielen.',
    'discuss.step4': '<pbtn>Andere Frage</pbtn> schreibt eine neue mit denselben Einstellungen.',
    'discuss.tip1': '☆ neben einem nützlichen Wort fügt es zu den Lernwörtern hinzu.',

    'settings.title': 'Einstellungen',
    'settings.summary': 'Sprache, Farbschema, was du lernst, dein Niveau und das Menü',
    'settings.intro':
      'Öffnen sich über <b>⚙️ Einstellungen</b> rechts in der oberen Leiste. Alles wird sofort gespeichert.',
    'settings.step1':
      '<b>Profil</b>: Füge ein Bild und deinen Namen hinzu; der Name wird in Zoom-Anrufen und in Nachrichten an die Lehrkraft verwendet.',
    'settings.step2':
      '<b>Oberfläche</b>: die Sprache der App (Englisch, Russisch, Französisch, Deutsch, Spanisch, Portugiesisch, Italienisch) und das Farbschema: wie das System, hell oder dunkel.',
    'settings.step3':
      '<b>Lernen</b>: Hake die Sprachen an, die du lernst, und wähle für jede dein Niveau. Übungen, Lernwörter, Fehler, Statistik und die Diskussionsfragen zeigen dann nur diese Sprachen, und das Niveau ist der Standard für Diskussionsfragen und im Lückentext.',
    'settings.step4':
      'Außerdem: das Tagesziel für die 🔥 Serie, das Tempo von 🔊, welche Bereiche das Menü und welche Tabs die Lektionsseite zeigt.',
    'settings.tip1':
      'Die Übersetzungen der Wörter bleiben auf Russisch, egal welche Sprache die Oberfläche hat.',
    'call.title': 'Unterrichtsmodus',
    'call.summary': 'Anruf, Notizen und die Wörter der Lektion auf einem Bildschirm',
    'call.intro':
      'Öffnet sich über <b>Zur Stunde</b> im Widget der nächsten Stunde oben, wenn das Dokument einen Google-Meet- oder Zoom-Link enthält. Gemacht für die Stunde selbst.',
    'call.step1':
      '<b>Google Meet</b>: Tippe auf <pbtn>Anruf in kleinem Fenster öffnen</pbtn>. Meet lässt sich nicht in andere Websites einbetten, deshalb öffnet es sich als kleines Fenster am Bildschirmrand.',
    'call.step2':
      '<b>Zoom</b>: Gib deinen Namen ein und tippe auf <pbtn>Hier beitreten</pbtn>. Der Anruf läuft direkt auf der Seite, in einem Fenster, das du verschieben und in der Größe ändern kannst (braucht eine einmalige Zoom-Einrichtung auf dem Server, siehe README).',
    'call.step3':
      'Schreib während der Stunde in die <b>Notizen zur Stunde</b>: neue Wörter als „Wort — перевод“, Fehler, Hausaufgaben. <btn>⏱ Uhrzeit</btn> markiert, wann etwas vorkam.',
    'call.step4':
      'Nach der Stunde legt <btn>Als Leçon 8 zum Dokument hinzufügen</btn> die Notizen als neue Lektion ins Dokument, bereit für Übungen.',
    'call.step5':
      '<pbtn>Tafel öffnen</pbtn> unter den Notizen: schreiben, zeichnen, Bilder einfügen. Ist das Live-Teilen eingerichtet, zeichnen Lehrkraft und Schüler gleichzeitig auf derselben Tafel und sehen den Zeiger des anderen; sonst teile deinen Bildschirm im Anruf. <b>Vollbild</b> und <b>Als Bild speichern</b> stehen darüber.',
    'call.step6':
      '<pbtn>Aufwärmen starten</pbtn> zu Beginn der Stunde: etwa 5 Minuten Fragen zur letzten Lektion und zu den Fehlern seitdem. Am Ende listet <b>Sitzt noch nicht</b> alle falschen Antworten für die Lehrkraft auf. Mach das am Gerät der Schülerin oder des Schülers, wo die Fehler gespeichert sind, und teile den Bildschirm.',
    'call.step7':
      '<pbtn>Spielen</pbtn> unter <b>Quizspiel</b>: 10 Fragen zu den Wörtern der Lektion, je 15 Sekunden, und eine schnelle richtige Antwort bringt mehr Punkte. Spielt auf dem geteilten Bildschirm; die besten Runden kommen in die Tabelle <b>Rekorde</b>.',
    'call.tip3':
      '<btn>Nebeneinander (halber Bildschirm)</btn> öffnet Meet auf der rechten Bildschirmhälfte, neben der App.',
    'call.tip1':
      'Die Notizen werden auf diesem Gerät für jeden Tag gespeichert; wenn du die Seite schließt, geht nichts verloren.',
    'call.tip2':
      'In Chrome kann Meet über allen Fenstern schweben: Öffne in Meet ⋮ und wähle Bild-im-Bild.',
    'document.title': 'Dokument',
    'document.summary': 'Das Google-Dokument bearbeiten, ohne die App zu verlassen',
    'document.intro': 'Der Google-Docs-Editor in der App, um Lektionen zu schreiben.',
    'document.step1': 'Bearbeite wie gewohnt: Änderungen werden in Google Docs gespeichert.',
    'document.step2':
      'Wenn du in einen anderen Bereich wechselst, synchronisiert die App und die Lektionen werden aktualisiert.',
    'document.tip1':
      'Wenn der Editor leer bleibt oder eine Anmeldung verlangt (oft in Safari), öffne das Dokument über den Link darüber in einem neuen Tab.',
    'news.title': 'Neuigkeiten',
    'news.summary': 'Was sich in der App geändert hat, nach Datum',
    'news.intro': 'Alle Änderungen der App, das Neueste zuerst.',
    'news.step1':
      'Jeder Tag zeigt, was <b>Neu</b>, <b>Verbessert</b> und <b>Behoben</b> ist. Ein Punkt neben <b>Neuigkeiten</b> im Menü heißt, dass es etwas gibt, das du noch nicht gesehen hast.',
    'news.step2':
      'Neue und verbesserte Funktionen stehen unter <b>Was ist neu</b>, Fehlerbehebungen unter <b>Fehlerbehebungen</b>. Wenn du mehrere Sprachen lernst, wähle unter <b>Sprache</b> eine aus: Du siehst ihre Neuigkeiten und die für alle Sprachen.',
  },
  es: {
    title: 'Guía',
    intro:
      'Cómo funciona la aplicación, en pocos minutos. Cada sección de abajo tiene un enlace que la abre.',
    quickStart: 'Inicio rápido',
    map: 'Qué hay y dónde',
    howTo: 'Cómo se usa',
    goodToKnow: 'Conviene saber',
    backToMap: '↑ Volver al mapa',
    open: 'Abrir {section}',
    pictureOf: 'Imagen de {label}',
    storageTitle: 'Dónde se guardan tus datos',
    storageText:
      'El progreso, las estrellas, las notas, las rachas y las notas a mano se guardan solo en este navegador. No te siguen a otro dispositivo o navegador, y borrar los datos del sitio en el navegador los elimina.',
    'quick1.title': 'Abre tu documento de lecciones',
    'quick1.text':
      'Usa el enlace de tu profesor. Escribe el código de clase si te lo pide (solo una vez).',
    'quick2.title': 'Elige una lección',
    'quick2.text':
      'En <lessons>Historial de lecciones</lessons>, elige una lección y mira sus palabras.',
    'quick3.title': 'Practica',
    'quick3.text':
      'Empieza con las <b>Tarjetas</b> y luego el <b>Test</b>. Las palabras que falles van a <mine>Palabras por aprender</mine>.',
    'quick4.title': 'Vuelve cada día',
    'quick4.text': 'Una ronda en <home>Inicio</home> lleva unos minutos y mantiene tu racha 🔥.',

    'header.title': 'La barra superior',
    'header.summary':
      'Tu imagen, el documento, la sincronización, la próxima clase, comentarios y ajustes',
    'header.intro':
      'La barra de arriba siempre está ahí. Muestra qué Google Doc lee la aplicación y cuándo se sincronizó por última vez, además de la próxima clase y la videollamada.',
    'header.step1':
      '<b>↻</b> junto al nombre del documento sincroniza: vuelve a leer el documento. Púlsalo cuando el profesor añada una lección. Durante la clase («Clase en curso») la app lo hace sola cada minuto.',
    'header.step2':
      '<b>Próxima clase</b> muestra la fecha de la línea más reciente como <ex>próxima clase: 22.11.2026 18:00 Madrid</ex>. Una hora indicada para una ciudad se convierte a la tuya. Cuando la fecha ha pasado, dice «aún sin confirmar».',
    'header.step3':
      '<b>Entrar en la clase</b> aparece en el widget de la próxima clase cuando el documento tiene un enlace de Google Meet o Zoom, y abre el modo clase: la llamada junto a la lección y tus notas.',
    'header.step4':
      '<b>Abrir el documento</b>, <b>Copiar el enlace del alumno</b> y <b>Cambiar de documento</b> están en <b>Ajustes</b>, en Documento.',
    'header.step5':
      '<b>Comentarios</b> envía un mensaje al profesor: un error, una idea o cualquier otra cosa. Añade hasta 3 capturas o pega una con Ctrl+V / ⌘V. La página en la que estabas se añade sola.',
    'header.step6':
      '<b>⚙️ Ajustes</b> a la derecha del todo: el documento, el idioma de la aplicación, el tema de color, los idiomas que aprendes y tu nivel. Tu imagen, elegida allí, aparece a la izquierda del todo.',
    'header.tip1':
      'Una lección empieza en el documento con una línea como <ex>14.10.2026 1 Lección</ex> (o <ex>Leçon</ex>, <ex>Lesson</ex>, <ex>Lektion</ex>, <ex>Lição</ex>, <ex>Lezione</ex>). Todo lo que hay debajo, hasta la siguiente línea así, pertenece a esa lección.',
    'header.mock': 'la barra superior',

    'home.title': 'Inicio',
    'home.summary': 'Una ronda diaria de 10 preguntas variadas',
    'home.intro':
      'La forma más rápida de practicar cada día: 10 preguntas de todas tus lecciones, y las palabras que fallas vuelven más a menudo.',
    'home.step1':
      'Responde a cada pregunta: elige una traducción, elige la palabra en el idioma que aprendes, escríbela o escribe lo que oyes.',
    'home.step2':
      'Después de cada respuesta pulsa <pbtn>Siguiente</pbtn>. Al final ves tu puntuación y <pbtn>Siguiente ronda</pbtn>.',
    'home.step3':
      'Responde al menos una vez al día para mantener tu racha 🔥; 20 respuestas cumplen el objetivo del día.',
    'home.tip1':
      'Cuando el profesor escribe los deberes en la lección (<ex>Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé</ex>), Inicio los muestra como una lista para marcar, con lo que falta para la próxima clase. <btn>Practicar las palabras</btn>, <btn>Rellenar los huecos</btn> y <btn>Conjugar</btn> abren el ejercicio de la tarea, y al terminarlo se marca.',
    'home.tip2':
      'Una tarea escrita (<ex>5 phrases au passé composé</ex>, una traducción, «describe tu día») tiene <btn>Escribir</btn>: escribe tu respuesta y pulsa <pbtn>Comprobar</pbtn>. Claude corrige los errores, explica cada uno como un profesor particular y dice si la respuesta cumple la tarea. En el modo clase, <b>Deberes escritos</b> muestra las respuestas corregidas al profesor.',
    'home.tip3':
      '<btn>Preparar el informe</btn> debajo de los deberes (y al final de Estadísticas) redacta un breve informe para el profesor: los deberes hechos, las respuestas y los errores desde la clase, tus respuestas escritas corregidas por Claude. Léelo, cámbialo si quieres, y <pbtn>Añadir al documento</pbtn> lo pone debajo de la lección.',
    'home.tip4':
      'El día de una lección y el siguiente, Inicio la resume: «Hoy, lección 7: 12 palabras nuevas, 2 verbos», sus palabras (primero las clave) y su gramática, con <pbtn>Empezar el repaso</pbtn>. ✕ la oculta.',
    'home.tip5':
      'En las 24 horas antes de una clase (si el documento indica la hora), Inicio ofrece <pbtn>Repasar antes de la clase</pbtn>: una ronda con las palabras de la última lección y tus palabras difíciles.',
    'home.mock': 'la racha y el objetivo diario en Inicio',

    'lessons.title': 'Historial de lecciones',
    'lessons.summary': 'Palabras, verbos y notas de cada lección',
    'lessons.intro':
      'Todas las lecciones del documento, con la más nueva seleccionada. Claude la lee una vez y prepara el vocabulario con traducciones, pares de sinónimos y antónimos, y los verbos.',
    'lessons.step1':
      'Elige una lección en la lista de la izquierda (cada lección tiene su propio enlace que puedes compartir).',
    'lessons.step2':
      'Quédate en la pestaña <b>Palabras</b>. Todas las palabras están marcadas; desmarca las que no quieras o usa <b>Elegir todas</b>, <b>Quitar</b> y el filtro.',
    'lessons.step3':
      'Empieza un ejercicio desde la fila de botones: <pbtn>Test</pbtn> <btn>Tarjetas</btn> <btn>Une las traducciones</btn> <btn>Sinónimos y antónimos</btn> <btn>Rellena el hueco</btn> <btn>Dictado</btn>',
    'lessons.step4':
      'Pulsa 🔊 para oír una palabra y ☆ para ponerla en <b>Palabras por aprender</b>.',
    'lessons.step5':
      'Haz doble clic en cualquier palabra o expresión en el idioma que aprendes (en el móvil, mantenla pulsada) para abrir su menú: <b>Traducir</b> en esa frase, <b>Definir</b>, <b>Ejemplos</b> y, si es un verbo, <b>Conjugar</b>. <btn>Añadir a la lección 1</btn> la escribe bajo la lección, y pasa a los ejercicios.',
    'lessons.tip1':
      '<added>✱</added> marca una traducción que añadió Claude y que no está en las notas.',
    'lessons.tip2':
      '<b>Tarjetas</b>: <key>Espacio</key> gira la tarjeta, <key>←</key> significa «otra vez», <key>→</key> significa «me la sé». El interruptor de arriba cambia la dirección.',
    'lessons.tip3':
      'Abajo: <b>Exportar palabras para Anki</b> guarda las palabras marcadas en un archivo (en Anki: Archivo → Importar), y <b>Preparar de nuevo esta lección</b> pide a Claude que vuelva a leer una lección editada.',
    'lessons.tip4':
      '<b>Mis notas</b> es tu bloc de notas de la lección, se guarda mientras escribes. <b>Original</b> muestra la lección tal como está escrita.',
    'lessons.tip5':
      '<b>Gramática</b> explica cada punto de gramática de la lección, con <pbtn>Practicar esta regla</pbtn> para hacer frases. <b>Deberes</b> muestra lo que hay que hacer; marca las tareas al terminarlas. <b>Ejercicios del libro</b> muestra los ejercicios del libro e importa otros nuevos desde fotos o un PDF a la lección del documento. En <b>Mis notas</b> están la pizarra y las notas del modo clase de ese día.',
    'lessons.tip6':
      'Una palabra que el profesor marca con ★ en el documento (<ex>★ la boulangerie — пекарня</ex>) es una <b>palabra clave</b>: lleva la etiqueta <b>clave</b> y sale más a menudo en los ejercicios.',
    'lessons.tip7':
      'Para el profesor: en <b>Deberes</b>, <btn>Preparar los deberes con Claude</btn> redacta un bloque <ex>Devoirs:</ex> con las palabras y la gramática de la lección (primero las palabras clave). Revísalo, pulsa <pbtn>Añadir a esta lección</pbtn>, y el alumno lo encuentra en Inicio como lista para marcar.',
    'lessons.mock': 'la pestaña Palabras de una lección',

    'verbs.title': 'Verbos',
    'verbs.summary': 'Tablas de conjugación y ejercicios (pestaña Verbos de una lección)',
    'verbs.intro':
      'La pestaña <b>Verbos</b> de una lección en cualquier idioma salvo el inglés tiene una tabla de conjugación para cada verbo: el francés en seis tiempos, en afirmativa y negativa; el alemán, el español, el italiano y el portugués en sus cinco o seis tiempos principales.',
    'verbs.step1': 'Pulsa un verbo para abrir su tabla.',
    'verbs.step2':
      'Elige un tiempo (présent, passé composé, imparfait, futur simple, conditionnel présent, impératif) y <b>afirmativa</b> o <b>negativa</b>. 🔊 lee cada forma.',
    'verbs.step3':
      'Pulsa <pbtn>Practicar este tiempo</pbtn>, rellena todas las personas y luego <pbtn>Comprobar las respuestas</pbtn>. Debajo de las formas incorrectas aparece la correcta.',
    'verbs.step4':
      '<btn>Test rápido</btn> pregunta formas al azar de todos los verbos que has abierto.',
    'verbs.tip1':
      'Escribe la forma con o sin el pronombre: valen tanto «nous réveillons» como «réveillons».',
    'verbs.tip2':
      'Las mayúsculas y la puntuación no cuentan. Un acento que falta cuenta como «casi», no como error.',
    'verbs.tip3':
      'Si una tabla parece incorrecta, <b>Conjugar de nuevo</b> (junto al participio pasado) pide una nueva.',
    'verbs.mock': 'una tabla de verbos',

    'all-lessons.title': 'Lecciones descargadas',
    'all-lessons.summary': 'Los mismos ejercicios, con varias lecciones a la vez',
    'all-lessons.intro':
      'Todos los ejercicios de palabras y verbos, con todas las lecciones preparadas juntas.',
    'all-lessons.step1':
      'Deja <b>Todas</b> seleccionado o toca las etiquetas de lecciones para practicar solo algunas.',
    'all-lessons.step2':
      'Usa las pestañas <b>Palabras</b> y <b>Verbos</b> igual que en una sola lección.',
    'all-lessons.mock': 'etiquetas de lecciones',

    'my-words.title': 'Palabras por aprender',
    'my-words.summary': 'Tu lista personal de palabras que trabajar',
    'my-words.intro':
      'Las palabras que marcaste con ☆ y las que fallaste en cualquier ejercicio. El número junto a <b>Palabras por aprender</b> en el menú indica cuántas hay.',
    'my-words.step1': 'Practícalas con los mismos ejercicios que en una lección.',
    'my-words.step2':
      'Una palabra sale de la lista tras <b>3 aciertos seguidos</b> en cualquier ejercicio (<b>Me la sé</b> en una tarjeta también cuenta) o cuando le quitas la ★. Los puntos a su lado, como ●●○, muestran cuánto ha avanzado; con un fallo, la cuenta vuelve a empezar.',

    'mistakes.title': 'Errores',
    'mistakes.summary': 'Las palabras y formas verbales que más fallas',
    'mistakes.intro':
      'Tus errores más frecuentes, palabras y formas verbales, con cuántas veces fallaste cada uno.',
    'mistakes.step1':
      'Pulsa <pbtn>Practicar mis errores</pbtn> para una ronda hecha solo de ellos.',

    'stats.title': 'Estadísticas',
    'stats.summary': 'Tu progreso y tus puntos débiles',
    'stats.intro':
      'Cuántas palabras has aprendido, qué lecciones, tipos de palabras y tiempos te cuestan más, y tus errores más comunes.',
    'stats.step1': 'Échale un vistazo de vez en cuando para decidir qué repasar.',

    'photo.title': 'Análisis de fotos',
    'photo.summary': 'Palabras subrayadas, notas a mano o un PDF del manual',
    'photo.intro':
      'Tres formas de traer palabras desde el papel. Elige una con el interruptor de arriba.',
    'photo.step1':
      '<b>Palabras subrayadas</b>: subraya palabras en un libro, pulsa <pbtn>Elegir o hacer fotos</pbtn> (hasta 10 páginas a la vez) y obtén una sola tabla con la traducción en contexto, la forma del diccionario, el tiempo verbal y una breve explicación.',
    'photo.step2':
      '<b>Notas a mano</b>: fotografía hasta 4 páginas de notas, corrige lo que se haya leído mal (las palabras ilegibles se marcan con [?]) y pulsa <pbtn>Preparar la lección</pbtn> para obtener palabras, verbos y ejercicios como en cualquier lección.',
    'photo.step3':
      '<b>PDF del manual</b>: pulsa <pbtn>Elegir un PDF</pbtn>, indica las páginas de un capítulo (hasta 20) y luego <pbtn>Leer estas páginas</pbtn>. Claude escribe notas de clase: palabras, frases, gramática y ejemplos. Revísalas y pulsa <pbtn>Preparar la lección</pbtn>.',
    'photo.step4':
      '<btn>Añadir al documento como Leçon 8</btn> añade lo leído al final del documento como una lección nueva (requiere una configuración única en el servidor, ver el README). Para las palabras subrayadas, <b>Añadir a</b> también permite ponerlas bajo una de tus lecciones.',
    'photo.tip1':
      'Haz la foto de frente, con buena luz y con toda la línea marcada dentro del encuadre.',
    'photo.tip2': '☆ junto a una palabra pone su forma del diccionario en Palabras por aprender.',
    'photo.mock': 'el resultado de una foto con palabras subrayadas',

    'text.title': 'Análisis de texto',
    'text.summary': 'Pega un artículo: explicaciones, una traducción y ejercicios',
    'text.intro':
      'Para un texto que encontraste tú: un artículo, un cuento, una publicación. Pégalo en lugar de hacer una captura y trabaja con él aquí.',
    'text.step1':
      'Pega el texto y pulsa <pbtn>Leer este texto</pbtn>. Se guarda en este dispositivo, con todo lo que hagas con él.',
    'text.step2':
      'Haz clic en una palabra o selecciona unas cuantas con el ratón o el dedo y pulsa <pbtn>Explicar</pbtn>: obtienes la traducción en esa frase, la forma del diccionario, el tiempo verbal y una breve explicación. ☆ pone la palabra en Palabras por aprender.',
    'text.step3':
      '<btn>Traducir el texto</btn> muestra una traducción al ruso debajo de cada párrafo; el mismo botón la vuelve a ocultar.',
    'text.step4':
      '<pbtn>Crear preguntas y ejercicios</pbtn>: Claude elige las palabras que vale la pena aprender (con el Test, las Tarjetas y los demás ejercicios de siempre), escribe preguntas sobre el texto y un ejercicio de verdadero o falso.',
    'text.tip1':
      'Las palabras por las que ya preguntaste aparecen subrayadas con puntos en el texto.',
    'text.tip2': 'Las palabras se eligen según tu nivel en ese idioma, fijado en Ajustes.',
    'discuss.title': 'Una pregunta para debatir',
    'discuss.summary': 'Una pregunta para debatir al empezar la clase',
    'discuss.intro':
      'Una pregunta de la que hablar al principio de la clase, escrita para tu nivel y la gramática que estás practicando.',
    'discuss.step1': 'Elige el idioma y tu <b>nivel</b> (A1–C2).',
    'discuss.step2':
      'Elige un <b>tema de vocabulario</b>: de la lista o de tus lecciones, o escribe cualquier tema propio en <b>O tu propio tema</b>: una serie, un pasatiempo, palabras nuevas de jerga. Elige un <b>tema de gramática</b> o deja <b>Cualquiera</b>.',
    'discuss.step3':
      'Pulsa <pbtn>Escribir una pregunta</pbtn>. Recibes la pregunta (🔊 la lee, <b>Mostrar la traducción</b> la muestra en ruso), preguntas para seguir, comienzos de frase que usan la gramática y palabras útiles. Con un tema de gramática, <b>📘 La regla</b> abre una explicación con ejemplos.',
    'discuss.step4': '<pbtn>Otra pregunta</pbtn> escribe una nueva con los mismos ajustes.',
    'discuss.tip1': '☆ junto a una palabra útil la pone en Palabras por aprender.',

    'settings.title': 'Ajustes',
    'settings.summary': 'Idioma, tema, lo que aprendes, tu nivel y el menú',
    'settings.intro':
      'Se abren con <b>⚙️ Ajustes</b> a la derecha de la barra superior. Todo se guarda al instante.',
    'settings.step1':
      '<b>Perfil</b>: añade una imagen y tu nombre; el nombre se usa en las llamadas de Zoom y en los mensajes al profesor.',
    'settings.step2':
      '<b>Interfaz</b>: el idioma de la aplicación (inglés, ruso, francés, alemán, español, portugués, italiano) y el tema de color: como el sistema, claro u oscuro.',
    'settings.step3':
      '<b>Aprendizaje</b>: marca los idiomas que aprendes y elige tu nivel en cada uno. Los ejercicios, Palabras por aprender, Errores, Estadísticas y las preguntas para debatir muestran entonces solo esos idiomas, y el nivel se usa por defecto en las preguntas para debatir y en Rellena el hueco.',
    'settings.step4':
      'También están allí: el objetivo diario para la racha 🔥, la velocidad de 🔊, qué secciones muestra el menú y qué pestañas muestra la página de una lección.',
    'settings.tip1':
      'Las traducciones de las palabras siguen en ruso, sea cual sea el idioma de la interfaz.',
    'call.title': 'Modo clase',
    'call.summary': 'La llamada, las notas y las palabras de la lección en una pantalla',
    'call.intro':
      'Se abre con <b>Entrar en la clase</b> en el widget de la próxima clase, arriba, cuando el documento tiene un enlace de Google Meet o Zoom. Pensado para la propia clase.',
    'call.step1':
      '<b>Google Meet</b>: pulsa <pbtn>Abrir la llamada en una ventana pequeña</pbtn>. Meet no puede funcionar dentro de otras webs, así que se abre en una ventana pequeña a un lado de la pantalla.',
    'call.step2':
      '<b>Zoom</b>: escribe tu nombre y pulsa <pbtn>Unirse aquí</pbtn>. La llamada funciona dentro de la página, en una ventana que puedes mover y cambiar de tamaño (requiere configurar Zoom una vez en el servidor, ver el README).',
    'call.step3':
      'Escribe en <b>Notas de la clase</b> durante la clase: palabras nuevas como «palabra — перевод», errores, deberes. <btn>⏱ Hora</btn> marca cuándo surgió algo.',
    'call.step4':
      'Después de la clase, <btn>Añadir al documento como Leçon 8</btn> pone las notas en el documento como una lección nueva, lista para los ejercicios.',
    'call.step5':
      '<pbtn>Abrir la pizarra</pbtn> debajo de las notas: escribe, dibuja y pega imágenes. Con el uso compartido en directo configurado, el profesor y el alumno dibujan a la vez en la misma pizarra y ven el puntero del otro; si no, comparte la pantalla en la llamada. <b>Pantalla completa</b> y <b>Guardar como imagen</b> están encima.',
    'call.step6':
      '<pbtn>Empezar el calentamiento</pbtn> al principio de la clase: unos 5 minutos de preguntas sobre la lección anterior y sobre los errores del alumno desde entonces. Al final, <b>No se ha fijado</b> muestra al profesor todas las respuestas incorrectas. Hazlo en el dispositivo del alumno, donde se guardan los errores, y comparte la pantalla.',
    'call.step7':
      '<pbtn>Jugar</pbtn> en <b>Juego de preguntas</b>: 10 preguntas sobre las palabras de la lección, 15 segundos cada una, y una respuesta correcta rápida da más puntos. Jugad en la pantalla compartida; las mejores rondas van a la tabla <b>Récords</b>.',
    'call.tip3':
      '<btn>Lado a lado (media pantalla)</btn> abre Meet sobre la mitad derecha de la pantalla, junto a la aplicación.',
    'call.tip1':
      'Las notas se guardan en este dispositivo para cada día, así que cerrar la página no hace perder nada.',
    'call.tip2':
      'En Chrome, Meet puede flotar sobre todas las ventanas: en Meet, abre ⋮ y elige imagen en imagen.',
    'document.title': 'Documento',
    'document.summary': 'Edita el Google Doc sin salir de la aplicación',
    'document.intro': 'El editor de Google Docs dentro de la aplicación, para escribir lecciones.',
    'document.step1': 'Edita como siempre: los cambios se guardan en Google Docs.',
    'document.step2':
      'Al ir a otra sección, la aplicación sincroniza y las lecciones se actualizan.',
    'document.tip1':
      'Si el editor se queda en blanco o pide iniciar sesión (a menudo en Safari), usa el enlace de encima para abrir el documento en una pestaña nueva.',
    'news.title': 'Novedades',
    'news.summary': 'Lo que ha cambiado en la aplicación, por fecha',
    'news.intro': 'Todos los cambios de la aplicación, de lo más nuevo a lo más antiguo.',
    'news.step1':
      'Cada día indica qué es <b>Nuevo</b>, qué está <b>Mejorado</b> y qué se ha <b>Corregido</b>. Un punto junto a <b>Novedades</b> en el menú significa que hay algo que aún no has visto.',
    'news.step2':
      'Las funciones nuevas y mejoradas están en <b>Qué hay de nuevo</b>, y los errores corregidos, en <b>Errores corregidos</b>. Si aprendes varios idiomas, elige uno en <b>Idioma</b>: verás sus novedades y las de todos los idiomas.',
  },
  pt: {
    title: 'Guia',
    intro:
      'Como funciona a aplicação, em poucos minutos. Cada secção abaixo tem uma ligação que a abre.',
    quickStart: 'Início rápido',
    map: 'O que está onde',
    howTo: 'Como usar',
    goodToKnow: 'Convém saber',
    backToMap: '↑ Voltar ao mapa',
    open: 'Abrir {section}',
    pictureOf: 'Imagem de {label}',
    storageTitle: 'Onde ficam os seus dados',
    storageText:
      'O progresso, as estrelas, as notas, as séries e as notas à mão ficam guardados só neste navegador. Não passam para outro dispositivo ou navegador, e apagar os dados do site no navegador elimina-os.',
    'quick1.title': 'Abra o seu documento de lições',
    'quick1.text':
      'Use a ligação do seu professor. Introduza o código da turma se lho pedirem (só uma vez).',
    'quick2.title': 'Escolha uma lição',
    'quick2.text':
      'No <lessons>Histórico de lições</lessons>, escolha uma lição e veja as palavras.',
    'quick3.title': 'Pratique',
    'quick3.text':
      'Comece pelos <b>Cartões</b> e depois o <b>Teste</b>. As palavras que errar vão para as <mine>Palavras por aprender</mine>.',
    'quick4.title': 'Volte todos os dias',
    'quick4.text': 'Uma ronda no <home>Início</home> leva poucos minutos e mantém a sua série 🔥.',

    'header.title': 'A barra superior',
    'header.summary':
      'A sua imagem, o documento, a sincronização, a próxima aula, comentários e definições',
    'header.intro':
      'A barra de cima está sempre lá. Mostra que Google Doc a aplicação lê e quando foi sincronizado pela última vez, além da próxima aula e da videochamada.',
    'header.step1':
      '<b>↻</b> ao lado do nome do documento sincroniza: volta a ler o documento. Carregue nele depois de o professor acrescentar uma lição. Durante a aula («Aula a decorrer») a app fá-lo sozinha a cada minuto.',
    'header.step2':
      '<b>Próxima aula</b> mostra a data da linha mais recente como <ex>próxima aula: 22.11.2026 18:00 Lisboa</ex>. Uma hora indicada para uma cidade é convertida para a sua. Quando a data já passou, diz «ainda por confirmar».',
    'header.step3':
      '<b>Entrar na aula</b> aparece no widget da próxima aula quando o documento tem uma ligação do Google Meet ou do Zoom, e abre o modo aula: a chamada ao lado da lição e das suas notas.',
    'header.step4':
      '<b>Abrir o documento</b>, <b>Copiar a ligação do aluno</b> e <b>Mudar de documento</b> estão nas <b>Definições</b>, em Documento.',
    'header.step5':
      '<b>Comentários</b> envia uma mensagem ao professor: um erro, uma ideia ou outra coisa qualquer. Anexe até 3 capturas de ecrã ou cole uma com Ctrl+V / ⌘V. A página onde estava é acrescentada automaticamente.',
    'header.step6':
      '<b>⚙️ Definições</b> na ponta direita: o documento, o idioma da aplicação, o tema de cores, as línguas que aprende e o seu nível. A sua imagem, escolhida lá, aparece na ponta esquerda.',
    'header.tip1':
      'Uma lição começa no documento com uma linha como <ex>14.10.2026 1 Lição</ex> (ou <ex>Leçon</ex>, <ex>Lesson</ex>, <ex>Lektion</ex>, <ex>Lección</ex>, <ex>Lezione</ex>). Tudo o que está por baixo, até à próxima linha assim, pertence a essa lição.',
    'header.mock': 'a barra superior',

    'home.title': 'Início',
    'home.summary': 'Uma ronda diária de 10 perguntas variadas',
    'home.intro':
      'A forma mais rápida de praticar todos os dias: 10 perguntas de todas as suas lições, e as palavras que erra voltam mais vezes.',
    'home.step1':
      'Responda a cada pergunta: escolha uma tradução, escolha a palavra na língua que aprende, escreva-a ou escreva o que ouve.',
    'home.step2':
      'Depois de cada resposta carregue em <pbtn>Seguinte</pbtn>. No fim vê a pontuação e <pbtn>Ronda seguinte</pbtn>.',
    'home.step3':
      'Responda pelo menos uma vez por dia para manter a série 🔥; 20 respostas cumprem o objetivo do dia.',
    'home.tip1':
      'Quando o professor escreve o trabalho de casa na lição (<ex>Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé</ex>), o Início mostra-o como uma lista para marcar, com o tempo que falta para a próxima aula. <btn>Praticar as palavras</btn>, <btn>Preencher as lacunas</btn> e <btn>Conjugar</btn> abrem o exercício da tarefa, e ao terminá-lo a tarefa fica marcada.',
    'home.tip2':
      'Uma tarefa escrita (<ex>5 phrases au passé composé</ex>, uma tradução, «descreve o teu dia») tem <btn>Escrever</btn>: escreva a resposta e carregue em <pbtn>Verificar</pbtn>. O Claude corrige os erros, explica cada um como um explicador e diz se a resposta cumpre a tarefa. No modo aula, <b>Trabalho de casa escrito</b> mostra as respostas corrigidas ao professor.',
    'home.tip3':
      '<btn>Preparar o relatório</btn> por baixo do trabalho de casa (e no fim das Estatísticas) escreve um pequeno relatório para o professor: o trabalho feito, as respostas e os erros desde a aula, as suas respostas escritas corrigidas pelo Claude. Leia-o, altere-o se quiser, e <pbtn>Acrescentar ao documento</pbtn> coloca-o por baixo da lição.',
    'home.tip4':
      'No dia de uma lição e no dia seguinte, o Início resume-a: «Hoje, lição 7: 12 palavras novas, 2 verbos», as palavras (primeiro as palavras-chave) e a gramática, com <pbtn>Começar a revisão</pbtn>. ✕ oculta-a.',
    'home.tip5':
      'Nas 24 horas antes de uma aula (quando o documento indica a hora), o Início propõe <pbtn>Rever antes da aula</pbtn>: uma ronda com as palavras da última lição e as suas palavras difíceis.',
    'home.mock': 'a série e o objetivo diário no Início',

    'lessons.title': 'Histórico de lições',
    'lessons.summary': 'Palavras, verbos e notas de cada lição',
    'lessons.intro':
      'Todas as lições do documento, com a mais recente selecionada. O Claude lê-a uma vez e prepara o vocabulário com traduções, pares de sinónimos e antónimos, e os verbos.',
    'lessons.step1':
      'Escolha uma lição na lista à esquerda (cada lição tem a sua própria ligação, que pode partilhar).',
    'lessons.step2':
      'Fique no separador <b>Palavras</b>. Todas as palavras estão marcadas; desmarque as que não quer ou use <b>Escolher todas</b>, <b>Limpar</b> e o filtro.',
    'lessons.step3':
      'Comece um exercício na fila de botões: <pbtn>Teste</pbtn> <btn>Cartões</btn> <btn>Ligue as traduções</btn> <btn>Sinónimos e antónimos</btn> <btn>Preencha o espaço</btn> <btn>Ditado</btn>',
    'lessons.step4':
      'Carregue em 🔊 para ouvir uma palavra e em ☆ para a pôr nas <b>Palavras por aprender</b>.',
    'lessons.step5':
      'Faça duplo clique em qualquer palavra ou expressão na língua que está a aprender (no telemóvel, mantenha-a premida) para abrir o menu: <b>Traduzir</b> nessa frase, <b>Definir</b>, <b>Exemplos</b> e, se for um verbo, <b>Conjugar</b>. <btn>Acrescentar à lição 1</btn> escreve-a por baixo da lição, e ela passa para os exercícios.',
    'lessons.tip1':
      '<added>✱</added> marca uma tradução que o Claude acrescentou e que não está nas notas.',
    'lessons.tip2':
      '<b>Cartões</b>: <key>Espaço</key> vira o cartão, <key>←</key> quer dizer «outra vez», <key>→</key> quer dizer «já sei». O botão em cima muda o sentido.',
    'lessons.tip3':
      'Em baixo: <b>Exportar palavras para o Anki</b> guarda as palavras marcadas num ficheiro (no Anki: Ficheiro → Importar), e <b>Preparar esta lição de novo</b> pede ao Claude que volte a ler uma lição editada.',
    'lessons.tip4':
      '<b>As minhas notas</b> é o seu bloco de notas da lição, guardado enquanto escreve. <b>Original</b> mostra a lição exatamente como está escrita.',
    'lessons.tip5':
      '<b>Gramática</b> explica cada ponto de gramática da lição, com <pbtn>Praticar esta regra</pbtn> para fazer frases. <b>Trabalhos de casa</b> mostra o que há para fazer; marque as tarefas ao terminá-las. <b>Exercícios do manual</b> mostra os exercícios do livro e importa novos a partir de fotos ou de um PDF para a lição no documento. Em <b>As minhas notas</b> estão o quadro e as notas do modo aula desse dia.',
    'lessons.tip6':
      'Uma palavra que o professor marca com ★ no documento (<ex>★ la boulangerie — пекарня</ex>) é uma <b>palavra-chave</b>: tem a etiqueta <b>chave</b> e aparece mais vezes nos exercícios.',
    'lessons.tip7':
      'Para o professor: em <b>Trabalhos de casa</b>, <btn>Fazer com o Claude</btn> escreve um bloco <ex>Devoirs:</ex> com as palavras e a gramática da lição (primeiro as palavras-chave). Verifique-o, carregue em <pbtn>Acrescentar a esta lição</pbtn>, e o aluno encontra-o no Início como lista para marcar.',
    'lessons.mock': 'o separador Palavras de uma lição',

    'verbs.title': 'Verbos',
    'verbs.summary': 'Tabelas de conjugação e exercícios (separador Verbos de uma lição)',
    'verbs.intro':
      'O separador <b>Verbos</b> de uma lição em qualquer língua exceto o inglês tem uma tabela de conjugação para cada verbo: o francês em seis tempos, na afirmativa e na negativa; o alemão, o espanhol, o italiano e o português nos seus cinco ou seis tempos principais.',
    'verbs.step1': 'Carregue num verbo para abrir a tabela.',
    'verbs.step2':
      'Escolha um tempo (présent, passé composé, imparfait, futur simple, conditionnel présent, impératif) e <b>afirmativa</b> ou <b>negativa</b>. 🔊 lê cada forma.',
    'verbs.step3':
      'Carregue em <pbtn>Praticar este tempo</pbtn>, preencha todas as pessoas e depois <pbtn>Verificar as respostas</pbtn>. Por baixo das formas erradas aparece a certa.',
    'verbs.step4':
      '<btn>Teste rápido</btn> pergunta formas aleatórias de todos os verbos que abriu.',
    'verbs.tip1':
      'Escreva a forma com ou sem o pronome: tanto «nous réveillons» como «réveillons» contam.',
    'verbs.tip2':
      'Maiúsculas e pontuação não contam. Um acento em falta conta como «quase», não como erro.',
    'verbs.tip3':
      'Se uma tabela parecer errada, <b>Conjugar de novo</b> (ao lado do particípio passado) pede uma nova.',
    'verbs.mock': 'uma tabela de verbos',

    'all-lessons.title': 'Lições descarregadas',
    'all-lessons.summary': 'Os mesmos exercícios, com várias lições ao mesmo tempo',
    'all-lessons.intro':
      'Todos os exercícios de palavras e verbos, com todas as lições preparadas juntas.',
    'all-lessons.step1':
      'Deixe <b>Todas</b> selecionado ou toque nas etiquetas das lições para praticar só algumas.',
    'all-lessons.step2':
      'Use os separadores <b>Palavras</b> e <b>Verbos</b> tal como numa só lição.',
    'all-lessons.mock': 'etiquetas das lições',

    'my-words.title': 'Palavras por aprender',
    'my-words.summary': 'A sua lista pessoal de palavras a trabalhar',
    'my-words.intro':
      'As palavras que marcou com ☆ e as que errou em qualquer exercício. O número ao lado de <b>Palavras por aprender</b> no menu mostra quantas são.',
    'my-words.step1': 'Pratique-as com os mesmos exercícios de uma lição.',
    'my-words.step2':
      'Uma palavra sai da lista após <b>3 respostas certas seguidas</b> em qualquer exercício (<b>Já sei</b> num cartão também conta) ou quando lhe tira a ★. Os pontos ao lado, como ●●○, mostram quanto já avançou; um erro recomeça a contagem.',

    'mistakes.title': 'Erros',
    'mistakes.summary': 'As palavras e formas verbais que mais erra',
    'mistakes.intro':
      'Os seus erros mais frequentes, palavras e formas verbais, com quantas vezes errou cada um.',
    'mistakes.step1': 'Carregue em <pbtn>Praticar os meus erros</pbtn> para uma ronda só com eles.',

    'stats.title': 'Estatísticas',
    'stats.summary': 'O seu progresso e os pontos fracos',
    'stats.intro':
      'Quantas palavras aprendeu, que lições, tipos de palavras e tempos lhe custam mais, e os erros mais comuns.',
    'stats.step1': 'Veja de vez em quando para escolher o que rever a seguir.',

    'photo.title': 'Análise de fotos',
    'photo.summary': 'Palavras sublinhadas, notas à mão ou um PDF do manual',
    'photo.intro': 'Três maneiras de trazer palavras do papel. Escolha uma com o botão em cima.',
    'photo.step1':
      '<b>Palavras sublinhadas</b>: sublinhe palavras num livro, carregue em <pbtn>Escolher ou tirar fotos</pbtn> (até 10 páginas de cada vez) e obtenha uma só tabela com a tradução no contexto, a forma do dicionário, o tempo verbal e uma explicação curta.',
    'photo.step2':
      '<b>Notas à mão</b>: fotografe até 4 páginas de notas, corrija o que foi mal lido (as palavras ilegíveis ficam marcadas com [?]) e carregue em <pbtn>Preparar a lição</pbtn> para obter palavras, verbos e exercícios como em qualquer lição.',
    'photo.step3':
      '<b>PDF do manual</b>: carregue em <pbtn>Escolher um PDF</pbtn>, indique as páginas de um capítulo (até 20) e depois <pbtn>Ler estas páginas</pbtn>. O Claude escreve notas da aula: palavras, expressões, gramática e exemplos. Reveja-as e carregue em <pbtn>Preparar a lição</pbtn>.',
    'photo.step4':
      '<btn>Acrescentar ao documento como Leçon 8</btn> acrescenta o que foi lido ao fim do documento como uma nova lição (precisa de uma configuração única no servidor, ver o README). Para as palavras sublinhadas, <b>Acrescentar a</b> também permite pô-las por baixo de uma das suas lições.',
    'photo.tip1':
      'Tire a foto de frente, com boa luz e com toda a linha marcada dentro do enquadramento.',
    'photo.tip2': '☆ ao lado de uma palavra põe a forma do dicionário nas Palavras por aprender.',
    'photo.mock': 'o resultado de uma foto com palavras sublinhadas',

    'text.title': 'Análise de texto',
    'text.summary': 'Cole um artigo: explicações, uma tradução e exercícios',
    'text.intro':
      'Para um texto que encontrou: um artigo, uma história, uma publicação. Cole-o em vez de tirar uma captura de ecrã e trabalhe com ele aqui.',
    'text.step1':
      'Cole o texto e carregue em <pbtn>Ler este texto</pbtn>. Fica guardado neste dispositivo, com tudo o que fizer com ele.',
    'text.step2':
      'Clique numa palavra ou selecione algumas com o rato ou o dedo e carregue em <pbtn>Explicar</pbtn>: obtém a tradução nessa frase, a forma do dicionário, o tempo verbal e uma explicação curta. ☆ põe a palavra nas Palavras por aprender.',
    'text.step3':
      '<btn>Traduzir o texto</btn> mostra uma tradução em russo por baixo de cada parágrafo; o mesmo botão volta a escondê-la.',
    'text.step4':
      '<pbtn>Criar perguntas e exercícios</pbtn>: o Claude escolhe as palavras que vale a pena aprender (com o Teste, os Cartões e os outros exercícios habituais), escreve perguntas sobre o texto e um exercício de verdadeiro ou falso.',
    'text.tip1':
      'As palavras sobre as quais já perguntou aparecem sublinhadas com pontos no texto.',
    'text.tip2':
      'As palavras são escolhidas para o seu nível nessa língua, definido nas Definições.',
    'discuss.title': 'Uma pergunta para debate',
    'discuss.summary': 'Uma pergunta para debater no início da aula',
    'discuss.intro':
      'Uma pergunta para conversar no início da aula, escrita para o seu nível e para a gramática que está a praticar.',
    'discuss.step1': 'Escolha a língua e o seu <b>nível</b> (A1–C2).',
    'discuss.step2':
      'Escolha um <b>tema de vocabulário</b>: da lista ou das suas lições, ou escreva qualquer tema seu em <b>Ou o seu próprio tema</b>: uma série, um passatempo, novas palavras de calão. Escolha um <b>tema de gramática</b> ou deixe <b>Qualquer</b>.',
    'discuss.step3':
      'Carregue em <pbtn>Escrever uma pergunta</pbtn>. Recebe a pergunta (🔊 lê-a, <b>Mostrar a tradução</b> mostra-a em russo), perguntas para continuar, inícios de frase que usam a gramática e palavras úteis. Com um tema de gramática, <b>📘 A regra</b> abre uma explicação com exemplos.',
    'discuss.step4': '<pbtn>Outra pergunta</pbtn> escreve uma nova com as mesmas definições.',
    'discuss.tip1': '☆ ao lado de uma palavra útil põe-na nas Palavras por aprender.',

    'settings.title': 'Definições',
    'settings.summary': 'Idioma, tema, o que aprende, o seu nível e o menu',
    'settings.intro':
      'Abrem-se com <b>⚙️ Definições</b> à direita da barra superior. Tudo fica guardado de imediato.',
    'settings.step1':
      '<b>Perfil</b>: acrescente uma imagem e o seu nome; o nome é usado nas chamadas do Zoom e nas mensagens para o professor.',
    'settings.step2':
      '<b>Interface</b>: o idioma da aplicação (inglês, russo, francês, alemão, espanhol, português, italiano) e o tema de cores: como o sistema, claro ou escuro.',
    'settings.step3':
      '<b>Aprendizagem</b>: marque as línguas que aprende e escolha o seu nível em cada uma. Os exercícios, as Palavras por aprender, os Erros, as Estatísticas e as perguntas para debate mostram então só essas línguas, e o nível é usado por defeito nas perguntas para debate e em Preencha o espaço.',
    'settings.step4':
      'Também lá estão: o objetivo diário para a série 🔥, a velocidade do 🔊, as secções que o menu mostra e os separadores que a página de uma lição mostra.',
    'settings.tip1':
      'As traduções das palavras ficam em russo, seja qual for o idioma da interface.',
    'call.title': 'Modo aula',
    'call.summary': 'A chamada, as notas e as palavras da lição num só ecrã',
    'call.intro':
      'Abre-se com <b>Entrar na aula</b> no widget da próxima aula, em cima, quando o documento tem uma ligação do Google Meet ou do Zoom. Feito para a própria aula.',
    'call.step1':
      '<b>Google Meet</b>: carregue em <pbtn>Abrir a chamada numa janela pequena</pbtn>. O Meet não funciona dentro de outros sites, por isso abre numa janela pequena ao lado do ecrã.',
    'call.step2':
      '<b>Zoom</b>: escreva o seu nome e carregue em <pbtn>Entrar aqui</pbtn>. A chamada funciona dentro da página, numa janela que pode mover e redimensionar (precisa de configurar o Zoom uma vez no servidor, ver o README).',
    'call.step3':
      'Escreva nas <b>Notas da aula</b> durante a aula: palavras novas como «palavra — перевод», erros, trabalhos de casa. <btn>⏱ Hora</btn> marca quando algo surgiu.',
    'call.step4':
      'Depois da aula, <btn>Acrescentar ao documento como Leçon 8</btn> põe as notas no documento como uma nova lição, pronta para os exercícios.',
    'call.step5':
      '<pbtn>Abrir o quadro</pbtn> por baixo das notas: escreva, desenhe e cole imagens. Com a partilha em direto configurada, o professor e o aluno desenham ao mesmo tempo no mesmo quadro e veem o ponteiro um do outro; caso contrário, partilhe o ecrã na chamada. <b>Ecrã inteiro</b> e <b>Guardar como imagem</b> estão por cima.',
    'call.step6':
      '<pbtn>Começar o aquecimento</pbtn> no início da aula: cerca de 5 minutos de perguntas sobre a lição anterior e sobre os erros do aluno desde então. No fim, <b>Não ficou</b> mostra ao professor todas as respostas erradas. Faça-o no dispositivo do aluno, onde os erros ficam guardados, e partilhe o ecrã.',
    'call.step7':
      '<pbtn>Jogar</pbtn> em <b>Jogo de perguntas</b>: 10 perguntas sobre as palavras da lição, 15 segundos cada, e uma resposta certa rápida vale mais. Joguem no ecrã partilhado; as melhores rondas vão para a tabela <b>Recordes</b>.',
    'call.tip3':
      '<btn>Lado a lado (meio ecrã)</btn> abre o Meet na metade direita do ecrã, ao lado da aplicação.',
    'call.tip1':
      'As notas ficam guardadas neste dispositivo para cada dia, por isso fechar a página não faz perder nada.',
    'call.tip2':
      'No Chrome, o Meet pode flutuar por cima de todas as janelas: no Meet, abra ⋮ e escolha imagem na imagem.',
    'document.title': 'Documento',
    'document.summary': 'Edite o Google Doc sem sair da aplicação',
    'document.intro': 'O editor do Google Docs dentro da aplicação, para escrever lições.',
    'document.step1': 'Edite como de costume: as alterações ficam guardadas no Google Docs.',
    'document.step2':
      'Quando passa para outra secção, a aplicação sincroniza e as lições são atualizadas.',
    'document.tip1':
      'Se o editor ficar em branco ou pedir para iniciar sessão (muitas vezes no Safari), use a ligação por cima dele para abrir o documento num separador novo.',
    'news.title': 'Novidades',
    'news.summary': 'O que mudou na aplicação, por data',
    'news.intro': 'Todas as alterações da aplicação, da mais recente para a mais antiga.',
    'news.step1':
      'Cada dia indica o que é <b>Novo</b>, o que foi <b>Melhorado</b> e o que foi <b>Corrigido</b>. Um ponto ao lado de <b>Novidades</b> no menu significa que há algo que ainda não viu.',
    'news.step2':
      'As funcionalidades novas e melhoradas estão em <b>O que há de novo</b> e as correções de erros em <b>Correções de erros</b>. Se aprende várias línguas, escolha uma em <b>Língua</b>: vê as novidades dessa língua e as de todas as línguas.',
  },
  it: {
    title: 'Guida',
    intro: 'Come funziona l’app, in pochi minuti. Ogni sezione qui sotto ha un link che la apre.',
    quickStart: 'Per iniziare',
    map: 'Cosa c’è e dove',
    howTo: 'Come si usa',
    goodToKnow: 'Utile sapere',
    backToMap: '↑ Torna alla mappa',
    open: 'Apri {section}',
    pictureOf: 'Immagine di {label}',
    storageTitle: 'Dove sono i tuoi dati',
    storageText:
      'Progressi, stelle, appunti, serie e appunti a mano sono salvati solo in questo browser. Non ti seguono su un altro dispositivo o browser, e cancellare i dati del sito nel browser li elimina.',
    'quick1.title': 'Apri il tuo documento delle lezioni',
    'quick1.text':
      'Usa il link del tuo insegnante. Inserisci il codice della classe se richiesto (una sola volta).',
    'quick2.title': 'Scegli una lezione',
    'quick2.text':
      'In <lessons>Cronologia lezioni</lessons> scegli una lezione e guarda le sue parole.',
    'quick3.title': 'Esercitati',
    'quick3.text':
      'Comincia con le <b>Flashcard</b>, poi il <b>Quiz</b>. Le parole sbagliate finiscono nelle <mine>Parole da imparare</mine>.',
    'quick4.title': 'Torna ogni giorno',
    'quick4.text':
      'Un turno in <home>Home</home> richiede pochi minuti e mantiene viva la tua serie 🔥.',

    'header.title': 'La barra in alto',
    'header.summary':
      'La tua immagine, il documento, la sincronizzazione, la prossima lezione, il feedback e le impostazioni',
    'header.intro':
      'La barra in alto è sempre lì. Mostra quale Google Doc legge l’app e quando è stato sincronizzato l’ultima volta, oltre alla prossima lezione e alla videochiamata.',
    'header.step1':
      '<b>↻</b> accanto al nome del documento sincronizza: rilegge il documento. Premilo dopo che l’insegnante ha aggiunto una lezione. Durante la lezione («Lezione in corso») l’app lo fa da sola ogni minuto.',
    'header.step2':
      '<b>Prossima lezione</b> mostra la data della riga più recente come <ex>prossima lezione: 22.11.2026 18:00 Roma</ex>. Un orario indicato per una città viene convertito nel tuo. Quando la data è passata, dice «non ancora confermata».',
    'header.step3':
      '<b>Entra nella lezione</b> compare nel widget della prossima lezione quando il documento ha un link di Google Meet o Zoom, e apre la modalità lezione: la chiamata accanto alla lezione e ai tuoi appunti.',
    'header.step4':
      '<b>Apri il documento</b>, <b>Copia il link per lo studente</b> e <b>Cambia documento</b> sono nelle <b>Impostazioni</b>, sotto Documento.',
    'header.step5':
      '<b>Feedback</b> invia un messaggio all’insegnante: un errore, un’idea o altro. Allega fino a 3 screenshot o incollane uno con Ctrl+V / ⌘V. La pagina in cui eri viene aggiunta da sola.',
    'header.step6':
      '<b>⚙️ Impostazioni</b> all’estrema destra: il documento, la lingua dell’app, il tema, le lingue che studi e il tuo livello. La tua immagine, scelta lì, compare all’estrema sinistra.',
    'header.tip1':
      'Una lezione inizia nel documento con una riga come <ex>14.10.2026 1 Lezione</ex> (oppure <ex>Leçon</ex>, <ex>Lesson</ex>, <ex>Lektion</ex>, <ex>Lección</ex>, <ex>Lição</ex>). Tutto ciò che c’è sotto, fino alla riga successiva di questo tipo, appartiene a quella lezione.',
    'header.mock': 'la barra in alto',

    'home.title': 'Home',
    'home.summary': 'Un turno quotidiano di 10 domande miste',
    'home.intro':
      'Il modo più veloce per esercitarsi ogni giorno: 10 domande da tutte le tue lezioni, con le parole che sbagli che tornano più spesso.',
    'home.step1':
      'Rispondi a ogni domanda: scegli una traduzione, scegli la parola nella lingua che studi, scrivila o scrivi quello che senti.',
    'home.step2':
      'Dopo ogni risposta premi <pbtn>Avanti</pbtn>. Alla fine vedi il punteggio e <pbtn>Prossimo turno</pbtn>.',
    'home.step3':
      'Rispondi almeno una volta al giorno per mantenere la serie 🔥; 20 risposte completano l’obiettivo del giorno.',
    'home.tip1':
      'Quando l’insegnante scrive i compiti nella lezione (<ex>Devoirs: verbes être, avoir — présent; mots de la leçon 5; 5 phrases au passé composé</ex>), la Home li mostra come lista da spuntare, con il tempo che manca alla prossima lezione. <btn>Ripassa le parole</btn>, <btn>Riempi gli spazi</btn> e <btn>Coniuga</btn> aprono l’esercizio del compito, e finirlo lo spunta.',
    'home.tip2':
      'Un compito scritto (<ex>5 phrases au passé composé</ex>, una traduzione, «descrivi la tua giornata») ha <btn>Scrivi</btn>: scrivi la risposta e premi <pbtn>Controlla</pbtn>. Claude corregge gli errori, spiega ognuno come un insegnante privato e dice se la risposta fa ciò che chiede il compito. Nella modalità lezione, <b>Compiti scritti</b> mostra all’insegnante le risposte corrette.',
    'home.tip3':
      '<btn>Prepara il resoconto</btn> sotto i compiti (e in fondo alle Statistiche) scrive un breve resoconto per l’insegnante: i compiti fatti, le risposte e gli errori dalla lezione, le tue risposte scritte corrette da Claude. Leggilo, cambialo se vuoi, e <pbtn>Aggiungi al documento</pbtn> lo mette sotto la lezione.',
    'home.tip4':
      'Il giorno di una lezione e quello dopo, la Home la riassume: «Oggi, lezione 7: 12 parole nuove, 2 verbi», le sue parole (prima quelle chiave) e la grammatica, con <pbtn>Inizia il ripasso</pbtn>. ✕ la nasconde.',
    'home.tip5':
      'Nelle 24 ore prima di una lezione (se il documento ne indica l’ora), la Home propone <pbtn>Ripassa prima della lezione</pbtn>: un giro sulle parole dell’ultima lezione e sulle tue parole difficili.',
    'home.mock': 'la serie e l’obiettivo giornaliero in Home',

    'lessons.title': 'Cronologia lezioni',
    'lessons.summary': 'Parole, verbi e appunti di ogni lezione',
    'lessons.intro':
      'Tutte le lezioni del documento, con la più recente selezionata. Claude la legge una volta e prepara il lessico con le traduzioni, le coppie di sinonimi e contrari, e i verbi.',
    'lessons.step1':
      'Scegli una lezione nella lista a sinistra (ogni lezione ha un proprio link che puoi condividere).',
    'lessons.step2':
      'Resta nella scheda <b>Parole</b>. Tutte le parole sono spuntate; togli la spunta a quelle che non vuoi, oppure usa <b>Scegli tutte</b>, <b>Togli</b> e il filtro.',
    'lessons.step3':
      'Avvia un esercizio dalla fila di pulsanti: <pbtn>Quiz</pbtn> <btn>Flashcard</btn> <btn>Abbina le traduzioni</btn> <btn>Sinonimi e contrari</btn> <btn>Completa la frase</btn> <btn>Dettato</btn>',
    'lessons.step4':
      'Premi 🔊 per ascoltare una parola e ☆ per metterla nelle <b>Parole da imparare</b>.',
    'lessons.step5':
      'Fai doppio clic su una parola o un’espressione nella lingua che studi (sul telefono, tienila premuta) per aprire il suo menu: <b>Traduci</b> in quella frase, <b>Definisci</b>, <b>Esempi</b> e, per un verbo, <b>Coniuga</b>. <btn>Aggiungi alla lezione 1</btn> la scrive sotto la lezione, ed entra negli esercizi.',
    'lessons.tip1':
      '<added>✱</added> segna una traduzione aggiunta da Claude che non c’è negli appunti.',
    'lessons.tip2':
      '<b>Flashcard</b>: <key>Spazio</key> gira la carta, <key>←</key> vuol dire «ancora», <key>→</key> vuol dire «la so». L’interruttore in alto cambia la direzione.',
    'lessons.tip3':
      'In fondo: <b>Esporta le parole per Anki</b> salva le parole spuntate in un file (in Anki: File → Importa), e <b>Prepara di nuovo questa lezione</b> chiede a Claude di rileggere una lezione modificata.',
    'lessons.tip4':
      '<b>I miei appunti</b> è il tuo blocco note per la lezione, salvato mentre scrivi. <b>Originale</b> mostra la lezione esattamente com’è scritta.',
    'lessons.tip5':
      '<b>Grammatica</b> spiega ogni punto di grammatica della lezione, con <pbtn>Esercitati su questa regola</pbtn> per fare frasi. <b>Compiti</b> elenca cosa fare; spunta i compiti finiti. <b>Esercizi dal libro</b> mostra gli esercizi del libro e ne importa di nuovi da foto o da un PDF nella lezione del documento. In <b>I miei appunti</b> trovi la lavagna e gli appunti della modalità lezione di quel giorno.',
    'lessons.tip6':
      'Una parola che l’insegnante segna con ★ nel documento (<ex>★ la boulangerie — пекарня</ex>) è una <b>parola chiave</b>: ha l’etichetta <b>chiave</b> e compare più spesso negli esercizi.',
    'lessons.tip7':
      'Per l’insegnante: in <b>Compiti</b>, <btn>Crea con Claude</btn> scrive un blocco <ex>Devoirs:</ex> con le parole e la grammatica della lezione (prima le parole chiave). Controllalo, premi <pbtn>Aggiungi a questa lezione</pbtn>, e lo studente lo trova nella Home come lista da spuntare.',
    'lessons.mock': 'la scheda Parole di una lezione',

    'verbs.title': 'Verbi',
    'verbs.summary': 'Tabelle di coniugazione ed esercizi (scheda Verbi di una lezione)',
    'verbs.intro':
      'La scheda <b>Verbi</b> di una lezione in qualsiasi lingua tranne l’inglese ha una tabella di coniugazione per ogni verbo: il francese in sei tempi, affermativa e negativa; il tedesco, lo spagnolo, l’italiano e il portoghese nei loro cinque o sei tempi principali.',
    'verbs.step1': 'Premi un verbo per aprire la sua tabella.',
    'verbs.step2':
      'Scegli un tempo (présent, passé composé, imparfait, futur simple, conditionnel présent, impératif) e <b>affermativa</b> o <b>negativa</b>. 🔊 legge ogni forma.',
    'verbs.step3':
      'Premi <pbtn>Esercitati su questo tempo</pbtn>, completa tutte le persone, poi <pbtn>Controlla le risposte</pbtn>. Sotto le forme sbagliate compare quella giusta.',
    'verbs.step4': '<btn>Quiz veloce</btn> chiede forme a caso di tutti i verbi che hai aperto.',
    'verbs.tip1':
      'Scrivi la forma con o senza il pronome: valgono sia «nous réveillons» sia «réveillons».',
    'verbs.tip2':
      'Maiuscole e punteggiatura non contano. Un accento mancante conta come «quasi», non come errore.',
    'verbs.tip3':
      'Se una tabella sembra sbagliata, <b>Coniuga di nuovo</b> (accanto al participio passato) ne chiede una nuova.',
    'verbs.mock': 'una tabella dei verbi',

    'all-lessons.title': 'Lezioni scaricate',
    'all-lessons.summary': 'Gli stessi esercizi, su più lezioni insieme',
    'all-lessons.intro':
      'Tutti gli esercizi su parole e verbi, con tutte le lezioni preparate insieme.',
    'all-lessons.step1':
      'Lascia selezionato <b>Tutte</b> oppure tocca le etichette delle lezioni per esercitarti solo su alcune.',
    'all-lessons.step2': 'Usa le schede <b>Parole</b> e <b>Verbi</b> come in una singola lezione.',
    'all-lessons.mock': 'etichette delle lezioni',

    'my-words.title': 'Parole da imparare',
    'my-words.summary': 'La tua lista personale di parole su cui lavorare',
    'my-words.intro':
      'Le parole che hai segnato con ☆ e quelle che hai sbagliato in qualsiasi esercizio. Il numero accanto a <b>Parole da imparare</b> nel menu indica quante sono.',
    'my-words.step1': 'Esercitati con gli stessi esercizi di una lezione.',
    'my-words.step2':
      'Una parola esce dalla lista dopo <b>3 risposte giuste di fila</b> in qualsiasi esercizio (vale anche <b>La so</b> su una flashcard) o quando le togli la ★. I puntini accanto, come ●●○, mostrano a che punto è; un errore fa ripartire il conteggio da capo.',

    'mistakes.title': 'Errori',
    'mistakes.summary': 'Le parole e le forme verbali che sbagli di più',
    'mistakes.intro':
      'I tuoi errori più frequenti, parole e forme verbali, con quante volte hai sbagliato ognuno.',
    'mistakes.step1':
      'Premi <pbtn>Esercitati sui miei errori</pbtn> per un turno fatto solo di quelli.',

    'stats.title': 'Statistiche',
    'stats.summary': 'I tuoi progressi e i punti deboli',
    'stats.intro':
      'Quante parole hai imparato, quali lezioni, tipi di parole e tempi ti riescono più difficili, e i tuoi errori più comuni.',
    'stats.step1': 'Guardale ogni tanto per decidere cosa ripassare.',

    'photo.title': 'Analisi delle foto',
    'photo.summary': 'Parole sottolineate, appunti a mano o un PDF del manuale',
    'photo.intro':
      'Tre modi per portare parole dalla carta. Scegline uno con l’interruttore in alto.',
    'photo.step1':
      '<b>Parole sottolineate</b>: sottolinea le parole in un libro, premi <pbtn>Scegli o scatta delle foto</pbtn> (fino a 10 pagine alla volta) e ottieni un’unica tabella con la traduzione nel contesto, la forma del dizionario, il tempo verbale e una breve spiegazione.',
    'photo.step2':
      '<b>Appunti a mano</b>: fotografa fino a 4 pagine di appunti, correggi ciò che è stato letto male (le parole illeggibili sono segnate con [?]), poi premi <pbtn>Prepara la lezione</pbtn> per avere parole, verbi ed esercizi come in qualsiasi lezione.',
    'photo.step3':
      '<b>PDF del manuale</b>: premi <pbtn>Scegli un PDF</pbtn>, indica le pagine di un capitolo (fino a 20), poi <pbtn>Leggi queste pagine</pbtn>. Claude scrive gli appunti della lezione: parole, espressioni, grammatica ed esempi. Controllali e premi <pbtn>Prepara la lezione</pbtn>.',
    'photo.step4':
      '<btn>Aggiungi al documento come Leçon 8</btn> aggiunge quanto letto in fondo al documento come nuova lezione (serve una configurazione una tantum sul server, vedi il README). Per le parole sottolineate, <b>Aggiungi a</b> può invece metterle sotto una delle tue lezioni.',
    'photo.tip1':
      'Scatta la foto di fronte, con buona luce e con tutta la riga segnata nell’inquadratura.',
    'photo.tip2':
      '☆ accanto a una parola mette la sua forma del dizionario nelle Parole da imparare.',
    'photo.mock': 'il risultato di una foto con parole sottolineate',

    'text.title': 'Analisi del testo',
    'text.summary': 'Incolla un articolo: spiegazioni, una traduzione ed esercizi',
    'text.intro':
      'Per un testo che hai trovato tu: un articolo, un racconto, un post. Incollalo invece di fare uno screenshot e lavoraci qui.',
    'text.step1':
      'Incolla il testo e premi <pbtn>Leggi questo testo</pbtn>. Viene salvato su questo dispositivo, con tutto quello che ci fai.',
    'text.step2':
      'Clicca su una parola, o selezionane alcune con il mouse o il dito, poi premi <pbtn>Spiega</pbtn>: ottieni la traduzione in quella frase, la forma del dizionario, il tempo verbale e una breve spiegazione. ☆ mette la parola nelle Parole da imparare.',
    'text.step3':
      '<btn>Traduci il testo</btn> mostra una traduzione in russo sotto ogni paragrafo; lo stesso pulsante la nasconde di nuovo.',
    'text.step4':
      '<pbtn>Crea domande ed esercizi</pbtn>: Claude sceglie le parole che vale la pena imparare (con Quiz, Flashcard e gli altri esercizi di sempre), scrive domande sul testo e un esercizio vero o falso.',
    'text.tip1': 'Le parole che hai già chiesto sono sottolineate a puntini nel testo.',
    'text.tip2':
      'Le parole sono scelte per il tuo livello in quella lingua, impostato nelle Impostazioni.',
    'discuss.title': 'Una domanda di discussione',
    'discuss.summary': 'Una domanda di discussione per iniziare la lezione',
    'discuss.intro':
      'Una domanda di cui parlare all’inizio della lezione, scritta per il tuo livello e la grammatica che stai esercitando.',
    'discuss.step1': 'Scegli la lingua e il tuo <b>livello</b> (A1–C2).',
    'discuss.step2':
      'Scegli un <b>tema di lessico</b>: dalla lista o dalle tue lezioni, oppure scrivi un tuo tema in <b>Oppure un tuo tema</b>: una serie, un hobby, parole nuove di slang. Scegli un <b>tema di grammatica</b> o lascia <b>Qualsiasi</b>.',
    'discuss.step3':
      'Premi <pbtn>Scrivi una domanda</pbtn>. Ricevi la domanda (🔊 la legge, <b>Mostra la traduzione</b> la mostra in russo), domande per continuare, inizi di frase che usano la grammatica e parole utili. Con un tema di grammatica, <b>📘 La regola</b> apre una spiegazione con esempi.',
    'discuss.step4':
      '<pbtn>Un’altra domanda</pbtn> ne scrive una nuova con le stesse impostazioni.',
    'discuss.tip1': '☆ accanto a una parola utile la mette nelle Parole da imparare.',

    'settings.title': 'Impostazioni',
    'settings.summary': 'Lingua, tema, cosa studi, il tuo livello e il menu',
    'settings.intro':
      'Si aprono con <b>⚙️ Impostazioni</b> a destra della barra in alto. Tutto si salva subito.',
    'settings.step1':
      '<b>Profilo</b>: aggiungi un’immagine e il tuo nome; il nome si usa nelle chiamate Zoom e nei messaggi all’insegnante.',
    'settings.step2':
      '<b>Interfaccia</b>: la lingua dell’app (inglese, russo, francese, tedesco, spagnolo, portoghese, italiano) e il tema: come il sistema, chiaro o scuro.',
    'settings.step3':
      '<b>Apprendimento</b>: spunta le lingue che studi e scegli il tuo livello in ognuna. Esercizi, Parole da imparare, Errori, Statistiche e le domande di discussione mostrano allora solo quelle lingue, e il livello è quello predefinito per le domande di discussione e per Completa la frase.',
    'settings.step4':
      'Lì trovi anche: l’obiettivo giornaliero per la serie 🔥, la velocità del 🔊, quali sezioni mostra il menu e quali schede mostra la pagina di una lezione.',
    'settings.tip1':
      'Le traduzioni delle parole restano in russo, qualunque sia la lingua dell’interfaccia.',
    'call.title': 'Modalità lezione',
    'call.summary': 'La chiamata, gli appunti e le parole della lezione in un’unica schermata',
    'call.intro':
      'Si apre con <b>Entra nella lezione</b> nel widget della prossima lezione, in alto, quando il documento ha un link di Google Meet o Zoom. Pensata per la lezione stessa.',
    'call.step1':
      '<b>Google Meet</b>: premi <pbtn>Apri la chiamata in una piccola finestra</pbtn>. Meet non può funzionare dentro altri siti, quindi si apre in una piccola finestra a lato dello schermo.',
    'call.step2':
      '<b>Zoom</b>: inserisci il tuo nome e premi <pbtn>Partecipa qui</pbtn>. La chiamata funziona dentro la pagina, in una finestra che puoi spostare e ridimensionare (serve configurare Zoom una volta sul server, vedi il README).',
    'call.step3':
      'Scrivi negli <b>Appunti della lezione</b> durante la lezione: parole nuove come «parola — перевод», errori, compiti. <btn>⏱ Ora</btn> segna quando è venuto fuori qualcosa.',
    'call.step4':
      'Dopo la lezione, <btn>Aggiungi al documento come Leçon 8</btn> mette gli appunti nel documento come nuova lezione, pronta per gli esercizi.',
    'call.step5':
      '<pbtn>Apri la lavagna</pbtn> sotto gli appunti: scrivi, disegna e incolla immagini. Con la condivisione in diretta configurata, insegnante e studente disegnano insieme sulla stessa lavagna e vedono il puntatore dell’altro; altrimenti condividi lo schermo nella chiamata. <b>Schermo intero</b> e <b>Salva come immagine</b> sono sopra.',
    'call.step6':
      '<pbtn>Inizia il riscaldamento</pbtn> all’inizio della lezione: circa 5 minuti di domande sulla lezione precedente e sugli errori dello studente da allora. Alla fine, <b>Non è rimasto</b> mostra all’insegnante tutte le risposte sbagliate. Fatelo sul dispositivo dello studente, dove sono salvati gli errori, e condividete lo schermo.',
    'call.step7':
      '<pbtn>Gioca</pbtn> in <b>Gioco a quiz</b>: 10 domande sulle parole della lezione, 15 secondi ciascuna, e una risposta giusta veloce vale di più. Giocate sullo schermo condiviso; i giri migliori finiscono nella tabella <b>Record</b>.',
    'call.tip3':
      '<btn>Affiancata (metà schermo)</btn> apre Meet sulla metà destra dello schermo, accanto all’app.',
    'call.tip1':
      'Gli appunti si salvano su questo dispositivo per ogni giorno, quindi chiudere la pagina non fa perdere nulla.',
    'call.tip2':
      'In Chrome, Meet può restare sopra tutte le finestre: in Meet apri ⋮ e scegli picture-in-picture.',
    'document.title': 'Documento',
    'document.summary': 'Modifica il Google Doc senza uscire dall’app',
    'document.intro': 'L’editor di Google Docs dentro l’app, per scrivere le lezioni.',
    'document.step1': 'Modifica come sempre: le modifiche si salvano in Google Docs.',
    'document.step2':
      'Quando passi a un’altra sezione, l’app sincronizza e le lezioni si aggiornano.',
    'document.tip1':
      'Se l’editor resta vuoto o chiede di accedere (spesso in Safari), usa il link sopra per aprire il documento in una nuova scheda.',
    'news.title': 'Novità',
    'news.summary': 'Cosa è cambiato nell’app, per data',
    'news.intro': 'Tutte le modifiche all’app, dalla più recente.',
    'news.step1':
      'Per ogni giorno, le voci sono segnate come <b>Nuovo</b>, <b>Migliorato</b> o <b>Corretto</b>. Un punto accanto a <b>Novità</b> nel menu vuol dire che c’è qualcosa che non hai ancora visto.',
    'news.step2':
      'Le funzioni nuove e migliorate sono in <b>Cosa c’è di nuovo</b>, le correzioni in <b>Correzioni di bug</b>. Se studi più lingue, scegline una in <b>Lingua</b>: vedi le sue novità e quelle per tutte le lingue.',
  },
});
