import type { UiLanguage } from '../i18n/core';
import { load, save } from './storage';

/* What changed in the app, for the News page. Add an entry here with every change students
   will notice: the newest day goes first, and every text needs all four interface languages. */

export type NewsKind = 'new' | 'better' | 'fixed';
export interface NewsItem {
  kind: NewsKind;
  text: Record<UiLanguage, string>;
}
export interface NewsDay {
  /** YYYY-MM-DD */
  date: string;
  items: NewsItem[];
}

export const NEWS: NewsDay[] = [
  {
    date: '2026-11-16',
    items: [
      {
        kind: 'new',
        text: {
          en: 'The menu is now a column on the left, grouped by topic. « folds it away and ☰ brings it back.',
          ru: 'Меню теперь колонка слева, разделённая на группы. « сворачивает его, ☰ возвращает.',
          fr: 'Le menu est maintenant une colonne à gauche, groupée par thème. « le replie et ☰ le rouvre.',
          de: 'Das Menü ist jetzt eine Spalte links, nach Themen gruppiert. « klappt es ein, ☰ wieder aus.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'This News page: what changed in the app, day by day. A dot next to News in the menu means there is something you haven’t seen.',
          ru: 'Эта страница «Новости»: что изменилось в приложении, по дням. Точка рядом с «Новостями» в меню значит, что есть что-то, чего вы ещё не видели.',
          fr: 'Cette page Nouveautés : ce qui a changé dans l’application, jour après jour. Un point à côté de Nouveautés dans le menu signale du nouveau.',
          de: 'Diese Seite Neuigkeiten: was sich in der App geändert hat, Tag für Tag. Ein Punkt neben Neuigkeiten im Menü heißt, dass es etwas Neues gibt.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Clearer section names: Lesson history, Downloaded lessons, A question for discussion, Favourite words, Text analysis and Photo parsing.',
          ru: 'Понятнее названия разделов: «История уроков», «Загруженные уроки», «Вопрос для обсуждения», «Избранные слова», «Разбор текста» и «Разбор фото».',
          fr: 'Des noms de sections plus clairs : Historique des leçons, Leçons téléchargées, Une question à discuter, Mots favoris, Analyse de texte et Analyse de photo.',
          de: 'Klarere Namen der Bereiche: Lektionsverlauf, Geladene Lektionen, Eine Frage zum Diskutieren, Lieblingswörter, Textanalyse und Fotoanalyse.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'A new top bar: the next lesson with Enter the lesson in the middle, ↻ to sync, and ⚙️ Settings on the right. Opening, sharing or changing the document is under Settings → Document.',
          ru: 'Новая верхняя панель: следующий урок с кнопкой «Войти в урок» посередине, ↻ для синхронизации и ⚙️ Настройки справа. Открыть, отправить ученику или сменить документ — в «Настройки → Документ».',
          fr: 'Une nouvelle barre du haut : le prochain cours avec Entrer dans le cours au milieu, ↻ pour synchroniser et ⚙️ Réglages à droite. Ouvrir, partager ou changer le document : Réglages → Document.',
          de: 'Eine neue obere Leiste: die nächste Stunde mit Zur Stunde in der Mitte, ↻ zum Synchronisieren und ⚙️ Einstellungen rechts. Dokument öffnen, teilen oder wechseln: Einstellungen → Dokument.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'A shared board in lesson mode: the teacher and the student draw on it at the same time.',
          ru: 'Общая доска в режиме урока: преподаватель и ученик рисуют на ней одновременно.',
          fr: 'Un tableau partagé en mode cours : le professeur et l’élève y dessinent en même temps.',
          de: 'Eine gemeinsame Tafel im Unterrichtsmodus: Lehrkraft und Schüler zeichnen gleichzeitig darauf.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Text analysis: paste an article, click any word or phrase to have it explained, translate the text paragraph by paragraph, and get questions and exercises on it.',
          ru: 'Разбор текста: вставьте статью, нажмите на слово или фразу, чтобы получить объяснение, переведите текст по абзацам и получите вопросы и упражнения по нему.',
          fr: 'Analyse de texte : collez un article, cliquez sur un mot ou une expression pour l’explication, traduisez le texte paragraphe par paragraphe et obtenez des questions et des exercices.',
          de: 'Textanalyse: Füge einen Artikel ein, klicke auf ein Wort oder eine Wendung für eine Erklärung, übersetze den Text Absatz für Absatz und bekomme Fragen und Übungen dazu.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'After the lesson, the next-lesson widget says it is finished.',
          ru: 'После урока виджет следующего урока показывает, что урок завершён.',
          fr: 'Après le cours, le widget du prochain cours indique qu’il est terminé.',
          de: 'Nach der Stunde zeigt das Widget der nächsten Stunde, dass sie vorbei ist.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Settings: your name and picture, the interface language, a light or dark theme, the languages you learn and your level, the daily goal, speech speed and which sections the menu shows.',
          ru: 'Настройки: имя и картинка, язык интерфейса, светлая или тёмная тема, изучаемые языки и уровень, цель на день, скорость озвучки и разделы в меню.',
          fr: 'Réglages : votre nom et votre image, la langue de l’interface, un thème clair ou sombre, les langues apprises et votre niveau, l’objectif du jour, la vitesse de lecture et les sections du menu.',
          de: 'Einstellungen: Name und Bild, Sprache der Oberfläche, helles oder dunkles Design, die Sprachen, die du lernst, und dein Niveau, Tagesziel, Sprechtempo und die Bereiche im Menü.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Lesson mode: Google Meet in a window beside the app, or Zoom inside it, with your notes and the lesson’s words next to the call.',
          ru: 'Режим урока: Google Meet в окне рядом с приложением или Zoom прямо в нём, а рядом со звонком — заметки и слова урока.',
          fr: 'Mode cours : Google Meet dans une fenêtre à côté de l’application, ou Zoom à l’intérieur, avec vos notes et les mots de la leçon à côté de l’appel.',
          de: 'Unterrichtsmodus: Google Meet in einem Fenster neben der App oder Zoom direkt darin, mit deinen Notizen und den Wörtern der Lektion neben dem Anruf.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Lessons can come from a Notion page instead of a Google Doc.',
          ru: 'Уроки можно брать со страницы Notion вместо Google-документа.',
          fr: 'Les leçons peuvent venir d’une page Notion au lieu d’un Google Doc.',
          de: 'Lektionen können aus einer Notion-Seite statt aus einem Google-Dokument kommen.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'A question for discussion: write your own topic (a TV show, new words…), and open a short explanation of the grammar rule.',
          ru: 'Вопрос для обсуждения: можно написать свою тему (сериал, новые слова…) и открыть короткое объяснение правила грамматики.',
          fr: 'Une question à discuter : écrivez votre propre sujet (une série, de nouveaux mots…) et ouvrez une courte explication de la règle de grammaire.',
          de: 'Eine Frage zum Diskutieren: Schreib dein eigenes Thema (eine Serie, neue Wörter …) und öffne eine kurze Erklärung der Grammatikregel.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Many small bugs fixed after a full review of the code.',
          ru: 'Исправлено много мелких ошибок после полной проверки кода.',
          fr: 'De nombreux petits bugs corrigés après une relecture complète du code.',
          de: 'Viele kleine Fehler nach einer vollständigen Durchsicht des Codes behoben.',
        },
      },
    ],
  },
  {
    date: '2026-11-14',
    items: [
      {
        kind: 'new',
        text: {
          en: 'The app speaks your language: English, Russian, French or German.',
          ru: 'Интерфейс на вашем языке: английский, русский, французский или немецкий.',
          fr: 'L’application parle votre langue : anglais, russe, français ou allemand.',
          de: 'Die App spricht deine Sprache: Englisch, Russisch, Französisch oder Deutsch.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'German joins French and English as a language to learn.',
          ru: 'Немецкий теперь можно учить вместе с французским и английским.',
          fr: 'L’allemand rejoint le français et l’anglais parmi les langues à apprendre.',
          de: 'Deutsch kommt zu Französisch und Englisch als Lernsprache dazu.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Feedback: send the teacher a bug, an idea or any message, with up to 3 screenshots.',
          ru: 'Обратная связь: отправьте преподавателю ошибку, идею или любое сообщение, до 3 скриншотов.',
          fr: 'Avis : envoyez au professeur un bug, une idée ou n’importe quel message, avec jusqu’à 3 captures d’écran.',
          de: 'Feedback: Schick der Lehrkraft einen Fehler, eine Idee oder eine Nachricht, mit bis zu 3 Screenshots.',
        },
      },
    ],
  },
  {
    date: '2026-11-13',
    items: [
      {
        kind: 'new',
        text: {
          en: 'Photo parsing reads PDFs too: handwritten notes and textbook pages.',
          ru: 'Разбор фото понимает и PDF: рукописные заметки и страницы учебника.',
          fr: 'L’analyse de photo lit aussi les PDF : notes manuscrites et pages de manuel.',
          de: 'Die Fotoanalyse liest auch PDFs: handschriftliche Notizen und Lehrbuchseiten.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Every section has its own address: links can be shared and the Back button works.',
          ru: 'У каждого раздела свой адрес: ссылками можно делиться, и кнопка «Назад» работает.',
          fr: 'Chaque section a sa propre adresse : les liens se partagent et le bouton Retour fonctionne.',
          de: 'Jeder Bereich hat seine eigene Adresse: Links lassen sich teilen und die Zurück-Taste funktioniert.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'A new look with new fonts, and a rewritten Tutorial.',
          ru: 'Новый внешний вид и шрифты, переписанная инструкция.',
          fr: 'Un nouveau look avec de nouvelles polices, et un guide réécrit.',
          de: 'Ein neues Aussehen mit neuen Schriften und eine neu geschriebene Anleitung.',
        },
      },
    ],
  },
];

const LATEST = NEWS[0]?.date ?? '';
const SEEN_KEY = 'news-seen';

/** Whether there is news this device hasn't opened the News page for yet. */
export const hasUnseenNews = () => (load<string>(SEEN_KEY) ?? '') < LATEST;
export const markNewsSeen = () => save(SEEN_KEY, LATEST);
