import type { UiLanguage } from '../i18n/core';
import { load, save } from './storage';
import type { Language } from './types';

/* What changed in the app, for the News page. Add an entry here with every change students
   will notice: the newest day goes first, and every text needs all seven interface languages. */

export type NewsKind = 'new' | 'better' | 'fixed';
export interface NewsItem {
  kind: NewsKind;
  text: Record<UiLanguage, string>;
  // "teacher": about the teacher's tools, so only the teacher sees it
  audience?: 'teacher';
  // the learned languages it is about (German verb tables: ["de"]); left out when it is about all of them
  languages?: Language[];
}

// The News page's tabs: new and improved features, and bug fixes.
export const NEWS_TABS = ['new', 'fixed'] as const;
export type NewsTab = (typeof NEWS_TABS)[number];
// Whose news the teacher reads; a student always gets the students' news.
export const NEWS_AUDIENCES = ['all', 'student', 'teacher'] as const;
export type NewsAudience = (typeof NEWS_AUDIENCES)[number];

/** The days with the items one tab shows, newest first, without the days left empty: for one
    language, the items about it and those about every language; for one audience, its items. */
export function newsFor(
  days: NewsDay[],
  { tab, language, audience }: { tab: NewsTab; language: Language | 'all'; audience: NewsAudience }
): NewsDay[] {
  return days
    .map((day) => ({
      ...day,
      items: day.items.filter(
        (item) =>
          (item.kind === 'fixed') === (tab === 'fixed') &&
          (language === 'all' || !item.languages || item.languages.includes(language)) &&
          (audience === 'all' || (item.audience === 'teacher') === (audience === 'teacher'))
      ),
    }))
    .filter((day) => day.items.length);
}
export interface NewsDay {
  // YYYY-MM-DD
  date: string;
  items: NewsItem[];
}

export const NEWS: NewsDay[] = [
  {
    date: '2026-11-20',
    items: [
      {
        kind: 'new',
        text: {
          en: 'Select any word or phrase in the language you learn (double-click it; on a phone, hold it) for its menu: the translation in that sentence, a definition, examples and, for a verb, its tables. On a lesson’s pages, Add to lesson writes it under the lesson, so it joins the exercises.',
          ru: 'Выделите любое слово или фразу на изучаемом языке (двойным щелчком, а на телефоне — удерживая палец), и откроется меню: перевод в этом предложении, определение, примеры, а для глагола — таблицы спряжения. На страницах урока кнопка «Добавить в урок» добавляет слово в урок, и оно попадает в упражнения.',
          fr: 'Sélectionnez un mot ou une expression dans la langue que vous apprenez (double-cliquez dessus ; sur un téléphone, maintenez le doigt dessus) pour ouvrir son menu : la traduction dans cette phrase, une définition, des exemples et, pour un verbe, ses tableaux de conjugaison. Sur les pages d’une leçon, le bouton « Ajouter à la leçon » l’inscrit sous la leçon, et il rejoint les exercices.',
          de: 'Markiere ein beliebiges Wort oder eine Wendung in der Sprache, die du lernst (per Doppelklick; auf dem Handy gedrückt halten), um das Menü zu öffnen: die Übersetzung in diesem Satz, eine Definition, Beispiele und bei einem Verb seine Konjugationstabellen. Auf den Seiten einer Lektion schreibt die Schaltfläche „Zu Lektion … hinzufügen“ es unter die Lektion, sodass es in die Übungen kommt.',
          es: 'Selecciona cualquier palabra o expresión en el idioma que aprendes (con doble clic; en el móvil, manteniéndola pulsada) para abrir su menú: la traducción en esa frase, una definición, ejemplos y, si es un verbo, sus tablas de conjugación. En las páginas de una lección, el botón «Añadir a la lección» la escribe bajo la lección, y así pasa a los ejercicios.',
          pt: 'Selecione qualquer palavra ou expressão na língua que está a aprender (com duplo clique; no telemóvel, mantendo-a premida) para abrir o menu: a tradução nessa frase, uma definição, exemplos e, se for um verbo, as tabelas de conjugação. Nas páginas de uma lição, o botão «Acrescentar à lição» escreve-a por baixo da lição, e assim ela passa para os exercícios.',
          it: 'Seleziona una parola o un’espressione nella lingua che studi (con un doppio clic; sul telefono, tenendola premuta) per aprire il suo menu: la traduzione in quella frase, una definizione, degli esempi e, per un verbo, le sue tabelle di coniugazione. Nelle pagine di una lezione, il pulsante «Aggiungi alla lezione» la scrive sotto la lezione, così entra negli esercizi.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'News has two tabs, What’s new and Bug fixes. If you learn several languages, choose one: you see its news and the news for every language.',
          ru: 'В Новостях теперь две вкладки: «Что нового» и «Исправления ошибок». Если вы изучаете несколько языков, выберите один: вы увидите его новости и новости для всех языков.',
          fr: 'Les Nouveautés ont maintenant deux onglets : « Quoi de neuf » et « Corrections de bugs ». Si vous apprenez plusieurs langues, choisissez-en une : vous voyez ses nouveautés et celles qui concernent toutes les langues.',
          de: 'Die Neuigkeiten haben jetzt zwei Tabs: „Was ist neu“ und „Fehlerbehebungen“. Wenn du mehrere Sprachen lernst, wähle eine aus: Du siehst ihre Neuigkeiten und die für alle Sprachen.',
          es: 'Novedades tiene ahora dos pestañas: «Qué hay de nuevo» y «Errores corregidos». Si aprendes varios idiomas, elige uno: verás sus novedades y las de todos los idiomas.',
          pt: 'As Novidades têm agora dois separadores: «O que há de novo» e «Correções de erros». Se aprende várias línguas, escolha uma: vê as novidades dessa língua e as de todas as línguas.',
          it: 'Le Novità hanno ora due schede: «Cosa c’è di nuovo» e «Correzioni di bug». Se studi più lingue, scegline una: vedi le sue novità e quelle per tutte le lingue.',
        },
      },
      {
        kind: 'better',
        audience: 'teacher',
        text: {
          en: 'For teachers: News can show only the students’ news or only the news about the teacher’s tools.',
          ru: 'Для преподавателя: в Новостях можно показать только новости для учеников или только новости об инструментах преподавателя.',
          fr: 'Pour le professeur : les Nouveautés peuvent afficher seulement celles des élèves ou seulement celles qui concernent les outils du professeur.',
          de: 'Für Lehrkräfte: Die Neuigkeiten können nur die für Lernende oder nur die zu den Werkzeugen der Lehrkraft zeigen.',
          es: 'Para el profesor: Novedades puede mostrar solo las de los alumnos o solo las de las herramientas del profesor.',
          pt: 'Para o professor: as Novidades podem mostrar só as dos alunos ou só as das ferramentas do professor.',
          it: 'Per l’insegnante: le Novità possono mostrare solo quelle per gli studenti o solo quelle sugli strumenti dell’insegnante.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Photo parsing → Underlined words takes up to 10 photos at once and gives one table of their words. Add to puts them under a lesson you pick, or into a new lesson as before.',
          ru: '«Разбор фото» → «Подчёркнутые слова» принимает до 10 фото за раз и собирает их слова в одну таблицу. В списке «Куда добавить» можно выбрать один из ваших уроков, и слова добавятся к нему — или, как раньше, в новый урок.',
          fr: 'Analyse de photo → Mots soulignés accepte jusqu’à 10 photos à la fois et donne un seul tableau de leurs mots. « Ajouter à » les place sous la leçon de votre choix, ou dans une nouvelle leçon comme avant.',
          de: 'Fotoanalyse → Unterstrichene Wörter nimmt bis zu 10 Fotos auf einmal und macht aus ihren Wörtern eine einzige Tabelle. „Hinzufügen zu“ setzt sie unter eine Lektion deiner Wahl oder wie bisher in eine neue Lektion.',
          es: 'Análisis de fotos → Palabras subrayadas acepta hasta 10 fotos a la vez y reúne sus palabras en una sola tabla. «Añadir a» las pone bajo la lección que elijas, o en una lección nueva como antes.',
          pt: 'Análise de fotos → Palavras sublinhadas aceita até 10 fotos de cada vez e junta as palavras numa só tabela. «Acrescentar a» põe-nas por baixo da lição que escolher, ou numa nova lição, como antes.',
          it: 'Analisi delle foto → Parole sottolineate accetta fino a 10 foto alla volta e raccoglie le loro parole in un’unica tabella. «Aggiungi a» le mette sotto la lezione che scegli, o in una nuova lezione come prima.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'On a phone, the keyboard no longer corrects or completes your answers in exercises, verb drills and written homework, so the answer checked is the one you typed.',
          ru: 'На телефоне клавиатура больше не исправляет и не дополняет ваши ответы в упражнениях, тренировке глаголов и письменных домашних заданиях, так что проверяется именно тот ответ, который вы ввели.',
          fr: 'Sur un téléphone, le clavier ne corrige plus et ne complète plus vos réponses dans les exercices, l’entraînement aux verbes et les devoirs écrits : la réponse vérifiée est bien celle que vous avez tapée.',
          de: 'Auf dem Handy korrigiert oder ergänzt die Tastatur deine Antworten in Übungen, beim Verbtraining und in schriftlichen Hausaufgaben nicht mehr, also wird genau die Antwort geprüft, die du getippt hast.',
          es: 'En el móvil, el teclado ya no corrige ni completa tus respuestas en los ejercicios, la práctica de verbos y los deberes escritos, así que se comprueba justo la respuesta que has escrito.',
          pt: 'No telemóvel, o teclado já não corrige nem completa as suas respostas nos exercícios, no treino de verbos e nos trabalhos de casa escritos, por isso a resposta verificada é exatamente a que escreveu.',
          it: 'Sul telefono la tastiera non corregge né completa più le tue risposte negli esercizi, nell’allenamento sui verbi e nei compiti scritti, così viene controllata proprio la risposta che hai digitato.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'A lesson’s nouns and their translations are in the same number, with the right article: “la colline — холм”, not “холмы”; “la vis”, not “le vis”. To fix a lesson read before, use Prepare this lesson again at the bottom of its Words tab.',
          ru: 'Существительные урока и их переводы стоят в одном числе и с правильным артиклем: «la colline — холм», а не «холмы»; «la vis», а не «le vis». Чтобы исправить урок, прочитанный раньше, нажмите «Подготовить урок заново» внизу его вкладки «Слова».',
          fr: 'Les noms d’une leçon et leurs traductions sont au même nombre, avec le bon article : « la colline — холм », et non « холмы » ; « la vis », et non « le vis ». Pour corriger une leçon lue auparavant, utilisez « Préparer de nouveau cette leçon » en bas de son onglet Mots.',
          de: 'Die Substantive einer Lektion und ihre Übersetzungen stehen im selben Numerus und mit dem richtigen Artikel: „la colline — холм“, nicht „холмы“; „la vis“, nicht „le vis“. Um eine schon gelesene Lektion zu korrigieren, nutze „Lektion neu vorbereiten“ unten in ihrem Tab Wörter.',
          es: 'Los sustantivos de una lección y sus traducciones van en el mismo número, con el artículo correcto: «la colline — холм», no «холмы»; «la vis», no «le vis». Para corregir una lección que ya leíste, usa «Preparar de nuevo esta lección» al final de su pestaña Palabras.',
          pt: 'Os substantivos de uma lição e as suas traduções ficam no mesmo número, com o artigo certo: «la colline — холм», e não «холмы»; «la vis», e não «le vis». Para corrigir uma lição lida antes, use «Preparar esta lição de novo» no fim do separador Palavras dessa lição.',
          it: 'I sostantivi di una lezione e le loro traduzioni sono nello stesso numero, con l’articolo giusto: «la colline — холм», non «холмы»; «la vis», non «le vis». Per correggere una lezione letta prima, usa «Prepara di nuovo questa lezione» in fondo alla sua scheda Parole.',
        },
      },
    ],
  },
  {
    date: '2026-11-19',
    items: [
      {
        kind: 'fixed',
        text: {
          en: 'Messages from the server are in your language too: a lesson too long to read, a picture of the wrong kind, a link that isn’t a Zoom meeting. After an update, a message asks you to reload the page instead of showing an error in English.',
          ru: 'Сообщения сервера теперь тоже на вашем языке: слишком длинный урок, картинка не того формата, ссылка, которая не ведёт на конференцию Zoom. После обновления приложения сообщение просит перезагрузить страницу, а не показывает ошибку на английском.',
          fr: 'Les messages du serveur sont eux aussi dans votre langue : une leçon trop longue à lire, une image au mauvais format, un lien qui n’est pas une réunion Zoom. Après une mise à jour, un message vous demande de recharger la page au lieu d’afficher une erreur en anglais.',
          de: 'Auch die Meldungen des Servers sind jetzt in deiner Sprache: eine Lektion, die zu lang zum Lesen ist, ein Bild im falschen Format, ein Link, der zu keinem Zoom-Meeting führt. Nach einem Update bittet dich eine Meldung, die Seite neu zu laden, statt einen Fehler auf Englisch zu zeigen.',
          es: 'Los mensajes del servidor también están en tu idioma: una lección demasiado larga para leerla, una imagen de un formato no admitido, un enlace que no es de una reunión de Zoom. Después de una actualización, un mensaje te pide que recargues la página en vez de mostrar un error en inglés.',
          pt: 'As mensagens do servidor também estão na sua língua: uma lição demasiado longa para ler, uma imagem num formato errado, uma ligação que não é de uma reunião do Zoom. Depois de uma atualização, uma mensagem pede-lhe que recarregue a página, em vez de mostrar um erro em inglês.',
          it: 'Anche i messaggi del server sono nella tua lingua: una lezione troppo lunga da leggere, un’immagine del tipo sbagliato, un link che non è una riunione Zoom. Dopo un aggiornamento, un messaggio ti chiede di ricaricare la pagina invece di mostrare un errore in inglese.',
        },
      },
      {
        kind: 'fixed',
        languages: ['es', 'it', 'pt'],
        text: {
          en: 'A word spelled the same in two of your languages (“la casa” in Spanish and in Italian, the verb “ser” in Spanish and in Portuguese) stays in the exercises in both, instead of only in the newer lesson’s.',
          ru: 'Слово, которое пишется одинаково в двух ваших языках («la casa» в испанском и итальянском, глагол «ser» в испанском и португальском), остаётся в упражнениях на обоих языках, а не только на языке более нового урока.',
          fr: 'Un mot qui s’écrit pareil dans deux de vos langues (« la casa » en espagnol et en italien, le verbe « ser » en espagnol et en portugais) reste dans les exercices des deux langues, et plus seulement dans ceux de la leçon la plus récente.',
          de: 'Ein Wort, das in zwei deiner Sprachen gleich geschrieben wird („la casa“ im Spanischen und Italienischen, das Verb „ser“ im Spanischen und Portugiesischen), bleibt in den Übungen beider Sprachen, statt nur in denen der neueren Lektion.',
          es: 'Una palabra que se escribe igual en dos de tus idiomas («la casa» en español y en italiano, el verbo «ser» en español y en portugués) se queda en los ejercicios de ambos, en vez de solo en los de la lección más reciente.',
          pt: 'Uma palavra que se escreve da mesma forma em duas das suas línguas («la casa» em espanhol e em italiano, o verbo «ser» em espanhol e em português) fica nos exercícios de ambas, em vez de só nos da lição mais recente.',
          it: 'Una parola che si scrive allo stesso modo in due delle tue lingue («la casa» in spagnolo e in italiano, il verbo «ser» in spagnolo e in portoghese) resta negli esercizi di entrambe, invece che solo in quelli della lezione più recente.',
        },
      },
      {
        kind: 'fixed',
        languages: ['en', 'de', 'es', 'pt', 'it'],
        text: {
          en: 'Without Claude, a lesson headed “Lektion”, “Lección”, “Lição”, “Lezione” or “Lesson” keeps its language: its words are read aloud in it and follow your languages in Settings.',
          ru: 'Без Claude урок с заголовком «Lektion», «Lección», «Lição», «Lezione» или «Lesson» сохраняет свой язык: его слова озвучиваются на этом языке и показываются по языкам, выбранным в Настройках.',
          fr: 'Sans Claude, une leçon intitulée « Lektion », « Lección », « Lição », « Lezione » ou « Lesson » garde sa langue : ses mots sont lus à voix haute dans cette langue et suivent les langues cochées dans les Réglages.',
          de: 'Ohne Claude behält eine Lektion mit der Überschrift „Lektion“, „Lección“, „Lição“, „Lezione“ oder „Lesson“ ihre Sprache: Ihre Wörter werden in dieser Sprache vorgelesen und richten sich nach deinen Sprachen in den Einstellungen.',
          es: 'Sin Claude, una lección titulada «Lektion», «Lección», «Lição», «Lezione» o «Lesson» conserva su idioma: sus palabras se leen en voz alta en ese idioma y siguen los idiomas que has marcado en Ajustes.',
          pt: 'Sem o Claude, uma lição com o título «Lektion», «Lección», «Lição», «Lezione» ou «Lesson» mantém a sua língua: as palavras são lidas em voz alta nessa língua e seguem as línguas marcadas nas Definições.',
          it: 'Senza Claude, una lezione intitolata «Lektion», «Lección», «Lição», «Lezione» o «Lesson» mantiene la sua lingua: le sue parole vengono lette ad alta voce in quella lingua e seguono le lingue spuntate nelle Impostazioni.',
        },
      },
      {
        kind: 'better',
        languages: ['fr', 'de'],
        text: {
          en: 'Typing “oe” for “œ” or “ss” for “ß” counts as almost right, like a missing accent, since many keyboards don’t have those letters.',
          ru: 'Если набрать «oe» вместо «œ» или «ss» вместо «ß», ответ засчитывается как «почти», как пропущенный диакритический знак: на многих клавиатурах этих букв нет.',
          fr: 'Taper « oe » pour « œ » ou « ss » pour « ß » compte comme « presque », comme un accent oublié, car beaucoup de claviers n’ont pas ces lettres.',
          de: '„oe“ statt „œ“ oder „ss“ statt „ß“ zählt als „fast“, wie ein fehlender Akzent, weil viele Tastaturen diese Buchstaben nicht haben.',
          es: 'Escribir «oe» por «œ» o «ss» por «ß» cuenta como «casi», igual que un acento que falta, porque muchos teclados no tienen esas letras.',
          pt: 'Escrever «oe» em vez de «œ» ou «ss» em vez de «ß» conta como «quase», tal como um acento em falta, porque muitos teclados não têm essas letras.',
          it: 'Scrivere «oe» al posto di «œ» o «ss» al posto di «ß» conta come «quasi», come un accento mancante, perché molte tastiere non hanno queste lettere.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'On a phone, the lesson list scrolls to the lesson you have open, and a lesson’s tabs fit in one row you can swipe.',
          ru: 'На телефоне список уроков прокручивается к открытому уроку, а вкладки урока помещаются в одну строку, которую можно листать пальцем.',
          fr: 'Sur téléphone, la liste des leçons défile jusqu’à la leçon ouverte, et les onglets d’une leçon tiennent sur une seule ligne que vous faites défiler du doigt.',
          de: 'Auf dem Handy scrollt die Lektionsliste zur geöffneten Lektion, und die Tabs einer Lektion passen in eine Zeile, durch die du wischen kannst.',
          es: 'En el móvil, la lista de lecciones se desplaza hasta la lección que tienes abierta, y las pestañas de una lección caben en una fila que puedes deslizar.',
          pt: 'No telemóvel, a lista de lições desloca-se até à lição que tem aberta, e os separadores de uma lição cabem numa linha que pode deslizar.',
          it: 'Sul telefono, l’elenco delle lezioni si sposta sulla lezione che hai aperto, e le schede di una lezione stanno in una sola riga da scorrere col dito.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'A lesson’s Homework tab links to Home, where each task opens its exercise.',
          ru: 'На вкладке «Домашнее задание» урока есть ссылка на Главную, где каждое задание открывает своё упражнение.',
          fr: 'L’onglet Devoirs d’une leçon mène à l’Accueil, où chaque tâche ouvre son exercice.',
          de: 'Der Tab Hausaufgaben einer Lektion führt zur Startseite, wo jede Aufgabe ihre Übung öffnet.',
          es: 'La pestaña Deberes de una lección lleva a Inicio, donde cada tarea abre su ejercicio.',
          pt: 'O separador Trabalhos de casa de uma lição leva ao Início, onde cada tarefa abre o seu exercício.',
          it: 'La scheda Compiti di una lezione porta alla Home, dove ogni compito apre il suo esercizio.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'When the app can’t add something to the Google Doc, it now says why in your language.',
          ru: 'Если приложению не удаётся что-то добавить в Google-документ, теперь оно объясняет причину на вашем языке.',
          fr: 'Quand l’application ne peut pas ajouter quelque chose au Google Doc, elle dit maintenant pourquoi dans votre langue.',
          de: 'Wenn die App etwas nicht zum Google-Dokument hinzufügen kann, sagt sie jetzt in deiner Sprache, warum.',
          es: 'Cuando la aplicación no puede añadir algo al Google Doc, ahora te dice por qué en tu idioma.',
          pt: 'Quando a aplicação não consegue acrescentar algo ao Google Doc, agora diz porquê na sua língua.',
          it: 'Quando l’app non riesce ad aggiungere qualcosa al Google Doc, ora ti dice perché nella tua lingua.',
        },
      },
      {
        kind: 'fixed',
        languages: ['fr', 'de', 'es', 'it', 'pt'],
        text: {
          en: 'Verb tables and quizzes accept the pronoun for every person: “elle se lève”, “sie geht” or “ella habla” was marked wrong where the person reads “il/elle/on”, “er/sie/es” or “él/ella/usted”.',
          ru: 'Таблицы спряжения и тесты теперь принимают любое местоимение лица: раньше «elle se lève», «sie geht» или «ella habla» засчитывались как ошибка там, где в строке стоит «il/elle/on», «er/sie/es» или «él/ella/usted».',
          fr: 'Les tableaux de conjugaison et les quiz acceptent désormais chaque pronom d’une personne : « elle se lève », « sie geht » ou « ella habla » étaient comptés comme faux là où la personne s’écrit « il/elle/on », « er/sie/es » ou « él/ella/usted ».',
          de: 'Konjugationstabellen und Quiz akzeptieren jetzt jedes Pronomen einer Person: „elle se lève“, „sie geht“ oder „ella habla“ wurde bisher als falsch gewertet, wo als Person „il/elle/on“, „er/sie/es“ oder „él/ella/usted“ steht.',
          es: 'Las tablas de conjugación y los tests aceptan todos los pronombres de cada persona: «elle se lève», «sie geht» o «ella habla» se marcaba como error donde la persona aparece como «il/elle/on», «er/sie/es» o «él/ella/usted».',
          pt: 'As tabelas de conjugação e os testes aceitam todos os pronomes de cada pessoa: «elle se lève», «sie geht» ou «ella habla» era marcado como erro onde a pessoa aparece como «il/elle/on», «er/sie/es» ou «él/ella/usted».',
          it: 'Le tabelle di coniugazione e i quiz accettano tutti i pronomi di ogni persona: «elle se lève», «sie geht» o «ella habla» veniva segnato come errore dove la persona compare come «il/elle/on», «er/sie/es» o «él/ella/usted».',
        },
      },
      {
        kind: 'fixed',
        languages: ['de', 'es', 'it', 'pt'],
        text: {
          en: 'Mistakes, Stats and the warm-up show missed verb forms in German, Spanish, Italian and Portuguese too, not only in French.',
          ru: '«Ошибки», «Статистика» и разминка теперь показывают формы глаголов с ошибками не только во французском, но и в немецком, испанском, итальянском и португальском.',
          fr: 'Erreurs, Statistiques et l’échauffement montrent aussi les formes verbales ratées en allemand, en espagnol, en italien et en portugais, pas seulement en français.',
          de: 'Fehler, Statistik und das Aufwärmen zeigen falsch beantwortete Verbformen jetzt auch für Deutsch, Spanisch, Italienisch und Portugiesisch, nicht nur für Französisch.',
          es: 'Errores, Estadísticas y el calentamiento muestran también las formas verbales falladas en alemán, español, italiano y portugués, no solo en francés.',
          pt: 'Erros, Estatísticas e o aquecimento mostram também as formas verbais erradas em alemão, espanhol, italiano e português, não só em francês.',
          it: 'Errori, Statistiche e il riscaldamento mostrano anche le forme verbali sbagliate in tedesco, spagnolo, italiano e portoghese, non solo in francese.',
        },
      },
      {
        kind: 'fixed',
        languages: ['fr', 'de', 'es', 'it', 'pt'],
        text: {
          en: 'Homework: verb tasks written with a short tense name (“au futur”, “presente”, “Futur”) or with “и” between the verbs open the right verbs in the right tense.',
          ru: 'Домашнее задание: упражнения на глаголы, где время названо коротко («au futur», «presente», «Futur») или глаголы разделены «и», открывают нужные глаголы в нужном времени.',
          fr: 'Devoirs : les tâches de verbes écrites avec un nom de temps abrégé (« au futur », « presente », « Futur ») ou avec « и » entre les verbes ouvrent les bons verbes au bon temps.',
          de: 'Hausaufgaben: Verbaufgaben mit einer kurzen Angabe der Zeitform („au futur“, „presente“, „Futur“) oder mit „и“ zwischen den Verben öffnen die richtigen Verben in der richtigen Zeitform.',
          es: 'Deberes: las tareas de verbos escritas con el nombre corto de un tiempo («au futur», «presente», «Futur») o con «и» entre los verbos abren los verbos correctos en el tiempo correcto.',
          pt: 'Trabalho de casa: as tarefas de verbos escritas com o nome curto de um tempo («au futur», «presente», «Futur») ou com «и» entre os verbos abrem os verbos certos no tempo certo.',
          it: 'Compiti: se un compito sui verbi indica il tempo in breve («au futur», «presente», «Futur») o ha «и» tra i verbi, apre i verbi giusti nel tempo giusto.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Next lesson: a line that only mentions it (“read the text for the next lesson”) no longer hides the date written above it.',
          ru: 'Следующий урок: строка, где он только упоминается («прочитать текст к следующему уроку»), больше не скрывает дату, написанную над ней.',
          fr: 'Prochain cours : une ligne qui ne fait que le mentionner (« lire le texte pour le prochain cours ») ne masque plus la date écrite au-dessus.',
          de: 'Nächste Stunde: Eine Zeile, die sie nur erwähnt („den Text für die nächste Stunde lesen“), verdeckt nicht mehr das Datum, das darüber steht.',
          es: 'Próxima clase: una línea que solo la menciona («leer el texto para la próxima clase») ya no oculta la fecha escrita encima.',
          pt: 'Próxima aula: uma linha que só a menciona («ler o texto para a próxima aula») já não esconde a data escrita por cima.',
          it: 'Prossima lezione: una riga che la nomina soltanto («leggere il testo per la prossima lezione») non nasconde più la data scritta sopra.',
        },
      },
      {
        kind: 'new',
        languages: ['fr', 'de', 'es', 'it', 'pt'],
        text: {
          en: 'Quizzes ask verb forms only in the tenses you have learned: by default those of your level (at A0 only the present), or the ones you tick in Settings → Tenses in quizzes.',
          ru: 'Тесты спрашивают формы глаголов только во временах, которые вы уже прошли: по умолчанию — во временах вашего уровня (на A0 только настоящее), или в тех, что вы отметите в «Настройках» → «Времена в тестах».',
          fr: 'Les quiz ne demandent les formes verbales qu’aux temps que vous avez appris : par défaut ceux de votre niveau (en A0, seulement le présent), ou ceux que vous cochez dans Réglages → Temps dans les quiz.',
          de: 'Im Quiz werden Verbformen nur in den Zeitformen abgefragt, die du gelernt hast: standardmäßig in denen deines Niveaus (bei A0 nur im Präsens) oder in denen, die du unter Einstellungen → Zeitformen im Quiz anhakst.',
          es: 'Los tests solo preguntan formas verbales en los tiempos que has aprendido: por defecto, los de tu nivel (en A0, solo el presente), o los que marques en Ajustes → Tiempos en los tests.',
          pt: 'Os testes só pedem formas verbais nos tempos que já aprendeu: por predefinição, os do seu nível (no A0, só o presente), ou os que marcar em Definições → Tempos nos testes.',
          it: 'I quiz chiedono le forme verbali solo nei tempi che hai imparato: in automatico quelli del tuo livello (all’A0 solo il presente), oppure quelli che spunti in Impostazioni → Tempi nei quiz.',
        },
      },
      {
        kind: 'new',
        audience: 'teacher',
        text: {
          en: 'Make homework with Claude: choose how many sentences to translate (2 to 8) and the level before Claude writes the homework.',
          ru: '«Составить с Claude»: теперь можно выбрать, сколько фраз дать на перевод (от 2 до 8) и уровень, прежде чем Claude напишет домашнее задание.',
          fr: 'Préparer les devoirs avec Claude : choisissez le nombre de phrases à traduire (de 2 à 8) et le niveau avant que Claude rédige les devoirs.',
          de: 'Mit Claude erstellen: Wähle vorher, wie viele Sätze zu übersetzen sind (2 bis 8) und auf welchem Niveau Claude die Hausaufgaben schreibt.',
          es: 'Preparar los deberes con Claude: elige cuántas frases hay que traducir (de 2 a 8) y el nivel antes de que Claude escriba los deberes.',
          pt: 'Fazer com o Claude: escolha quantas frases há para traduzir (de 2 a 8) e o nível antes de o Claude escrever o trabalho de casa.',
          it: 'Crea con Claude: scegli quante frasi far tradurre (da 2 a 8) e il livello prima che Claude scriva i compiti.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'With an interface language other than English, lesson topics are no longer shown in English: under a lesson’s title, in Stats and in A question for discussion.',
          ru: 'Если язык интерфейса не английский, темы уроков больше не показываются по-английски: под названием урока, в «Статистике» и в «Вопросе для обсуждения».',
          fr: 'Avec une langue d’interface autre que l’anglais, les thèmes des leçons ne s’affichent plus en anglais : sous le titre d’une leçon, dans Statistiques et dans Une question à discuter.',
          de: 'Ist die Sprache der Oberfläche nicht Englisch, erscheinen die Themen der Lektionen nicht mehr auf Englisch: unter dem Titel einer Lektion, in Statistik und in Eine Frage zum Diskutieren.',
          es: 'Con un idioma de la interfaz distinto del inglés, los temas de las lecciones ya no aparecen en inglés: bajo el título de una lección, en Estadísticas y en Una pregunta para debatir.',
          pt: 'Com um idioma da interface diferente do inglês, os temas das lições já não aparecem em inglês: por baixo do título de uma lição, em Estatísticas e em Uma pergunta para debate.',
          it: 'Con una lingua dell’interfaccia diversa dall’inglese, gli argomenti delle lezioni non compaiono più in inglese: sotto il titolo di una lezione, in Statistiche e in Una domanda di discussione.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Listening questions in the exercises have a “Can’t listen now” button: it skips the round’s listening questions without counting them as mistakes.',
          ru: 'У вопросов на слух в упражнениях появилась кнопка «Сейчас не могу слушать»: она пропускает вопросы на слух в этом раунде и не считает их ошибками.',
          fr: 'Les questions d’écoute des exercices ont un bouton « Je ne peux pas écouter maintenant » : il passe les questions d’écoute du tour sans les compter comme des erreurs.',
          de: 'Hörfragen in den Übungen haben eine Schaltfläche „Kann gerade nicht zuhören“: Sie überspringt die Hörfragen der Runde, ohne sie als Fehler zu zählen.',
          es: 'Las preguntas de escucha de los ejercicios tienen un botón «Ahora no puedo escuchar»: salta las preguntas de escucha de la ronda sin contarlas como errores.',
          pt: 'As perguntas de audição dos exercícios têm um botão «Agora não posso ouvir»: salta as perguntas de audição da ronda sem as contar como erros.',
          it: 'Le domande di ascolto negli esercizi hanno un pulsante «Ora non posso ascoltare»: salta le domande di ascolto del turno senza contarle come errori.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'An answer of only “?” (or other punctuation) now counts as “I don’t know”: the right answer is shown, instead of Check doing nothing.',
          ru: 'Ответ из одного «?» (или других знаков препинания) теперь считается ответом «не знаю»: приложение показывает правильный ответ, а раньше кнопка «Проверить» просто ничего не делала.',
          fr: 'Une réponse faite seulement d’un « ? » (ou d’autres signes de ponctuation) compte désormais comme « je ne sais pas » : la bonne réponse s’affiche, alors qu’avant Vérifier ne faisait rien.',
          de: 'Eine Antwort nur aus „?“ (oder anderen Satzzeichen) zählt jetzt als „weiß ich nicht“: Die richtige Antwort erscheint, statt dass Prüfen nichts tut.',
          es: 'Una respuesta de solo «?» (u otros signos de puntuación) ahora cuenta como «no lo sé»: se muestra la respuesta correcta, en vez de que Comprobar no haga nada.',
          pt: 'Uma resposta só com «?» (ou outra pontuação) passa a contar como «não sei»: a resposta certa aparece, em vez de Verificar não fazer nada.',
          it: 'Una risposta fatta solo di «?» (o di altra punteggiatura) ora conta come «non lo so»: compare la risposta giusta, mentre prima Controlla non faceva nulla.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'While Claude is working, each “Did you know?” fact now stays 20 seconds instead of 8, long enough to read; “Next fact →” still shows another one at once.',
          ru: 'Пока Claude работает, каждый интересный факт теперь держится 20 секунд вместо 8 — этого хватает, чтобы его прочитать; «Следующий факт →» по-прежнему сразу показывает другой.',
          fr: 'Pendant que Claude travaille, chaque fait du « Le saviez-vous ? » reste maintenant 20 secondes au lieu de 8, le temps de le lire ; « Fait suivant → » en montre toujours un autre tout de suite.',
          de: 'Während Claude arbeitet, bleibt jeder „Schon gewusst?“-Fakt jetzt 20 statt 8 Sekunden stehen, lang genug zum Lesen; „Nächster Fakt →“ zeigt weiterhin sofort einen anderen.',
          es: 'Mientras Claude trabaja, cada dato curioso se queda ahora 20 segundos en vez de 8, tiempo suficiente para leerlo; «Siguiente dato →» sigue mostrando otro al instante.',
          pt: 'Enquanto o Claude trabalha, cada curiosidade fica agora 20 segundos em vez de 8, o suficiente para a ler; «Curiosidade seguinte →» continua a mostrar outra de imediato.',
          it: 'Mentre Claude lavora, ogni curiosità ora resta 20 secondi invece di 8, abbastanza per leggerla; «Curiosità successiva →» ne mostra comunque subito un’altra.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Favourite words no longer looks empty when your starred words are in a language not ticked in Settings: it says how many are hidden and which language to tick to see them.',
          ru: '«Избранные слова» больше не выглядят пустыми, если слова со звёздочкой — на языке, который не отмечен в Настройках: страница пишет, сколько слов скрыто и какой язык отметить, чтобы их увидеть.',
          fr: 'La page Mots favoris ne paraît plus vide quand vos mots marqués d’une ★ sont dans une langue non cochée dans les Réglages : elle indique combien sont masqués et quelle langue cocher pour les voir.',
          de: 'Die Seite Lieblingswörter sieht nicht mehr leer aus, wenn deine Wörter mit ★ in einer Sprache sind, die in den Einstellungen nicht angehakt ist: Sie zeigt, wie viele ausgeblendet sind und welche Sprache du anhaken musst, um sie zu sehen.',
          es: 'La página Palabras favoritas ya no parece vacía cuando tus palabras con ★ están en un idioma no marcado en Ajustes: indica cuántas están ocultas y qué idioma marcar para verlas.',
          pt: 'A página Palavras favoritas já não parece vazia quando as suas palavras com ★ estão numa língua não marcada nas Definições: indica quantas estão ocultas e que língua marcar para as ver.',
          it: 'La pagina Parole preferite non sembra più vuota quando le tue parole con la ★ sono in una lingua non spuntata nelle Impostazioni: indica quante sono nascoste e quale lingua spuntare per vederle.',
        },
      },
    ],
  },
  {
    date: '2026-11-18',
    items: [
      {
        kind: 'new',
        languages: ['es', 'it', 'pt'],
        text: {
          en: 'Spanish, Italian and Portuguese verbs: the Verbs tab of their lessons has conjugation tables in the main tenses, with the drill and the quick quiz. Portuguese is the Portuguese of Portugal.',
          ru: 'Испанские, итальянские и португальские глаголы: на вкладке «Глаголы» их уроков есть таблицы спряжения в основных временах, с тренировкой и быстрым тестом. Португальский — европейский.',
          fr: 'Verbes espagnols, italiens et portugais : l’onglet Verbes de leurs leçons a des tableaux de conjugaison aux temps principaux, avec l’entraînement et le quiz rapide. Le portugais est celui du Portugal.',
          de: 'Spanische, italienische und portugiesische Verben: Der Tab Verben ihrer Lektionen hat Konjugationstabellen in den wichtigsten Zeitformen, mit Übung und Schnelltest. Das Portugiesisch ist das aus Portugal.',
          es: 'Verbos españoles, italianos y portugueses: la pestaña Verbos de sus lecciones tiene tablas de conjugación en los tiempos principales, con la práctica y el test rápido. El portugués es el de Portugal.',
          pt: 'Verbos espanhóis, italianos e portugueses: o separador Verbos das suas lições tem tabelas de conjugação nos tempos principais, com o treino e o teste rápido. O português é o de Portugal.',
          it: 'Verbi spagnoli, italiani e portoghesi: la scheda Verbi delle loro lezioni ha le tabelle di coniugazione nei tempi principali, con l’esercizio e il quiz veloce. Il portoghese è quello del Portogallo.',
        },
      },
      {
        kind: 'new',
        languages: ['de'],
        text: {
          en: 'German verbs: a German lesson’s Verbs tab has tables in Präsens, Perfekt, Präteritum, Futur I and Konjunktiv II, with the drill and the quick quiz, and homework can ask to conjugate them.',
          ru: 'Немецкие глаголы: на вкладке «Глаголы» немецкого урока есть таблицы в Präsens, Perfekt, Präteritum, Futur I и Konjunktiv II, с тренировкой и быстрым тестом, а в домашнем задании можно попросить их проспрягать.',
          fr: 'Verbes allemands : l’onglet Verbes d’une leçon d’allemand a des tableaux au Präsens, Perfekt, Präteritum, Futur I et Konjunktiv II, avec l’entraînement et le quiz rapide, et les devoirs peuvent demander de les conjuguer.',
          de: 'Deutsche Verben: Der Tab Verben einer Deutsch-Lektion hat Tabellen im Präsens, Perfekt, Präteritum, Futur I und Konjunktiv II, mit Übung und Schnelltest, und Hausaufgaben können das Konjugieren verlangen.',
          es: 'Verbos alemanes: la pestaña Verbos de una lección de alemán tiene tablas en Präsens, Perfekt, Präteritum, Futur I y Konjunktiv II, con la práctica y el test rápido, y los deberes pueden pedir conjugarlos.',
          pt: 'Verbos alemães: o separador Verbos de uma lição de alemão tem tabelas em Präsens, Perfekt, Präteritum, Futur I e Konjunktiv II, com o treino e o teste rápido, e os trabalhos de casa podem pedir para os conjugar.',
          it: 'Verbi tedeschi: la scheda Verbi di una lezione di tedesco ha le tabelle al Präsens, Perfekt, Präteritum, Futur I e Konjunktiv II, con l’esercizio e il quiz veloce, e i compiti possono chiedere di coniugarli.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Claude now writes for your level (Settings → Languages I learn) everywhere: lesson words, grammar explanations, Photo parsing, textbook notes and explained words. At A0 it keeps things short and simple; from B1 it uses natural wording.',
          ru: 'Claude теперь везде пишет под ваш уровень (Настройки → Языки, которые я учу): слова урока, объяснения грамматики, разбор фото, заметки из учебника и объяснения слов. На A0 — коротко и просто, с B1 — естественные формулировки.',
          fr: 'Claude écrit maintenant partout pour votre niveau (Réglages → Langues que j’apprends) : mots de la leçon, explications de grammaire, analyse de photos, notes du manuel et mots expliqués. En A0, court et simple ; à partir de B1, des tournures naturelles.',
          de: 'Claude schreibt jetzt überall für dein Niveau (Einstellungen → Sprachen, die ich lerne): Wörter der Lektion, Grammatikerklärungen, Fotoanalyse, Notizen aus dem Lehrbuch und erklärte Wörter. Bei A0 kurz und einfach, ab B1 natürliche Formulierungen.',
          es: 'Claude ahora escribe para tu nivel en todas partes (Ajustes → Idiomas que aprendo): palabras de la lección, explicaciones de gramática, análisis de fotos, notas del libro y palabras explicadas. En A0, corto y sencillo; desde B1, frases naturales.',
          pt: 'O Claude escreve agora para o seu nível em todo o lado (Definições → Línguas que aprendo): palavras da lição, explicações de gramática, análise de fotos, notas do manual e palavras explicadas. No A0, curto e simples; a partir do B1, frases naturais.',
          it: 'Claude ora scrive per il tuo livello ovunque (Impostazioni → Lingue che studio): parole della lezione, spiegazioni di grammatica, analisi delle foto, appunti dal libro e parole spiegate. Ad A0 breve e semplice; da B1 frasi naturali.',
        },
      },
    ],
  },
  {
    date: '2026-11-17',
    items: [
      {
        kind: 'fixed',
        text: {
          en: 'Speech: “Slow” in Settings is now clearly slower than “Normal”. Words no longer play by themselves when you open Home, and reading stops when you leave the page or switch tabs.',
          ru: 'Озвучка: скорость «Медленная» в Настройках теперь заметно медленнее, чем «Обычная». Слова больше не звучат сами, когда вы открываете Главную, а чтение останавливается, когда вы уходите со страницы или переключаете вкладку.',
          fr: 'Lecture à voix haute : « Lente » dans les Réglages est maintenant nettement plus lente que « Normale ». Les mots ne se lisent plus tout seuls à l’ouverture de l’Accueil, et la lecture s’arrête quand vous quittez la page ou changez d’onglet.',
          de: 'Vorlesen: „Langsam“ in den Einstellungen ist jetzt deutlich langsamer als „Normal“. Wörter werden nicht mehr von selbst vorgelesen, wenn du die Startseite öffnest, und das Vorlesen hört auf, wenn du die Seite verlässt oder den Tab wechselst.',
          es: 'Lectura en voz alta: «Lenta» en Ajustes ahora es claramente más lenta que «Normal». Las palabras ya no suenan solas al abrir Inicio, y la lectura se detiene al salir de la página o cambiar de pestaña.',
          pt: 'Leitura em voz alta: «Lenta» nas Definições é agora claramente mais lenta do que «Normal». As palavras já não soam sozinhas ao abrir o Início, e a leitura para quando sai da página ou muda de separador.',
          it: 'Lettura ad alta voce: «Lenta» nelle Impostazioni ora è chiaramente più lenta di «Normale». Le parole non si leggono più da sole quando apri la Home, e la lettura si ferma quando lasci la pagina o cambi scheda.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'A “?” next to every page’s title opens that page’s guide in the Tutorial. Icon buttons show what they do when you point at them or reach them with the Tab key.',
          ru: 'Значок «?» рядом с названием каждой страницы открывает её раздел в Инструкции. Кнопки-значки показывают подсказку, когда вы наводите на них указатель или переходите к ним клавишей Tab.',
          fr: 'Un « ? » à côté du titre de chaque page ouvre sa partie du Guide. Les boutons-icônes disent ce qu’ils font quand on les survole ou qu’on y arrive avec la touche Tab.',
          de: 'Ein „?“ neben dem Titel jeder Seite öffnet ihren Teil der Anleitung. Symbol-Schaltflächen zeigen, was sie tun, wenn du darauf zeigst oder sie mit der Tab-Taste erreichst.',
          es: 'Un «?» junto al título de cada página abre su parte de la Guía. Los botones con icono dicen lo que hacen al pasar el puntero o al llegar a ellos con la tecla Tab.',
          pt: 'Um «?» junto ao título de cada página abre a sua parte do Guia. Os botões com ícone mostram o que fazem quando aponta para eles ou chega a eles com a tecla Tab.',
          it: 'Un «?» accanto al titolo di ogni pagina apre la sua parte della Guida. I pulsanti con icona dicono cosa fanno quando ci passi sopra o li raggiungi con il tasto Tab.',
        },
      },
      {
        kind: 'new',
        audience: 'teacher',
        text: {
          en: 'For teachers: Settings → Teacher turns on the teacher’s tools with the teacher code. Students no longer see Make homework from this lesson.',
          ru: 'Для преподавателя: Настройки → Преподаватель включают инструменты преподавателя по коду преподавателя. Ученики больше не видят «Домашнее задание по этому уроку».',
          fr: 'Pour le professeur : Réglages → Professeur active ses outils avec le code du professeur. Les élèves ne voient plus « Des devoirs à partir de cette leçon ».',
          de: 'Für Lehrkräfte: Einstellungen → Lehrkraft schaltet die Werkzeuge der Lehrkraft mit dem Code der Lehrkraft ein. Lernende sehen „Hausaufgaben aus dieser Lektion“ nicht mehr.',
          es: 'Para el profesor: Ajustes → Profesor activa sus herramientas con el código del profesor. Los alumnos ya no ven «Deberes a partir de esta lección».',
          pt: 'Para o professor: Definições → Professor ativa as suas ferramentas com o código do professor. Os alunos deixam de ver «Trabalho de casa a partir desta lição».',
          it: 'Per l’insegnante: Impostazioni → Insegnante attiva i suoi strumenti con il codice dell’insegnante. Gli studenti non vedono più «Compiti da questa lezione».',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Settings → Lesson tabs: untick the lesson tabs you don’t need (Grammar, My notes, Original…) and the lesson page leaves them out.',
          ru: 'Настройки → Вкладки урока: снимите галочки с ненужных вкладок (Грамматика, Мои заметки, Оригинал…), и страница урока их не покажет.',
          fr: 'Réglages → Onglets de la leçon : décochez les onglets dont vous n’avez pas besoin (Grammaire, Mes notes, Original…) et la page de la leçon ne les affiche plus.',
          de: 'Einstellungen → Tabs der Lektion: Entferne die Haken bei Tabs, die du nicht brauchst (Grammatik, Meine Notizen, Original…), und die Lektionsseite lässt sie weg.',
          es: 'Ajustes → Pestañas de la lección: desmarca las pestañas que no necesitas (Gramática, Mis notas, Original…) y la página de la lección ya no las muestra.',
          pt: 'Definições → Separadores da lição: desmarque os separadores de que não precisa (Gramática, As minhas notas, Original…) e a página da lição deixa de os mostrar.',
          it: 'Impostazioni → Schede della lezione: togli la spunta alle schede che non ti servono (Grammatica, I miei appunti, Originale…) e la pagina della lezione non le mostra più.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Revise before the lesson: in the 24 hours before a lesson, Home offers a round on the last lesson’s words and your hard words.',
          ru: 'Повторить перед уроком: за сутки до урока на Главной появляется раунд по словам прошлого урока и вашим сложным словам.',
          fr: 'Réviser avant le cours : dans les 24 heures avant un cours, l’Accueil propose un tour sur les mots de la dernière leçon et vos mots difficiles.',
          de: 'Vor der Stunde wiederholen: In den 24 Stunden vor einer Stunde bietet die Startseite eine Runde mit den Wörtern der letzten Lektion und deinen schweren Wörtern an.',
          es: 'Repasar antes de la clase: en las 24 horas antes de una clase, Inicio ofrece una ronda con las palabras de la última lección y tus palabras difíciles.',
          pt: 'Rever antes da aula: nas 24 horas antes de uma aula, o Início propõe uma ronda com as palavras da última lição e as suas palavras difíceis.',
          it: 'Ripassa prima della lezione: nelle 24 ore prima di una lezione, la Home propone un giro sulle parole dell’ultima lezione e sulle tue parole difficili.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Lesson summary on Home: on the day of a lesson and the day after, a card with its new words, verbs and grammar, and Start revising.',
          ru: 'Итог урока на Главной: в день урока и на следующий день — карточка с его новыми словами, глаголами и грамматикой и кнопкой «Начать повторение».',
          fr: 'Le résumé de la leçon sur l’Accueil : le jour du cours et le lendemain, une carte avec ses nouveaux mots, ses verbes et sa grammaire, et « Commencer la révision ».',
          de: 'Zusammenfassung der Lektion auf der Startseite: am Tag der Stunde und am Tag danach eine Karte mit neuen Wörtern, Verben und Grammatik und „Wiederholung starten“.',
          es: 'Resumen de la lección en Inicio: el día de la clase y el siguiente, una tarjeta con sus palabras nuevas, verbos y gramática, y «Empezar el repaso».',
          pt: 'Resumo da lição no Início: no dia da aula e no seguinte, um cartão com as palavras novas, os verbos e a gramática, e «Começar a revisão».',
          it: 'Riassunto della lezione nella Home: il giorno della lezione e quello dopo, una scheda con parole nuove, verbi e grammatica, e «Inizia il ripasso».',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Quiz game in lesson mode: 10 questions on the lesson’s words against the clock, more points for a fast answer, and a records table to beat.',
          ru: 'Игра-квиз в режиме урока: 10 вопросов по словам урока на время, за быстрый ответ больше очков, и таблица рекордов, которые можно побить.',
          fr: 'Quiz chrono dans le mode cours : 10 questions sur les mots de la leçon contre la montre, plus de points pour une réponse rapide, et un tableau des records à battre.',
          de: 'Quizspiel im Unterrichtsmodus: 10 Fragen zu den Wörtern der Lektion gegen die Uhr, mehr Punkte für schnelle Antworten und eine Rekordtabelle zum Schlagen.',
          es: 'Juego de preguntas en el modo clase: 10 preguntas contra el reloj sobre las palabras de la lección, más puntos por responder rápido y una tabla de récords que superar.',
          pt: 'Jogo de perguntas no modo aula: 10 perguntas contra o relógio sobre as palavras da lição, mais pontos por responder depressa e uma tabela de recordes para bater.',
          it: 'Gioco a quiz nella modalità lezione: 10 domande contro il tempo sulle parole della lezione, più punti per una risposta veloce e una tabella di record da battere.',
        },
      },
      {
        kind: 'new',
        audience: 'teacher',
        text: {
          en: 'For teachers: “Make homework with Claude” in a lesson’s Homework tab writes a Devoirs: block from the lesson’s words and grammar, key words first. After a check it goes under the lesson, and the student gets it on Home as a checklist.',
          ru: 'Для преподавателя: «Составить с Claude» во вкладке «Домашнее задание» пишет блок Devoirs: по словам и грамматике урока, сначала ключевые слова. После проверки он попадает под урок, а ученик видит его на Главной чек-листом.',
          fr: 'Pour les professeurs : « Préparer les devoirs avec Claude » dans l’onglet Devoirs d’une leçon rédige un bloc Devoirs: à partir des mots et de la grammaire, mots clés d’abord. Après vérification, il va sous la leçon et l’élève le retrouve sur l’Accueil en liste à cocher.',
          de: 'Für Lehrkräfte: „Mit Claude erstellen“ im Tab Hausaufgaben einer Lektion schreibt einen Block Devoirs: aus den Wörtern und der Grammatik, Schlüsselwörter zuerst. Nach dem Prüfen kommt er unter die Lektion, und die Startseite zeigt ihn als Checkliste.',
          es: 'Para profesores: «Preparar los deberes con Claude» en la pestaña Deberes de una lección redacta un bloque Devoirs: con sus palabras y su gramática, primero las palabras clave. Tras revisarlo va debajo de la lección, y el alumno lo ve en Inicio como lista.',
          pt: 'Para professores: «Fazer com o Claude» no separador Trabalhos de casa de uma lição escreve um bloco Devoirs: com as palavras e a gramática, primeiro as palavras-chave. Depois de verificado vai para baixo da lição, e o aluno vê-o no Início como lista.',
          it: 'Per gli insegnanti: «Crea con Claude» nella scheda Compiti di una lezione scrive un blocco Devoirs: con le parole e la grammatica, prima le parole chiave. Dopo il controllo va sotto la lezione, e lo studente lo vede nella Home come lista.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Send to the teacher: under the homework and in Stats, a short report (homework done, mistakes since the lesson, your corrected written answers) goes into the document under the lesson after you’ve read it.',
          ru: 'Отправить преподавателю: под домашним заданием и в Статистике короткий отчёт (что сделано, ошибки с урока, исправленные письменные ответы) после вашей проверки попадает в документ под урок.',
          fr: 'Envoyer au professeur : sous les devoirs et dans les Statistiques, un court rapport (devoirs faits, erreurs depuis le cours, vos réponses écrites corrigées) va dans le document sous la leçon, après relecture.',
          de: 'An die Lehrkraft senden: Unter den Hausaufgaben und in der Statistik kommt ein kurzer Bericht (erledigte Aufgaben, Fehler seit der Stunde, deine korrigierten schriftlichen Antworten) nach dem Durchlesen ins Dokument unter die Lektion.',
          es: 'Enviar al profesor: debajo de los deberes y en Estadísticas, un breve informe (deberes hechos, errores desde la clase, tus respuestas escritas corregidas) va al documento debajo de la lección, después de que lo leas.',
          pt: 'Enviar ao professor: por baixo do trabalho de casa e nas Estatísticas, um pequeno relatório (trabalho feito, erros desde a aula, as suas respostas escritas corrigidas) vai para o documento por baixo da lição, depois de o ler.',
          it: 'Invia all’insegnante: sotto i compiti e nelle Statistiche, un breve resoconto (compiti fatti, errori dalla lezione, le tue risposte scritte corrette) va nel documento sotto la lezione, dopo che l’hai letto.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Written homework checked by Claude: write your answer to a task like “5 phrases au passé composé”, and Claude fixes the mistakes and explains each one, like a tutor. The teacher sees the corrected answers in lesson mode.',
          ru: 'Письменное домашнее задание с проверкой Claude: напишите ответ на задание вроде «5 phrases au passé composé», и Claude исправит ошибки и объяснит каждую, как репетитор. Преподаватель видит исправленные ответы в режиме урока.',
          fr: 'Devoirs écrits vérifiés par Claude : écrivez votre réponse à une tâche comme « 5 phrases au passé composé », et Claude corrige les erreurs et explique chacune, comme un professeur particulier. Le professeur voit les réponses corrigées dans le mode cours.',
          de: 'Schriftliche Hausaufgaben, von Claude geprüft: Schreib deine Antwort auf eine Aufgabe wie „5 phrases au passé composé“, und Claude korrigiert die Fehler und erklärt jeden, wie ein Nachhilfelehrer. Die Lehrkraft sieht die korrigierten Antworten im Unterrichtsmodus.',
          es: 'Deberes escritos corregidos por Claude: escribe tu respuesta a una tarea como «5 phrases au passé composé», y Claude corrige los errores y explica cada uno, como un profesor particular. El profesor ve las respuestas corregidas en el modo clase.',
          pt: 'Trabalho de casa escrito verificado pelo Claude: escreva a resposta a uma tarefa como «5 phrases au passé composé», e o Claude corrige os erros e explica cada um, como um explicador. O professor vê as respostas corrigidas no modo aula.',
          it: 'Compiti scritti controllati da Claude: scrivi la risposta a un compito come «5 phrases au passé composé», e Claude corregge gli errori e spiega ognuno, come un insegnante privato. L’insegnante vede le risposte corrette nella modalità lezione.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Homework on Home: what the teacher writes after “Devoirs:” in the lesson becomes a checklist with the days left until the next lesson. Each task opens its exercise, and finishing it ticks the task.',
          ru: 'Домашнее задание на Главной: то, что преподаватель пишет в уроке после «Devoirs:», становится чек-листом, где видно, сколько дней до урока. Каждое задание открывает своё упражнение, а когда оно закончено, галочка ставится сама.',
          fr: 'Les devoirs sur l’Accueil : ce que le professeur écrit après « Devoirs: » dans la leçon devient une liste à cocher, avec les jours restants avant le cours. Chaque tâche ouvre son exercice, et le finir la coche.',
          de: 'Hausaufgaben auf der Startseite: Was die Lehrkraft in der Lektion nach „Devoirs:“ schreibt, wird zur Checkliste mit den Tagen bis zur nächsten Stunde. Jede Aufgabe öffnet ihre Übung, und ist sie fertig, wird sie abgehakt.',
          es: 'Deberes en Inicio: lo que el profesor escribe tras «Devoirs:» en la lección se convierte en una lista para marcar, con los días que faltan para la clase. Cada tarea abre su ejercicio, y al terminarlo se marca.',
          pt: 'Trabalho de casa no Início: o que o professor escreve depois de «Devoirs:» na lição passa a ser uma lista para marcar, com os dias que faltam para a aula. Cada tarefa abre o seu exercício, e ao terminá-lo fica marcada.',
          it: 'Compiti nella Home: quello che l’insegnante scrive dopo «Devoirs:» nella lezione diventa una lista da spuntare, con i giorni che mancano alla lezione. Ogni compito apre il suo esercizio, e finirlo lo spunta.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Key words: the teacher marks a word with ★ in the document (★ la boulangerie — пекарня), and it gets a “key” badge and comes up more often in exercises and the warm-up.',
          ru: 'Ключевые слова: преподаватель отмечает слово звёздочкой в документе (★ la boulangerie — пекарня), у него появляется метка «ключевое», и оно чаще встречается в упражнениях и разминке.',
          fr: 'Mots clés : le professeur marque un mot d’une ★ dans le document (★ la boulangerie — пекарня) ; il reçoit l’étiquette « clé » et revient plus souvent dans les exercices et l’échauffement.',
          de: 'Schlüsselwörter: Die Lehrkraft markiert ein Wort im Dokument mit ★ (★ la boulangerie — пекарня); es bekommt das Etikett „Schlüsselwort“ und kommt in Übungen und beim Aufwärmen öfter dran.',
          es: 'Palabras clave: el profesor marca una palabra con ★ en el documento (★ la boulangerie — пекарня); lleva la etiqueta «clave» y sale más a menudo en los ejercicios y el calentamiento.',
          pt: 'Palavras-chave: o professor marca uma palavra com ★ no documento (★ la boulangerie — пекарня); fica com a etiqueta «chave» e aparece mais vezes nos exercícios e no aquecimento.',
          it: 'Parole chiave: l’insegnante segna una parola con ★ nel documento (★ la boulangerie — пекарня); riceve l’etichetta «chiave» e compare più spesso negli esercizi e nel riscaldamento.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Warm-up in lesson mode: about 5 minutes of questions on the previous lesson and on your mistakes since, with a list of what didn’t stick at the end, for the teacher to see on the shared screen.',
          ru: 'Разминка в режиме урока: минут 5 вопросов по прошлому уроку и вашим ошибкам с тех пор, а в конце — список того, что не закрепилось, чтобы преподаватель увидел его на общем экране.',
          fr: 'Échauffement dans le mode cours : environ 5 minutes de questions sur la leçon précédente et sur vos erreurs depuis, avec à la fin la liste de ce qui n’est pas acquis, que le professeur voit sur l’écran partagé.',
          de: 'Aufwärmen im Unterrichtsmodus: etwa 5 Minuten Fragen zur letzten Lektion und zu deinen Fehlern seitdem, am Ende eine Liste dessen, was noch nicht sitzt, damit die Lehrkraft sie auf dem geteilten Bildschirm sieht.',
          es: 'Calentamiento en el modo clase: unos 5 minutos de preguntas sobre la lección anterior y sobre tus errores desde entonces, con una lista al final de lo que no se ha fijado, para que el profesor la vea en la pantalla compartida.',
          pt: 'Aquecimento no modo aula: cerca de 5 minutos de perguntas sobre a lição anterior e sobre os seus erros desde então, com uma lista no fim do que não ficou, para o professor ver no ecrã partilhado.',
          it: 'Riscaldamento nella modalità lezione: circa 5 minuti di domande sulla lezione precedente e sui tuoi errori da allora, con alla fine l’elenco di ciò che non è rimasto, che l’insegnante vede sullo schermo condiviso.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Live sync: while the top bar says “Lesson now”, the app reads the document every minute by itself, so the words the teacher writes appear with their exercises without pressing ↻.',
          ru: 'Живая синхронизация: пока в шапке горит «Урок идёт», приложение само читает документ каждую минуту, и слова, которые пишет преподаватель, появляются вместе с упражнениями без нажатия ↻.',
          fr: 'Synchro en direct : tant que la barre du haut affiche « Cours en cours », l’app relit le document chaque minute, et les mots que le professeur écrit apparaissent avec leurs exercices sans appuyer sur ↻.',
          de: 'Live-Synchronisierung: Solange oben „Stunde läuft“ steht, liest die App das Dokument jede Minute selbst, und die Wörter, die die Lehrkraft schreibt, erscheinen samt Übungen, ohne ↻ zu drücken.',
          es: 'Sincronización en directo: mientras la barra superior dice «Clase en curso», la app lee el documento cada minuto, y las palabras que escribe el profesor aparecen con sus ejercicios sin pulsar ↻.',
          pt: 'Sincronização em direto: enquanto a barra de cima diz «Aula a decorrer», a app lê o documento a cada minuto, e as palavras que o professor escreve aparecem com os exercícios sem carregar em ↻.',
          it: 'Sincronizzazione dal vivo: finché la barra in alto dice «Lezione in corso», l’app rilegge il documento ogni minuto, e le parole che l’insegnante scrive compaiono con i loro esercizi senza premere ↻.',
        },
      },
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
        languages: ['es', 'pt', 'it'],
        text: {
          en: 'Spanish, Portuguese and Italian: as languages to learn, and as interface languages. Lessons can start with Lección, Clase, Lição, Aula or Lezione, and “próxima clase”, “próxima aula” or “prossima lezione” sets the next lesson.',
          ru: 'Испанский, португальский и итальянский: их можно учить, и на них можно переключить интерфейс. Уроки в документе могут начинаться с Lección, Clase, Lição, Aula или Lezione, а следующий урок задаётся строкой «próxima clase», «próxima aula» или «prossima lezione».',
          fr: 'L’espagnol, le portugais et l’italien : comme langues à apprendre et comme langues de l’interface. Les leçons peuvent commencer par Lección, Clase, Lição, Aula ou Lezione, et « próxima clase », « próxima aula » ou « prossima lezione » fixe le prochain cours.',
          de: 'Spanisch, Portugiesisch und Italienisch: als Lernsprachen und als Sprachen der Oberfläche. Lektionen können mit Lección, Clase, Lição, Aula oder Lezione beginnen, und „próxima clase“, „próxima aula“ oder „prossima lezione“ legt die nächste Stunde fest.',
          es: 'Español, portugués e italiano: como idiomas para aprender y como idiomas de la interfaz. Las lecciones pueden empezar con Lección, Clase, Lição, Aula o Lezione, y «próxima clase», «próxima aula» o «prossima lezione» fija la próxima clase.',
          pt: 'Espanhol, português e italiano: como línguas para aprender e como idiomas da interface. As lições podem começar com Lección, Clase, Lição, Aula ou Lezione, e «próxima clase», «próxima aula» ou «prossima lezione» marca a próxima aula.',
          it: 'Spagnolo, portoghese e italiano: come lingue da studiare e come lingue dell’interfaccia. Le lezioni possono iniziare con Lección, Clase, Lição, Aula o Lezione, e «próxima clase», «próxima aula» o «prossima lezione» fissa la prossima lezione.',
        },
      },
      {
        kind: 'new',
        languages: ['es', 'pt', 'it'],
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
        languages: ['de'],
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

// Whether there is news this device hasn't opened the News page for yet.
export const hasUnseenNews = () => (load<string>(SEEN_KEY) ?? '') < LATEST;
// Marks every News entry as seen on this device: the dot in the menu goes away.
export const markNewsSeen = () => save(SEEN_KEY, LATEST);
