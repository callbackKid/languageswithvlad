import type { ReactNode } from 'react';

import { type GuideId } from '@/shared/config';

import HelpLink from './HelpLink';

/** A page's title and intro; with a guide, a "?" beside the title opens its Tutorial card. aside
    sits on the right of them on a wide screen and under them on a phone (lesson mode's call). */
export default function PageHead({
  title,
  guide,
  aside,
  children,
}: {
  title: string;
  guide?: GuideId;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const heading = (
    <>
      <div className="title-row">
        <h1>{title}</h1>
        {guide && <HelpLink guide={guide} />}
      </div>
      {children && <p>{children}</p>}
    </>
  );
  return (
    <section className={'page-head' + (aside ? ' with-aside' : '')}>
      {aside ? (
        <>
          <div className="page-head-text">{heading}</div>
          <div className="page-head-aside">{aside}</div>
        </>
      ) : (
        heading
      )}
    </section>
  );
}
