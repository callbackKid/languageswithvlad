import { defineMessages } from '../core';

/** Lesson mode: the video call, the teacher's notes and the lesson's words side by side. */
export const call = defineMessages({
  en: {
    title: 'Lesson mode',
    intro: 'The call, your notes and the lesson’s words in one place.',
    noCall:
      'There is no Google Meet or Zoom link in the document yet. Paste the lesson’s link into it and press Sync.',
    // Meet
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet can’t run inside other websites, so it opens as a small window at the side of the screen. Keep it next to this page.',
    openMeet: 'Open the call in a small window',
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
  },
  ru: {
    title: 'Режим урока',
    intro: 'Звонок, ваши заметки и слова урока в одном месте.',
    noCall:
      'В документе пока нет ссылки на Google Meet или Zoom. Вставьте ссылку на урок и нажмите «Синхронизировать».',
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet нельзя встроить в другие сайты, поэтому он открывается маленьким окном сбоку экрана. Держите его рядом с этой страницей.',
    openMeet: 'Открыть звонок в маленьком окне',
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
  },
  fr: {
    title: 'Mode cours',
    intro: 'L’appel, vos notes et les mots de la leçon au même endroit.',
    noCall:
      'Le document ne contient pas encore de lien Google Meet ou Zoom. Collez-y le lien du cours et appuyez sur Synchroniser.',
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet ne peut pas s’afficher dans d’autres sites : il s’ouvre donc dans une petite fenêtre sur le côté de l’écran. Gardez-la à côté de cette page.',
    openMeet: 'Ouvrir l’appel dans une petite fenêtre',
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
  },
  de: {
    title: 'Unterrichtsmodus',
    intro: 'Der Anruf, deine Notizen und die Wörter der Lektion an einem Ort.',
    noCall:
      'Im Dokument steht noch kein Google-Meet- oder Zoom-Link. Füge den Link der Stunde ein und tippe auf Synchronisieren.',
    meetTitle: 'Google Meet',
    meetExplain:
      'Google Meet lässt sich nicht in andere Websites einbetten, deshalb öffnet es sich als kleines Fenster am Bildschirmrand. Behalte es neben dieser Seite.',
    openMeet: 'Anruf in kleinem Fenster öffnen',
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
    joining: 'Anruf wird beigetreten…',
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
  },
});
