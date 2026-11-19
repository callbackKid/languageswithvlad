import { defineMessages } from '../core';

// Lesson mode: the video call, the teacher's notes and the lesson's words side by side.
export const call = defineMessages({
  en: {
    title: 'Lesson mode',
    intro: 'The call, your notes and the lesson’s words in one place.',
    noCall:
      'There is no Google Meet or Zoom link in the document yet. Paste the lesson’s link into it and press ↻ (Sync) at the top.',
    // Meet
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet can’t run inside other websites, so it opens as a small window at the side of the screen. Keep it next to this page.',
    openMeet: 'Open the call in a small window',
    sideBySide: 'Side by side (half the screen)',
    boardTitle: 'Board',
    boardHint:
      'Write, draw and paste pictures, like on a whiteboard. Share your screen in the call so the student sees it. Saved on this device for each day.',
    boardHintShared:
      'Write, draw and paste pictures. The teacher and the student see the same board and can both draw on it at once. It is also saved on this device for each day.',
    boardLive: '🟢 Live with: {names}',
    boardWaiting: 'Shared board: waiting for the other person to open it…',
    someone: 'someone',
    openBoard: 'Open the board',
    loadingBoard: 'Loading the board…',
    fullScreen: 'Full screen',
    exitFullScreen: 'Exit full screen',
    savePicture: 'Save as picture',
    clearBoard: 'Clear',
    clearBoardConfirm: 'Clear the whole board?',
    openInTab: 'Open in a new tab',
    popupBlocked:
      'The browser blocked the window. Allow pop-ups for this site, or open the call in a new tab.',
    pipTip:
      'In Chrome, Meet can also float above every window: in Meet, open ⋮ (More options) and choose picture-in-picture.',
    // Zoom
    zoomTitle: 'Zoom',
    zoomExplain: 'The Zoom call runs right here, in a window you can move and resize.',
    yourName: 'Your name in the call',
    passcode: 'Meeting passcode',
    joinHere: 'Join here',
    joining: 'Joining the call…',
    leave: 'Leave the call',
    zoomNotSetUp:
      'Zoom isn’t set up on this server yet (ZOOM_SDK_KEY, see README), so the call opens in Zoom.',
    zoomNoNumber: 'This Zoom link has no meeting number, so the call opens in Zoom.',
    openInZoom: 'Open in Zoom',
    zoomFailed: 'Couldn’t join the call: {reason}',
    // notes
    notesTitle: 'Lesson notes',
    notesHint:
      'Write during the lesson: new words as “mot — перевод”, mistakes to work on, homework. Saved on this device.',
    notesPlaceholder: 'la boulangerie — пекарня\nil faisait beau — была хорошая погода',
    insertTime: '⏱ Time',
    clearNotes: 'Clear',
    clearConfirm: 'Clear the notes of this lesson?',
    // words
    wordsTitle: 'Words of the last lesson',
    noWords: 'No words prepared yet.',
    openLesson: 'Open the lesson',
    // warm-up
    warmUpTitle: 'Warm-up',
    warmUpHint:
      'About 5 minutes at the start: questions on lesson {n} ({date}) and on what the student got wrong since. Do it on the student’s device, where their mistakes are kept, with the screen shared: the teacher sees at once what didn’t stick.',
    warmUpHintNoLesson:
      'About 5 minutes at the start: questions on what the student got wrong this past week. Do it on the student’s device, where their mistakes are kept, with the screen shared: the teacher sees at once what didn’t stick.',
    startWarmUp: 'Start the warm-up',
    preparingWarmUp: 'Preparing lesson {n}…',
    warmUpEmpty: 'Nothing to go over yet: no words from the last lesson and no mistakes since.',
    warmUpRound: 'Warm-up · lesson {n}',
    backToLesson: 'Back to the lesson',
    missedTitle: 'Didn’t stick: go over these together',
    allStuck: 'Everything stuck: no mistakes in this round.',
  },
  ru: {
    title: 'Режим урока',
    intro: 'Звонок, ваши заметки и слова урока в одном месте.',
    noCall:
      'В документе пока нет ссылки на Google Meet или Zoom. Вставьте ссылку на урок и нажмите ↻ («Синхронизировать») наверху.',
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet нельзя встроить в другие сайты, поэтому он открывается маленьким окном сбоку экрана. Держите его рядом с этой страницей.',
    openMeet: 'Открыть звонок в маленьком окне',
    sideBySide: 'Рядом (половина экрана)',
    boardTitle: 'Доска',
    boardHint:
      'Пишите, рисуйте и вставляйте картинки, как на доске. Покажите экран в звонке, чтобы ученик её видел. Сохраняется на этом устройстве отдельно на каждый день.',
    boardHintShared:
      'Пишите, рисуйте и вставляйте картинки. Преподаватель и ученик видят одну и ту же доску и могут рисовать на ней одновременно. Она также сохраняется на этом устройстве отдельно на каждый день.',
    boardLive: '🟢 Вместе с вами: {names}',
    boardWaiting: 'Общая доска: ждём, пока её откроет второй участник…',
    someone: 'участник',
    openBoard: 'Открыть доску',
    loadingBoard: 'Загружаю доску…',
    fullScreen: 'На весь экран',
    exitFullScreen: 'Выйти из полноэкранного режима',
    savePicture: 'Сохранить картинкой',
    clearBoard: 'Очистить',
    clearBoardConfirm: 'Очистить всю доску?',
    openInTab: 'Открыть в новой вкладке',
    popupBlocked:
      'Браузер заблокировал окно. Разрешите всплывающие окна для этого сайта или откройте звонок в новой вкладке.',
    pipTip:
      'В Chrome Meet может висеть поверх всех окон: в Meet откройте ⋮ (Другие действия) и выберите «картинка в картинке».',
    zoomTitle: 'Zoom',
    zoomExplain: 'Звонок Zoom идёт прямо здесь, в окне, которое можно двигать и менять по размеру.',
    yourName: 'Ваше имя в звонке',
    passcode: 'Код доступа',
    joinHere: 'Подключиться здесь',
    joining: 'Подключаюсь к звонку…',
    leave: 'Выйти из звонка',
    zoomNotSetUp:
      'Zoom ещё не настроен на сервере (ZOOM_SDK_KEY, см. README), поэтому звонок откроется в Zoom.',
    zoomNoNumber: 'В этой ссылке Zoom нет номера конференции, поэтому звонок откроется в Zoom.',
    openInZoom: 'Открыть в Zoom',
    zoomFailed: 'Не удалось подключиться к звонку: {reason}',
    notesTitle: 'Заметки урока',
    notesHint:
      'Пишите во время урока: новые слова в виде «mot — перевод», ошибки для работы, домашнее задание. Сохраняется на этом устройстве.',
    notesPlaceholder: 'la boulangerie — пекарня\nil faisait beau — была хорошая погода',
    insertTime: '⏱ Время',
    clearNotes: 'Очистить',
    clearConfirm: 'Очистить заметки этого урока?',
    wordsTitle: 'Слова последнего урока',
    noWords: 'Слова ещё не подготовлены.',
    openLesson: 'Открыть урок',
    // warm-up
    warmUpTitle: 'Разминка',
    warmUpHint:
      'Минут 5 в начале: вопросы по уроку {n} ({date}) и по ошибкам ученика с тех пор. Делайте на устройстве ученика, где хранятся его ошибки, с общим экраном: преподаватель сразу видит, что не закрепилось.',
    warmUpHintNoLesson:
      'Минут 5 в начале: вопросы по ошибкам ученика за последнюю неделю. Делайте на устройстве ученика, где хранятся его ошибки, с общим экраном: преподаватель сразу видит, что не закрепилось.',
    startWarmUp: 'Начать разминку',
    preparingWarmUp: 'Готовлю урок {n}…',
    warmUpEmpty: 'Пока не о чем спрашивать: нет слов прошлого урока и ошибок с тех пор.',
    warmUpRound: 'Разминка · урок {n}',
    backToLesson: 'Вернуться к уроку',
    missedTitle: 'Не закрепилось: разберите вместе',
    allStuck: 'Всё закрепилось: в этом раунде ни одной ошибки.',
  },
  fr: {
    title: 'Mode cours',
    intro: 'L’appel, vos notes et les mots de la leçon au même endroit.',
    noCall:
      'Le document ne contient pas encore de lien Google Meet ou Zoom. Collez-y le lien du cours et appuyez sur ↻ (Synchroniser) en haut.',
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet ne peut pas s’afficher dans d’autres sites : il s’ouvre donc dans une petite fenêtre sur le côté de l’écran. Gardez-la à côté de cette page.',
    openMeet: 'Ouvrir l’appel dans une petite fenêtre',
    sideBySide: 'Côte à côte (moitié de l’écran)',
    boardTitle: 'Tableau',
    boardHint:
      'Écrivez, dessinez et collez des images, comme sur un tableau blanc. Partagez votre écran dans l’appel pour que l’élève le voie. Enregistré sur cet appareil pour chaque jour.',
    boardHintShared:
      'Écrivez, dessinez et collez des images. Le professeur et l’élève voient le même tableau et peuvent y dessiner en même temps. Il est aussi enregistré sur cet appareil pour chaque jour.',
    boardLive: '🟢 En direct avec : {names}',
    boardWaiting: 'Tableau partagé : en attente que l’autre personne l’ouvre…',
    someone: 'quelqu’un',
    openBoard: 'Ouvrir le tableau',
    loadingBoard: 'Chargement du tableau…',
    fullScreen: 'Plein écran',
    exitFullScreen: 'Quitter le plein écran',
    savePicture: 'Enregistrer en image',
    clearBoard: 'Effacer',
    clearBoardConfirm: 'Effacer tout le tableau ?',
    openInTab: 'Ouvrir dans un nouvel onglet',
    popupBlocked:
      'Le navigateur a bloqué la fenêtre. Autorisez les fenêtres pop-up pour ce site, ou ouvrez l’appel dans un nouvel onglet.',
    pipTip:
      'Dans Chrome, Meet peut aussi rester au-dessus de toutes les fenêtres : dans Meet, ouvrez ⋮ (Autres options) et choisissez l’image dans l’image.',
    zoomTitle: 'Zoom',
    zoomExplain:
      'L’appel Zoom se déroule ici même, dans une fenêtre que vous pouvez déplacer et redimensionner.',
    yourName: 'Votre nom dans l’appel',
    passcode: 'Code secret de la réunion',
    joinHere: 'Rejoindre ici',
    joining: 'Connexion à l’appel…',
    leave: 'Quitter l’appel',
    zoomNotSetUp:
      'Zoom n’est pas encore configuré sur ce serveur (ZOOM_SDK_KEY, voir README) : l’appel s’ouvre donc dans Zoom.',
    zoomNoNumber: 'Ce lien Zoom n’a pas de numéro de réunion : l’appel s’ouvre donc dans Zoom.',
    openInZoom: 'Ouvrir dans Zoom',
    zoomFailed: 'Impossible de rejoindre l’appel : {reason}',
    notesTitle: 'Notes du cours',
    notesHint:
      'Écrivez pendant le cours : les nouveaux mots sous la forme « mot — перевод », les erreurs à travailler, les devoirs. Enregistré sur cet appareil.',
    notesPlaceholder: 'la boulangerie — пекарня\nil faisait beau — была хорошая погода',
    insertTime: '⏱ Heure',
    clearNotes: 'Effacer',
    clearConfirm: 'Effacer les notes de ce cours ?',
    wordsTitle: 'Mots de la dernière leçon',
    noWords: 'Aucun mot préparé pour l’instant.',
    openLesson: 'Ouvrir la leçon',
    // warm-up
    warmUpTitle: 'Échauffement',
    warmUpHint:
      'Environ 5 minutes au début : des questions sur la leçon {n} ({date}) et sur les erreurs de l’élève depuis. Faites-le sur l’appareil de l’élève, où ses erreurs sont gardées, avec l’écran partagé : le professeur voit tout de suite ce qui n’est pas acquis.',
    warmUpHintNoLesson:
      'Environ 5 minutes au début : des questions sur les erreurs de l’élève de la semaine passée. Faites-le sur l’appareil de l’élève, où ses erreurs sont gardées, avec l’écran partagé : le professeur voit tout de suite ce qui n’est pas acquis.',
    startWarmUp: 'Commencer l’échauffement',
    preparingWarmUp: 'Préparation de la leçon {n}…',
    warmUpEmpty:
      'Rien à revoir pour l’instant : pas de mots de la dernière leçon ni d’erreurs depuis.',
    warmUpRound: 'Échauffement · leçon {n}',
    backToLesson: 'Retour au cours',
    missedTitle: 'Pas encore acquis : à revoir ensemble',
    allStuck: 'Tout est acquis : aucune erreur dans cette série.',
  },
  de: {
    title: 'Unterrichtsmodus',
    intro: 'Der Anruf, deine Notizen und die Wörter der Lektion an einem Ort.',
    noCall:
      'Im Dokument steht noch kein Google-Meet- oder Zoom-Link. Füge den Link der Stunde ein und tippe oben auf ↻ (Synchronisieren).',
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet lässt sich nicht in andere Websites einbetten, deshalb öffnet es sich als kleines Fenster am Bildschirmrand. Behalte es neben dieser Seite.',
    openMeet: 'Anruf in kleinem Fenster öffnen',
    sideBySide: 'Nebeneinander (halber Bildschirm)',
    boardTitle: 'Tafel',
    boardHint:
      'Schreib, zeichne und füge Bilder ein, wie an einem Whiteboard. Teile deinen Bildschirm im Anruf, damit die Schülerin oder der Schüler sie sieht. Wird auf diesem Gerät für jeden Tag gespeichert.',
    boardHintShared:
      'Schreib, zeichne und füge Bilder ein. Lehrkraft und Schüler sehen dieselbe Tafel und können gleichzeitig darauf zeichnen. Sie wird außerdem auf diesem Gerät für jeden Tag gespeichert.',
    boardLive: '🟢 Live mit: {names}',
    boardWaiting: 'Geteilte Tafel: Es wird gewartet, bis die andere Person sie öffnet…',
    someone: 'jemand',
    openBoard: 'Tafel öffnen',
    loadingBoard: 'Tafel wird geladen…',
    fullScreen: 'Vollbild',
    exitFullScreen: 'Vollbild verlassen',
    savePicture: 'Als Bild speichern',
    clearBoard: 'Leeren',
    clearBoardConfirm: 'Die ganze Tafel leeren?',
    openInTab: 'In neuem Tab öffnen',
    popupBlocked:
      'Der Browser hat das Fenster blockiert. Erlaube Pop-ups für diese Seite oder öffne den Anruf in einem neuen Tab.',
    pipTip:
      'In Chrome kann Meet auch über allen Fenstern schweben: Öffne in Meet ⋮ (Weitere Optionen) und wähle Bild-im-Bild.',
    zoomTitle: 'Zoom',
    zoomExplain:
      'Der Zoom-Anruf läuft direkt hier, in einem Fenster, das du verschieben und in der Größe ändern kannst.',
    yourName: 'Dein Name im Anruf',
    passcode: 'Kenncode des Meetings',
    joinHere: 'Hier beitreten',
    joining: 'Verbindung zum Anruf…',
    leave: 'Anruf verlassen',
    zoomNotSetUp:
      'Zoom ist auf diesem Server noch nicht eingerichtet (ZOOM_SDK_KEY, siehe README), deshalb öffnet sich der Anruf in Zoom.',
    zoomNoNumber: 'Dieser Zoom-Link hat keine Meeting-ID, deshalb öffnet sich der Anruf in Zoom.',
    openInZoom: 'In Zoom öffnen',
    zoomFailed: 'Beitritt zum Anruf nicht möglich: {reason}',
    notesTitle: 'Notizen zur Stunde',
    notesHint:
      'Schreib während der Stunde: neue Wörter als „Wort — перевод“, Fehler zum Üben, Hausaufgaben. Wird auf diesem Gerät gespeichert.',
    notesPlaceholder: 'die Bäckerei — пекарня\nes war schön — была хорошая погода',
    insertTime: '⏱ Uhrzeit',
    clearNotes: 'Leeren',
    clearConfirm: 'Die Notizen dieser Stunde leeren?',
    wordsTitle: 'Wörter der letzten Lektion',
    noWords: 'Noch keine Wörter vorbereitet.',
    openLesson: 'Lektion öffnen',
    // warm-up
    warmUpTitle: 'Aufwärmen',
    warmUpHint:
      'Etwa 5 Minuten am Anfang: Fragen zur Lektion {n} ({date}) und zu den Fehlern seitdem. Am Gerät der Schülerin oder des Schülers, wo die Fehler gespeichert sind, mit geteiltem Bildschirm: Die Lehrkraft sieht sofort, was noch nicht sitzt.',
    warmUpHintNoLesson:
      'Etwa 5 Minuten am Anfang: Fragen zu den Fehlern der letzten Woche. Am Gerät der Schülerin oder des Schülers, wo die Fehler gespeichert sind, mit geteiltem Bildschirm: Die Lehrkraft sieht sofort, was noch nicht sitzt.',
    startWarmUp: 'Aufwärmen starten',
    preparingWarmUp: 'Lektion {n} wird vorbereitet…',
    warmUpEmpty:
      'Noch nichts zu wiederholen: keine Wörter aus der letzten Lektion und seitdem keine Fehler.',
    warmUpRound: 'Aufwärmen · Lektion {n}',
    backToLesson: 'Zurück zur Stunde',
    missedTitle: 'Sitzt noch nicht: gemeinsam durchgehen',
    allStuck: 'Alles sitzt: kein Fehler in dieser Runde.',
  },
  es: {
    title: 'Modo clase',
    intro: 'La llamada, tus notas y las palabras de la lección en un solo lugar.',
    noCall:
      'Todavía no hay ningún enlace de Google Meet o Zoom en el documento. Pega en él el enlace de la clase y pulsa ↻ (Sincronizar) arriba.',
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet no puede funcionar dentro de otras webs, así que se abre en una ventana pequeña a un lado de la pantalla. Tenla junto a esta página.',
    openMeet: 'Abrir la llamada en una ventana pequeña',
    sideBySide: 'Lado a lado (media pantalla)',
    boardTitle: 'Pizarra',
    boardHint:
      'Escribe, dibuja y pega imágenes, como en una pizarra. Comparte la pantalla en la llamada para que el alumno la vea. Se guarda en este dispositivo para cada día.',
    boardHintShared:
      'Escribe, dibuja y pega imágenes. El profesor y el alumno ven la misma pizarra y pueden dibujar a la vez. También se guarda en este dispositivo para cada día.',
    boardLive: '🟢 En directo con: {names}',
    boardWaiting: 'Pizarra compartida: esperando a que la otra persona la abra…',
    someone: 'alguien',
    openBoard: 'Abrir la pizarra',
    loadingBoard: 'Cargando la pizarra…',
    fullScreen: 'Pantalla completa',
    exitFullScreen: 'Salir de pantalla completa',
    savePicture: 'Guardar como imagen',
    clearBoard: 'Borrar',
    clearBoardConfirm: '¿Borrar toda la pizarra?',
    openInTab: 'Abrir en una pestaña nueva',
    popupBlocked:
      'El navegador ha bloqueado la ventana. Permite las ventanas emergentes para este sitio o abre la llamada en una pestaña nueva.',
    pipTip:
      'En Chrome, Meet también puede flotar sobre todas las ventanas: en Meet, abre ⋮ (Más opciones) y elige imagen en imagen.',
    zoomTitle: 'Zoom',
    zoomExplain:
      'La llamada de Zoom funciona aquí mismo, en una ventana que puedes mover y cambiar de tamaño.',
    yourName: 'Tu nombre en la llamada',
    passcode: 'Código de acceso de la reunión',
    joinHere: 'Unirse aquí',
    joining: 'Entrando en la llamada…',
    leave: 'Salir de la llamada',
    zoomNotSetUp:
      'Zoom aún no está configurado en este servidor (ZOOM_SDK_KEY, ver README), así que la llamada se abre en Zoom.',
    zoomNoNumber:
      'Este enlace de Zoom no tiene número de reunión, así que la llamada se abre en Zoom.',
    openInZoom: 'Abrir en Zoom',
    zoomFailed: 'No se ha podido entrar en la llamada: {reason}',
    notesTitle: 'Notas de la clase',
    notesHint:
      'Escribe durante la clase: palabras nuevas como «palabra — перевод», errores que trabajar, deberes. Se guarda en este dispositivo.',
    notesPlaceholder: 'la panadería — пекарня\nhacía buen tiempo — была хорошая погода',
    insertTime: '⏱ Hora',
    clearNotes: 'Borrar',
    clearConfirm: '¿Borrar las notas de esta clase?',
    wordsTitle: 'Palabras de la última lección',
    noWords: 'Aún no hay palabras preparadas.',
    openLesson: 'Abrir la lección',
    // warm-up
    warmUpTitle: 'Calentamiento',
    warmUpHint:
      'Unos 5 minutos al principio: preguntas sobre la lección {n} ({date}) y sobre los errores del alumno desde entonces. Hazlo en el dispositivo del alumno, donde se guardan sus errores, con la pantalla compartida: el profesor ve enseguida lo que no se ha fijado.',
    warmUpHintNoLesson:
      'Unos 5 minutos al principio: preguntas sobre los errores del alumno de la última semana. Hazlo en el dispositivo del alumno, donde se guardan sus errores, con la pantalla compartida: el profesor ve enseguida lo que no se ha fijado.',
    startWarmUp: 'Empezar el calentamiento',
    preparingWarmUp: 'Preparando la lección {n}…',
    warmUpEmpty:
      'Todavía no hay nada que repasar: ni palabras de la última lección ni errores desde entonces.',
    warmUpRound: 'Calentamiento · lección {n}',
    backToLesson: 'Volver a la clase',
    missedTitle: 'No se ha fijado: repasadlo juntos',
    allStuck: 'Todo se ha fijado: ningún error en esta ronda.',
  },
  pt: {
    title: 'Modo aula',
    intro: 'A chamada, as suas notas e as palavras da lição num só lugar.',
    noCall:
      'Ainda não há nenhuma ligação do Google Meet ou do Zoom no documento. Cole lá a ligação da aula e carregue em ↻ (Sincronizar) em cima.',
    meetTitle: 'Google Meet',
    meetExplain:
      'O Google Meet não funciona dentro de outros sites, por isso abre numa janela pequena ao lado do ecrã. Mantenha-a junto a esta página.',
    openMeet: 'Abrir a chamada numa janela pequena',
    sideBySide: 'Lado a lado (meio ecrã)',
    boardTitle: 'Quadro',
    boardHint:
      'Escreva, desenhe e cole imagens, como num quadro branco. Partilhe o ecrã na chamada para o aluno o ver. Fica guardado neste dispositivo para cada dia.',
    boardHintShared:
      'Escreva, desenhe e cole imagens. O professor e o aluno veem o mesmo quadro e podem desenhar ao mesmo tempo. Também fica guardado neste dispositivo para cada dia.',
    boardLive: '🟢 Em direto com: {names}',
    boardWaiting: 'Quadro partilhado: à espera que a outra pessoa o abra…',
    someone: 'alguém',
    openBoard: 'Abrir o quadro',
    loadingBoard: 'A carregar o quadro…',
    fullScreen: 'Ecrã inteiro',
    exitFullScreen: 'Sair do ecrã inteiro',
    savePicture: 'Guardar como imagem',
    clearBoard: 'Limpar',
    clearBoardConfirm: 'Limpar o quadro todo?',
    openInTab: 'Abrir num separador novo',
    popupBlocked:
      'O navegador bloqueou a janela. Permita janelas pop-up para este site ou abra a chamada num separador novo.',
    pipTip:
      'No Chrome, o Meet também pode flutuar por cima de todas as janelas: no Meet, abra ⋮ (Mais opções) e escolha imagem na imagem.',
    zoomTitle: 'Zoom',
    zoomExplain:
      'A chamada do Zoom funciona aqui mesmo, numa janela que pode mover e redimensionar.',
    yourName: 'O seu nome na chamada',
    passcode: 'Código de acesso da reunião',
    joinHere: 'Entrar aqui',
    joining: 'A entrar na chamada…',
    leave: 'Sair da chamada',
    zoomNotSetUp:
      'O Zoom ainda não está configurado neste servidor (ZOOM_SDK_KEY, ver README), por isso a chamada abre no Zoom.',
    zoomNoNumber:
      'Esta ligação do Zoom não tem número de reunião, por isso a chamada abre no Zoom.',
    openInZoom: 'Abrir no Zoom',
    zoomFailed: 'Não foi possível entrar na chamada: {reason}',
    notesTitle: 'Notas da aula',
    notesHint:
      'Escreva durante a aula: palavras novas como «palavra — перевод», erros a trabalhar, trabalhos de casa. Fica guardado neste dispositivo.',
    notesPlaceholder: 'a padaria — пекарня\nestava bom tempo — была хорошая погода',
    insertTime: '⏱ Hora',
    clearNotes: 'Limpar',
    clearConfirm: 'Limpar as notas desta aula?',
    wordsTitle: 'Palavras da última lição',
    noWords: 'Ainda não há palavras preparadas.',
    openLesson: 'Abrir a lição',
    // warm-up
    warmUpTitle: 'Aquecimento',
    warmUpHint:
      'Cerca de 5 minutos no início: perguntas sobre a lição {n} ({date}) e sobre os erros do aluno desde então. Faça-o no dispositivo do aluno, onde os erros ficam guardados, com o ecrã partilhado: o professor vê logo o que não ficou.',
    warmUpHintNoLesson:
      'Cerca de 5 minutos no início: perguntas sobre os erros do aluno na última semana. Faça-o no dispositivo do aluno, onde os erros ficam guardados, com o ecrã partilhado: o professor vê logo o que não ficou.',
    startWarmUp: 'Começar o aquecimento',
    preparingWarmUp: 'A preparar a lição {n}…',
    warmUpEmpty:
      'Ainda não há nada para rever: nem palavras da última lição nem erros desde então.',
    warmUpRound: 'Aquecimento · lição {n}',
    backToLesson: 'Voltar à aula',
    missedTitle: 'Não ficou: revejam juntos',
    allStuck: 'Ficou tudo: nenhum erro nesta ronda.',
  },
  it: {
    title: 'Modalità lezione',
    intro: 'La chiamata, i tuoi appunti e le parole della lezione in un unico posto.',
    noCall:
      'Nel documento non c’è ancora un link di Google Meet o Zoom. Incolla il link della lezione e premi ↻ (Sincronizza) in alto.',
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet non può funzionare dentro altri siti, quindi si apre in una piccola finestra a lato dello schermo. Tienila accanto a questa pagina.',
    openMeet: 'Apri la chiamata in una piccola finestra',
    sideBySide: 'Affiancata (metà schermo)',
    boardTitle: 'Lavagna',
    boardHint:
      'Scrivi, disegna e incolla immagini, come su una lavagna. Condividi lo schermo nella chiamata perché lo studente la veda. Si salva su questo dispositivo per ogni giorno.',
    boardHintShared:
      'Scrivi, disegna e incolla immagini. Insegnante e studente vedono la stessa lavagna e possono disegnarci insieme. Si salva anche su questo dispositivo per ogni giorno.',
    boardLive: '🟢 In diretta con: {names}',
    boardWaiting: 'Lavagna condivisa: in attesa che l’altra persona la apra…',
    someone: 'qualcuno',
    openBoard: 'Apri la lavagna',
    loadingBoard: 'Caricamento della lavagna…',
    fullScreen: 'Schermo intero',
    exitFullScreen: 'Esci dallo schermo intero',
    savePicture: 'Salva come immagine',
    clearBoard: 'Cancella',
    clearBoardConfirm: 'Cancellare tutta la lavagna?',
    openInTab: 'Apri in una nuova scheda',
    popupBlocked:
      'Il browser ha bloccato la finestra. Consenti i pop-up per questo sito o apri la chiamata in una nuova scheda.',
    pipTip:
      'In Chrome, Meet può anche restare sopra tutte le finestre: in Meet apri ⋮ (Altre opzioni) e scegli picture-in-picture.',
    zoomTitle: 'Zoom',
    zoomExplain:
      'La chiamata Zoom funziona proprio qui, in una finestra che puoi spostare e ridimensionare.',
    yourName: 'Il tuo nome nella chiamata',
    passcode: 'Codice della riunione',
    joinHere: 'Partecipa qui',
    joining: 'Ingresso nella chiamata…',
    leave: 'Esci dalla chiamata',
    zoomNotSetUp:
      'Zoom non è ancora configurato su questo server (ZOOM_SDK_KEY, vedi README), quindi la chiamata si apre in Zoom.',
    zoomNoNumber:
      'Questo link di Zoom non ha un numero di riunione, quindi la chiamata si apre in Zoom.',
    openInZoom: 'Apri in Zoom',
    zoomFailed: 'Impossibile entrare nella chiamata: {reason}',
    notesTitle: 'Appunti della lezione',
    notesHint:
      'Scrivi durante la lezione: parole nuove come «parola — перевод», errori su cui lavorare, compiti. Si salva su questo dispositivo.',
    notesPlaceholder: 'la panetteria — пекарня\nfaceva bel tempo — была хорошая погода',
    insertTime: '⏱ Ora',
    clearNotes: 'Cancella',
    clearConfirm: 'Cancellare gli appunti di questa lezione?',
    wordsTitle: 'Parole dell’ultima lezione',
    noWords: 'Nessuna parola ancora pronta.',
    openLesson: 'Apri la lezione',
    // warm-up
    warmUpTitle: 'Riscaldamento',
    warmUpHint:
      'Circa 5 minuti all’inizio: domande sulla lezione {n} ({date}) e sugli errori dello studente da allora. Fatelo sul dispositivo dello studente, dove sono salvati i suoi errori, con lo schermo condiviso: l’insegnante vede subito cosa non è rimasto.',
    warmUpHintNoLesson:
      'Circa 5 minuti all’inizio: domande sugli errori dello studente nell’ultima settimana. Fatelo sul dispositivo dello studente, dove sono salvati i suoi errori, con lo schermo condiviso: l’insegnante vede subito cosa non è rimasto.',
    startWarmUp: 'Inizia il riscaldamento',
    preparingWarmUp: 'Preparo la lezione {n}…',
    warmUpEmpty:
      'Ancora niente da ripassare: nessuna parola dell’ultima lezione e nessun errore da allora.',
    warmUpRound: 'Riscaldamento · lezione {n}',
    backToLesson: 'Torna alla lezione',
    missedTitle: 'Non è rimasto: ripassatelo insieme',
    allStuck: 'È rimasto tutto: nessun errore in questo turno.',
  },
});
