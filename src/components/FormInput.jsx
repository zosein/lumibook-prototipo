import React from 'react';

export default function FormInput({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  required,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-white text-sm font-medium">
        {label}{required && <span className="text-red-300 ml-1">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`rounded px-3 py-2 ${error ? "border-red-400 border-2" : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        {...props}
      />
      {error && <span id={`${id}-error`} className="text-red-200 text-xs">{error}</span>}
    </div>
  );
}