import './Textarea.css';

import { type ChangeEventHandler, forwardRef } from 'react';

export interface TextareaProps {
  className?: string;
  id?: string;
  name?: string;
  lang?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  placeholder?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  spellCheck?: boolean;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Forward the ref so callers can focus the native textarea.
export default forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    className,
    id,
    name,
    lang,
    value,
    defaultValue,
    placeholder,
    rows,
    cols,
    maxLength,
    minLength,
    required,
    disabled,
    readOnly,
    autoFocus,
    autoComplete,
    autoCapitalize,
    autoCorrect,
    spellCheck,
    onChange,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={className ? `ui-textarea ${className}` : 'ui-textarea'}
      id={id}
      name={name}
      lang={lang}
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      rows={rows}
      cols={cols}
      maxLength={maxLength}
      minLength={minLength}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      onChange={onChange}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    />
  );
});
