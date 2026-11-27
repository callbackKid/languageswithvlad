import type { ReactNode } from 'react';

import { type GuideId } from '@/shared/config';

import HelpLink from './HelpLink';

/** A page's title and intro; with a guide, a "?" beside the title opens its Tutorial card. aside
    sits on the right of them on a wide screen and under them on a phone (lesson mode's call). */
const PageHead = ({
  title,
  guide,
  aside,
  children,
}: {
  title: string;
  guide?: GuideId;
  aside?: ReactNode;
  children?: ReactNode;
}) => {
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
    <section className={styles['page-head'] + (aside ? ` ${styles['with-aside']}` : '')}>
      {aside ? (
        <>
          <div className={styles['page-head-text']}>{heading}</div>
          <div className={styles['page-head-aside']}>{aside}</div>
        </>
      ) : (
        heading
      )}
    </section>
  );
};

export default PageHead;
import styles from './PageHead.module.css';
