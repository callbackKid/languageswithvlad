import type { UiLanguage } from '../i18n/core';
import type { Language } from './types';

/** A short fact or expression shown while Claude is working: the phrase in the language being learned, then a note in the interface language. */
export interface Fact {
  phrase: string;
  note: Record<UiLanguage, string>;
}

export const FACTS: Record<Language, Fact[]> = {
  fr: [
    {
      phrase: 'quatre-vingts = 4 × 20',
      note: {
        en: 'French counts 80 as “four twenties” and 90 as “four twenties ten”: quatre-vingt-dix.',
        ru: 'Во французском 80 — это «четыре двадцать», а 90 — «четыре двадцать десять»: quatre-vingt-dix.',
        fr: 'En français, 80 se dit « quatre fois vingt » et 90 « quatre-vingt-dix ».',
        de: 'Im Französischen ist 80 „vier Zwanziger“ und 90 „vier Zwanziger zehn“: quatre-vingt-dix.',
      },
    },
    {
      phrase: 'septante, nonante',
      note: {
        en: 'In Belgium and Switzerland 70 and 90 are simply septante and nonante. Parts of Switzerland also say huitante for 80.',
        ru: 'В Бельгии и Швейцарии 70 и 90 — просто septante и nonante. В части Швейцарии и 80 — huitante.',
        fr: 'En Belgique et en Suisse, on dit simplement septante et nonante. Dans une partie de la Suisse, on dit aussi huitante pour 80.',
        de: 'In Belgien und der Schweiz heißen 70 und 90 einfach septante und nonante. In Teilen der Schweiz sagt man auch huitante für 80.',
      },
    },
    {
      phrase: 'forêt, hôpital, île',
      note: {
        en: 'The circumflex often marks an s that disappeared long ago: compare forest, hospital, isle.',
        ru: 'Циркумфлекс часто стоит на месте давно исчезнувшей s: сравните с английскими forest, hospital, isle.',
        fr: 'L’accent circonflexe remplace souvent un s disparu depuis longtemps : comparez avec l’anglais forest, hospital, isle.',
        de: 'Der Zirkumflex steht oft für ein längst verschwundenes s: vergleiche englisch forest, hospital, isle.',
      },
    },
    {
      phrase: 'il y a deux jours',
      note: {
        en: '“Il y a” means both “there is” and “ago”: il y a deux jours — two days ago.',
        ru: '«Il y a» значит и «есть, имеется», и «назад»: il y a deux jours — два дня назад.',
        fr: '« Il y a » sert à dire ce qui existe, mais aussi à situer dans le passé : il y a deux jours.',
        de: '„Il y a“ heißt sowohl „es gibt“ als auch „vor“: il y a deux jours — vor zwei Tagen.',
      },
    },
    {
      phrase: 'la mer, la mère, le maire',
      note: {
        en: 'Sea, mother and mayor all sound the same. Context and the article tell them apart.',
        ru: 'Море, мать и мэр звучат одинаково. Различить их помогают контекст и артикль.',
        fr: 'Ces trois mots se prononcent pareil. Le contexte et l’article font la différence.',
        de: 'Meer, Mutter und Bürgermeister klingen gleich. Kontext und Artikel unterscheiden sie.',
      },
    },
    {
      phrase: 'Je sais pas.',
      note: {
        en: 'In everyday speech the “ne” of a negation is usually dropped: je sais pas instead of je ne sais pas.',
        ru: 'В разговорной речи «ne» в отрицании обычно опускают: je sais pas вместо je ne sais pas.',
        fr: 'À l’oral, on laisse souvent tomber le « ne » de la négation : je sais pas au lieu de je ne sais pas.',
        de: 'Im Alltag fällt das „ne“ der Verneinung meist weg: je sais pas statt je ne sais pas.',
      },
    },
    {
      phrase: 'les‿amis [lezami]',
      note: {
        en: 'Liaison: a silent final consonant is pronounced when the next word starts with a vowel.',
        ru: 'Связывание (liaison): немая конечная согласная произносится, если следующее слово начинается с гласной.',
        fr: 'La liaison : une consonne finale muette se prononce quand le mot suivant commence par une voyelle.',
        de: 'Liaison: Ein stummer Endkonsonant wird gesprochen, wenn das nächste Wort mit einem Vokal beginnt.',
      },
    },
    {
      phrase: 'lundi, mardi, mercredi',
      note: {
        en: 'Most weekdays come from Roman names: the Moon, Mars, Mercury, Jupiter (jeudi), Venus (vendredi).',
        ru: 'Большинство дней недели названы по-римски: Луна, Марс, Меркурий, Юпитер (jeudi), Венера (vendredi).',
        fr: 'La plupart des jours viennent des noms romains : la Lune, Mars, Mercure, Jupiter (jeudi), Vénus (vendredi).',
        de: 'Die meisten Wochentage gehen auf römische Namen zurück: Mond, Mars, Merkur, Jupiter (jeudi), Venus (vendredi).',
      },
    },
    {
      phrase: 'пляж, шофёр, тротуар, абажур',
      note: {
        en: 'Russian took these from French: plage, chauffeur, trottoir, abat-jour.',
        ru: 'Эти слова пришли в русский из французского: plage, chauffeur, trottoir, abat-jour.',
        fr: 'Le russe a emprunté ces mots au français : plage, chauffeur, trottoir, abat-jour.',
        de: 'Das Russische hat diese Wörter aus dem Französischen: plage, chauffeur, trottoir, abat-jour.',
      },
    },
    {
      phrase: 'bistro ≠ быстро',
      note: {
        en: 'The story that bistro comes from Russian “быстро”, shouted by Cossacks in Paris in 1814, is a popular legend; linguists doubt it.',
        ru: 'История о том, что bistro происходит от «быстро» казаков в Париже 1814 года, — популярная легенда; лингвисты в ней сомневаются.',
        fr: 'L’idée que bistro viendrait du russe « bystro », crié par les cosaques à Paris en 1814, est une légende ; les linguistes en doutent.',
        de: 'Dass bistro vom russischen „bystro“ der Kosaken in Paris 1814 kommt, ist eine beliebte Legende; Sprachforscher bezweifeln sie.',
      },
    },
    {
      phrase: 'Il pleut des cordes.',
      note: {
        en: '“It’s raining ropes”: it’s pouring.',
        ru: '«Идёт дождь из верёвок»: льёт как из ведра.',
        fr: 'Il pleut très fort.',
        de: '„Es regnet Seile“: Es gießt in Strömen.',
      },
    },
    {
      phrase: 'avoir le cafard',
      note: {
        en: '“To have the cockroach”: to feel down, to have the blues.',
        ru: '«Иметь таракана»: хандрить, грустить.',
        fr: 'Avoir des idées noires, être déprimé.',
        de: '„Die Kakerlake haben“: niedergeschlagen sein, den Blues haben.',
      },
    },
    {
      phrase: 'poser un lapin',
      note: {
        en: '“To put down a rabbit”: to stand someone up.',
        ru: '«Положить кролика»: не прийти на встречу.',
        fr: 'Ne pas venir à un rendez-vous sans prévenir.',
        de: '„Ein Kaninchen hinlegen“: jemanden versetzen.',
      },
    },
    {
      phrase: 'coûter les yeux de la tête',
      note: {
        en: '“To cost the eyes of the head”: to cost an arm and a leg.',
        ru: '«Стоить глаз с головы»: стоить бешеных денег.',
        fr: 'Coûter très cher.',
        de: '„Die Augen aus dem Kopf kosten“: ein Vermögen kosten.',
      },
    },
    {
      phrase: 'avoir faim, avoir soif',
      note: {
        en: 'French “has” hunger and thirst: j’ai faim — I’m hungry. Same with avoir froid, avoir peur, avoir 20 ans.',
        ru: 'По-французски голод и жажду «имеют»: j’ai faim — я голоден. Так же avoir froid, avoir peur, avoir 20 ans.',
        fr: 'On « a » faim et soif, mais aussi froid, peur ou 20 ans : tout cela se dit avec avoir.',
        de: 'Auf Französisch „hat“ man Hunger und Durst, wie im Deutschen — aber auch avoir froid (kalt sein) und avoir 20 ans (20 sein).',
      },
    },
    {
      phrase: 'pain au chocolat / chocolatine',
      note: {
        en: 'The same pastry: most of France says pain au chocolat, the south-west says chocolatine.',
        ru: 'Это одна и та же булочка: почти вся Франция говорит pain au chocolat, а юго-запад — chocolatine.',
        fr: 'La même viennoiserie : on dit pain au chocolat presque partout, chocolatine dans le Sud-Ouest.',
        de: 'Dasselbe Gebäck: Fast ganz Frankreich sagt pain au chocolat, der Südwesten chocolatine.',
      },
    },
    {
      phrase: 'la fin de semaine',
      note: {
        en: 'France says le week-end; Quebec prefers the French-made la fin de semaine.',
        ru: 'Во Франции говорят le week-end, а в Квебеке предпочитают французское la fin de semaine.',
        fr: 'En France, on dit le week-end ; au Québec, on préfère la fin de semaine.',
        de: 'Frankreich sagt le week-end, Québec bevorzugt das französische la fin de semaine.',
      },
    },
    {
      phrase: 'tu / vous',
      note: {
        en: 'Vous is for strangers, elders and work; tu for friends, family and children. When unsure, start with vous.',
        ru: 'Vous — незнакомым, старшим и на работе; tu — друзьям, семье и детям. Если сомневаетесь, начинайте с vous.',
        fr: 'Vous pour les inconnus, les aînés et le travail ; tu pour les amis, la famille et les enfants. Dans le doute, vous.',
        de: 'Vous wie „Sie“: für Fremde, Ältere und die Arbeit; tu wie „du“. Im Zweifel mit vous anfangen.',
      },
    },
    {
      phrase: 'l’Académie française, 1635',
      note: {
        en: 'Founded by Cardinal Richelieu to look after the French language; its members are called “les Immortels”.',
        ru: 'Основана кардиналом Ришельё, чтобы заботиться о французском языке; её членов называют «бессмертными».',
        fr: 'Fondée par le cardinal de Richelieu pour veiller sur la langue ; ses membres sont « les Immortels ».',
        de: 'Von Kardinal Richelieu gegründet, um die französische Sprache zu pflegen; ihre Mitglieder heißen „les Immortels“.',
      },
    },
    {
      phrase: 'un œuf, un cœur',
      note: {
        en: 'œ is the letters o and e joined together; it is part of French spelling, not a decoration.',
        ru: 'œ — это слитые буквы o и e; это часть французской орфографии, а не украшение.',
        fr: 'Le œ, c’est le o et le e liés : il fait partie de l’orthographe, ce n’est pas une fantaisie.',
        de: 'œ sind die Buchstaben o und e zusammengezogen; es gehört zur Rechtschreibung, ist keine Verzierung.',
      },
    },
    {
      phrase: 'Ça va ? — Ça va.',
      note: {
        en: 'The same two words ask “how are you?” and answer “fine”. Only the intonation changes.',
        ru: 'Одни и те же два слова и спрашивают «как дела?», и отвечают «нормально». Меняется только интонация.',
        fr: 'Les deux mêmes mots servent à demander et à répondre. Seule l’intonation change.',
        de: 'Dieselben zwei Wörter fragen „Wie geht’s?“ und antworten „Gut“. Nur die Betonung ändert sich.',
      },
    },
    {
      phrase: 'merci',
      note: {
        en: 'Merci first meant “mercy” or “grace”; the meaning “thank you” came later.',
        ru: 'Сначала merci значило «милость, пощада»; значение «спасибо» появилось позже.',
        fr: 'Merci voulait d’abord dire « grâce, pitié » ; le sens de remerciement est venu plus tard.',
        de: 'Merci bedeutete zuerst „Gnade“; die Bedeutung „danke“ kam später.',
      },
    },
    {
      phrase: 'un oignon [ɔɲɔ̃]',
      note: {
        en: 'The i in oignon is silent; since the 1990 spelling reform ognon is also correct.',
        ru: 'Буква i в oignon не читается; с орфографической реформы 1990 года можно писать и ognon.',
        fr: 'Le i d’oignon ne se prononce pas ; depuis les rectifications de 1990, ognon est aussi correct.',
        de: 'Das i in oignon ist stumm; seit der Rechtschreibreform von 1990 ist auch ognon richtig.',
      },
    },
    {
      phrase: 'Bonsoir !',
      note: {
        en: 'Bonsoir greets someone in the evening; bonne soirée and bonne nuit are said when leaving or going to bed.',
        ru: 'Bonsoir — приветствие вечером; bonne soirée и bonne nuit говорят на прощание или перед сном.',
        fr: 'Bonsoir pour saluer le soir ; bonne soirée et bonne nuit pour prendre congé ou aller se coucher.',
        de: 'Bonsoir begrüßt am Abend; bonne soirée und bonne nuit sagt man beim Abschied oder vor dem Schlafen.',
      },
    },
  ],
  en: [
    {
      phrase: 'knight, knee, know',
      note: {
        en: 'The k used to be pronounced; it went silent a few hundred years ago, but the spelling stayed.',
        ru: 'Когда-то k произносилась; она замолчала несколько веков назад, а написание осталось.',
        fr: 'Le k se prononçait autrefois ; il est devenu muet il y a quelques siècles, mais l’orthographe est restée.',
        de: 'Das k wurde früher gesprochen; es verstummte vor einigen Jahrhunderten, die Schreibung blieb.',
      },
    },
    {
      phrase: 'beef, pork, mutton',
      note: {
        en: 'Meat words came from French after 1066 (bœuf, porc, mouton), while the animals kept their English names: cow, pig, sheep.',
        ru: 'Названия мяса пришли из французского после 1066 года (bœuf, porc, mouton), а животные сохранили английские имена: cow, pig, sheep.',
        fr: 'Les noms des viandes viennent du français après 1066 (bœuf, porc, mouton) ; les animaux ont gardé leurs noms anglais : cow, pig, sheep.',
        de: 'Die Fleischwörter kamen nach 1066 aus dem Französischen (bœuf, porc, mouton); die Tiere behielten englische Namen: cow, pig, sheep.',
      },
    },
    {
      phrase: 'I am / I’m',
      note: {
        en: 'Contractions are normal in speech and friendly writing; full forms sound more formal.',
        ru: 'Сокращения — норма в речи и в дружеской переписке; полные формы звучат официальнее.',
        fr: 'Les contractions sont normales à l’oral et à l’écrit familier ; les formes pleines sont plus formelles.',
        de: 'Kurzformen sind beim Sprechen und in lockeren Texten normal; Langformen klingen förmlicher.',
      },
    },
    {
      phrase: 'It’s raining cats and dogs.',
      note: {
        en: 'It’s pouring. Nobody knows for sure where the expression comes from.',
        ru: '«Льёт кошками и собаками»: льёт как из ведра. Откуда выражение — точно никто не знает.',
        fr: '« Il pleut des chats et des chiens » : il pleut des cordes. Personne ne sait vraiment d’où vient l’expression.',
        de: '„Es regnet Katzen und Hunde“: Es schüttet. Woher der Ausdruck kommt, weiß niemand genau.',
      },
    },
    {
      phrase: 'read [riːd] / read [rɛd]',
      note: {
        en: 'Same spelling, two pronunciations: present “I read” sounds like reed, past “I read” like red.',
        ru: 'Одно написание — два произношения: в настоящем времени read звучит как «рид», в прошедшем — как «ред».',
        fr: 'Même orthographe, deux prononciations : au présent « rid », au passé « rèd ».',
        de: 'Gleiche Schreibung, zwei Aussprachen: im Präsens wie „ried“, in der Vergangenheit wie „red“.',
      },
    },
    {
      phrase: 'a piece of cake',
      note: {
        en: 'Something very easy.',
        ru: '«Кусок торта»: проще простого.',
        fr: '« Un morceau de gâteau » : c’est du gâteau, très facile.',
        de: '„Ein Stück Kuchen“: ein Kinderspiel.',
      },
    },
    {
      phrase: 'You’re welcome.',
      note: {
        en: 'The usual answer to “thank you”; “no problem” and “sure” are more casual.',
        ru: 'Обычный ответ на «спасибо»; «no problem» и «sure» — более разговорные.',
        fr: 'La réponse habituelle à « merci » ; « no problem » et « sure » sont plus familiers.',
        de: 'Die übliche Antwort auf „danke“; „no problem“ und „sure“ sind lockerer.',
      },
    },
  ],
  de: [
    {
      phrase: 'die Sonne, der Mond',
      note: {
        en: 'In German the sun is feminine and the moon masculine — the other way round from French: le soleil, la lune.',
        ru: 'В немецком солнце женского рода, а луна мужского — наоборот, чем во французском: le soleil, la lune.',
        fr: 'En allemand, le soleil est féminin et la lune masculine : l’inverse du français.',
        de: 'Im Deutschen ist die Sonne weiblich und der Mond männlich — umgekehrt als im Französischen: le soleil, la lune.',
      },
    },
    {
      phrase: 'das Mädchen',
      note: {
        en: '“Girl” is neuter, because every noun ending in -chen is neuter: das Mädchen, das Brötchen.',
        ru: '«Девочка» среднего рода, потому что все существительные на -chen среднего рода: das Mädchen, das Brötchen.',
        fr: '« Fille » est neutre, car tous les noms en -chen sont neutres : das Mädchen, das Brötchen.',
        de: '„Mädchen“ ist sächlich, weil alle Nomen auf -chen sächlich sind: das Mädchen, das Brötchen.',
      },
    },
    {
      phrase: 'der Tisch, die Freiheit',
      note: {
        en: 'Every noun is written with a capital letter, not only names.',
        ru: 'Все существительные пишутся с заглавной буквы, не только имена.',
        fr: 'Tous les noms prennent une majuscule, pas seulement les noms propres.',
        de: 'Alle Nomen werden großgeschrieben, nicht nur Namen.',
      },
    },
    {
      phrase: 'einundzwanzig',
      note: {
        en: '21 is “one-and-twenty”: the ones come before the tens, so 48 is achtundvierzig.',
        ru: '21 — это «один-и-двадцать»: единицы идут перед десятками, поэтому 48 — achtundvierzig.',
        fr: '21 se dit « un-et-vingt » : les unités avant les dizaines, donc 48 = achtundvierzig.',
        de: 'Bei Zahlen kommen die Einer vor den Zehnern: 21 ist einundzwanzig, 48 achtundvierzig.',
      },
    },
    {
      phrase: 'die Schifffahrt',
      note: {
        en: 'German glues words together: Schiff + Fahrt. Since the 1996 spelling reform all three f’s are kept.',
        ru: 'Немецкий склеивает слова: Schiff + Fahrt. С реформы 1996 года все три f сохраняются.',
        fr: 'L’allemand colle les mots : Schiff + Fahrt. Depuis la réforme de 1996, on garde les trois f.',
        de: 'Deutsch setzt Wörter zusammen: Schiff + Fahrt. Seit der Rechtschreibreform 1996 bleiben alle drei f.',
      },
    },
    {
      phrase: 'ß',
      note: {
        en: 'The Eszett is read as a sharp s: die Straße. Switzerland doesn’t use it and writes ss; a capital ẞ has been official since 2017.',
        ru: 'Эсцет читается как глухое s: die Straße. В Швейцарии его не используют и пишут ss; заглавная ẞ официальна с 2017 года.',
        fr: 'L’Eszett se lit comme un s dur : die Straße. La Suisse ne l’utilise pas et écrit ss ; la majuscule ẞ est officielle depuis 2017.',
        de: 'Das Eszett ist ein scharfes s: die Straße. Die Schweiz schreibt stattdessen ss; das große ẞ ist seit 2017 offiziell.',
      },
    },
    {
      phrase: 'du / Sie',
      note: {
        en: 'Sie with a capital S is the polite “you”; du is for friends, family and children.',
        ru: 'Sie с заглавной буквы — вежливое «вы»; du — для друзей, семьи и детей.',
        fr: 'Sie avec une majuscule, c’est le vouvoiement ; du, le tutoiement.',
        de: 'Sie mit großem S ist die höfliche Anrede; du sagt man zu Freunden, Familie und Kindern.',
      },
    },
    {
      phrase: 'бутерброд, рюкзак, шлагбаум',
      note: {
        en: 'Russian took these from German: Butterbrot, Rucksack, Schlagbaum. Парикмахер comes from Perückenmacher, “wig maker”.',
        ru: 'Эти слова пришли в русский из немецкого: Butterbrot, Rucksack, Schlagbaum. А «парикмахер» — от Perückenmacher, «мастер париков».',
        fr: 'Le russe a pris ces mots à l’allemand : Butterbrot, Rucksack, Schlagbaum. « Coiffeur » vient de Perückenmacher, « fabricant de perruques ».',
        de: 'Das Russische hat diese Wörter aus dem Deutschen: Butterbrot, Rucksack, Schlagbaum. „Friseur“ heißt dort парикмахер, von Perückenmacher.',
      },
    },
    {
      phrase: 'Ich habe Hunger.',
      note: {
        en: 'Like French avoir faim, German “has” hunger and thirst: ich habe Durst — I’m thirsty.',
        ru: 'Как во французском avoir faim, по-немецки голод и жажду «имеют»: ich habe Durst — я хочу пить.',
        fr: 'Comme avoir faim en français : ich habe Hunger, ich habe Durst.',
        de: 'Wie im Französischen avoir faim „hat“ man Hunger und Durst.',
      },
    },
    {
      phrase: 'Ich verstehe nur Bahnhof.',
      note: {
        en: '“I only understand ‘train station’”: I don’t understand a thing.',
        ru: '«Понимаю только „вокзал“»: ничего не понимаю.',
        fr: '« Je ne comprends que gare » : je n’y comprends rien.',
        de: 'Man versteht gar nichts.',
      },
    },
    {
      phrase: 'Tomaten auf den Augen haben',
      note: {
        en: '“To have tomatoes on your eyes”: not to notice something obvious.',
        ru: '«Помидоры на глазах»: не замечать очевидного.',
        fr: '« Avoir des tomates sur les yeux » : ne pas voir l’évidence.',
        de: 'Etwas Offensichtliches nicht bemerken.',
      },
    },
    {
      phrase: 'Das ist mir Wurst.',
      note: {
        en: '“That’s sausage to me”: I don’t care.',
        ru: '«Мне это колбаса»: мне всё равно.',
        fr: '« C’est de la saucisse pour moi » : ça m’est égal.',
        de: 'Das ist mir egal.',
      },
    },
    {
      phrase: 'Schadenfreude',
      note: {
        en: 'Joy at someone else’s bad luck. English borrowed the word as it is.',
        ru: 'Радость от чужой неудачи. Английский взял это слово без изменений.',
        fr: 'La joie devant le malheur des autres. L’anglais a emprunté le mot tel quel.',
        de: 'Die Freude über das Pech anderer. Das Englische hat das Wort unverändert übernommen.',
      },
    },
    {
      phrase: 'Guten Tag / Grüß Gott / Grüezi',
      note: {
        en: 'The same “hello”: most of Germany says Guten Tag, the south and Austria Grüß Gott, Switzerland Grüezi.',
        ru: 'Одно и то же «здравствуйте»: почти вся Германия говорит Guten Tag, юг и Австрия — Grüß Gott, Швейцария — Grüezi.',
        fr: 'Le même « bonjour » : Guten Tag dans presque toute l’Allemagne, Grüß Gott dans le sud et en Autriche, Grüezi en Suisse.',
        de: 'Dasselbe „Hallo“: In den meisten Teilen Deutschlands Guten Tag, im Süden und in Österreich Grüß Gott, in der Schweiz Grüezi.',
      },
    },
  ],
};
