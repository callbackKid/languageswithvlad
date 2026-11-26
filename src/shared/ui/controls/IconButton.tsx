import { forwardRef, type ReactNode } from 'react';

import Button, { type ButtonProps } from './Button';

type IconButtonProps = Pick<
  ButtonProps,
  | 'className'
  | 'disabled'
  | 'onClick'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'aria-pressed'
> & {
  label: string;
  tooltip?: string;
  children: ReactNode;
};

// Keeps icon-only actions named. A caller can supply its own style for compact controls.
export default forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    className = 'icon-button',
    label,
    tooltip = label,
    children,
    disabled,
    onClick,
    'aria-controls': ariaControls,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup,
    'aria-pressed': ariaPressed,
  },
  ref
) {
  return (
    <Button
      ref={ref}
      variant="unstyled"
      className={className}
      disabled={disabled}
      onClick={onClick}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      aria-label={label}
      aria-pressed={ariaPressed}
      data-tooltip={tooltip}
    >
      {children}
    </Button>
  );
});
