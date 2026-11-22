// A written homework answer as Claude checked it.
export interface WritingCheck {
  corrected: string;
  mistakes: { wrong: string; right: string; why: string }[];
  comment: string;
}

// A written homework answer, kept on the device: the draft, and the last check of it.
export interface Writing {
  task: string;
  text: string;
  check?: WritingCheck;
  // the text that check was made on, to tell when it was edited since
  checkedText?: string;
  checkedAt?: number;
}
