import type { UiLanguage } from '../i18n/core';
import { load, save } from './storage';

/* What changed in the app, for the News page. Add an entry here with every change students
   will notice: the newest day goes first, and every text needs all seven interface languages. */

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
    date: '2026-11-17',
    items: [
      {
        kind: 'new',
        text: {
          en: 'Every lesson now has Grammar (the rules explained, with practice sentences on each), Homework (a list to tick off) and Book exercises (imported from photos or a PDF into the lesson in the document). My notes also shows the board and lesson-mode notes from that day.',
          ru: 'В каждом уроке теперь есть Грамматика (правила с объяснением и тренировкой на каждое), Домашнее задание (список с галочками) и Упражнения из учебника (с фото или PDF, добавляются в урок в документе). В «Моих заметках» видны доска и заметки из режима урока за тот день.',
          fr: 'Chaque leçon a maintenant Grammaire (les règles expliquées, avec des phrases d’entraînement sur chacune), Devoirs (une liste à cocher) et Exercices du manuel (importés depuis des photos ou un PDF dans la leçon du document). Mes notes affiche aussi le tableau et les notes du mode cours de ce jour-là.',
          de: 'Jede Lektion hat jetzt Grammatik (die Regeln erklärt, mit Übungssätzen zu jeder), Hausaufgaben (eine Liste zum Abhaken) und Übungen aus dem Lehrbuch (aus Fotos oder einem PDF in die Lektion im Dokument importiert). Meine Notizen zeigt auch die Tafel und die Notizen aus dem Unterrichtsmodus von diesem Tag.',
          es: 'Cada lección tiene ahora Gramática (las reglas explicadas, con frases para practicar cada una), Deberes (una lista para marcar) y Ejercicios del libro (importados desde fotos o un PDF a la lección del documento). Mis notas muestra también la pizarra y las notas del modo clase de ese día.',
          pt: 'Cada lição tem agora Gramática (as regras explicadas, com frases para praticar cada uma), Trabalhos de casa (uma lista para marcar) e Exercícios do manual (importados a partir de fotos ou de um PDF para a lição no documento). As minhas notas mostra também o quadro e as notas do modo aula desse dia.',
          it: 'Ogni lezione ha ora Grammatica (le regole spiegate, con frasi per esercitarsi su ognuna), Compiti (una lista da spuntare) ed Esercizi dal libro (importati da foto o da un PDF nella lezione del documento). I miei appunti mostra anche la lavagna e gli appunti della modalità lezione di quel giorno.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Spanish, Portuguese and Italian: as languages to learn, and as interface languages. Lessons can start with Lección, Clase, Lição, Aula or Lezione, and “próxima clase”, “próxima aula” or “prossima lezione” sets the next lesson.',
          ru: 'Испанский, португальский и итальянский: их можно учить, и на них можно переключить интерфейс. Уроки в документе могут начинаться с Lección, Clase, Lição, Aula или Lezione, а следующий урок задаётся строкой «próxima clase», «próxima aula» или «prossima lezione».',
          fr: 'L’espagnol, le portugais et l’italien : comme langues à apprendre et comme langues de l’interface. Les leçons peuvent commencer par Lección, Clase, Lição, Aula ou Lezione, et « próxima clase », « próxima aula » ou « prossima lezione » fixe le prochain cours.',
          de: 'Spanisch, Portugiesisch und Italienisch: als Lernsprachen und als Sprachen der Oberfläche. Lektionen können mit Lección, Clase, Lição, Aula oder Lezione beginnen, und „próxima clase“, „próxima aula“ oder „prossima lezione“ legt die nächste Stunde fest.',
          es: 'Español, portugués e italiano: como idiomas para aprender y como idiomas de la interfaz. Las lecciones pueden empezar con Lección, Clase, Lição, Aula o Lezione, y «próxima clase» fija la próxima clase.',
          pt: 'Espanhol, português e italiano: como línguas para aprender e como idiomas da interface. As lições podem começar com Lección, Clase, Lição, Aula ou Lezione, e «próxima aula» marca a próxima aula.',
          it: 'Spagnolo, portoghese e italiano: come lingue da studiare e come lingue dell’interfaccia. Le lezioni possono iniziare con Lección, Clase, Lição, Aula o Lezione, e «prossima lezione» fissa la prossima lezione.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'New “did you know?” facts about Spanish, Portuguese and Italian while Claude is working.',
          ru: 'Новые факты «А вы знали?» об испанском, португальском и итальянском, пока Claude работает.',
          fr: 'De nouvelles anecdotes « Le saviez-vous ? » sur l’espagnol, le portugais et l’italien pendant que Claude travaille.',
          de: 'Neue „Schon gewusst?“-Fakten über Spanisch, Portugiesisch und Italienisch, während Claude arbeitet.',
          es: 'Nuevos datos curiosos sobre el español, el portugués y el italiano mientras Claude trabaja.',
          pt: 'Novas curiosidades sobre o espanhol, o português e o italiano enquanto o Claude trabalha.',
          it: 'Nuove curiosità sullo spagnolo, il portoghese e l’italiano mentre Claude lavora.',
        },
      },
    ],
  },
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
          es: 'El menú es ahora una columna a la izquierda, agrupada por temas. « lo pliega y ☰ lo vuelve a abrir.',
          pt: 'O menu é agora uma coluna à esquerda, agrupada por temas. « recolhe-o e ☰ volta a abri-lo.',
          it: 'Il menu ora è una colonna a sinistra, raggruppata per temi. « lo chiude e ☰ lo riapre.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'This News page: what changed in the app, day by day. A dot next to News in the menu means there is something you haven’t seen.',
          ru: 'Эта страница «Новости»: что изменилось в приложении, по дням. Точка рядом с «Новостями» в меню значит, что есть что-то, чего вы ещё не видели.',
          fr: 'Cette page Nouveautés : ce qui a changé dans l’application, jour après jour. Un point à côté de Nouveautés dans le menu signale du nouveau.',
          de: 'Diese Seite Neuigkeiten: was sich in der App geändert hat, Tag für Tag. Ein Punkt neben Neuigkeiten im Menü heißt, dass es etwas Neues gibt.',
          es: 'Esta página de Novedades: lo que ha cambiado en la aplicación, día a día. Un punto junto a Novedades en el menú indica que hay algo que no has visto.',
          pt: 'Esta página de Novidades: o que mudou na aplicação, dia a dia. Um ponto ao lado de Novidades no menu indica que há algo que ainda não viu.',
          it: 'Questa pagina Novità: cosa è cambiato nell’app, giorno per giorno. Un punto accanto a Novità nel menu indica che c’è qualcosa che non hai visto.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Clearer section names: Lesson history, Downloaded lessons, A question for discussion, Favourite words, Text analysis and Photo parsing.',
          ru: 'Понятнее названия разделов: «История уроков», «Загруженные уроки», «Вопрос для обсуждения», «Избранные слова», «Разбор текста» и «Разбор фото».',
          fr: 'Des noms de sections plus clairs : Historique des leçons, Leçons téléchargées, Une question à discuter, Mots favoris, Analyse de texte et Analyse de photo.',
          de: 'Klarere Namen der Bereiche: Lektionsverlauf, Geladene Lektionen, Eine Frage zum Diskutieren, Lieblingswörter, Textanalyse und Fotoanalyse.',
          es: 'Nombres de secciones más claros: Historial de lecciones, Lecciones descargadas, Una pregunta para debatir, Palabras favoritas, Análisis de texto y Análisis de fotos.',
          pt: 'Nomes de secções mais claros: Histórico de lições, Lições descarregadas, Uma pergunta para debate, Palavras favoritas, Análise de texto e Análise de fotos.',
          it: 'Nomi delle sezioni più chiari: Cronologia lezioni, Lezioni scaricate, Una domanda di discussione, Parole preferite, Analisi del testo e Analisi delle foto.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'A new top bar: the next lesson with Enter the lesson in the middle, ↻ to sync, and ⚙️ Settings on the right. Opening, sharing or changing the document is under Settings → Document.',
          ru: 'Новая верхняя панель: следующий урок с кнопкой «Войти в урок» посередине, ↻ для синхронизации и ⚙️ Настройки справа. Открыть, отправить ученику или сменить документ — в «Настройки → Документ».',
          fr: 'Une nouvelle barre du haut : le prochain cours avec Entrer dans le cours au milieu, ↻ pour synchroniser et ⚙️ Réglages à droite. Ouvrir, partager ou changer le document : Réglages → Document.',
          de: 'Eine neue obere Leiste: die nächste Stunde mit Zur Stunde in der Mitte, ↻ zum Synchronisieren und ⚙️ Einstellungen rechts. Dokument öffnen, teilen oder wechseln: Einstellungen → Dokument.',
          es: 'Una barra superior nueva: la próxima clase con Entrar en la clase en el centro, ↻ para sincronizar y ⚙️ Ajustes a la derecha. Abrir, compartir o cambiar el documento está en Ajustes → Documento.',
          pt: 'Uma nova barra superior: a próxima aula com Entrar na aula ao centro, ↻ para sincronizar e ⚙️ Definições à direita. Abrir, partilhar ou mudar o documento está em Definições → Documento.',
          it: 'Una nuova barra in alto: la prossima lezione con Entra nella lezione al centro, ↻ per sincronizzare e ⚙️ Impostazioni a destra. Aprire, condividere o cambiare il documento è in Impostazioni → Documento.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'A shared board in lesson mode: the teacher and the student draw on it at the same time.',
          ru: 'Общая доска в режиме урока: преподаватель и ученик рисуют на ней одновременно.',
          fr: 'Un tableau partagé en mode cours : le professeur et l’élève y dessinent en même temps.',
          de: 'Eine gemeinsame Tafel im Unterrichtsmodus: Lehrkraft und Schüler zeichnen gleichzeitig darauf.',
          es: 'Una pizarra compartida en el modo clase: el profesor y el alumno dibujan en ella a la vez.',
          pt: 'Um quadro partilhado no modo aula: o professor e o aluno desenham nele ao mesmo tempo.',
          it: 'Una lavagna condivisa nella modalità lezione: insegnante e studente ci disegnano insieme.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Text analysis: paste an article, click any word or phrase to have it explained, translate the text paragraph by paragraph, and get questions and exercises on it.',
          ru: 'Разбор текста: вставьте статью, нажмите на слово или фразу, чтобы получить объяснение, переведите текст по абзацам и получите вопросы и упражнения по нему.',
          fr: 'Analyse de texte : collez un article, cliquez sur un mot ou une expression pour l’explication, traduisez le texte paragraphe par paragraphe et obtenez des questions et des exercices.',
          de: 'Textanalyse: Füge einen Artikel ein, klicke auf ein Wort oder eine Wendung für eine Erklärung, übersetze den Text Absatz für Absatz und bekomme Fragen und Übungen dazu.',
          es: 'Análisis de texto: pega un artículo, haz clic en una palabra o frase para que te la expliquen, traduce el texto párrafo a párrafo y consigue preguntas y ejercicios.',
          pt: 'Análise de texto: cole um artigo, clique numa palavra ou expressão para a ver explicada, traduza o texto parágrafo a parágrafo e obtenha perguntas e exercícios.',
          it: 'Analisi del testo: incolla un articolo, clicca su una parola o una frase per fartela spiegare, traduci il testo paragrafo per paragrafo e ottieni domande ed esercizi.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'After the lesson, the next-lesson widget says it is finished.',
          ru: 'После урока виджет следующего урока показывает, что урок завершён.',
          fr: 'Après le cours, le widget du prochain cours indique qu’il est terminé.',
          de: 'Nach der Stunde zeigt das Widget der nächsten Stunde, dass sie vorbei ist.',
          es: 'Después de la clase, el widget de la próxima clase indica que ha terminado.',
          pt: 'Depois da aula, o widget da próxima aula indica que terminou.',
          it: 'Dopo la lezione, il widget della prossima lezione indica che è finita.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Settings: your name and picture, the interface language, a light or dark theme, the languages you learn and your level, the daily goal, speech speed and which sections the menu shows.',
          ru: 'Настройки: имя и картинка, язык интерфейса, светлая или тёмная тема, изучаемые языки и уровень, цель на день, скорость озвучки и разделы в меню.',
          fr: 'Réglages : votre nom et votre image, la langue de l’interface, un thème clair ou sombre, les langues apprises et votre niveau, l’objectif du jour, la vitesse de lecture et les sections du menu.',
          de: 'Einstellungen: Name und Bild, Sprache der Oberfläche, helles oder dunkles Design, die Sprachen, die du lernst, und dein Niveau, Tagesziel, Sprechtempo und die Bereiche im Menü.',
          es: 'Ajustes: tu nombre y tu imagen, el idioma de la interfaz, un tema claro u oscuro, los idiomas que aprendes y tu nivel, el objetivo diario, la velocidad de voz y qué secciones muestra el menú.',
          pt: 'Definições: o seu nome e imagem, o idioma da interface, um tema claro ou escuro, as línguas que aprende e o seu nível, o objetivo diário, a velocidade da voz e as secções do menu.',
          it: 'Impostazioni: nome e immagine, lingua dell’interfaccia, tema chiaro o scuro, le lingue che studi e il tuo livello, obiettivo giornaliero, velocità della voce e sezioni del menu.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Lesson mode: Google Meet in a window beside the app, or Zoom inside it, with your notes and the lesson’s words next to the call.',
          ru: 'Режим урока: Google Meet в окне рядом с приложением или Zoom прямо в нём, а рядом со звонком — заметки и слова урока.',
          fr: 'Mode cours : Google Meet dans une fenêtre à côté de l’application, ou Zoom à l’intérieur, avec vos notes et les mots de la leçon à côté de l’appel.',
          de: 'Unterrichtsmodus: Google Meet in einem Fenster neben der App oder Zoom direkt darin, mit deinen Notizen und den Wörtern der Lektion neben dem Anruf.',
          es: 'Modo clase: Google Meet en una ventana junto a la aplicación, o Zoom dentro de ella, con tus notas y las palabras de la lección al lado de la llamada.',
          pt: 'Modo aula: o Google Meet numa janela ao lado da aplicação, ou o Zoom dentro dela, com as suas notas e as palavras da lição ao lado da chamada.',
          it: 'Modalità lezione: Google Meet in una finestra accanto all’app, o Zoom al suo interno, con i tuoi appunti e le parole della lezione accanto alla chiamata.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Lessons can come from a Notion page instead of a Google Doc.',
          ru: 'Уроки можно брать со страницы Notion вместо Google-документа.',
          fr: 'Les leçons peuvent venir d’une page Notion au lieu d’un Google Doc.',
          de: 'Lektionen können aus einer Notion-Seite statt aus einem Google-Dokument kommen.',
          es: 'Las lecciones pueden venir de una página de Notion en lugar de un Google Doc.',
          pt: 'As lições podem vir de uma página do Notion em vez de um Google Doc.',
          it: 'Le lezioni possono arrivare da una pagina Notion invece che da un Google Doc.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'A question for discussion: write your own topic (a TV show, new words…), and open a short explanation of the grammar rule.',
          ru: 'Вопрос для обсуждения: можно написать свою тему (сериал, новые слова…) и открыть короткое объяснение правила грамматики.',
          fr: 'Une question à discuter : écrivez votre propre sujet (une série, de nouveaux mots…) et ouvrez une courte explication de la règle de grammaire.',
          de: 'Eine Frage zum Diskutieren: Schreib dein eigenes Thema (eine Serie, neue Wörter …) und öffne eine kurze Erklärung der Grammatikregel.',
          es: 'Una pregunta para debatir: escribe tu propio tema (una serie, palabras nuevas…) y abre una breve explicación de la regla gramatical.',
          pt: 'Uma pergunta para debate: escreva o seu próprio tema (uma série, palavras novas…) e abra uma explicação curta da regra gramatical.',
          it: 'Una domanda di discussione: scrivi un tuo tema (una serie, parole nuove…) e apri una breve spiegazione della regola grammaticale.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Many small bugs fixed after a full review of the code.',
          ru: 'Исправлено много мелких ошибок после полной проверки кода.',
          fr: 'De nombreux petits bugs corrigés après une relecture complète du code.',
          de: 'Viele kleine Fehler nach einer vollständigen Durchsicht des Codes behoben.',
          es: 'Muchos pequeños errores corregidos tras una revisión completa del código.',
          pt: 'Muitos pequenos erros corrigidos após uma revisão completa do código.',
          it: 'Molti piccoli errori corretti dopo una revisione completa del codice.',
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
          es: 'La aplicación habla tu idioma: inglés, ruso, francés o alemán.',
          pt: 'A aplicação fala a sua língua: inglês, russo, francês ou alemão.',
          it: 'L’app parla la tua lingua: inglese, russo, francese o tedesco.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'German joins French and English as a language to learn.',
          ru: 'Немецкий теперь можно учить вместе с французским и английским.',
          fr: 'L’allemand rejoint le français et l’anglais parmi les langues à apprendre.',
          de: 'Deutsch kommt zu Französisch und Englisch als Lernsprache dazu.',
          es: 'El alemán se une al francés y al inglés como idioma para aprender.',
          pt: 'O alemão junta-se ao francês e ao inglês como língua para aprender.',
          it: 'Il tedesco si aggiunge al francese e all’inglese come lingua da studiare.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Feedback: send the teacher a bug, an idea or any message, with up to 3 screenshots.',
          ru: 'Обратная связь: отправьте преподавателю ошибку, идею или любое сообщение, до 3 скриншотов.',
          fr: 'Avis : envoyez au professeur un bug, une idée ou n’importe quel message, avec jusqu’à 3 captures d’écran.',
          de: 'Feedback: Schick der Lehrkraft einen Fehler, eine Idee oder eine Nachricht, mit bis zu 3 Screenshots.',
          es: 'Comentarios: envía al profesor un error, una idea o cualquier mensaje, con hasta 3 capturas.',
          pt: 'Comentários: envie ao professor um erro, uma ideia ou qualquer mensagem, com até 3 capturas de ecrã.',
          it: 'Feedback: invia all’insegnante un errore, un’idea o qualsiasi messaggio, con fino a 3 screenshot.',
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
          es: 'El análisis de fotos también lee PDF: notas a mano y páginas de manual.',
          pt: 'A análise de fotos também lê PDF: notas à mão e páginas de manual.',
          it: 'L’analisi delle foto legge anche i PDF: appunti a mano e pagine di manuale.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Every section has its own address: links can be shared and the Back button works.',
          ru: 'У каждого раздела свой адрес: ссылками можно делиться, и кнопка «Назад» работает.',
          fr: 'Chaque section a sa propre adresse : les liens se partagent et le bouton Retour fonctionne.',
          de: 'Jeder Bereich hat seine eigene Adresse: Links lassen sich teilen und die Zurück-Taste funktioniert.',
          es: 'Cada sección tiene su propia dirección: los enlaces se pueden compartir y el botón Atrás funciona.',
          pt: 'Cada secção tem o seu próprio endereço: as ligações podem ser partilhadas e o botão Retroceder funciona.',
          it: 'Ogni sezione ha il suo indirizzo: i link si possono condividere e il pulsante Indietro funziona.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'A new look with new fonts, and a rewritten Tutorial.',
          ru: 'Новый внешний вид и шрифты, переписанная инструкция.',
          fr: 'Un nouveau look avec de nouvelles polices, et un guide réécrit.',
          de: 'Ein neues Aussehen mit neuen Schriften und eine neu geschriebene Anleitung.',
          es: 'Un aspecto nuevo con fuentes nuevas, y una guía reescrita.',
          pt: 'Um novo aspeto com novos tipos de letra, e um guia reescrito.',
          it: 'Un nuovo aspetto con nuovi caratteri, e una guida riscritta.',
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
