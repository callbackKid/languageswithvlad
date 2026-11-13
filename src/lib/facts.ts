import type { Language } from './types';

/** A short fact or expression shown while Claude is working: the phrase in the language being learned, then a note. */
export interface Fact {
  phrase: string;
  note: string;
}

export const FACTS: Record<Language, Fact[]> = {
  fr: [
    {
      phrase: 'quatre-vingts = 4 × 20',
      note: 'French counts 80 as “four twenties” and 90 as “four twenties ten”: quatre-vingt-dix.',
    },
    {
      phrase: 'septante, nonante',
      note: 'In Belgium and Switzerland 70 and 90 are simply septante and nonante. Parts of Switzerland also say huitante for 80.',
    },
    {
      phrase: 'forêt, hôpital, île',
      note: 'The circumflex often marks an s that disappeared long ago: compare forest, hospital, isle.',
    },
    {
      phrase: 'il y a deux jours',
      note: '“Il y a” means both “there is” and “ago”: il y a deux jours — two days ago.',
    },
    {
      phrase: 'la mer, la mère, le maire',
      note: 'Sea, mother and mayor all sound the same. Context and the article tell them apart.',
    },
    {
      phrase: 'Je sais pas.',
      note: 'In everyday speech the “ne” of a negation is usually dropped: je sais pas instead of je ne sais pas.',
    },
    {
      phrase: 'les‿amis [lezami]',
      note: 'Liaison: a silent final consonant is pronounced when the next word starts with a vowel.',
    },
    {
      phrase: 'lundi, mardi, mercredi',
      note: 'Most weekdays come from Roman names: the Moon, Mars, Mercury, Jupiter (jeudi), Venus (vendredi).',
    },
    {
      phrase: 'пляж, шофёр, тротуар, абажур',
      note: 'Russian took these from French: plage, chauffeur, trottoir, abat-jour.',
    },
    {
      phrase: 'bistro ≠ быстро',
      note: 'The story that bistro comes from Russian “быстро”, shouted by Cossacks in Paris in 1814, is a popular legend; linguists doubt it.',
    },
    {
      phrase: 'Il pleut des cordes.',
      note: '“It’s raining ropes”: it’s pouring.',
    },
    {
      phrase: 'avoir le cafard',
      note: '“To have the cockroach”: to feel down, to have the blues.',
    },
    {
      phrase: 'poser un lapin',
      note: '“To put down a rabbit”: to stand someone up.',
    },
    {
      phrase: 'coûter les yeux de la tête',
      note: '“To cost the eyes of the head”: to cost an arm and a leg.',
    },
    {
      phrase: 'avoir faim, avoir soif',
      note: 'French “has” hunger and thirst: j’ai faim — I’m hungry. Same with avoir froid, avoir peur, avoir 20 ans.',
    },
    {
      phrase: 'pain au chocolat / chocolatine',
      note: 'The same pastry: most of France says pain au chocolat, the south-west says chocolatine.',
    },
    {
      phrase: 'la fin de semaine',
      note: 'France says le week-end; Quebec prefers the French-made la fin de semaine.',
    },
    {
      phrase: 'tu / vous',
      note: 'Vous is for strangers, elders and work; tu for friends, family and children. When unsure, start with vous.',
    },
    {
      phrase: 'l’Académie française, 1635',
      note: 'Founded by Cardinal Richelieu to look after the French language; its members are called “les Immortels”.',
    },
    {
      phrase: 'un œuf, un cœur',
      note: 'œ is the letters o and e joined together; it is part of French spelling, not a decoration.',
    },
    {
      phrase: 'Ça va ? — Ça va.',
      note: 'The same two words ask “how are you?” and answer “fine”. Only the intonation changes.',
    },
    {
      phrase: 'merci',
      note: 'Merci first meant “mercy” or “grace”; the meaning “thank you” came later.',
    },
    {
      phrase: 'un oignon [ɔɲɔ̃]',
      note: 'The i in oignon is silent; since the 1990 spelling reform ognon is also correct.',
    },
    {
      phrase: 'Bonsoir !',
      note: 'Bonsoir greets someone in the evening; bonne soirée and bonne nuit are said when leaving or going to bed.',
    },
  ],
  en: [
    {
      phrase: 'knight, knee, know',
      note: 'The k used to be pronounced; it went silent a few hundred years ago, but the spelling stayed.',
    },
    {
      phrase: 'beef, pork, mutton',
      note: 'Meat words came from French after 1066 (bœuf, porc, mouton), while the animals kept their English names: cow, pig, sheep.',
    },
    {
      phrase: 'I am / I’m',
      note: 'Contractions are normal in speech and friendly writing; full forms sound more formal.',
    },
    {
      phrase: 'It’s raining cats and dogs.',
      note: 'It’s pouring. Nobody knows for sure where the expression comes from.',
    },
    {
      phrase: 'read [riːd] / read [rɛd]',
      note: 'Same spelling, two pronunciations: present “I read” sounds like reed, past “I read” like red.',
    },
    {
      phrase: 'a piece of cake',
      note: 'Something very easy.',
    },
    {
      phrase: 'You’re welcome.',
      note: 'The usual answer to “thank you”; “no problem” and “sure” are more casual.',
    },
  ],
};
