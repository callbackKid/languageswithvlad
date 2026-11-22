import type { ReactNode } from 'react';

import { type GuideId } from '@/shared/config/guides';

import HelpLink from './HelpLink';

// A page's title and intro; with a guide, a "?" beside the title opens its Tutorial card.
export default function PageHead({
  title,
  guide,
  children,
}: {
  title: string;
  guide?: GuideId;
  children?: ReactNode;
}) {
  return (
    <section className="page-head">
      <div className="title-row">
        <h1>{title}</h1>
        {guide && <HelpLink guide={guide} />}
      </div>
      {children && <p>{children}</p>}
    </section>
  );
}
