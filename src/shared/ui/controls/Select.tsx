import {
  type AriaAttributes,
  type AriaRole,
  type ChangeEventHandler,
  type FocusEventHandler,
  forwardRef,
  type ReactNode,
} from 'react';

export interface SelectProps {
  children?: ReactNode;
  className?: string;
  id?: string;
  name?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  form?: string;
  multiple?: boolean;
  size?: number;
  role?: AriaRole;
  tabIndex?: number;
  lang?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
  onFocus?: FocusEventHandler<HTMLSelectElement>;
  onBlur?: FocusEventHandler<HTMLSelectElement>;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: AriaAttributes['aria-invalid'];
  'data-tooltip'?: string;
  'aria-live'?: AriaAttributes['aria-live'];
  'aria-errormessage'?: string;
}

// Forward the ref to the native select so callers can focus or inspect the field.
export default forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    children,
    className,
    id,
    name,
    value,
    defaultValue,
    disabled,
    required,
    autoFocus,
    form,
    multiple,
    size,
    role,
    tabIndex,
    lang,
    onChange,
    onFocus,
    onBlur,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
    'data-tooltip': tooltip,
    'aria-live': ariaLive,
    'aria-errormessage': ariaErrorMessage,
  },
  ref
) {
  return (
    <select
      ref={ref}
      className={className}
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      required={required}
      autoFocus={autoFocus}
      form={form}
      multiple={multiple}
      size={size}
      role={role}
      tabIndex={tabIndex}
      lang={lang}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      aria-live={ariaLive}
      aria-errormessage={ariaErrorMessage}
      data-tooltip={tooltip}
    >
      {children}
    </select>
  );
});
