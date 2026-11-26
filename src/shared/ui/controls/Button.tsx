import {
  type AriaAttributes,
  type AriaRole,
  type FocusEventHandler,
  forwardRef,
  type MouseEventHandler,
  type ReactNode,
} from 'react';

export interface ButtonProps {
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost' | 'unstyled';
  children?: ReactNode;
  className?: string;
  id?: string;
  lang?: string;
  role?: AriaRole;
  tabIndex?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  'aria-controls'?: string;
  'aria-expanded'?: AriaAttributes['aria-expanded'];
  'aria-haspopup'?: AriaAttributes['aria-haspopup'];
  'aria-label'?: string;
  'aria-pressed'?: AriaAttributes['aria-pressed'];
  'aria-selected'?: AriaAttributes['aria-selected'];
  'data-tooltip'?: string;
}

// Forward the ref to the native button so callers can move keyboard focus to it.
export default forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    type = 'button',
    variant,
    children,
    className,
    id,
    lang,
    role,
    tabIndex,
    autoFocus,
    disabled,
    onClick,
    onFocus,
    'aria-controls': ariaControls,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup,
    'aria-label': ariaLabel,
    'aria-pressed': ariaPressed,
    'aria-selected': ariaSelected,
    'data-tooltip': tooltip,
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type === 'submit' ? 'submit' : 'button'}
      className={
        variant === 'unstyled' ? className : ['btn', variant, className].filter(Boolean).join(' ')
      }
      id={id}
      lang={lang}
      role={role}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
      disabled={disabled}
      onClick={onClick}
      onFocus={onFocus}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-selected={ariaSelected}
      data-tooltip={tooltip}
    >
      {children}
    </button>
  );
});
