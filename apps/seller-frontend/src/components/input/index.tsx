import { forwardRef } from 'react';

interface BaseProps {
  label?: string;
  type?: 'text' | 'number' | 'password' | 'email' | 'textarea';
  className?: string;
}

type InputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Props = InputProps | TextareaProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  ({ label, type = 'text', className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-semibold text-gray-300 mb-1">
            {label}
          </label>
        )}
        {type === 'textarea' ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={`w-full border outline-none border-gray-700 bg-transparent ${className}`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
            className={`w-full border outline-none border-gray-700 bg-transparent ${className}`}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
