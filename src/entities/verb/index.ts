// The public API of entities/verb: everything outside the slice imports from here.
export { negate } from './lib/negation';
export { knownTenses, tensesForLevel } from './lib/tenses';
export { sortVerbs, VERB_SORTS, verbGroup, type VerbSort } from './lib/verbGroups';
export { type Conjugation, type Form, type VerbRef } from './model/types';
export { default as ConjugationTable } from './ui/ConjugationTable';
