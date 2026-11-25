import { homeworkItems, sameTask } from '@/entities/homework';
import { type HomeworkTask } from '@/entities/lesson';

/** The tasks the Homework tab ticks. With a homework block in the lesson text, they are the
    teacher's own items, the list Home and the lesson list's dot count, so a tick there always
    clears them; Claude only adds what each asks (empty when Claude split or worded the task
    otherwise, or hasn't read the lesson). Without a block, Claude's list as before; null while
    there is none yet. */
export function homeworkTasks(
  body: string,
  claudeTasks: HomeworkTask[] | null
): HomeworkTask[] | null {
  const items = homeworkItems(body);
  if (!items.length) return claudeTasks;
  return items.map((task) => ({
    task,
    meaning: claudeTasks?.find((candidate) => sameTask(candidate.task, task))?.meaning ?? '',
  }));
}
