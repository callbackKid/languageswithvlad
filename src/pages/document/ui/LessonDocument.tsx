import { type ReactNode } from 'react';

import { app, useTranslation } from '@/shared/i18n';

/** The lesson document itself: a Google Doc opens for editing right here; a Notion page can't be
    shown inside another site, so it gets a link instead. */
const LessonDocument = ({ url, isNotion }: { url: string; isNotion: boolean }) => {
  const { rich } = useTranslation(app);
  const link = (chunk: ReactNode) => (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {chunk}
    </a>
  );

  if (isNotion)
    return (
      <main className="page">
        <p className="empty">{rich('notionDocument', { link })}</p>
      </main>
    );
  return (
    <main className="doc-editor">
      <p className="hint">{rich('editorHint', { link })}</p>
      <iframe title="Google Doc" src={url} allow="clipboard-read; clipboard-write" />
    </main>
  );
};

export default LessonDocument;
