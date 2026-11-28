import { defineMessages } from '@/shared/i18n';

// Create an exercise, a card in lesson mode, and the round the student then does.
export const makeExerciseText = defineMessages({
  en: {
    title: 'Create an exercise',
    hint: 'Claude writes a round of questions for the student to do here: choose the answer, fill the gap, translate a sentence. Every answer is checked and explained.',
    practise: 'What to practise',
    grammar: 'Grammar',
    grammarPlaceholder: 'e.g. passé composé with être',
    words: { one: 'The {count} word of lesson {n}', other: 'The {count} words of lesson {n}' },
    noWords: 'The newest lesson has no words yet.',
    level: 'Level',
    count: 'Questions',
    pickSomething: 'Choose grammar, the words or both.',
    make: 'Create the exercise',
    making: {
      one: 'Claude is writing {count} question…',
      other: 'Claude is writing {count} questions…',
    },
    failed: 'Couldn’t create the exercise. Try again.',
    openLast: 'Open the last one: {title}',
    progress: 'Question {current} of {total}',
    translate: 'Translate:',
    again: 'Do it again',
    makeAnother: 'Create another',
    // the button next to a group of words, and the round it makes
    groupButton: 'Exercise',
    groupLabel: 'An exercise on the words of “{name}”',
    groupTooltip: '15 questions by Claude on these words',
    groupTooFew: {
      one: 'To start an exercise, tick at least {count} word from one language. Each word needs a translation.',
      other:
        'To start an exercise, tick at least {count} words from one language. Each word needs a translation.',
    },
    // one note over a grouped word list when a group has too few ticked words for its Exercise
    groupNote: {
      one: 'To start a group exercise, tick at least {count} word from one language. Each word needs a translation.',
      other:
        'To start a group exercise, tick at least {count} words from one language. Each word needs a translation.',
    },
    groupTitle: 'Exercise: {name}',
  },
  ru: {
    title: 'Составить упражнение',
    hint: 'Claude составит раунд вопросов, который ученик пройдёт прямо здесь: выбрать ответ, вставить пропущенное слово, перевести предложение. Каждый ответ проверяется и объясняется.',
    practise: 'Что тренировать',
    grammar: 'Грамматика',
    grammarPlaceholder: 'например, passé composé с être',
    words: {
      one: '{count} слово урока {n}',
      few: '{count} слова урока {n}',
      many: '{count} слов урока {n}',
      other: '{count} слова урока {n}',
    },
    noWords: 'В последнем уроке пока нет слов.',
    level: 'Уровень',
    count: 'Сколько вопросов',
    pickSomething: 'Выберите грамматику, слова или и то и другое.',
    make: 'Составить упражнение',
    making: {
      one: 'Claude составляет {count} вопрос…',
      few: 'Claude составляет {count} вопроса…',
      many: 'Claude составляет {count} вопросов…',
      other: 'Claude составляет {count} вопроса…',
    },
    failed: 'Не удалось составить упражнение. Попробуйте ещё раз.',
    openLast: 'Открыть последнее: {title}',
    progress: 'Вопрос {current} из {total}',
    translate: 'Переведите:',
    again: 'Пройти ещё раз',
    makeAnother: 'Составить ещё одно',
    // the button next to a group of words, and the round it makes
    groupButton: 'Упражнение',
    groupLabel: 'Упражнение по словам группы «{name}»',
    groupTooltip: '15 вопросов от Claude по этим словам',
    groupTooFew: {
      one: 'Для упражнения отметьте хотя бы {count} слово на одном языке. У каждого слова должен быть перевод.',
      few: 'Для упражнения отметьте хотя бы {count} слова на одном языке. У каждого слова должен быть перевод.',
      many: 'Для упражнения отметьте хотя бы {count} слов на одном языке. У каждого слова должен быть перевод.',
      other:
        'Для упражнения отметьте хотя бы {count} слова на одном языке. У каждого слова должен быть перевод.',
    },
    // one note over a grouped word list when a group has too few ticked words for its Exercise
    groupNote: {
      one: 'Для упражнения по группе отметьте хотя бы {count} слово на одном языке. У каждого слова должен быть перевод.',
      few: 'Для упражнения по группе отметьте хотя бы {count} слова на одном языке. У каждого слова должен быть перевод.',
      many: 'Для упражнения по группе отметьте хотя бы {count} слов на одном языке. У каждого слова должен быть перевод.',
      other:
        'Для упражнения по группе отметьте хотя бы {count} слова на одном языке. У каждого слова должен быть перевод.',
    },
    groupTitle: 'Упражнение: {name}',
  },
  fr: {
    title: 'Créer un exercice',
    hint: 'Claude écrit un tour de questions que l’élève fait ici même : choisir la réponse, compléter les trous, traduire une phrase. Chaque réponse est vérifiée et expliquée.',
    practise: 'Ce qu’il faut travailler',
    grammar: 'Grammaire',
    grammarPlaceholder: 'par ex. le passé composé avec être',
    words: { one: '{count} mot de la leçon {n}', other: 'Les {count} mots de la leçon {n}' },
    noWords: 'La dernière leçon n’a pas encore de mots.',
    level: 'Niveau',
    count: 'Questions',
    pickSomething: 'Choisissez la grammaire, les mots ou les deux.',
    make: 'Créer l’exercice',
    making: {
      one: 'Claude écrit {count} question…',
      other: 'Claude écrit {count} questions…',
    },
    failed: 'Impossible de créer l’exercice. Réessayez.',
    openLast: 'Ouvrir le dernier : {title}',
    progress: 'Question {current} sur {total}',
    translate: 'Traduisez :',
    again: 'Recommencer',
    makeAnother: 'En créer un autre',
    // the button next to a group of words, and the round it makes
    groupButton: 'Exercice',
    groupLabel: 'Exercice sur les mots du groupe « {name} »',
    groupTooltip: '15 questions de Claude sur ces mots',
    groupTooFew: {
      one: 'Pour démarrer un exercice, cochez au moins {count} mot d’une seule langue. Chaque mot doit avoir une traduction.',
      other:
        'Pour démarrer un exercice, cochez au moins {count} mots d’une seule langue. Chaque mot doit avoir une traduction.',
    },
    // one note over a grouped word list when a group has too few ticked words for its Exercise
    groupNote: {
      one: 'Pour démarrer un exercice sur un groupe, cochez au moins {count} mot d’une seule langue. Chaque mot doit avoir une traduction.',
      other:
        'Pour démarrer un exercice sur un groupe, cochez au moins {count} mots d’une seule langue. Chaque mot doit avoir une traduction.',
    },
    groupTitle: 'Exercice : {name}',
  },
  de: {
    title: 'Übung erstellen',
    hint: 'Claude schreibt eine Runde Fragen, die der Schüler gleich hier löst: die Antwort wählen, die Lücke füllen, einen Satz übersetzen. Jede Antwort wird geprüft und erklärt.',
    practise: 'Was geübt wird',
    grammar: 'Grammatik',
    grammarPlaceholder: 'z. B. passé composé mit être',
    words: { one: '{count} Wort aus Lektion {n}', other: 'Die {count} Wörter aus Lektion {n}' },
    noWords: 'Die neueste Lektion hat noch keine Wörter.',
    level: 'Niveau',
    count: 'Fragen',
    pickSomething: 'Wähle Grammatik, die Wörter oder beides.',
    make: 'Übung erstellen',
    making: {
      one: 'Claude schreibt {count} Frage…',
      other: 'Claude schreibt {count} Fragen…',
    },
    failed: 'Die Übung konnte nicht erstellt werden. Versuch es nochmal.',
    openLast: 'Die letzte öffnen: {title}',
    progress: 'Frage {current} von {total}',
    translate: 'Übersetze:',
    again: 'Nochmal machen',
    makeAnother: 'Noch eine erstellen',
    // the button next to a group of words, and the round it makes
    groupButton: 'Übung',
    groupLabel: 'Übung zu den Wörtern der Gruppe „{name}“',
    groupTooltip: '15 Fragen von Claude zu diesen Wörtern',
    groupTooFew: {
      one: 'Wähle für eine Übung mindestens {count} Wort aus einer einzigen Sprache aus. Jedes Wort braucht eine Übersetzung.',
      other:
        'Wähle für eine Übung mindestens {count} Wörter aus einer einzigen Sprache aus. Jedes Wort braucht eine Übersetzung.',
    },
    // one note over a grouped word list when a group has too few ticked words for its Exercise
    groupNote: {
      one: 'Wähle für eine Übung zu einer Gruppe mindestens {count} Wort aus einer einzigen Sprache aus. Jedes Wort braucht eine Übersetzung.',
      other:
        'Wähle für eine Übung zu einer Gruppe mindestens {count} Wörter aus einer einzigen Sprache aus. Jedes Wort braucht eine Übersetzung.',
    },
    groupTitle: 'Übung: {name}',
  },
  es: {
    title: 'Crear un ejercicio',
    hint: 'Claude escribe una ronda de preguntas para que el alumno la haga aquí mismo: elegir la respuesta, rellenar el hueco, traducir una frase. Cada respuesta se corrige y se explica.',
    practise: 'Qué practicar',
    grammar: 'Gramática',
    grammarPlaceholder: 'p. ej., passé composé con être',
    words: {
      one: '{count} palabra de la lección {n}',
      other: 'Las {count} palabras de la lección {n}',
    },
    noWords: 'La lección más reciente aún no tiene palabras.',
    level: 'Nivel',
    count: 'Preguntas',
    pickSomething: 'Elige la gramática, las palabras o ambas cosas.',
    make: 'Crear el ejercicio',
    making: {
      one: 'Claude está escribiendo {count} pregunta…',
      other: 'Claude está escribiendo {count} preguntas…',
    },
    failed: 'No se pudo crear el ejercicio. Inténtalo de nuevo.',
    openLast: 'Abrir el último: {title}',
    progress: 'Pregunta {current} de {total}',
    translate: 'Traduce:',
    again: 'Hacerlo otra vez',
    makeAnother: 'Crear otro',
    // the button next to a group of words, and the round it makes
    groupButton: 'Ejercicio',
    groupLabel: 'Ejercicio con las palabras del grupo «{name}»',
    groupTooltip: '15 preguntas de Claude sobre estas palabras',
    groupTooFew: {
      one: 'Para empezar un ejercicio, marca al menos {count} palabra de un mismo idioma. Cada palabra debe tener una traducción.',
      other:
        'Para empezar un ejercicio, marca al menos {count} palabras de un mismo idioma. Cada palabra debe tener una traducción.',
    },
    // one note over a grouped word list when a group has too few ticked words for its Exercise
    groupNote: {
      one: 'Para empezar un ejercicio sobre un grupo, marca al menos {count} palabra de un mismo idioma. Cada palabra debe tener una traducción.',
      other:
        'Para empezar un ejercicio sobre un grupo, marca al menos {count} palabras de un mismo idioma. Cada palabra debe tener una traducción.',
    },
    groupTitle: 'Ejercicio: {name}',
  },
  pt: {
    title: 'Criar um exercício',
    hint: 'O Claude escreve uma ronda de perguntas para o aluno fazer aqui mesmo: escolher a resposta, preencher o espaço, traduzir uma frase. Cada resposta é verificada e explicada.',
    practise: 'O que praticar',
    grammar: 'Gramática',
    grammarPlaceholder: 'p. ex., passé composé com être',
    words: {
      one: '{count} palavra da lição {n}',
      other: 'As {count} palavras da lição {n}',
    },
    noWords: 'A lição mais recente ainda não tem palavras.',
    level: 'Nível',
    count: 'Perguntas',
    pickSomething: 'Escolha a gramática, as palavras ou as duas coisas.',
    make: 'Criar o exercício',
    making: {
      one: 'O Claude está a escrever {count} pergunta…',
      other: 'O Claude está a escrever {count} perguntas…',
    },
    failed: 'Não foi possível criar o exercício. Tente de novo.',
    openLast: 'Abrir o último: {title}',
    progress: 'Pergunta {current} de {total}',
    translate: 'Traduza:',
    again: 'Fazer outra vez',
    makeAnother: 'Criar outro',
    // the button next to a group of words, and the round it makes
    groupButton: 'Exercício',
    groupLabel: 'Exercício com as palavras do grupo «{name}»',
    groupTooltip: '15 perguntas do Claude sobre estas palavras',
    groupTooFew: {
      one: 'Para começar um exercício, marque pelo menos {count} palavra de uma só língua. Cada palavra deve ter uma tradução.',
      other:
        'Para começar um exercício, marque pelo menos {count} palavras de uma só língua. Cada palavra deve ter uma tradução.',
    },
    // one note over a grouped word list when a group has too few ticked words for its Exercise
    groupNote: {
      one: 'Para começar um exercício sobre um grupo, marque pelo menos {count} palavra de uma só língua. Cada palavra deve ter uma tradução.',
      other:
        'Para começar um exercício sobre um grupo, marque pelo menos {count} palavras de uma só língua. Cada palavra deve ter uma tradução.',
    },
    groupTitle: 'Exercício: {name}',
  },
  it: {
    title: 'Crea un esercizio',
    hint: 'Claude scrive un giro di domande che lo studente fa direttamente qui: scegliere la risposta, riempire lo spazio vuoto, tradurre una frase. Ogni risposta viene controllata e spiegata.',
    practise: 'Su cosa esercitarsi',
    grammar: 'Grammatica',
    grammarPlaceholder: 'es. passé composé con être',
    words: {
      one: '{count} parola della lezione {n}',
      other: 'Le {count} parole della lezione {n}',
    },
    noWords: 'L’ultima lezione non ha ancora parole.',
    level: 'Livello',
    count: 'Domande',
    pickSomething: 'Scegli la grammatica, le parole o entrambe.',
    make: 'Crea l’esercizio',
    making: {
      one: 'Claude sta scrivendo {count} domanda…',
      other: 'Claude sta scrivendo {count} domande…',
    },
    failed: 'Impossibile creare l’esercizio. Riprova.',
    openLast: 'Apri l’ultimo: {title}',
    progress: 'Domanda {current} di {total}',
    translate: 'Traduci:',
    again: 'Rifallo',
    makeAnother: 'Creane un altro',
    // the button next to a group of words, and the round it makes
    groupButton: 'Esercizio',
    groupLabel: 'Esercizio sulle parole del gruppo «{name}»',
    groupTooltip: '15 domande di Claude su queste parole',
    groupTooFew: {
      one: 'Per iniziare un esercizio, spunta almeno {count} parola in una sola lingua. Ogni parola deve avere una traduzione.',
      other:
        'Per iniziare un esercizio, spunta almeno {count} parole in una sola lingua. Ogni parola deve avere una traduzione.',
    },
    // one note over a grouped word list when a group has too few ticked words for its Exercise
    groupNote: {
      one: 'Per iniziare un esercizio su un gruppo, spunta almeno {count} parola in una sola lingua. Ogni parola deve avere una traduzione.',
      other:
        'Per iniziare un esercizio su un gruppo, spunta almeno {count} parole in una sola lingua. Ogni parola deve avere una traduzione.',
    },
    groupTitle: 'Esercizio: {name}',
  },
});
