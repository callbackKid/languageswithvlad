import { LATEST_NEWS_DATE } from '@/entities/news';
import { type Language } from '@/shared/config';
import { type UiLanguage } from '@/shared/i18n';

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
export const newsFor = (
  days: NewsDay[],
  { tab, language, audience }: { tab: NewsTab; language: Language | 'all'; audience: NewsAudience }
): NewsDay[] => {
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
};
export interface NewsDay {
  // YYYY-MM-DD
  date: string;
  items: NewsItem[];
}

export const NEWS: NewsDay[] = [
  {
    date: LATEST_NEWS_DATE,
    items: [
      {
        kind: 'better',
        text: {
          en: 'Large drawings stay responsive while you edit them. Their preview is generated when you open My notes.',
          ru: 'Большие рисунки можно редактировать без задержек. Предпросмотр создаётся, когда вы открываете вкладку «Мои заметки».',
          fr: 'Les grands dessins restent fluides pendant la modification. Leur aperçu est généré quand vous ouvrez « Mes notes ».',
          de: 'Auch bei großen Zeichnungen reagiert die Tafel beim Bearbeiten flüssig. Die Vorschau wird erstellt, wenn du „Meine Notizen“ öffnest.',
          es: 'Puedes editar dibujos grandes con fluidez. La vista previa se genera al abrir «Mis notas».',
          pt: 'Pode editar desenhos grandes sem atrasos. A pré-visualização é gerada ao abrir «As minhas notas».',
          it: 'Puoi modificare i disegni grandi senza rallentamenti. L’anteprima viene generata quando apri «I miei appunti».',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Switching lesson tabs after clicking Read the lesson again no longer starts another reading.',
          ru: 'Если после нажатия «Прочитать урок заново» вы перейдёте на другую вкладку урока, повторный анализ не запустится.',
          fr: 'Changer d’onglet après avoir cliqué sur « Relire la leçon » ne relance plus l’analyse de la leçon.',
          de: 'Wenn du nach einem Klick auf „Lektion neu lesen“ den Tab wechselst, wird die Lektion nicht noch einmal gelesen.',
          es: 'Cambiar de pestaña tras pulsar «Volver a leer la lección» ya no vuelve a iniciar el análisis de la lección.',
          pt: 'Mudar de separador depois de clicar em «Voltar a ler a lição» já não inicia uma nova análise da lição.',
          it: 'Passare a un’altra scheda dopo aver premuto «Rileggi la lezione» non avvia più un’altra analisi della lezione.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Several small pictures pasted into the shared board together can now reach the other person.',
          ru: 'Если вы вставите на общую доску сразу несколько небольших изображений, собеседник сможет их увидеть.',
          fr: 'Si vous collez plusieurs petites images à la fois sur le tableau partagé, l’autre personne peut désormais les voir.',
          de: 'Wenn du mehrere kleine Bilder auf einmal auf der gemeinsamen Tafel einfügst, kann die andere Person sie jetzt sehen.',
          es: 'Si pegas varias imágenes pequeñas a la vez en la pizarra compartida, ahora la otra persona puede verlas.',
          pt: 'Se colar várias imagens pequenas de uma vez no quadro partilhado, a outra pessoa já as pode ver.',
          it: 'Se incolli più immagini piccole insieme sulla lavagna condivisa, ora anche l’altra persona può vederle.',
        },
      },
    ],
  },
  {
    date: '2026-11-27',
    items: [
      {
        kind: 'fixed',
        text: {
          en: 'Corrections in dictation, conjugation practice, and other exercises are easier to read in both themes.',
          ru: 'Исправления в диктантах, упражнениях на спряжение и других заданиях теперь легче читать и в светлой, и в тёмной теме.',
          fr: 'Les corrections des dictées, des exercices de conjugaison et des autres exercices sont plus lisibles avec les deux thèmes.',
          de: 'Die Korrekturen bei Diktaten, Konjugationsübungen und anderen Übungen sind in beiden Designs leichter zu lesen.',
          es: 'Las correcciones de los dictados, los ejercicios de conjugación y otros ejercicios se leen mejor en ambos temas.',
          pt: 'As correções nos ditados, nos exercícios de conjugação e nos restantes exercícios são mais fáceis de ler em ambos os temas.',
          it: 'Le correzioni nei dettati, negli esercizi di coniugazione e negli altri esercizi sono più leggibili in entrambi i temi.',
        },
      },
    ],
  },
  {
    date: '2026-11-26',
    items: [
      {
        kind: 'fixed',
        text: {
          en: 'When you practise in two tabs in the same browser, each tab keeps the answers saved by the other.',
          ru: 'Если вы занимаетесь в двух вкладках одного браузера, ответы из обеих вкладок сохраняются.',
          fr: 'Si vous vous entraînez dans deux onglets du même navigateur, les réponses données dans les deux onglets sont conservées.',
          de: 'Wenn du in zwei Tabs desselben Browsers übst, bleiben deine Antworten aus beiden Tabs erhalten.',
          es: 'Si practicas en dos pestañas del mismo navegador, se conservan las respuestas de ambas.',
          pt: 'Se praticar em dois separadores do mesmo navegador, as respostas de ambos ficam guardadas.',
          it: 'Se ti eserciti in due schede dello stesso browser, le risposte di entrambe vengono salvate.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'You can now move between tabs with the arrow keys and open the focused tab with Enter or Space.',
          ru: 'Теперь можно перемещать фокус между вкладками клавишами со стрелками и открывать вкладку клавишей Enter или пробелом.',
          fr: 'Vous pouvez maintenant parcourir les onglets avec les touches fléchées, puis appuyer sur Entrée ou sur la barre d’espace pour ouvrir l’onglet.',
          de: 'Du kannst jetzt mit den Pfeiltasten von Tab zu Tab gehen und den jeweiligen Tab mit der Eingabe- oder Leertaste öffnen.',
          es: 'Ahora puedes recorrer las pestañas con las flechas del teclado y abrir la que tiene el foco con Intro o la barra espaciadora.',
          pt: 'Agora pode percorrer os separadores com as teclas de seta e abrir o separador em foco com Enter ou com a barra de espaços.',
          it: 'Ora puoi spostarti tra le schede con i tasti freccia e aprire quella su cui ti trovi con Invio o con la barra spaziatrice.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'An older sync can no longer replace a newer copy of the lesson document. Verbs that share a spelling across languages now open the right conjugation table.',
          ru: 'Результат более ранней синхронизации больше не перезапишет свежую версию документа с уроками. Для глаголов, которые пишутся одинаково в разных языках, теперь открывается таблица спряжения нужного языка.',
          fr: 'Une synchronisation lancée plus tôt ne peut plus remplacer une version plus récente du document de cours. Si un verbe s’écrit de la même façon dans plusieurs langues, c’est maintenant le tableau de conjugaison de la bonne langue qui s’ouvre.',
          de: 'Eine früher gestartete Synchronisierung kann eine neuere Version des Lektionsdokuments nicht mehr überschreiben. Bei Verben, die in mehreren Sprachen gleich geschrieben werden, öffnet sich jetzt die Verbtabelle für die richtige Sprache.',
          es: 'Una sincronización anterior ya no puede sobrescribir una versión más reciente del documento de clase. Si un verbo se escribe igual en varios idiomas, ahora se abre la tabla de conjugación del idioma correcto.',
          pt: 'Uma sincronização anterior já não pode substituir uma versão mais recente do documento da lição. Quando um verbo se escreve da mesma forma em várias línguas, abre-se agora a tabela de conjugação da língua certa.',
          it: 'Una sincronizzazione precedente non può più sovrascrivere una versione più recente del documento delle lezioni. Quando un verbo si scrive allo stesso modo in più lingue, ora si apre la tabella di coniugazione della lingua giusta.',
        },
      },
    ],
  },
  {
    date: '2026-11-25',
    items: [
      {
        kind: 'fixed',
        text: {
          en: 'Homework written under a heading without a colon (“Les devoirs”, then a numbered list) is now found: it shows on Home, and its lesson gets the red badge in Lesson history.',
          ru: 'Теперь находится и домашнее задание, записанное под заголовком без двоеточия («Les devoirs», а затем нумерованный список): оно видно на Главной, и в «Истории уроков» у урока появляется красный значок.',
          fr: 'Les devoirs écrits sous un titre sans deux-points (« Les devoirs », puis une liste numérotée) sont maintenant reconnus : ils s’affichent sur l’Accueil et ont leur pastille rouge dans l’« Historique des leçons ».',
          de: 'Hausaufgaben unter einer Überschrift ohne Doppelpunkt („Les devoirs“, dann eine nummerierte Liste) werden jetzt gefunden: Sie erscheinen auf der Startseite und bekommen ihr rotes Badge im „Lektionsverlauf“.',
          es: 'Ahora se encuentran los deberes escritos bajo un título sin dos puntos («Les devoirs» y luego una lista numerada): aparecen en Inicio y tienen su insignia roja en el «Historial de lecciones».',
          pt: 'Os trabalhos de casa escritos sob um título sem dois pontos («Les devoirs», seguido de uma lista numerada) são agora encontrados: aparecem no Início e têm o seu indicador vermelho no «Histórico de lições».',
          it: 'I compiti scritti sotto un titolo senza due punti («Les devoirs», poi un elenco numerato) ora vengono riconosciuti: compaiono nella Home e hanno il loro badge rosso nella «Cronologia lezioni».',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'A red badge in Lesson history marks a downloaded lesson whose homework isn’t finished yet, with the number of tasks left in it. Ticking a task on Home or in the lesson’s Homework tab now ticks it in both places.',
          ru: 'Красный значок в «Истории уроков» отмечает загруженный урок, домашнее задание которого ещё не сделано, и показывает, сколько заданий осталось. Задание, отмеченное на Главной или на вкладке «Домашнее задание» урока, теперь отмечено в обоих местах.',
          fr: 'Une pastille rouge dans l’« Historique des leçons » signale une leçon téléchargée dont les devoirs ne sont pas encore finis, avec le nombre de tâches restantes. Cocher une tâche sur l’Accueil ou dans l’onglet « Devoirs » de la leçon la coche maintenant aux deux endroits.',
          de: 'Ein rotes Badge im „Lektionsverlauf“ markiert eine geladene Lektion, deren Hausaufgaben noch nicht fertig sind, und zeigt, wie viele Aufgaben noch offen sind. Hakst du eine Aufgabe auf der Startseite oder im Tab „Hausaufgaben“ der Lektion ab, ist sie jetzt an beiden Stellen abgehakt.',
          es: 'Una insignia roja en el «Historial de lecciones» marca una lección descargada cuyos deberes aún no están terminados, con el número de tareas que quedan. Marcar una tarea en Inicio o en la pestaña «Deberes» de la lección ahora la marca en los dos sitios.',
          pt: 'Um indicador vermelho no «Histórico de lições» assinala uma lição descarregada cujos trabalhos de casa ainda não estão terminados, com o número de tarefas que faltam. Marcar uma tarefa no Início ou no separador «Trabalhos de casa» da lição marca-a agora nos dois sítios.',
          it: 'Un badge rosso nella «Cronologia lezioni» segna una lezione scaricata i cui compiti non sono ancora finiti, con il numero di compiti che mancano. Spuntare un compito nella Home o nella scheda «Compiti» della lezione ora lo spunta in entrambi i posti.',
        },
      },
    ],
  },
  {
    date: '2026-11-23',
    items: [
      {
        kind: 'better',
        text: {
          en: 'Settings are easier to find your way in: Learning shows only the languages you learn, each with its level and the tenses quizzes ask, and + Add a language asks for both before adding one. The daily goal and speech speed are under your profile, and the document is at the bottom.',
          ru: '«Настройки» стали понятнее: в «Обучении» теперь только языки, которые вы учите, у каждого — уровень и времена в тестах, а «+ Добавить язык» спрашивает и то и другое, прежде чем добавить язык. Цель на день и скорость озвучки теперь в «Профиле», а документ — в самом низу.',
          fr: 'On s’y retrouve mieux dans les « Réglages » : « Apprentissage » ne montre que les langues que vous apprenez, chacune avec son niveau et les temps demandés dans les quiz, et « + Ajouter une langue » demande les deux avant d’en ajouter une. L’objectif du jour et la vitesse de lecture sont dans le « Profil », et le document est tout en bas.',
          de: 'In den „Einstellungen“ findest du dich leichter zurecht: „Lernen“ zeigt nur die Sprachen, die du lernst, jede mit ihrem Niveau und den Zeitformen im Quiz, und „+ Sprache hinzufügen“ fragt nach beidem, bevor eine dazukommt. Tagesziel und Sprechtempo stehen jetzt unter „Profil“, das Dokument ganz unten.',
          es: 'Es más fácil orientarse en «Ajustes»: «Aprendizaje» muestra solo los idiomas que aprendes, cada uno con su nivel y los tiempos que preguntan los tests, y «+ Añadir un idioma» pide ambas cosas antes de añadir uno. El objetivo diario y la velocidad de voz están ahora en «Perfil», y el documento, al final.',
          pt: 'É mais fácil orientar-se nas «Definições»: «Aprendizagem» mostra só as línguas que aprende, cada uma com o seu nível e os tempos que os testes pedem, e «+ Adicionar uma língua» pede as duas coisas antes de acrescentar uma. O objetivo diário e a velocidade da voz estão agora no «Perfil», e o documento fica no fim.',
          it: 'Orientarsi nelle «Impostazioni» è più facile: «Apprendimento» mostra solo le lingue che studi, ognuna con il suo livello e i tempi chiesti nei quiz, e «+ Aggiungi una lingua» chiede entrambe le cose prima di aggiungerne una. L’obiettivo giornaliero e la velocità della voce ora sono nel «Profilo», e il documento è in fondo.',
        },
      },
      {
        kind: 'better',
        text: {
          en: '✕ on a word or a verb in a lesson now asks before taking it out, so a slip of the finger doesn’t remove it.',
          ru: '✕ у слова или глагола в уроке теперь переспрашивает, прежде чем убрать его, — случайное нажатие ничего не удалит.',
          fr: '✕ sur un mot ou un verbe d’une leçon demande maintenant confirmation avant de le retirer : un faux mouvement ne l’enlève plus.',
          de: '✕ bei einem Wort oder Verb einer Lektion fragt jetzt nach, bevor es entfernt wird, damit nichts aus Versehen verschwindet.',
          es: '✕ en una palabra o un verbo de una lección ahora pregunta antes de quitarlo, así que un toque sin querer no lo borra.',
          pt: '✕ numa palavra ou num verbo de uma lição pergunta agora antes de o retirar, para que um toque por engano não o apague.',
          it: '✕ su una parola o un verbo di una lezione ora chiede conferma prima di toglierlo, così un tocco per sbaglio non lo rimuove.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'When 🔊 stays silent, a note now says why and what to do: the browser has no voices, has no voice for the language, or couldn’t read the word.',
          ru: 'Когда 🔊 молчит, теперь появляется подсказка, почему так и что делать: в браузере нет голосов, нет голоса для этого языка или браузер не смог прочитать слово.',
          fr: 'Quand 🔊 reste muet, un message explique maintenant pourquoi et quoi faire : le navigateur n’a aucune voix, n’a pas de voix pour la langue, ou n’a pas pu lire le mot.',
          de: 'Wenn 🔊 stumm bleibt, sagt dir jetzt ein Hinweis, warum und was zu tun ist: Der Browser hat keine Stimmen, keine Stimme für die Sprache, oder er konnte das Wort nicht vorlesen.',
          es: 'Cuando 🔊 no suena, ahora un aviso explica por qué y qué hacer: el navegador no tiene voces, no tiene voz para el idioma o no ha podido leer la palabra.',
          pt: 'Quando 🔊 fica em silêncio, um aviso explica agora porquê e o que fazer: o navegador não tem vozes, não tem voz para a língua ou não conseguiu ler a palavra.',
          it: 'Quando 🔊 resta muto, ora un avviso spiega perché e cosa fare: il browser non ha voci, non ha una voce per la lingua o non è riuscito a leggere la parola.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Lesson mode is now called the lesson space, and it is tidier: the way into the call sits beside the title, and the cards under it are in two tabs, Lesson and Warm-up and games (the warm-up, the quiz game and A question for discussion). Switching tabs never closes the call.',
          ru: 'Режим урока теперь называется «Пространство урока», и он стал аккуратнее: вход в звонок теперь рядом с заголовком, а карточки под звонком разложены по двум вкладкам — «Урок» и «Разминка и игры» (разминка, игра-квиз и «Вопрос для обсуждения»). Переключение вкладок никогда не прерывает звонок.',
          fr: 'Le mode cours s’appelle désormais « Espace cours », et il est mieux rangé : l’accès à l’appel se trouve à côté du titre, et les cartes en dessous sont réparties en deux onglets, « Cours » et « Échauffement et jeux » (l’échauffement, le Quiz chrono et « Une question à discuter »). Changer d’onglet ne coupe jamais l’appel.',
          de: 'Der Unterrichtsmodus heißt jetzt Unterrichtsraum und ist aufgeräumter: Der Weg in den Anruf liegt neben dem Titel, und die Karten darunter sind auf zwei Tabs verteilt, „Unterricht“ und „Aufwärmen und Spiele“ (das Aufwärmen, das Quizspiel und „Eine Frage zum Diskutieren“). Beim Tabwechsel läuft der Anruf immer weiter.',
          es: 'El modo clase ahora se llama «Espacio de clase» y está más ordenado: el acceso a la llamada está junto al título, y las tarjetas de debajo están en dos pestañas, «Clase» y «Calentamiento y juegos» (el calentamiento, el juego de preguntas y «Una pregunta para debatir»). Cambiar de pestaña nunca corta la llamada.',
          pt: 'O modo aula passou a chamar-se «Espaço de aula» e está mais arrumado: o acesso à chamada fica ao lado do título, e os cartões por baixo estão em dois separadores, «Aula» e «Aquecimento e jogos» (o aquecimento, o jogo de perguntas e «Uma pergunta para debate»). Mudar de separador nunca interrompe a chamada.',
          it: 'La modalità lezione ora si chiama «Spazio lezione» ed è più ordinata: l’accesso alla chiamata è accanto al titolo, e i riquadri sotto sono divisi in due schede, «Lezione» e «Riscaldamento e giochi» (il riscaldamento, il gioco a quiz e «Una domanda di discussione»). Cambiare scheda non chiude mai la chiamata.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'A homework line such as “5 предложений в passé composé” is now a written task with its exercise, like “5 phrases au passé composé”.',
          ru: 'Строка домашнего задания вроде «5 предложений в passé composé» теперь становится письменным заданием со своим упражнением, как и «5 phrases au passé composé».',
          fr: 'Une ligne de devoirs comme « 5 предложений в passé composé » devient maintenant une tâche écrite avec son exercice, comme « 5 phrases au passé composé ».',
          de: 'Eine Hausaufgabenzeile wie „5 предложений в passé composé“ wird jetzt eine schriftliche Aufgabe mit ihrer Übung, wie schon „5 phrases au passé composé“.',
          es: 'Una línea de los deberes como «5 предложений в passé composé» ahora es una tarea escrita con su ejercicio, igual que «5 phrases au passé composé».',
          pt: 'Uma linha dos trabalhos de casa como «5 предложений в passé composé» passa a ser uma tarefa escrita com o seu exercício, tal como «5 phrases au passé composé».',
          it: 'Una riga dei compiti come «5 предложений в passé composé» ora diventa un compito scritto con il suo esercizio, come «5 phrases au passé composé».',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Stats shows the weak tenses in every language you learn that has verb tables, not only French.',
          ru: 'В «Статистике» теперь видны слабые времена во всех изучаемых языках с таблицами глаголов, а не только во французском.',
          fr: 'Les « Statistiques » montrent les temps qui vous posent problème dans chaque langue apprise avec des tableaux de conjugaison, pas seulement en français.',
          de: 'Die „Statistik“ zeigt deine schwachen Zeitformen in jeder Sprache, die du mit Verbtabellen lernst, nicht nur im Französischen.',
          es: 'En «Estadísticas» aparecen tus tiempos verbales flojos en todos los idiomas que aprendes con tablas de verbos, no solo en francés.',
          pt: 'Em «Estatísticas» aparecem os seus tempos verbais fracos em todas as línguas que aprende com tabelas de verbos, não só em francês.',
          it: 'In «Statistiche» compaiono i tuoi tempi verbali deboli in ogni lingua che studi con le tabelle dei verbi, non solo in francese.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Flashcards name the language of your translations on the direction switch (FR → EN), not always RU.',
          ru: 'В «Карточках» на переключателе направления теперь указан язык ваших переводов (FR → EN), а не всегда RU.',
          fr: 'Dans les « Cartes », le sélecteur de sens indique la langue de vos traductions (FR → EN), et plus toujours RU.',
          de: 'Bei den „Karteikarten“ zeigt der Richtungsschalter jetzt die Sprache deiner Übersetzungen (FR → EN) statt immer RU.',
          es: 'En «Tarjetas», el selector de dirección indica el idioma de tus traducciones (FR → EN), y no siempre RU.',
          pt: 'Nos «Cartões», o seletor de sentido indica a língua das suas traduções (FR → EN), e não sempre RU.',
          it: 'Nelle «Flashcard» il selettore di direzione indica la lingua delle tue traduzioni (FR → EN), non sempre RU.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'A next-lesson date past the end of its month, such as 31.02, now means the month’s last day instead of a date in the next month.',
          ru: 'Дата следующего урока, которой нет в месяце, например 31.02, теперь означает последний день месяца, а не число следующего месяца.',
          fr: 'Une date de prochain cours au-delà de la fin du mois, comme 31.02, correspond maintenant au dernier jour du mois, et non à une date du mois suivant.',
          de: 'Ein Datum der nächsten Stunde, das es im Monat nicht gibt, etwa 31.02, gilt jetzt als letzter Tag des Monats statt als Tag im Folgemonat.',
          es: 'Una fecha de la próxima clase que no existe en su mes, como 31.02, ahora indica el último día del mes y no una fecha del mes siguiente.',
          pt: 'Uma data da próxima aula que não existe no mês, como 31.02, passa a indicar o último dia do mês, e não uma data do mês seguinte.',
          it: 'Una data della prossima lezione oltre la fine del mese, come 31.02, ora indica l’ultimo giorno del mese invece di un giorno del mese successivo.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Grammar and Phonetics say why a lesson couldn’t be read (too long, no access), not only that it couldn’t.',
          ru: 'Вкладки «Грамматика» и «Фонетика» теперь объясняют, почему не удалось прочитать урок (слишком длинный, нет доступа), а не только сообщают, что не удалось.',
          fr: 'Les onglets « Grammaire » et « Phonétique » disent maintenant pourquoi une leçon n’a pas pu être lue (trop longue, pas d’accès), et pas seulement qu’elle n’a pas pu l’être.',
          de: 'Die Tabs „Grammatik“ und „Aussprache“ sagen jetzt, warum eine Lektion nicht gelesen werden konnte (zu lang, kein Zugriff), nicht nur, dass es nicht ging.',
          es: 'Las pestañas «Gramática» y «Fonética» dicen ahora por qué no se pudo leer una lección (demasiado larga, sin acceso), y no solo que no se pudo.',
          pt: 'Os separadores «Gramática» e «Fonética» dizem agora porque não foi possível ler uma lição (demasiado longa, sem acesso), e não apenas que não foi possível.',
          it: 'Le schede «Grammatica» e «Fonetica» ora dicono perché non è stato possibile leggere una lezione (troppo lunga, nessun accesso), non solo che non è stato possibile.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Home now says so when an address doesn’t exist in the app, instead of opening without a word.',
          ru: 'Если такого адреса в приложении нет, Главная теперь сообщает об этом, а не открывается молча.',
          fr: 'Si une adresse n’existe pas dans l’app, l’Accueil le signale maintenant au lieu de s’ouvrir sans rien dire.',
          de: 'Gibt es eine Adresse in der App nicht, sagt die Startseite das jetzt, statt sich kommentarlos zu öffnen.',
          es: 'Si una dirección no existe en la app, Inicio ahora lo avisa en lugar de abrirse sin decir nada.',
          pt: 'Quando um endereço não existe na app, o Início passa a avisar, em vez de abrir sem dizer nada.',
          it: 'Se un indirizzo non esiste nell’app, la Home ora lo segnala invece di aprirsi senza dire nulla.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'A lesson’s new Phonetics tab: the sounds and reading rules from the lesson notes, explained with transcribed examples to listen to, and Practise under each for a round of questions on it.',
          ru: 'Новая вкладка урока — «Фонетика»: звуки и правила чтения из записей урока, объяснённые на примерах с транскрипцией, которые можно прослушать. Под каждой темой есть кнопка «Потренироваться»: Claude составит раунд вопросов по этой теме.',
          fr: 'Nouvel onglet « Phonétique » dans chaque leçon : les sons et les règles de lecture des notes de cours, expliqués avec des exemples transcrits à écouter, et, sous chacun, « S’entraîner » pour un tour de questions sur ce point.',
          de: 'Neuer Tab „Aussprache“ in jeder Lektion: die Laute und Leseregeln aus den Unterrichtsnotizen, erklärt mit Beispielen in Lautschrift zum Anhören, und unter jedem Punkt „Üben“ für eine Runde Fragen dazu.',
          es: 'Nueva pestaña «Fonética» en cada lección: los sonidos y las reglas de lectura de las notas de clase, explicados con ejemplos transcritos para escuchar, y «Practicar» debajo de cada uno para hacer una ronda de preguntas sobre él.',
          pt: 'Novo separador «Fonética» em cada lição: os sons e as regras de leitura das notas da aula, explicados com exemplos transcritos para ouvir, e «Praticar» por baixo de cada um para fazer uma ronda de perguntas sobre ele.',
          it: 'Nuova scheda «Fonetica» in ogni lezione: i suoni e le regole di lettura degli appunti della lezione, spiegati con esempi trascritti da ascoltare, e «Esercitati» sotto ciascuno per fare un giro di domande su quel punto.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Listen, next to Dictation in every word list: the ticked words are read aloud one by one, each followed by its translation, with a pause of 1 to 5 seconds to say them back.',
          ru: '«Прослушивание» рядом с кнопкой «Диктант» в каждом списке слов: отмеченные слова читаются вслух по одному, после каждого — его перевод, а между ними пауза от 1 до 5 секунд, чтобы повторить вслух.',
          fr: '« Écoute », à côté de « Dictée » dans chaque liste de mots : les mots cochés sont lus à voix haute un par un, chacun suivi de sa traduction, avec une pause de 1 à 5 secondes pour les répéter.',
          de: '„Anhören“, neben „Diktat“ in jeder Wortliste: Die angehakten Wörter werden einzeln vorgelesen, jedes gefolgt von seiner Übersetzung, mit einer Pause von 1 bis 5 Sekunden zum Nachsprechen.',
          es: '«Escuchar», junto a «Dictado» en cada lista de palabras: las palabras marcadas se leen en voz alta una a una, cada una seguida de su traducción, con una pausa de 1 a 5 segundos para repetirlas.',
          pt: '«Ouvir», ao lado de «Ditado» em cada lista de palavras: as palavras marcadas são lidas em voz alta uma a uma, cada uma seguida da sua tradução, com uma pausa de 1 a 5 segundos para as repetir.',
          it: '«Ascolto», accanto a «Dettato» in ogni elenco di parole: le parole spuntate vengono lette ad alta voce una alla volta, ciascuna seguita dalla sua traduzione, con una pausa da 1 a 5 secondi per ripeterle.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'On a computer, the lesson list in Lesson history can now be a row above the lesson instead of a column beside it, and it folds away like the main menu when the lesson needs the room.',
          ru: 'На компьютере список уроков в «Истории уроков» теперь можно выстроить в ряд над уроком вместо колонки сбоку, а когда уроку нужно больше места, он сворачивается, как главное меню.',
          fr: 'Sur ordinateur, la liste des leçons de l’« Historique des leçons » peut maintenant s’afficher sur une ligne au-dessus de la leçon plutôt qu’en colonne à côté, et elle se replie comme le menu principal quand la leçon a besoin de place.',
          de: 'Am Computer kann die Lektionsliste im „Lektionsverlauf“ jetzt eine Reihe über der Lektion sein statt einer Spalte daneben, und sie klappt wie das Hauptmenü ein, wenn die Lektion den Platz braucht.',
          es: 'En el ordenador, la lista de lecciones del «Historial de lecciones» ahora puede ser una fila encima de la lección en lugar de una columna al lado, y se pliega como el menú principal cuando la lección necesita espacio.',
          pt: 'No computador, a lista de lições do «Histórico de lições» pode agora ser uma fila por cima da lição em vez de uma coluna ao lado, e recolhe-se como o menu principal quando a lição precisa de espaço.',
          it: 'Sul computer, l’elenco delle lezioni della «Cronologia lezioni» ora può stare in fila sopra la lezione invece che in colonna accanto, e si nasconde come il menu principale quando la lezione ha bisogno di spazio.',
        },
      },
    ],
  },
  {
    date: '2026-11-22',
    items: [
      {
        kind: 'new',
        text: {
          en: 'Each group of words in a lesson and on Words to learn now has an Exercise button: Claude writes 15 mixed questions on that group’s words (choose the answer, fill the gap, translate a sentence), and every answer is explained.',
          ru: 'У каждой группы слов в уроке и в разделе «Слова на изучении» теперь есть кнопка «Упражнение»: Claude составит 15 вопросов разных типов по словам группы (выбрать ответ, вставить пропущенное слово, перевести предложение) и объяснит каждый ответ.',
          fr: 'Chaque groupe de mots d’une leçon et de « Mots à apprendre » a maintenant un bouton « Exercice » : Claude écrit 15 questions variées sur les mots du groupe (choisir la réponse, compléter les trous, traduire une phrase), et chaque réponse est expliquée.',
          de: 'Jede Wortgruppe in einer Lektion und in den „Lernwörtern“ hat jetzt eine Schaltfläche „Übung“: Claude schreibt 15 gemischte Fragen zu den Wörtern der Gruppe (die Antwort wählen, die Lücke füllen, einen Satz übersetzen), und jede Antwort wird erklärt.',
          es: 'Cada grupo de palabras de una lección y de «Palabras por aprender» tiene ahora un botón «Ejercicio»: Claude escribe 15 preguntas variadas sobre las palabras del grupo (elegir la respuesta, rellenar el hueco, traducir una frase), y cada respuesta se explica.',
          pt: 'Cada grupo de palavras de uma lição e de «Palavras por aprender» tem agora um botão «Exercício»: o Claude escreve 15 perguntas variadas sobre as palavras do grupo (escolher a resposta, preencher o espaço, traduzir uma frase), e cada resposta é explicada.',
          it: 'Ogni gruppo di parole di una lezione e di «Parole da imparare» ha ora un pulsante «Esercizio»: Claude scrive 15 domande di vario tipo sulle parole del gruppo (scegliere la risposta, riempire lo spazio vuoto, tradurre una frase), e ogni risposta viene spiegata.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Fill the gap, Vocabulary blitz, the practice sentences of the Grammar tab, Create an exercise and A question for discussion now translate into the language chosen under “Translations in”; grammar explanations stay in the interface language.',
          ru: 'В упражнениях «Вставьте слово» и «Словарный блиц», в тренировке грамматики, в карточке «Составить упражнение» и в разделе «Вопрос для обсуждения» переводы теперь пишутся на языке, выбранном в строке «Язык переводов»; объяснения грамматики остаются на языке интерфейса.',
          fr: '« Texte à trous », « Vocabulaire éclair », l’entraînement à la grammaire, « Créer un exercice » et « Une question à discuter » traduisent maintenant dans la langue choisie sous « Langue des traductions » ; les explications de grammaire restent dans la langue de l’interface.',
          de: '„Lückentext“, „Vokabelblitz“, die Grammatikübungen, „Übung erstellen“ und „Eine Frage zum Diskutieren“ übersetzen jetzt in die Sprache, die du unter „Übersetzungssprache“ gewählt hast; Grammatikerklärungen bleiben in der Sprache der Oberfläche.',
          es: '«Rellena el hueco», «Vocabulario relámpago», la práctica de gramática, «Crear un ejercicio» y «Una pregunta para debatir» traducen ahora al idioma elegido en «Idioma de las traducciones»; las explicaciones de gramática siguen en el idioma de la interfaz.',
          pt: '«Preencha o espaço», «Vocabulário relâmpago», a prática de gramática, «Criar um exercício» e «Uma pergunta para debate» traduzem agora para o idioma escolhido em «Idioma das traduções»; as explicações de gramática continuam no idioma da interface.',
          it: '«Completa la frase», «Vocabolario lampo», gli esercizi di grammatica, «Crea un esercizio» e «Una domanda di discussione» ora traducono nella lingua scelta in «Lingua delle traduzioni»; le spiegazioni di grammatica restano nella lingua dell’interfaccia.',
        },
      },
      {
        kind: 'new',
        audience: 'teacher',
        text: {
          en: 'Make homework from this lesson: choose the language of the sentences to translate.',
          ru: '«Домашнее задание по этому уроку»: теперь можно выбрать, на каком языке будут фразы для перевода.',
          fr: '« Des devoirs à partir de cette leçon » : choisissez la langue des phrases à traduire.',
          de: '„Hausaufgaben aus dieser Lektion“: Wähle die Sprache der Sätze, die übersetzt werden sollen.',
          es: '«Deberes a partir de esta lección»: elige el idioma de las frases que hay que traducir.',
          pt: '«Trabalho de casa a partir desta lição»: escolha o idioma das frases a traduzir.',
          it: '«Compiti da questa lezione»: scegli la lingua delle frasi da tradurre.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'The word menu, Photo parsing, Text analysis and textbook notes now translate into the language chosen under “Translations in”, explanations included.',
          ru: 'Переводы и объяснения в меню слова, «Разборе фото», «Разборе текста» и записях по учебнику теперь пишутся на языке, выбранном в строке «Язык переводов».',
          fr: 'Le menu des mots, Analyse de photo, Analyse de texte et les notes tirées d’un manuel traduisent maintenant dans la langue choisie sous « Langue des traductions », explications comprises.',
          de: 'Das Wortmenü, die Fotoanalyse, die Textanalyse und die Notizen aus dem Lehrbuch übersetzen jetzt samt Erklärungen in die Sprache, die du unter „Übersetzungssprache“ gewählt hast.',
          es: 'El menú de palabras, Análisis de fotos, Análisis de texto y las notas del manual traducen ahora al idioma elegido en «Idioma de las traducciones», explicaciones incluidas.',
          pt: 'O menu das palavras, a Análise de fotos, a Análise de texto e as notas do manual traduzem agora para o idioma escolhido em «Idioma das traduções», explicações incluídas.',
          it: 'Il menu delle parole, Analisi delle foto, Analisi del testo e gli appunti dal manuale ora traducono nella lingua scelta in «Lingua delle traduzioni», spiegazioni comprese.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Settings: choose the language word and verb translations are written in, under “Translations in”. Each lesson is prepared again in that language when you open it.',
          ru: 'Настройки: в строке «Язык переводов» можно выбрать, на каком языке пишутся переводы слов и глаголов. Каждый урок будет подготовлен заново на этом языке, когда вы его откроете.',
          fr: 'Réglages : choisissez sous « Langue des traductions » la langue dans laquelle sont écrites les traductions des mots et des verbes. Chaque leçon est de nouveau préparée dans cette langue quand vous l’ouvrez.',
          de: 'Einstellungen: Unter „Übersetzungssprache“ wählst du, in welcher Sprache Wörter und Verben übersetzt werden. Jede Lektion wird beim Öffnen neu in dieser Sprache vorbereitet.',
          es: 'Ajustes: en «Idioma de las traducciones» eliges el idioma en el que se escriben las traducciones de palabras y verbos. Cada lección se vuelve a preparar en ese idioma cuando la abres.',
          pt: 'Definições: em «Idioma das traduções» escolhe o idioma em que são escritas as traduções das palavras e dos verbos. Cada lição volta a ser preparada nesse idioma quando a abrir.',
          it: 'Impostazioni: in «Lingua delle traduzioni» scegli la lingua in cui sono scritte le traduzioni di parole e verbi. Ogni lezione viene preparata di nuovo in quella lingua quando la apri.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Vocabulary blitz, a new exercise on the Words tab: a round of 10 questions on the lesson’s words, half of them a sentence with a gap to fill from four choices, half a short definition in the language you learn, from which you guess the word and type it.',
          ru: '«Словарный блиц» — новое упражнение на вкладке «Слова»: раунд из 10 вопросов по словам урока. В половине из них нужно вставить в пропуск в предложении одно из четырёх слов, в другой половине — по короткому определению на изучаемом языке угадать слово и написать его.',
          fr: '« Vocabulaire éclair », un nouvel exercice dans l’onglet Mots : un tour de 10 questions sur les mots de la leçon. La moitié sont des phrases à trou, à compléter parmi quatre choix ; l’autre moitié, de courtes définitions dans la langue que vous apprenez, à partir desquelles vous devinez le mot avant de l’écrire.',
          de: '„Vokabelblitz“, eine neue Übung im Tab Wörter: eine Runde mit 10 Fragen zu den Wörtern der Lektion. Die eine Hälfte sind Lückensätze, für die du das passende Wort aus vier Vorschlägen wählst, die andere kurze Definitionen in der Sprache, die du lernst: Du errätst das Wort und tippst es ein.',
          es: '«Vocabulario relámpago», un ejercicio nuevo en la pestaña Palabras: una ronda de 10 preguntas sobre las palabras de la lección. La mitad son frases con un hueco que rellenas eligiendo entre cuatro opciones; la otra mitad, definiciones cortas en el idioma que aprendes, con las que adivinas la palabra y la escribes.',
          pt: '«Vocabulário relâmpago», um exercício novo no separador Palavras: uma ronda de 10 perguntas sobre as palavras da lição. Metade são frases com um espaço para preencher com uma de quatro opções; a outra metade são definições curtas na língua que aprende, a partir das quais adivinha a palavra e a escreve.',
          it: '«Vocabolario lampo», un nuovo esercizio nella scheda Parole: un giro di 10 domande sulle parole della lezione. Metà sono frasi con uno spazio vuoto da riempire scegliendo tra quattro opzioni; l’altra metà, brevi definizioni nella lingua che studi, da cui indovini la parola e la scrivi.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Lesson history: a download arrow next to a lesson shows it is already on this device, so its words and exercises open at once, without waiting for Claude.',
          ru: 'История уроков: стрелка загрузки рядом с уроком показывает, что он уже на этом устройстве, поэтому его слова и упражнения открываются сразу, без ожидания Claude.',
          fr: 'Historique des leçons : une flèche de téléchargement à côté d’une leçon indique qu’elle est déjà sur cet appareil ; ses mots et ses exercices s’ouvrent donc tout de suite, sans attendre Claude.',
          de: 'Lektionsverlauf: Ein Download-Pfeil neben einer Lektion zeigt, dass sie schon auf diesem Gerät ist. Wörter und Übungen öffnen sich dann sofort, ohne Warten auf Claude.',
          es: 'Historial de lecciones: una flecha de descarga junto a una lección indica que ya está en este dispositivo, así que sus palabras y ejercicios se abren al instante, sin esperar a Claude.',
          pt: 'Histórico de lições: uma seta para baixo ao lado de uma lição mostra que esta já está descarregada neste dispositivo, por isso as suas palavras e exercícios abrem de imediato, sem esperar pelo Claude.',
          it: 'Cronologia lezioni: una freccia di download accanto a una lezione indica che è già su questo dispositivo, quindi le sue parole e i suoi esercizi si aprono subito, senza aspettare Claude.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Verbs tab: the verbs are a list now, in alphabetical order or by group (1, 2, 3 for French; -ar, -er, -ir and the like for Spanish, Portuguese and Italian). ✕ takes a verb out of the lesson, as for words, and Bring back removed verbs puts them back.',
          ru: 'Вкладка «Глаголы»: глаголы теперь идут списком, по алфавиту или по группам (1, 2, 3 у французских; -ar, -er, -ir и похожие у испанских, португальских и итальянских). ✕ убирает глагол из урока, как и слово, а «Вернуть убранные глаголы» возвращает их обратно.',
          fr: 'Onglet Verbes : les verbes forment maintenant une liste, par ordre alphabétique ou par groupe (1er, 2e, 3e groupe pour le français ; -ar, -er, -ir et leurs équivalents pour l’espagnol, le portugais et l’italien). ✕ retire un verbe de la leçon, comme pour les mots, et « Remettre les verbes retirés » les remet.',
          de: 'Tab Verben: Die Verben stehen jetzt in einer Liste, alphabetisch oder nach Gruppe (1, 2, 3 im Französischen; -ar, -er, -ir und Ähnliches im Spanischen, Portugiesischen und Italienischen). ✕ nimmt ein Verb aus der Lektion, wie bei Wörtern, und „Entfernte Verben zurückholen“ holt sie zurück.',
          es: 'Pestaña Verbos: los verbos son ahora una lista, por orden alfabético o por grupo (1, 2, 3 en francés; -ar, -er, -ir y similares en español, portugués e italiano). ✕ quita un verbo de la lección, como con las palabras, y «Recuperar los verbos quitados» los devuelve.',
          pt: 'Separador Verbos: os verbos são agora uma lista, por ordem alfabética ou por grupo (1, 2, 3 em francês; -ar, -er, -ir e semelhantes em espanhol, português e italiano). ✕ retira um verbo da lição, tal como as palavras, e «Repor os verbos retirados» volta a pô-los.',
          it: 'Scheda Verbi: i verbi ora sono in una lista, in ordine alfabetico o per gruppo (1, 2, 3 per il francese; -ar, -er, -ir e simili per spagnolo, portoghese e italiano). ✕ toglie un verbo dalla lezione, come per le parole, e «Recupera i verbi tolti» li rimette.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Lesson words: ✕ on a word’s row takes it out of the lesson’s list and its exercises, for a word Claude picked up by mistake or one you don’t want to practise. Bring back removed words, under the list, puts them back.',
          ru: 'Слова урока: ✕ в строке слова убирает его из списка урока и из упражнений — если Claude взял слово по ошибке или вы не хотите его тренировать. «Вернуть убранные слова» под списком возвращает их обратно.',
          fr: 'Mots de la leçon : ✕ sur la ligne d’un mot le retire de la liste de la leçon et de ses exercices, pour un mot que Claude a relevé par erreur ou que vous ne voulez pas travailler. « Remettre les mots retirés », sous la liste, les remet.',
          de: 'Lektionswörter: ✕ in der Zeile eines Wortes nimmt es aus der Wortliste der Lektion und aus ihren Übungen, etwa ein Wort, das Claude versehentlich aufgenommen hat, oder eines, das du nicht üben willst. „Entfernte Wörter zurückholen“ unter der Liste holt sie zurück.',
          es: 'Palabras de la lección: ✕ en la fila de una palabra la quita de la lista de la lección y de sus ejercicios, para una palabra que Claude cogió por error o que no quieres practicar. «Recuperar las palabras quitadas», debajo de la lista, las devuelve.',
          pt: 'Palavras da lição: ✕ na linha de uma palavra retira-a da lista da lição e dos seus exercícios, para uma palavra que o Claude apanhou por engano ou que não quer praticar. «Repor as palavras retiradas», por baixo da lista, volta a pô-las.',
          it: 'Parole della lezione: ✕ sulla riga di una parola la toglie dalla lista della lezione e dai suoi esercizi, per una parola che Claude ha preso per errore o su cui non vuoi esercitarti. «Recupera le parole tolte», sotto la lista, le rimette.',
        },
      },
      {
        kind: 'fixed',
        languages: ['fr'],
        text: {
          en: 'Dictation: a French adjective whose masculine and feminine sound the same (grec, grecque) now says which form to write, so a right spelling of the other form is no longer a mistake out of nowhere.',
          ru: 'Диктант: если у французского прилагательного мужской и женский род звучат одинаково (grec, grecque), теперь подсказывается, какую форму написать, так что правильно написанная другая форма больше не становится ошибкой на ровном месте.',
          fr: 'Dictée : quand un adjectif français se prononce de la même façon au masculin et au féminin (grec, grecque), la consigne indique maintenant quelle forme écrire ; l’autre forme, même bien orthographiée, n’est donc plus une erreur sortie de nulle part.',
          de: 'Diktat: Bei einem französischen Adjektiv, dessen maskuline und feminine Form gleich klingen (grec, grecque), steht jetzt dabei, welche Form du schreiben sollst, sodass die richtig geschriebene andere Form nicht mehr aus heiterem Himmel als Fehler zählt.',
          es: 'Dictado: cuando un adjetivo francés suena igual en masculino y en femenino (grec, grecque), ahora se indica qué forma escribir, así que escribir bien la otra forma ya no es un error salido de la nada.',
          pt: 'Ditado: quando um adjetivo francês soa igual no masculino e no feminino (grec, grecque), agora indica-se que forma escrever, por isso a outra forma, bem escrita, já não conta como um erro sem razão aparente.',
          it: 'Dettato: quando un aggettivo francese suona uguale al maschile e al femminile (grec, grecque), ora viene indicato quale forma scrivere, quindi scrivere correttamente l’altra forma non è più un errore venuto dal nulla.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'In an exercise made with Create an exercise, the Russian translation of a sentence no longer gives the answer away: it stays folded under Translation until you open it or give your answer.',
          ru: 'В упражнении, составленном в карточке «Составить упражнение», русский перевод предложения больше не выдаёт ответ: он остаётся свёрнутым в строке «Перевод», пока вы её не раскроете или не ответите.',
          fr: 'Dans un exercice fait avec « Créer un exercice », la traduction russe d’une phrase ne donne plus la réponse : elle reste repliée sous « Traduction » jusqu’à ce que vous l’ouvriez ou que vous répondiez.',
          de: 'In einer Übung aus „Übung erstellen“ verrät die russische Übersetzung eines Satzes die Antwort nicht mehr: Sie bleibt unter „Übersetzung“ eingeklappt, bis du sie aufklappst oder antwortest.',
          es: 'En un ejercicio hecho con «Crear un ejercicio», la traducción al ruso de una frase ya no delata la respuesta: queda plegada bajo «Traducción» hasta que la abras o respondas.',
          pt: 'Num exercício feito com «Criar um exercício», a tradução russa de uma frase já não revela a resposta: fica recolhida sob «Tradução» até a abrir ou responder.',
          it: 'In un esercizio fatto con «Crea un esercizio», la traduzione russa di una frase non svela più la risposta: resta chiusa sotto «Traduzione» finché non la apri o non rispondi.',
        },
      },
      {
        kind: 'fixed',
        text: {
          en: 'Homework now shows up when the lesson writes it as “les devoirs:”, with an article. The next lesson is found when it is written “le prochain cours: …” or with a two-digit year (24.11.26).',
          ru: 'Домашнее задание теперь появляется, когда в уроке оно записано как «les devoirs:», с артиклем. Следующий урок теперь находится и тогда, когда он записан как «le prochain cours: …» или с годом из двух цифр (24.11.26).',
          fr: 'Les devoirs s’affichent maintenant quand ils sont écrits « les devoirs: » dans la leçon, avec l’article. Le prochain cours est aussi trouvé quand il est écrit « le prochain cours: … » ou avec l’année sur deux chiffres (24.11.26).',
          de: 'Hausaufgaben werden jetzt angezeigt, wenn sie in der Lektion mit Artikel als „les devoirs:“ stehen. Die nächste Stunde wird auch erkannt, wenn sie als „le prochain cours: …“ oder mit zweistelliger Jahreszahl (24.11.26) geschrieben ist.',
          es: 'Los deberes ya aparecen cuando en la lección se escriben «les devoirs:», con artículo. La próxima clase también se encuentra cuando se escribe «le prochain cours: …» o con el año en dos cifras (24.11.26).',
          pt: 'O trabalho de casa passa a aparecer quando na lição está escrito «les devoirs:», com artigo. A próxima aula também é encontrada quando está escrita «le prochain cours: …» ou com o ano em dois algarismos (24.11.26).',
          it: 'I compiti ora compaiono quando nella lezione sono scritti «les devoirs:», con l’articolo. La prossima lezione viene trovata anche quando è scritta «le prochain cours: …» o con l’anno a due cifre (24.11.26).',
        },
      },
    ],
  },
  {
    date: '2026-11-21',
    items: [
      {
        kind: 'new',
        text: {
          en: 'French verbs have the futur proche (je vais manger), in the Verbs tab, in quizzes and in homework, negative forms included. Tick it in Settings under Tenses in quizzes; from A1 it is asked by default.',
          ru: 'У французских глаголов появилось время futur proche (je vais manger): на вкладке «Глаголы», в тестах и в домашних заданиях, включая отрицательные формы. Отметьте его в «Настройках» → «Времена в тестах»; с уровня A1 оно спрашивается по умолчанию.',
          fr: 'Les verbes français ont maintenant le futur proche (je vais manger), dans l’onglet Verbes, dans les quiz et dans les devoirs, formes négatives comprises. Cochez-le dans Réglages → Temps dans les quiz ; à partir du niveau A1, il est demandé par défaut.',
          de: 'Französische Verben haben jetzt das futur proche (je vais manger), im Tab Verben, im Quiz und in den Hausaufgaben, verneinte Formen inklusive. Hake es unter Einstellungen → Zeitformen im Quiz an; ab A1 wird es standardmäßig abgefragt.',
          es: 'Los verbos franceses tienen ahora el futur proche (je vais manger), en la pestaña Verbos, en los tests y en los deberes, formas negativas incluidas. Márcalo en Ajustes → Tiempos en los tests; desde A1 se pregunta por defecto.',
          pt: 'Os verbos franceses têm agora o futur proche (je vais manger), no separador Verbos, nos testes e nos trabalhos de casa, com as formas negativas incluídas. Marque-o em Definições → Tempos nos testes; a partir do A1 é perguntado por predefinição.',
          it: 'I verbi francesi ora hanno il futur proche (je vais manger), nella scheda Verbi, nei quiz e nei compiti, forme negative comprese. Spuntalo in Impostazioni → Tempi nei quiz; dall’A1 viene chiesto in automatico.',
        },
        languages: ['fr'],
      },
    ],
  },
  {
    date: '2026-11-20',
    items: [
      {
        kind: 'new',
        text: {
          en: 'Lesson mode now has Import from the book, under the words of the last lesson: choose photos or PDF pages of the book and tick what to take, and it goes under the newest lesson, as in a lesson’s Book exercises tab.',
          ru: 'В режиме урока под «Словами последнего урока» появилось «Добавить из учебника»: выберите фото или страницы PDF из учебника, отметьте, что взять, и это попадёт под самый новый урок — как на вкладке «Упражнения из учебника» в уроке.',
          fr: 'Le mode cours a maintenant « Importer du manuel », sous « Mots de la dernière leçon » : choisissez des photos ou des pages PDF du manuel et cochez ce qu’il faut prendre, et c’est ajouté sous la leçon la plus récente, comme dans l’onglet Exercices du manuel d’une leçon.',
          de: 'Der Unterrichtsmodus hat jetzt „Aus dem Lehrbuch importieren“, unter „Wörter der letzten Lektion“: Wähle Fotos oder PDF-Seiten des Lehrbuchs, kreuze an, was übernommen werden soll, und es kommt unter die neueste Lektion, wie im Tab Übungen aus dem Lehrbuch einer Lektion.',
          es: 'El modo clase tiene ahora «Importar del libro», debajo de «Palabras de la última lección»: elige fotos o páginas PDF del libro, marca lo que quieras tomar y va debajo de la lección más reciente, como en la pestaña Ejercicios del libro de una lección.',
          pt: 'O modo aula tem agora «Importar do manual», por baixo de «Palavras da última lição»: escolha fotos ou páginas PDF do manual, marque o que quer aproveitar, e fica por baixo da lição mais recente, como no separador Exercícios do manual de uma lição.',
          it: 'La modalità lezione ora ha «Importa dal libro», sotto «Parole dell’ultima lezione»: scegli foto o pagine PDF del libro, spunta cosa prendere e va sotto la lezione più recente, come nella scheda Esercizi dal libro di una lezione.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'The words of a lesson and Words to learn are now sorted into groups by meaning, such as food or time. Choose a group next to Filter words to see only its words and practise them on their own.',
          ru: 'Слова урока и раздела «Слова на изучении» теперь разделены на группы по смыслу, например еда или время. Выберите группу рядом с полем «Найти слово», чтобы видеть только её слова и тренировать их отдельно.',
          fr: 'Les mots d’une leçon et de « Mots à apprendre » sont maintenant classés en groupes par sens, par exemple la nourriture ou le temps. Choisissez un groupe à côté de « Filtrer les mots » pour ne voir que ses mots et les travailler à part.',
          de: 'Die Wörter einer Lektion und die „Lernwörter“ sind jetzt nach Bedeutung in Gruppen sortiert, etwa Essen oder Zeit. Wähle neben „Wörter filtern“ eine Gruppe, um nur ihre Wörter zu sehen und sie gezielt zu üben.',
          es: 'Las palabras de una lección y de «Palabras por aprender» están ahora ordenadas en grupos por significado, como la comida o el tiempo. Elige un grupo junto a «Filtrar palabras» para ver solo sus palabras y practicarlas por separado.',
          pt: 'As palavras de uma lição e de «Palavras por aprender» estão agora organizadas em grupos por significado, como a comida ou o tempo. Escolha um grupo ao lado de «Filtrar palavras» para ver só as palavras dele e praticá-las à parte.',
          it: 'Le parole di una lezione e di «Parole da imparare» ora sono divise in gruppi per significato, come il cibo o il tempo. Scegli un gruppo accanto a «Filtra le parole» per vedere solo le sue parole ed esercitarti solo su quelle.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Downloaded lessons is now the second tab of Lesson history, and A question for discussion sits in the menu next to Words to learn and Mistakes. Its button for a new question is now called Ask a question.',
          ru: '«Загруженные уроки» теперь вторая вкладка раздела «История уроков», а «Вопрос для обсуждения» — в меню рядом с разделами «Слова на изучении» и «Ошибки». Кнопка, которая пишет новый вопрос, теперь называется «Задать вопрос».',
          fr: '« Leçons téléchargées » est maintenant le deuxième onglet de l’« Historique des leçons », et « Une question à discuter » se trouve dans le menu, à côté de « Mots à apprendre » et « Erreurs ». Le bouton qui écrit une nouvelle question s’appelle désormais « Poser une question ».',
          de: '„Geladene Lektionen“ ist jetzt der zweite Tab im „Lektionsverlauf“, und „Eine Frage zum Diskutieren“ steht im Menü neben „Lernwörter“ und „Fehler“. Die Schaltfläche für eine neue Frage heißt jetzt „Frage stellen“.',
          es: '«Lecciones descargadas» es ahora la segunda pestaña del «Historial de lecciones», y «Una pregunta para debatir» está en el menú, junto a «Palabras por aprender» y «Errores». El botón para una pregunta nueva se llama ahora «Hacer una pregunta».',
          pt: '«Lições descarregadas» é agora o segundo separador do «Histórico de lições», e «Uma pergunta para debate» está no menu, ao lado de «Palavras por aprender» e «Erros». O botão para uma nova pergunta chama-se agora «Fazer uma pergunta».',
          it: '«Lezioni scaricate» è ora la seconda scheda della «Cronologia lezioni», e «Una domanda di discussione» si trova nel menu accanto a «Parole da imparare» ed «Errori». Il pulsante per una nuova domanda ora si chiama «Fai una domanda».',
        },
      },
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
      {
        kind: 'better',
        text: {
          en: 'Favourite words is now called Words to learn, because that is how it works: a word you miss or star stays until you get it right 3 times in a row in any exercise (I know it on a flashcard counts too). Dots next to each word, like ●●○, show how far it has got.',
          ru: '«Избранные слова» теперь называются «Слова на изучении», потому что так этот список и работает: слово, в котором вы ошиблись или которое отметили ☆, остаётся в нём, пока вы не ответите на него верно 3 раза подряд в любом упражнении («Знаю» на карточке тоже считается). Точки рядом с каждым словом, например ●●○, показывают, сколько уже пройдено.',
          fr: 'Mots favoris s’appelle désormais Mots à apprendre, car c’est ainsi que la liste fonctionne : un mot raté ou marqué d’une ☆ y reste jusqu’à ce que vous le réussissiez 3 fois d’affilée dans n’importe quel exercice (« Je sais » sur une carte compte aussi). Les points à côté de chaque mot, comme ●●○, montrent où il en est.',
          de: 'Lieblingswörter heißen jetzt Lernwörter, denn so funktioniert die Liste: Ein Wort, das du falsch hast oder mit ☆ markierst, bleibt darin, bis du es in einer beliebigen Übung 3-mal in Folge richtig hast (auch „Weiß ich“ auf einer Karteikarte zählt). Die Punkte neben jedem Wort, etwa ●●○, zeigen, wie weit es schon ist.',
          es: 'Palabras favoritas ahora se llama Palabras por aprender, porque así funciona la lista: una palabra que fallas o marcas con ☆ se queda en ella hasta que la aciertas 3 veces seguidas en cualquier ejercicio («Me la sé» en una tarjeta también cuenta). Los puntos junto a cada palabra, como ●●○, muestran cuánto ha avanzado.',
          pt: 'As Palavras favoritas chamam-se agora Palavras por aprender, porque é assim que a lista funciona: uma palavra que errou ou marcou com ☆ fica lá até a acertar 3 vezes seguidas em qualquer exercício («Já sei» num cartão também conta). Os pontos ao lado de cada palavra, como ●●○, mostram quanto já avançou.',
          it: 'Le Parole preferite ora si chiamano Parole da imparare, perché è così che funziona la lista: una parola che sbagli o segni con ☆ ci resta finché non la indovini 3 volte di fila in qualsiasi esercizio (vale anche «La so» su una flashcard). I puntini accanto a ogni parola, come ●●○, mostrano a che punto è.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'The word menu is on the Text page too: click a word or select a phrase, and the words you look up are listed under the text. On Words to learn, type a word that isn’t in any text and press Look up.',
          ru: 'Меню слова появилось и в «Разборе текста»: нажмите на слово или выделите фразу, а слова, которые вы посмотрели, соберутся в список под текстом. В «Словах на изучении» можно ввести слово, которого нет ни в одном тексте, и нажать «Найти».',
          fr: 'Le menu des mots est aussi sur la page Analyse de texte : cliquez sur un mot ou sélectionnez une expression, et les mots consultés sont listés sous le texte. Dans Mots à apprendre, tapez un mot qui n’est dans aucun texte et appuyez sur « Chercher ».',
          de: 'Das Wortmenü gibt es jetzt auch in der Textanalyse: Klicke auf ein Wort oder markiere eine Wendung, und die Wörter, die du nachschlägst, stehen in einer Liste unter dem Text. In den Lernwörtern gibst du ein Wort ein, das in keinem Text vorkommt, und tippst auf „Nachschlagen“.',
          es: 'El menú de palabras también está en Análisis de texto: haz clic en una palabra o selecciona una frase, y las palabras que consultas aparecen en una lista bajo el texto. En Palabras por aprender, escribe una palabra que no esté en ningún texto y pulsa «Buscar».',
          pt: 'O menu das palavras também está na Análise de texto: clique numa palavra ou selecione uma expressão, e as palavras que consultar ficam numa lista por baixo do texto. Nas Palavras por aprender, escreva uma palavra que não esteja em nenhum texto e carregue em «Procurar».',
          it: 'Il menu delle parole c’è anche in Analisi del testo: clicca su una parola o seleziona una frase, e le parole che cerchi compaiono in un elenco sotto il testo. In Parole da imparare, scrivi una parola che non è in nessun testo e premi «Cerca».',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Photo parsing → Handwritten notes takes up to 10 pages at once.',
          ru: '«Разбор фото» → «Рукописные заметки» принимает до 10 страниц за раз.',
          fr: 'Analyse de photo → Notes manuscrites accepte jusqu’à 10 pages à la fois.',
          de: 'Fotoanalyse → Handschriftliche Notizen nimmt bis zu 10 Seiten auf einmal.',
          es: 'Análisis de fotos → Notas a mano acepta hasta 10 páginas a la vez.',
          pt: 'Análise de fotos → Notas à mão aceita até 10 páginas de cada vez.',
          it: 'Analisi delle foto → Appunti a mano accetta fino a 10 pagine alla volta.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Lesson mode: press a card’s title to fold it away, and it stays folded on your device. A question for discussion is there too, to start the lesson with a conversation.',
          ru: 'Режим урока: нажмите на заголовок карточки, чтобы свернуть её, и она останется свёрнутой на вашем устройстве. Там же теперь и «Вопрос для обсуждения», чтобы начать урок с разговора.',
          fr: 'Mode cours : appuyez sur le titre d’une carte pour la replier, et elle reste repliée sur votre appareil. « Une question à discuter » y est aussi, pour commencer le cours par une conversation.',
          de: 'Unterrichtsmodus: Tippe auf den Titel einer Karte, um sie einzuklappen, und sie bleibt auf deinem Gerät eingeklappt. Auch „Eine Frage zum Diskutieren“ ist jetzt dort, um die Stunde mit einem Gespräch zu beginnen.',
          es: 'Modo clase: pulsa el título de una tarjeta para contraerla, y se queda así en tu dispositivo. «Una pregunta para debatir» también está ahí, para empezar la clase con una conversación.',
          pt: 'Modo aula: carregue no título de um cartão para o recolher, e ele fica assim no seu dispositivo. «Uma pergunta para debate» também lá está, para começar a aula com uma conversa.',
          it: 'Modalità lezione: premi il titolo di un riquadro per comprimerlo, e resta così sul tuo dispositivo. C’è anche «Una domanda di discussione», per iniziare la lezione con una conversazione.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'Lesson mode ends with a Homework card: the teacher writes the tasks during the lesson and adds them under the lesson, and the student gets them on Home as a checklist. The quiz game now comes right after the warm-up.',
          ru: 'Режим урока заканчивается карточкой «Домашнее задание»: преподаватель записывает задания во время урока и добавляет их под урок, а ученик видит их на Главной чек-листом. Игра-квиз теперь идёт сразу после разминки.',
          fr: 'Le mode cours se termine par une carte « Devoirs » : le professeur écrit les tâches pendant le cours et les ajoute sous la leçon, et l’élève les retrouve sur l’Accueil en liste à cocher. Le Quiz chrono vient maintenant juste après l’échauffement.',
          de: 'Der Unterrichtsmodus endet mit einer Karte „Hausaufgaben“: Die Lehrkraft schreibt die Aufgaben während der Stunde auf und fügt sie unter der Lektion ein, und der Schüler sieht sie auf der Startseite als Checkliste. Das Quizspiel kommt jetzt direkt nach dem Aufwärmen.',
          es: 'El modo clase termina con una tarjeta «Deberes»: el profesor escribe las tareas durante la clase y las añade bajo la lección, y el alumno las ve en Inicio como lista. El juego de preguntas va ahora justo después del calentamiento.',
          pt: 'O modo aula termina com um cartão «Trabalhos de casa»: o professor escreve as tarefas durante a aula e acrescenta-as por baixo da lição, e o aluno vê-as no Início como lista. O jogo de perguntas vem agora logo a seguir ao aquecimento.',
          it: 'La modalità lezione finisce con un riquadro «Compiti»: l’insegnante scrive i compiti durante la lezione e li aggiunge sotto la lezione, e lo studente li vede nella Home come lista. Il gioco a quiz ora viene subito dopo il riscaldamento.',
        },
      },
      {
        kind: 'new',
        text: {
          en: 'New in lesson mode: Create an exercise. Choose a grammar point and/or the lesson’s words, the level and the number of questions, and Claude writes a round (choose the answer, fill the gap, translate) that the student does right there, every answer checked and explained.',
          ru: 'В режиме урока появилась карточка «Составить упражнение». Выберите грамматическую тему и/или слова урока, уровень и число вопросов, и Claude составит раунд (выбрать ответ, вставить пропущенное слово, перевести), который ученик пройдёт прямо там; каждый ответ проверяется и объясняется.',
          fr: '« Créer un exercice » arrive en mode cours. Choisissez un point de grammaire et/ou les mots de la leçon, le niveau et le nombre de questions, et Claude écrit un tour (choisir la réponse, compléter les trous, traduire) que l’élève fait sur place, chaque réponse étant vérifiée et expliquée.',
          de: 'Neu im Unterrichtsmodus: „Übung erstellen“. Wähle ein Grammatikthema und/oder die Wörter der Lektion, das Niveau und die Anzahl der Fragen, und Claude schreibt eine Runde (Antwort wählen, Lücke füllen, übersetzen), die der Schüler gleich dort löst; jede Antwort wird geprüft und erklärt.',
          es: 'Nuevo en el modo clase: «Crear un ejercicio». Elige un tema de gramática y/o las palabras de la lección, el nivel y el número de preguntas, y Claude escribe una ronda (elegir la respuesta, rellenar el hueco, traducir) que el alumno hace allí mismo; cada respuesta se corrige y se explica.',
          pt: 'Novo no modo aula: «Criar um exercício». Escolha um tema de gramática e/ou as palavras da lição, o nível e o número de perguntas, e o Claude escreve uma ronda (escolher a resposta, preencher o espaço, traduzir) que o aluno faz ali mesmo; cada resposta é verificada e explicada.',
          it: 'Novità nella modalità lezione: «Crea un esercizio». Scegli un tema di grammatica e/o le parole della lezione, il livello e il numero di domande, e Claude scrive un giro (scegliere la risposta, riempire lo spazio vuoto, tradurre) che lo studente fa direttamente lì; ogni risposta viene controllata e spiegata.',
        },
      },
      {
        kind: 'better',
        text: {
          en: 'Import from the book (a lesson’s Book exercises tab) takes more than exercises: tick the exercises, the text and/or the grammar of the pages, and they go into the lesson. Answers are never copied, so the exercises stay for the student to do.',
          ru: '«Добавить из учебника» (вкладка «Упражнения из учебника» в уроке) берёт теперь не только упражнения: отметьте упражнения, текст и/или грамматику со страниц, и они попадут в урок. Ответы никогда не переписываются, так что упражнения остаются ученику.',
          fr: '« Importer du manuel » (l’onglet Exercices du manuel d’une leçon) ne prend plus seulement les exercices : cochez les exercices, le texte et/ou la grammaire des pages, et ils sont ajoutés à la leçon. Les réponses ne sont jamais recopiées : les exercices restent à faire pour l’élève.',
          de: '„Aus dem Lehrbuch importieren“ (im Tab Übungen aus dem Lehrbuch einer Lektion) übernimmt mehr als Übungen: Kreuze die Übungen, den Text und/oder die Grammatik der Seiten an, und sie kommen in die Lektion. Lösungen werden nie abgeschrieben, damit die Übungen für den Schüler zu lösen bleiben.',
          es: '«Importar del libro» (la pestaña Ejercicios del libro de una lección) ya no se limita a los ejercicios: marca los ejercicios, el texto y/o la gramática de las páginas, y pasan a la lección. Las soluciones nunca se copian, así que los ejercicios quedan para que los haga el alumno.',
          pt: '«Importar do manual» (o separador Exercícios do manual de uma lição) já não traz só exercícios: marque os exercícios, o texto e/ou a gramática das páginas, e eles passam para a lição. As soluções nunca são copiadas, por isso os exercícios ficam para o aluno fazer.',
          it: '«Importa dal libro» (la scheda Esercizi dal libro di una lezione) non prende più solo gli esercizi: spunta gli esercizi, il testo e/o la grammatica delle pagine, e finiscono nella lezione. Le soluzioni non vengono mai ricopiate, così gli esercizi restano da fare per lo studente.',
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
