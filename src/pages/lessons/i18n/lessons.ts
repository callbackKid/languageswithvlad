import { defineMessages } from '@/shared/i18n';

// Lesson history's own texts (the rest of the page uses the app shell's).
export const lessonsText = defineMessages({
  en: {
    downloaded: 'Downloaded: its words and exercises are already on this device',
    listAsRow: 'Lessons in a row',
    hideList: 'Hide the lesson list',
    showList: 'Show the lesson list',
    // the red dot on a downloaded lesson whose homework isn't all ticked; {count} tasks are left
    homeworkLeft: {
      one: 'Homework left: {count} task of {total}',
      other: 'Homework left: {count} tasks of {total}',
    },
  },
  ru: {
    downloaded: 'Загружен: слова и упражнения урока уже на этом устройстве',
    listAsRow: 'Уроки в ряд',
    hideList: 'Скрыть список уроков',
    showList: 'Показать список уроков',
    homeworkLeft: {
      one: 'Домашнее задание: осталось {count} задание из {total}',
      few: 'Домашнее задание: осталось {count} задания из {total}',
      many: 'Домашнее задание: осталось {count} заданий из {total}',
      other: 'Домашнее задание: осталось {count} задания из {total}',
    },
  },
  fr: {
    downloaded: 'Téléchargée : ses mots et ses exercices sont déjà sur cet appareil',
    listAsRow: 'Leçons sur une ligne',
    hideList: 'Masquer la liste des leçons',
    showList: 'Afficher la liste des leçons',
    homeworkLeft: {
      one: 'Devoirs : il reste {count} tâche sur {total}',
      other: 'Devoirs : il reste {count} tâches sur {total}',
    },
  },
  de: {
    downloaded: 'Geladen: Wörter und Übungen dieser Lektion sind schon auf diesem Gerät',
    listAsRow: 'Lektionen in einer Reihe',
    hideList: 'Lektionsliste ausblenden',
    showList: 'Lektionsliste einblenden',
    homeworkLeft: {
      one: 'Hausaufgaben: noch {count} Aufgabe von {total}',
      other: 'Hausaufgaben: noch {count} Aufgaben von {total}',
    },
  },
  es: {
    downloaded: 'Descargada: sus palabras y ejercicios ya están en este dispositivo',
    listAsRow: 'Lecciones en fila',
    hideList: 'Ocultar la lista de lecciones',
    showList: 'Mostrar la lista de lecciones',
    homeworkLeft: {
      one: 'Deberes: queda {count} tarea de {total}',
      other: 'Deberes: quedan {count} tareas de {total}',
    },
  },
  pt: {
    downloaded: 'Descarregada: as suas palavras e exercícios já estão neste dispositivo',
    listAsRow: 'Lições em fila',
    hideList: 'Esconder a lista de lições',
    showList: 'Mostrar a lista de lições',
    homeworkLeft: {
      one: 'Trabalho de casa: falta {count} tarefa de {total}',
      other: 'Trabalho de casa: faltam {count} tarefas de {total}',
    },
  },
  it: {
    downloaded: 'Scaricata: le sue parole e i suoi esercizi sono già su questo dispositivo',
    listAsRow: 'Lezioni in fila',
    hideList: 'Nascondi l’elenco delle lezioni',
    showList: 'Mostra l’elenco delle lezioni',
    homeworkLeft: {
      one: 'Compiti: manca {count} compito su {total}',
      other: 'Compiti: mancano {count} compiti su {total}',
    },
  },
});
