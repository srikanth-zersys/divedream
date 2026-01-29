import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Pencil, Loader2 } from 'lucide-react';

interface InlineEditProps {
  value: string | number;
  onSave: (value: string) => Promise<void> | void;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  formatter?: (value: string | number) => string;
  validator?: (value: string) => string | null;
  disabled?: boolean;
}

const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  type = 'text',
  options = [],
  placeholder = 'Click to edit',
  className = '',
  displayClassName = '',
  inputClassName = '',
  formatter,
  validator,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(String(value));
  }, [value]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(String(value));
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(String(value));
    setError(null);
  };

  const handleSave = async () => {
    if (editValue === String(value)) {
      setIsEditing(false);
      return;
    }

    if (validator) {
      const validationError = validator(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = formatter ? formatter(value) : String(value);

  if (!isEditing) {
    return (
      <button
        onClick={handleStartEdit}
        disabled={disabled}
        className={`group inline-flex items-center gap-1 px-2 py-1 -mx-2 -my-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${
          disabled ? 'cursor-default' : 'cursor-pointer'
        } ${displayClassName}`}
      >
        <span className={value ? '' : 'text-gray-400 italic'}>
          {displayValue || placeholder}
        </span>
        {!disabled && (
          <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {type === 'select' ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className={`px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 ${inputClassName}`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className={`px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 ${
            error ? 'border-red-500' : ''
          } ${inputClassName}`}
          style={{ width: Math.max(60, editValue.length * 8 + 20) }}
        />
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
        title="Save"
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </button>

      <button
        onClick={handleCancel}
        disabled={isSaving}
        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
        title="Cancel"
      >
        <X className="w-4 h-4" />
      </button>

      {error && (
        <span className="text-xs text-red-500 ml-1">{error}</span>
      )}
    </div>
  );
};

export default InlineEdit;
