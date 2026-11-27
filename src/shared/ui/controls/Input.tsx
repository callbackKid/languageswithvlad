import './Input.css';

import {
  type ChangeEventHandler,
  forwardRef,
  type HTMLAttributes,
  type HTMLInputTypeAttribute,
  type KeyboardEventHandler,
} from 'react';

export interface InputProps {
  type?: HTMLInputTypeAttribute;
  className?: string;
  id?: string;
  name?: string;
  lang?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  checked?: boolean;
  defaultChecked?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  hidden?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  autoCapitalize?: string;
  autoCorrect?: string;
  spellCheck?: boolean;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  accept?: string;
  multiple?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  maxLength?: number;
  minLength?: number;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// Forward the ref so callers can focus the native input or open its file picker.
export default forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    type,
    className,
    id,
    name,
    lang,
    value,
    defaultValue,
    checked,
    defaultChecked,
    placeholder,
    disabled,
    readOnly,
    required,
    hidden,
    autoFocus,
    autoComplete,
    autoCapitalize,
    autoCorrect,
    spellCheck,
    inputMode,
    accept,
    multiple,
    min,
    max,
    step,
    maxLength,
    minLength,
    onChange,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
  },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={className ? `ui-input ${className}` : 'ui-input'}
      id={id}
      name={name}
      lang={lang}
      value={value}
      defaultValue={defaultValue}
      checked={checked}
      defaultChecked={defaultChecked}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      hidden={hidden}
      autoFocus={autoFocus}
      autoComplete={autoComplete}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      inputMode={inputMode}
      accept={accept}
      multiple={multiple}
      min={min}
      max={max}
      step={step}
      maxLength={maxLength}
      minLength={minLength}
      onChange={onChange}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    />
  );
});
