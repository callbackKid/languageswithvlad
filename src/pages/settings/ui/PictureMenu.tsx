import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/shared/i18n';
import { Button, IconButton } from '@/shared/ui/controls';

import { settingsText } from '../i18n/settings';
import styles from './Settings.module.css';

/** The profile picture with a pencil on its corner. With a picture, the pencil opens a menu
    (upload another, remove it); without one, it opens the file picker straight away. */
export default function PictureMenu({
  children,
  hasPicture,
  onFile,
  onRemove,
}: {
  // the picture itself
  children: ReactNode;
  hasPicture: boolean;
  onFile: (file: File) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation(settingsText);
  const [isOpen, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const pencil = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    pencil.current?.focus();
  }

  // while open: focus its first item, and close on a click anywhere outside
  useEffect(() => {
    if (!isOpen) return;
    menu.current?.querySelector('button')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !wrapper.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isOpen]);

  // ↑ and ↓ move between the items, Escape closes the menu
  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = [...(menu.current?.querySelectorAll('button') ?? [])];
    const current = items.findIndex((item) => item === document.activeElement);
    const step = event.key === 'ArrowDown' ? 1 : -1;
    items[(current + step + items.length) % items.length]?.focus();
  }

  function choose(action: () => void) {
    close();
    action();
  }

  return (
    <div className={styles.picture} ref={wrapper}>
      {children}
      <IconButton
        ref={pencil}
        className={styles['picture-edit']}
        label={t('editPicture')}
        aria-haspopup={hasPicture ? 'menu' : undefined}
        aria-expanded={hasPicture ? isOpen : undefined}
        onClick={() => (hasPicture ? setOpen((previous) => !previous) : input.current?.click())}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </IconButton>
      {isOpen && (
        <div className={styles['picture-menu']} role="menu" ref={menu} onKeyDown={onMenuKey}>
          <Button
            variant="unstyled"
            role="menuitem"
            onClick={() => choose(() => input.current?.click())}
          >
            {t('uploadPicture')}
          </Button>
          <Button variant="unstyled" role="menuitem" onClick={() => choose(onRemove)}>
            {t('removePicture')}
          </Button>
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          // emptied, so choosing the same file again still counts as a change
          event.target.value = '';
          if (file) onFile(file);
        }}
      />
    </div>
  );
}
