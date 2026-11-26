import { type FocusEvent, type KeyboardEvent, useId, useState } from 'react';

// Keyboard focus moves independently of selection, so reading a tab label never starts loading it.
export function useTabs(selected: string) {
  const id = useId();
  const [focused, setFocused] = useState<string | null>(null);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    );
    const index = tabs.findIndex((tab) => tab === event.target);
    if (index === -1) return;

    let target: HTMLButtonElement | undefined;
    switch (event.key) {
      case 'ArrowLeft':
        target = tabs[(index + tabs.length - 1) % tabs.length];
        break;
      case 'ArrowRight':
        target = tabs[(index + 1) % tabs.length];
        break;
      case 'Home':
        target = tabs[0];
        break;
      case 'End':
        target = tabs.at(-1);
        break;
    }
    if (!target) return;
    event.preventDefault();
    target.focus();
  }

  return {
    tabListProps: {
      role: 'tablist',
      onKeyDown,
      onBlur: (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null);
      },
    },
    tabProps: (key: string) => ({
      role: 'tab',
      id: `${id}-tab-${key}`,
      'aria-controls': `${id}-panel-${key}`,
      'aria-selected': key === selected,
      tabIndex: key === (focused ?? selected) ? 0 : -1,
      onFocus: () => setFocused(key),
    }),
    panelProps: (key: string) => ({
      role: 'tabpanel',
      id: `${id}-panel-${key}`,
      'aria-labelledby': `${id}-tab-${key}`,
      hidden: key !== selected,
      tabIndex: 0,
    }),
  };
}
