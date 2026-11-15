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
    'quick2.text': 'In <lessons>Lessons</lessons>, choose a lesson and look at its words.',
    'quick3.title': 'Practise',
    'quick3.text':
      'Start with <b>Flashcards</b>, then the <b>Quiz</b>. Missed words go to <mine>My words</mine>.',
    'quick4.title': 'Come back every day',
    'quick4.text':
      'A round on <home>Home</home> takes a few minutes and keeps your 🔥 streak going.',

    'header.title': 'The top bar',
    'header.summary': 'Document, sync, next lesson, the call link, feedback and the language',
    'header.intro':
      'The bar at the top is always there. It shows which Google Doc the app reads and when it last synced, plus the next lesson and the video call.',
    'header.step1':
      '<b>Sync</b> reads the document again: press it after the teacher adds a lesson.',
    'header.step2':
      '<b>Next lesson</b> shows the date from the newest line like <ex>le cours prochain: 22.11.2026 18:00 de Paris</ex>. A time given for a city is converted to yours. When the date has passed it says “not confirmed yet”.',
    'header.step3':
      '<b>Join call</b> appears when the document has a Google Meet or Zoom link and opens lesson mode: the call next to the lesson and your notes.',
    'header.step4':
      '<b>Open document</b> opens the Google Doc in a new tab. <b>Copy student link</b> copies a link that opens this document straight away. <b>Change document</b> connects another one.',
    'header.step5':
      '<b>Feedback</b> sends a message to the teacher: a bug, an idea or anything else. Add up to 3 screenshots, or paste one with Ctrl+V / ⌘V. The page you were on is added automatically.',
    'header.step6':
      'The language menu on the right (🇬🇧 🇷🇺 🇫🇷 🇩🇪) changes the language of the app. Translations of words stay in Russian.',
    'header.tip1':
      'A lesson in the document starts with a line like <ex>14.10.2026 1 Leçon</ex> (or <ex>Lesson</ex>, <ex>Lektion</ex>). Everything under it, up to the next such line, belongs to that lesson.',
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
    'home.mock': 'the streak and daily goal on Home',

    'lessons.title': 'Lessons',
    'lessons.summary': 'Words, verbs and notes for each lesson',
    'lessons.intro':
      'Every lesson from the document, newest selected. Claude reads it once and prepares the vocabulary with translations, synonym and antonym pairs, and the verbs.',
    'lessons.step1':
      'Pick a lesson in the list on the left (each lesson has its own link you can share).',
    'lessons.step2':
      'Stay on the <b>Words</b> tab. Every word is ticked; untick the ones you don’t want, or use <b>Pick all</b>, <b>Clear</b> and the filter box.',
    'lessons.step3':
      'Start an exercise from the row of buttons: <pbtn>Quiz</pbtn> <btn>Flashcards</btn> <btn>Match translations</btn> <btn>Synonyms & antonyms</btn> <btn>Fill the gap</btn> <btn>Dictation</btn>',
    'lessons.step4': 'Press 🔊 to hear a word and ☆ to put it on <b>My words</b>.',
    'lessons.tip1': '<added>✱</added> marks a translation Claude added that isn’t in the notes.',
    'lessons.tip2':
      '<b>Flashcards</b>: <key>Space</key> flips the card, <key>←</key> means “again”, <key>→</key> means “I know it”. The toggle on top switches the direction.',
    'lessons.tip3':
      'At the bottom: <b>Export words for Anki</b> saves the ticked words as a file (in Anki: File → Import), and <b>Prepare this lesson again</b> asks Claude to re-read an edited lesson.',
    'lessons.tip4':
      '<b>My notes</b> is your notepad for the lesson, saved as you type. <b>Original</b> shows the lesson exactly as written.',
    'lessons.mock': 'the Words tab of a lesson',

    'verbs.title': 'Verbs',
    'verbs.summary': 'Conjugation tables and drills (Verbs tab of a lesson)',
    'verbs.intro':
      'The <b>Verbs</b> tab of a French lesson has a conjugation table for every verb in it, in six tenses, affirmative and negative.',
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

    'all-lessons.title': 'All lessons',
    'all-lessons.summary': 'The same exercises, on several lessons at once',
    'all-lessons.intro': 'Every word and verb exercise, on all prepared lessons together.',
    'all-lessons.step1':
      'Leave <b>All</b> selected, or tap lesson chips to practise only a few lessons.',
    'all-lessons.step2':
      'Use the <b>Words</b> and <b>Verbs</b> tabs exactly as in a single lesson.',
    'all-lessons.mock': 'lesson chips',

    'my-words.title': 'My words',
    'my-words.summary': 'Your personal list of words to work on',
    'my-words.intro':
      'Words you starred with ☆ and words you got wrong in any exercise. The number next to <b>My words</b> in the menu shows how many there are.',
    'my-words.step1': 'Practise them with the same exercises as in a lesson.',
    'my-words.step2':
      'A word leaves the list after <b>3 right answers in a row</b>, or when you take its ★ off.',

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

    'photo.title': 'Photo',
    'photo.summary': 'Underlined words, handwritten notes, or a textbook PDF',
    'photo.intro':
      'Three ways to bring words in from paper. Choose one with the switch at the top.',
    'photo.step1':
      '<b>Underlined words</b>: underline words in a book, press <pbtn>Choose or take a photo</pbtn>, and get a table with the translation in context, the dictionary form, the tense and a short explanation.',
    'photo.step2':
      '<b>Handwritten notes</b>: photograph up to 4 pages of notes, fix anything misread (unreadable words are marked [?]), then press <pbtn>Prepare lesson</pbtn> to get words, verbs and exercises as for any lesson.',
    'photo.step3':
      '<b>Textbook PDF</b>: press <pbtn>Choose a PDF</pbtn>, enter the pages of one chapter (up to 20), then <pbtn>Read these pages</pbtn>. Claude writes lesson notes: words, phrases, grammar and examples. Check them and press <pbtn>Prepare lesson</pbtn>.',
    'photo.step4':
      '<btn>Add to Google Doc as Leçon 8</btn> adds what was read to the end of the document as a new lesson (needs a one-time setup on the server, see the README).',
    'photo.tip1':
      'Take the photo straight on, in good light, with the whole marked line in the frame.',
    'photo.tip2': '☆ next to a word puts its dictionary form on My words.',
    'photo.mock': 'the result of a photo with underlined words',

    'discuss.title': 'Discuss',
    'discuss.summary': 'A discussion question to start the lesson',
    'discuss.intro':
      'A question to talk about at the start of a lesson, written for your level and the grammar you are practising.',
    'discuss.step1': 'Choose the language and your <b>level</b> (A1–C2).',
    'discuss.step2':
      'Pick a <b>vocabulary topic</b>: from the list or from your lessons, or write any topic of your own under <b>Or your own topic</b>: a TV series, a hobby, new slang words. Pick a <b>grammar topic</b>, or leave <b>Any</b>.',
    'discuss.step3':
      'Press <pbtn>Write a question</pbtn>. You get the question (🔊 reads it, <b>Show translation</b> shows it in Russian), follow-up questions, sentence beginnings that use the grammar, and useful words. With a grammar topic, <b>📘 The rule</b> opens an explanation with examples.',
    'discuss.step4': '<pbtn>Another question</pbtn> writes a new one with the same settings.',
    'discuss.tip1': '☆ next to a useful word puts it on My words.',

    'call.title': 'Lesson mode',
    'call.summary': 'The call, notes and the lesson’s words on one screen',
    'call.intro':
      'Opens from <b>Join call</b> in the top bar when the document has a Google Meet or Zoom link. Made for the lesson itself.',
    'call.step1':
      '<b>Google Meet</b>: press <pbtn>Open the call in a small window</pbtn>. Meet can’t run inside other websites, so it opens as a small window at the side of the screen.',
    'call.step2':
      '<b>Zoom</b>: enter your name and press <pbtn>Join here</pbtn>. The call runs inside the page, in a window you can move and resize (needs a one-time Zoom setup on the server, see the README).',
    'call.step3':
      'Write in <b>Lesson notes</b> during the lesson: new words as “mot — перевод”, mistakes, homework. <btn>⏱ Time</btn> marks when something came up.',
    'call.step4':
      'After the lesson, <btn>Add to Google Doc as Leçon 8</btn> puts the notes into the document as a new lesson, ready for exercises.',
    'call.step5':
      '<pbtn>Open the board</pbtn> under the notes: write, draw and paste pictures. Share your screen in the call so the student sees it. <b>Full screen</b> and <b>Save as picture</b> are above it.',
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
    'quick2.text': 'В разделе <lessons>Уроки</lessons> выберите урок и посмотрите его слова.',
    'quick3.title': 'Тренируйтесь',
    'quick3.text':
      'Начните с <b>Карточек</b>, потом пройдите <b>Тест</b>. Слова с ошибками попадут в <mine>Мои слова</mine>.',
    'quick4.title': 'Возвращайтесь каждый день',
    'quick4.text':
      'Раунд на <home>Главной</home> занимает несколько минут и поддерживает вашу 🔥 серию.',

    'header.title': 'Верхняя панель',
    'header.summary': 'Документ, синхронизация, следующий урок, звонок, обратная связь и язык',
    'header.intro':
      'Панель наверху видна всегда. На ней — какой Google-документ читает приложение и когда он синхронизировался, а также следующий урок и видеозвонок.',
    'header.step1':
      '<b>Синхронизировать</b> заново читает документ: нажмите, когда преподаватель добавил урок.',
    'header.step2':
      '<b>Следующий урок</b> показывает дату из самой новой строки вроде <ex>le cours prochain: 22.11.2026 18:00 de Paris</ex>. Время, указанное для города, переводится в ваше. Если дата прошла, будет написано «не подтверждена».',
    'header.step3':
      '<b>Войти в звонок</b> появляется, если в документе есть ссылка на Google Meet или Zoom, и открывает режим урока: звонок рядом с уроком и заметками.',
    'header.step4':
      '<b>Открыть документ</b> открывает Google-документ в новой вкладке. <b>Ссылка для ученика</b> копирует ссылку, по которой сразу открывается этот документ. <b>Сменить документ</b> подключает другой.',
    'header.step5':
      '<b>Обратная связь</b> отправляет сообщение преподавателю: ошибка, идея или что угодно. Можно приложить до 3 скриншотов или вставить скриншот через Ctrl+V / ⌘V. Страница, на которой вы были, добавится сама.',
    'header.step6':
      'Меню языка справа (🇬🇧 🇷🇺 🇫🇷 🇩🇪) меняет язык приложения. Переводы слов остаются на русском.',
    'header.tip1':
      'Урок в документе начинается со строки вроде <ex>14.10.2026 1 Leçon</ex> (или <ex>Lesson</ex>, <ex>Lektion</ex>). Всё ниже неё, до следующей такой строки, относится к этому уроку.',
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
    'home.mock': 'серия и цель дня на Главной',

    'lessons.title': 'Уроки',
    'lessons.summary': 'Слова, глаголы и заметки к каждому уроку',
    'lessons.intro':
      'Все уроки из документа, выбран самый новый. Claude один раз читает урок и готовит лексику с переводами, пары синонимов и антонимов и глаголы.',
    'lessons.step1':
      'Выберите урок в списке слева (у каждого урока своя ссылка, ею можно поделиться).',
    'lessons.step2':
      'Оставайтесь на вкладке <b>Слова</b>. Все слова отмечены; снимите галочки с ненужных или используйте <b>Выбрать все</b>, <b>Снять выбор</b> и поиск.',
    'lessons.step3':
      'Запустите упражнение кнопкой: <pbtn>Тест</pbtn> <btn>Карточки</btn> <btn>Найди перевод</btn> <btn>Синонимы и антонимы</btn> <btn>Вставь слово</btn> <btn>Диктант</btn>',
    'lessons.step4':
      'Нажмите 🔊, чтобы услышать слово, и ☆, чтобы добавить его в <b>Мои слова</b>.',
    'lessons.tip1':
      '<added>✱</added> отмечает перевод, который добавил Claude: в записях его не было.',
    'lessons.tip2':
      '<b>Карточки</b>: <key>Пробел</key> переворачивает карточку, <key>←</key> — «ещё раз», <key>→</key> — «знаю». Переключатель сверху меняет направление.',
    'lessons.tip3':
      'Внизу: <b>Экспорт слов в Anki</b> сохраняет отмеченные слова в файл (в Anki: Файл → Импорт), а <b>Подготовить урок заново</b> просит Claude перечитать изменённый урок.',
    'lessons.tip4':
      '<b>Мои заметки</b> — ваш блокнот к уроку, сохраняется по мере набора. <b>Оригинал</b> показывает урок так, как он записан.',
    'lessons.mock': 'вкладка «Слова» в уроке',

    'verbs.title': 'Глаголы',
    'verbs.summary': 'Таблицы спряжения и тренировка (вкладка «Глаголы» в уроке)',
    'verbs.intro':
      'На вкладке <b>Глаголы</b> во французском уроке есть таблица спряжения для каждого глагола: шесть времён, утвердительная и отрицательная формы.',
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

    'all-lessons.title': 'Все уроки',
    'all-lessons.summary': 'Те же упражнения сразу по нескольким урокам',
    'all-lessons.intro': 'Все упражнения на слова и глаголы по всем подготовленным урокам вместе.',
    'all-lessons.step1':
      'Оставьте выбранным <b>Все</b> или нажмите на нужные уроки, чтобы тренировать только их.',
    'all-lessons.step2':
      'Пользуйтесь вкладками <b>Слова</b> и <b>Глаголы</b> так же, как в отдельном уроке.',
    'all-lessons.mock': 'выбор уроков',

    'my-words.title': 'Мои слова',
    'my-words.summary': 'Ваш личный список слов для повторения',
    'my-words.intro':
      'Слова, отмеченные ☆, и слова, в которых вы ошиблись в любом упражнении. Число рядом с <b>Мои слова</b> в меню показывает, сколько их.',
    'my-words.step1': 'Тренируйте их теми же упражнениями, что и в уроке.',
    'my-words.step2':
      'Слово уходит из списка после <b>3 верных ответов подряд</b> или если снять с него ★.',

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

    'photo.title': 'Фото',
    'photo.summary': 'Подчёркнутые слова, рукописные заметки или учебник в PDF',
    'photo.intro': 'Три способа перенести слова с бумаги. Выберите нужный переключателем сверху.',
    'photo.step1':
      '<b>Подчёркнутые слова</b>: подчеркните слова в книге, нажмите <pbtn>Выбрать или сделать фото</pbtn> — и получите таблицу с переводом в контексте, словарной формой, временем и коротким объяснением.',
    'photo.step2':
      '<b>Рукописные заметки</b>: сфотографируйте до 4 страниц записей, исправьте неверно прочитанное (неразборчивые слова отмечены [?]) и нажмите <pbtn>Подготовить урок</pbtn> — получите слова, глаголы и упражнения, как в любом уроке.',
    'photo.step3':
      '<b>Учебник (PDF)</b>: нажмите <pbtn>Выбрать PDF</pbtn>, укажите страницы одной главы (до 20), затем <pbtn>Прочитать эти страницы</pbtn>. Claude составит записи урока: слова, фразы, грамматику и примеры. Проверьте их и нажмите <pbtn>Подготовить урок</pbtn>.',
    'photo.step4':
      '<btn>Добавить в Google-документ как Leçon 8</btn> добавляет прочитанное в конец документа новым уроком (нужна разовая настройка на сервере, см. README).',
    'photo.tip1': 'Снимайте прямо, при хорошем свете, чтобы вся отмеченная строка попала в кадр.',
    'photo.tip2': '☆ рядом со словом добавляет его словарную форму в «Мои слова».',
    'photo.mock': 'результат фото с подчёркнутыми словами',

    'discuss.title': 'Обсуждение',
    'discuss.summary': 'Вопрос для разговора в начале урока',
    'discuss.intro':
      'Вопрос, чтобы поговорить в начале урока, под ваш уровень и грамматику, которую вы тренируете.',
    'discuss.step1': 'Выберите язык и свой <b>уровень</b> (A1–C2).',
    'discuss.step2':
      'Выберите <b>лексическую тему</b>: из списка или из ваших уроков — или впишите любую свою в поле <b>Или своя тема</b>: сериал, хобби, новые сленговые слова. Выберите <b>грамматическую тему</b> или оставьте <b>Любая</b>.',
    'discuss.step3':
      'Нажмите <pbtn>Придумать вопрос</pbtn>. Вы получите вопрос (🔊 прочитает его, <b>Показать перевод</b> покажет его по-русски), вопросы для продолжения разговора, начала фраз с нужной грамматикой и полезные слова. Если выбрана грамматика, <b>📘 Правило</b> раскрывает объяснение с примерами.',
    'discuss.step4': '<pbtn>Другой вопрос</pbtn> придумает новый с теми же настройками.',
    'discuss.tip1': '☆ рядом с полезным словом добавляет его в «Мои слова».',

    'call.title': 'Режим урока',
    'call.summary': 'Звонок, заметки и слова урока на одном экране',
    'call.intro':
      'Открывается кнопкой <b>Войти в звонок</b> в верхней панели, если в документе есть ссылка на Google Meet или Zoom. Для самого урока.',
    'call.step1':
      '<b>Google Meet</b>: нажмите <pbtn>Открыть звонок в маленьком окне</pbtn>. Meet нельзя встроить в другие сайты, поэтому он открывается маленьким окном сбоку экрана.',
    'call.step2':
      '<b>Zoom</b>: введите своё имя и нажмите <pbtn>Подключиться здесь</pbtn>. Звонок идёт прямо на странице, в окне, которое можно двигать и менять по размеру (нужна разовая настройка Zoom на сервере, см. README).',
    'call.step3':
      'Во время урока пишите в <b>Заметки урока</b>: новые слова в виде «mot — перевод», ошибки, домашнее задание. <btn>⏱ Время</btn> отмечает, когда что-то прозвучало.',
    'call.step4':
      'После урока <btn>Добавить в Google-документ как Leçon 8</btn> переносит заметки в документ новым уроком — сразу с упражнениями.',
    'call.step5':
      '<pbtn>Открыть доску</pbtn> под заметками: пишите, рисуйте, вставляйте картинки. Покажите экран в звонке, чтобы ученик видел доску. Над ней — <b>На весь экран</b> и <b>Сохранить картинкой</b>.',
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
    'quick2.text': 'Dans <lessons>Leçons</lessons>, choisissez une leçon et regardez ses mots.',
    'quick3.title': 'Entraînez-vous',
    'quick3.text':
      'Commencez par les <b>Cartes</b>, puis le <b>Quiz</b>. Les mots ratés vont dans <mine>Mes mots</mine>.',
    'quick4.title': 'Revenez chaque jour',
    'quick4.text':
      'Une série sur l’<home>Accueil</home> prend quelques minutes et entretient votre 🔥 série.',

    'header.title': 'La barre du haut',
    'header.summary': 'Document, synchronisation, prochain cours, appel, avis et langue',
    'header.intro':
      'La barre du haut est toujours là. Elle montre quel Google Doc l’application lit et quand il a été synchronisé, ainsi que le prochain cours et l’appel vidéo.',
    'header.step1':
      '<b>Synchroniser</b> relit le document : appuyez-y quand le professeur a ajouté une leçon.',
    'header.step2':
      '<b>Prochain cours</b> affiche la date de la ligne la plus récente comme <ex>le cours prochain: 22.11.2026 18:00 de Paris</ex>. Une heure donnée pour une ville est convertie dans la vôtre. Une fois la date passée, il est écrit « pas encore confirmée ».',
    'header.step3':
      '<b>Rejoindre l’appel</b> apparaît quand le document contient un lien Google Meet ou Zoom et ouvre le mode cours : l’appel à côté de la leçon et de vos notes.',
    'header.step4':
      '<b>Ouvrir le document</b> ouvre le Google Doc dans un nouvel onglet. <b>Copier le lien élève</b> copie un lien qui ouvre directement ce document. <b>Changer de document</b> en connecte un autre.',
    'header.step5':
      '<b>Avis</b> envoie un message au professeur : un bug, une idée ou autre chose. Ajoutez jusqu’à 3 captures d’écran, ou collez-en une avec Ctrl+V / ⌘V. La page où vous étiez est ajoutée automatiquement.',
    'header.step6':
      'Le menu de langue à droite (🇬🇧 🇷🇺 🇫🇷 🇩🇪) change la langue de l’application. Les traductions des mots restent en russe.',
    'header.tip1':
      'Une leçon commence dans le document par une ligne comme <ex>14.10.2026 1 Leçon</ex> (ou <ex>Lesson</ex>, <ex>Lektion</ex>). Tout ce qui suit, jusqu’à la ligne de ce type suivante, appartient à cette leçon.',
    'header.mock': 'la barre du haut',

    'home.title': 'Accueil',
    'home.summary': 'Une série quotidienne de 10 questions variées',
    'home.intro':
      'Le moyen le plus rapide de pratiquer chaque jour : 10 questions de toutes vos leçons, et les mots ratés reviennent plus souvent.',
    'home.step1':
      'Répondez à chaque question : choisissez une traduction, choisissez le mot dans la langue apprise, tapez-le ou écrivez ce que vous entendez.',
    'home.step2':
      'Après chaque réponse, appuyez sur <pbtn>Suivant</pbtn>. À la fin, vous voyez votre score et <pbtn>Série suivante</pbtn>.',
    'home.step3':
      'Répondez au moins une fois par jour pour garder votre 🔥 série ; 20 réponses remplissent l’objectif du jour.',
    'home.mock': 'la série et l’objectif du jour sur l’Accueil',

    'lessons.title': 'Leçons',
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
      'Appuyez sur 🔊 pour entendre un mot et sur ☆ pour l’ajouter à <b>Mes mots</b>.',
    'lessons.tip1': '<added>✱</added> marque une traduction ajoutée par Claude, absente des notes.',
    'lessons.tip2':
      '<b>Cartes</b> : <key>Espace</key> retourne la carte, <key>←</key> veut dire « encore », <key>→</key> « je sais ». Le bouton du haut change le sens.',
    'lessons.tip3':
      'En bas : <b>Exporter les mots pour Anki</b> enregistre les mots cochés dans un fichier (dans Anki : Fichier → Importer), et <b>Préparer de nouveau cette leçon</b> demande à Claude de relire une leçon modifiée.',
    'lessons.tip4':
      '<b>Mes notes</b> est votre bloc-notes pour la leçon, enregistré pendant la saisie. <b>Original</b> montre la leçon telle qu’elle est écrite.',
    'lessons.mock': 'l’onglet Mots d’une leçon',

    'verbs.title': 'Verbes',
    'verbs.summary': 'Tableaux de conjugaison et exercices (onglet Verbes d’une leçon)',
    'verbs.intro':
      'L’onglet <b>Verbes</b> d’une leçon de français contient un tableau de conjugaison pour chaque verbe, à six temps, à l’affirmatif et au négatif.',
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

    'all-lessons.title': 'Toutes les leçons',
    'all-lessons.summary': 'Les mêmes exercices, sur plusieurs leçons à la fois',
    'all-lessons.intro':
      'Tous les exercices de mots et de verbes, sur toutes les leçons préparées.',
    'all-lessons.step1':
      'Laissez <b>Toutes</b> sélectionné, ou touchez des leçons pour n’en travailler que quelques-unes.',
    'all-lessons.step2':
      'Utilisez les onglets <b>Mots</b> et <b>Verbes</b> comme dans une seule leçon.',
    'all-lessons.mock': 'le choix des leçons',

    'my-words.title': 'Mes mots',
    'my-words.summary': 'Votre liste personnelle de mots à travailler',
    'my-words.intro':
      'Les mots marqués d’une ☆ et les mots ratés dans un exercice. Le nombre à côté de <b>Mes mots</b> dans le menu indique combien il y en a.',
    'my-words.step1': 'Travaillez-les avec les mêmes exercices que dans une leçon.',
    'my-words.step2':
      'Un mot quitte la liste après <b>3 bonnes réponses d’affilée</b>, ou quand vous retirez son ★.',

    'mistakes.title': 'Erreurs',
    'mistakes.summary': 'Les mots et formes verbales que vous ratez le plus',
    'mistakes.intro':
      'Vos erreurs les plus fréquentes, mots et formes verbales, avec le nombre de fois où vous les avez ratés.',
    'mistakes.step1':
      'Appuyez sur <pbtn>Travailler mes erreurs</pbtn> pour une série faite uniquement d’elles.',

    'stats.title': 'Statistiques',
    'stats.summary': 'Vos progrès et vos points faibles',
    'stats.intro':
      'Combien de mots vous avez appris, quelles leçons, quels types de mots et quels temps vous posent le plus de problèmes, et vos erreurs les plus fréquentes.',
    'stats.step1': 'Consultez-les de temps en temps pour choisir quoi réviser.',

    'photo.title': 'Photo',
    'photo.summary': 'Mots soulignés, notes manuscrites ou manuel en PDF',
    'photo.intro':
      'Trois façons de passer du papier aux mots. Choisissez-en une avec le sélecteur en haut.',
    'photo.step1':
      '<b>Mots soulignés</b> : soulignez des mots dans un livre, appuyez sur <pbtn>Choisir ou prendre une photo</pbtn>, et obtenez un tableau avec la traduction en contexte, la forme du dictionnaire, le temps et une courte explication.',
    'photo.step2':
      '<b>Notes manuscrites</b> : photographiez jusqu’à 4 pages de notes, corrigez ce qui a été mal lu (les mots illisibles sont marqués [?]), puis appuyez sur <pbtn>Préparer la leçon</pbtn> pour obtenir mots, verbes et exercices comme pour toute leçon.',
    'photo.step3':
      '<b>Manuel en PDF</b> : appuyez sur <pbtn>Choisir un PDF</pbtn>, indiquez les pages d’un chapitre (jusqu’à 20), puis <pbtn>Lire ces pages</pbtn>. Claude rédige des notes de cours : mots, expressions, grammaire et exemples. Vérifiez-les et appuyez sur <pbtn>Préparer la leçon</pbtn>.',
    'photo.step4':
      '<btn>Ajouter au Google Doc comme Leçon 8</btn> ajoute ce qui a été lu à la fin du document comme nouvelle leçon (une configuration unique du serveur est nécessaire, voir le README).',
    'photo.tip1':
      'Prenez la photo bien en face, avec une bonne lumière, toute la ligne marquée dans le cadre.',
    'photo.tip2': '☆ à côté d’un mot ajoute sa forme du dictionnaire à Mes mots.',
    'photo.mock': 'le résultat d’une photo de mots soulignés',

    'discuss.title': 'Discussion',
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
    'discuss.tip1': '☆ à côté d’un mot utile l’ajoute à Mes mots.',

    'call.title': 'Mode cours',
    'call.summary': 'L’appel, les notes et les mots de la leçon sur un seul écran',
    'call.intro':
      'S’ouvre avec <b>Rejoindre l’appel</b> dans la barre du haut quand le document contient un lien Google Meet ou Zoom. Pensé pour le cours lui-même.',
    'call.step1':
      '<b>Google Meet</b> : appuyez sur <pbtn>Ouvrir l’appel dans une petite fenêtre</pbtn>. Meet ne peut pas s’afficher dans d’autres sites : il s’ouvre dans une petite fenêtre sur le côté de l’écran.',
    'call.step2':
      '<b>Zoom</b> : saisissez votre nom et appuyez sur <pbtn>Rejoindre ici</pbtn>. L’appel se déroule dans la page, dans une fenêtre que vous pouvez déplacer et redimensionner (une configuration Zoom unique est nécessaire sur le serveur, voir le README).',
    'call.step3':
      'Pendant le cours, écrivez dans <b>Notes du cours</b> : les nouveaux mots sous la forme « mot — перевод », les erreurs, les devoirs. <btn>⏱ Heure</btn> marque le moment.',
    'call.step4':
      'Après le cours, <btn>Ajouter au Google Doc comme Leçon 8</btn> met les notes dans le document comme nouvelle leçon, prête pour les exercices.',
    'call.step5':
      '<pbtn>Ouvrir le tableau</pbtn> sous les notes : écrivez, dessinez, collez des images. Partagez votre écran dans l’appel pour que l’élève le voie. <b>Plein écran</b> et <b>Enregistrer en image</b> sont au-dessus.',
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
      'Wähle unter <lessons>Lektionen</lessons> eine Lektion und sieh dir ihre Wörter an.',
    'quick3.title': 'Üben',
    'quick3.text':
      'Fang mit den <b>Karteikarten</b> an, dann das <b>Quiz</b>. Falsche Wörter landen in <mine>Meine Wörter</mine>.',
    'quick4.title': 'Komm jeden Tag wieder',
    'quick4.text':
      'Eine Runde auf <home>Start</home> dauert ein paar Minuten und hält deine 🔥 Serie am Leben.',

    'header.title': 'Die obere Leiste',
    'header.summary': 'Dokument, Synchronisierung, nächste Stunde, Anruf, Feedback und Sprache',
    'header.intro':
      'Die Leiste oben ist immer da. Sie zeigt, welches Google-Dokument die App liest und wann zuletzt synchronisiert wurde, dazu die nächste Stunde und den Videoanruf.',
    'header.step1':
      '<b>Synchronisieren</b> liest das Dokument neu: Tippe darauf, wenn die Lehrkraft eine Lektion hinzugefügt hat.',
    'header.step2':
      '<b>Nächste Stunde</b> zeigt das Datum aus der neuesten Zeile wie <ex>nächste Stunde: 22.11.2026 18:00 Berlin</ex>. Eine Uhrzeit für eine Stadt wird in deine umgerechnet. Ist das Datum vorbei, steht dort „noch nicht bestätigt“.',
    'header.step3':
      '<b>Anruf beitreten</b> erscheint, wenn das Dokument einen Google-Meet- oder Zoom-Link enthält, und öffnet den Unterrichtsmodus: den Anruf neben der Lektion und deinen Notizen.',
    'header.step4':
      '<b>Dokument öffnen</b> öffnet das Google-Dokument in einem neuen Tab. <b>Schülerlink kopieren</b> kopiert einen Link, der dieses Dokument direkt öffnet. <b>Dokument wechseln</b> verbindet ein anderes.',
    'header.step5':
      '<b>Feedback</b> schickt der Lehrkraft eine Nachricht: einen Fehler, eine Idee oder etwas anderes. Hänge bis zu 3 Screenshots an oder füge einen mit Strg+V / ⌘V ein. Die Seite, auf der du warst, wird automatisch mitgeschickt.',
    'header.step6':
      'Das Sprachmenü rechts (🇬🇧 🇷🇺 🇫🇷 🇩🇪) ändert die Sprache der App. Die Übersetzungen der Wörter bleiben auf Russisch.',
    'header.tip1':
      'Eine Lektion beginnt im Dokument mit einer Zeile wie <ex>14.10.2026 1 Lektion</ex> (oder <ex>Leçon</ex>, <ex>Lesson</ex>). Alles darunter bis zur nächsten solchen Zeile gehört zu dieser Lektion.',
    'header.mock': 'die obere Leiste',

    'home.title': 'Start',
    'home.summary': 'Eine tägliche Runde mit 10 gemischten Fragen',
    'home.intro':
      'Der schnellste Weg, jeden Tag zu üben: 10 Fragen aus allen Lektionen, und Wörter, bei denen du Fehler machst, kommen öfter.',
    'home.step1':
      'Beantworte jede Frage: Wähle eine Übersetzung, wähle das Wort in der Lernsprache, tippe es oder schreib, was du hörst.',
    'home.step2':
      'Tippe nach jeder Antwort auf <pbtn>Weiter</pbtn>. Am Ende siehst du dein Ergebnis und <pbtn>Nächste Runde</pbtn>.',
    'home.step3':
      'Antworte mindestens einmal am Tag, damit deine 🔥 Serie hält; 20 Antworten erfüllen das Tagesziel.',
    'home.mock': 'Serie und Tagesziel auf Start',

    'lessons.title': 'Lektionen',
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
      'Tippe auf 🔊, um ein Wort zu hören, und auf ☆, um es zu <b>Meine Wörter</b> hinzuzufügen.',
    'lessons.tip1':
      '<added>✱</added> markiert eine Übersetzung, die Claude ergänzt hat und die nicht in den Notizen steht.',
    'lessons.tip2':
      '<b>Karteikarten</b>: <key>Leertaste</key> dreht die Karte um, <key>←</key> heißt „nochmal“, <key>→</key> „weiß ich“. Der Schalter oben ändert die Richtung.',
    'lessons.tip3':
      'Unten: <b>Wörter für Anki exportieren</b> speichert die angehakten Wörter als Datei (in Anki: Datei → Importieren), und <b>Lektion neu vorbereiten</b> lässt Claude eine geänderte Lektion neu lesen.',
    'lessons.tip4':
      '<b>Meine Notizen</b> ist dein Notizblock zur Lektion, wird beim Tippen gespeichert. <b>Original</b> zeigt die Lektion so, wie sie geschrieben ist.',
    'lessons.mock': 'der Tab Wörter einer Lektion',

    'verbs.title': 'Verben',
    'verbs.summary': 'Konjugationstabellen und Übungen (Tab Verben einer Lektion)',
    'verbs.intro':
      'Der Tab <b>Verben</b> einer Französisch-Lektion hat für jedes Verb eine Konjugationstabelle in sechs Zeitformen, bejaht und verneint.',
    'verbs.step1': 'Tippe auf ein Verb, um seine Tabelle zu öffnen.',
    'verbs.step2':
      'Wähle eine Zeitform (présent, passé composé, imparfait, futur simple, conditionnel présent, impératif) und <b>bejaht</b> oder <b>verneint</b>. 🔊 liest jede Form vor.',
    'verbs.step3':
      'Tippe auf <pbtn>Diese Zeitform üben</pbtn>, fülle alle Personen aus und dann <pbtn>Antworten prüfen</pbtn>. Unter falschen Formen steht die richtige.',
    'verbs.step4': '<btn>Schnellquiz</btn> fragt zufällige Formen aller geöffneten Verben ab.',
    'verbs.tip1':
      'Tippe eine Form mit oder ohne Pronomen: „nous réveillons“ und „réveillons“ zählen beide.',
    'verbs.tip2':
      'Groß- und Kleinschreibung und Satzzeichen sind egal. Ein fehlender Akzent zählt als „fast“, nicht als falsch.',
    'verbs.tip3':
      'Wenn eine Tabelle falsch aussieht, holt <b>Neu konjugieren</b> (neben dem Partizip) eine neue.',
    'verbs.mock': 'eine Verbtabelle',

    'all-lessons.title': 'Alle Lektionen',
    'all-lessons.summary': 'Dieselben Übungen, für mehrere Lektionen auf einmal',
    'all-lessons.intro': 'Alle Wort- und Verbübungen für alle vorbereiteten Lektionen zusammen.',
    'all-lessons.step1':
      'Lass <b>Alle</b> ausgewählt oder tippe auf einzelne Lektionen, um nur diese zu üben.',
    'all-lessons.step2':
      'Nutze die Tabs <b>Wörter</b> und <b>Verben</b> wie in einer einzelnen Lektion.',
    'all-lessons.mock': 'die Lektionsauswahl',

    'my-words.title': 'Meine Wörter',
    'my-words.summary': 'Deine persönliche Liste mit Wörtern zum Üben',
    'my-words.intro':
      'Wörter, die du mit ☆ markiert hast, und Wörter, die du in einer Übung falsch hattest. Die Zahl neben <b>Meine Wörter</b> im Menü zeigt, wie viele es sind.',
    'my-words.step1': 'Übe sie mit denselben Übungen wie in einer Lektion.',
    'my-words.step2':
      'Ein Wort verlässt die Liste nach <b>3 richtigen Antworten in Folge</b> oder wenn du den ★ entfernst.',

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

    'photo.title': 'Foto',
    'photo.summary': 'Unterstrichene Wörter, handschriftliche Notizen oder ein Lehrbuch-PDF',
    'photo.intro': 'Drei Wege, Wörter vom Papier zu holen. Wähle einen mit dem Schalter oben.',
    'photo.step1':
      '<b>Unterstrichene Wörter</b>: Unterstreiche Wörter in einem Buch, tippe auf <pbtn>Foto auswählen oder aufnehmen</pbtn> und bekomme eine Tabelle mit der Übersetzung im Kontext, der Grundform, der Zeitform und einer kurzen Erklärung.',
    'photo.step2':
      '<b>Handschriftliche Notizen</b>: Fotografiere bis zu 4 Seiten Notizen, korrigiere Falschgelesenes (Unleserliches ist mit [?] markiert) und tippe auf <pbtn>Lektion vorbereiten</pbtn>, um Wörter, Verben und Übungen wie bei jeder Lektion zu bekommen.',
    'photo.step3':
      '<b>Lehrbuch-PDF</b>: Tippe auf <pbtn>PDF auswählen</pbtn>, gib die Seiten eines Kapitels an (bis zu 20) und dann <pbtn>Diese Seiten lesen</pbtn>. Claude schreibt Unterrichtsnotizen: Wörter, Wendungen, Grammatik und Beispiele. Prüfe sie und tippe auf <pbtn>Lektion vorbereiten</pbtn>.',
    'photo.step4':
      '<btn>Als Leçon 8 zum Google-Dokument hinzufügen</btn> hängt das Gelesene als neue Lektion ans Ende des Dokuments (braucht eine einmalige Einrichtung auf dem Server, siehe README).',
    'photo.tip1':
      'Fotografiere gerade von vorn, bei gutem Licht, mit der ganzen markierten Zeile im Bild.',
    'photo.tip2': '☆ neben einem Wort fügt seine Grundform zu Meine Wörter hinzu.',
    'photo.mock': 'das Ergebnis eines Fotos mit unterstrichenen Wörtern',

    'discuss.title': 'Diskussion',
    'discuss.summary': 'Eine Gesprächsfrage für den Stundenbeginn',
    'discuss.intro':
      'Eine Frage zum Reden am Anfang der Stunde, passend zu deinem Niveau und der Grammatik, die du übst.',
    'discuss.step1': 'Wähle die Sprache und dein <b>Niveau</b> (A1–C2).',
    'discuss.step2':
      'Wähle ein <b>Wortschatzthema</b>: aus der Liste oder aus deinen Lektionen, oder schreib unter <b>Oder ein eigenes Thema</b> ein beliebiges: eine Serie, ein Hobby, neue Slangwörter. Wähle ein <b>Grammatikthema</b> oder lass <b>Beliebig</b>.',
    'discuss.step3':
      'Tippe auf <pbtn>Frage schreiben</pbtn>. Du bekommst die Frage (🔊 liest sie vor, <b>Übersetzung zeigen</b> zeigt sie auf Russisch), Anschlussfragen, Satzanfänge mit der Grammatik und nützliche Wörter. Mit einem Grammatikthema öffnet <b>📘 Die Regel</b> eine Erklärung mit Beispielen.',
    'discuss.step4': '<pbtn>Andere Frage</pbtn> schreibt eine neue mit denselben Einstellungen.',
    'discuss.tip1': '☆ neben einem nützlichen Wort fügt es zu Meine Wörter hinzu.',

    'call.title': 'Unterrichtsmodus',
    'call.summary': 'Anruf, Notizen und die Wörter der Lektion auf einem Bildschirm',
    'call.intro':
      'Öffnet sich über <b>Anruf beitreten</b> in der oberen Leiste, wenn das Dokument einen Google-Meet- oder Zoom-Link enthält. Gemacht für die Stunde selbst.',
    'call.step1':
      '<b>Google Meet</b>: Tippe auf <pbtn>Anruf in kleinem Fenster öffnen</pbtn>. Meet lässt sich nicht in andere Websites einbetten, deshalb öffnet es sich als kleines Fenster am Bildschirmrand.',
    'call.step2':
      '<b>Zoom</b>: Gib deinen Namen ein und tippe auf <pbtn>Hier beitreten</pbtn>. Der Anruf läuft direkt auf der Seite, in einem Fenster, das du verschieben und in der Größe ändern kannst (braucht eine einmalige Zoom-Einrichtung auf dem Server, siehe README).',
    'call.step3':
      'Schreib während der Stunde in die <b>Notizen zur Stunde</b>: neue Wörter als „Wort — перевод“, Fehler, Hausaufgaben. <btn>⏱ Uhrzeit</btn> markiert, wann etwas vorkam.',
    'call.step4':
      'Nach der Stunde legt <btn>Als Leçon 8 zum Google-Dokument hinzufügen</btn> die Notizen als neue Lektion ins Dokument, bereit für Übungen.',
    'call.step5':
      '<pbtn>Tafel öffnen</pbtn> unter den Notizen: schreiben, zeichnen, Bilder einfügen. Teile deinen Bildschirm im Anruf, damit die Schülerin oder der Schüler sie sieht. <b>Vollbild</b> und <b>Als Bild speichern</b> stehen darüber.',
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
  },
});
