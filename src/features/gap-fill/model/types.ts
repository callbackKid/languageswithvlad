export interface GapItem {
  before: string;
  after: string;
  answer: string;
  word: string;
  ru: string;
  choices: string[];
  // why the answer is right, for grammar practice; "" when not given
  why: string;
}
