import * as React from 'react';
import classNames from 'classnames';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export const Button = ({
  label,
  className,
  disabled,
  loading,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={classNames(
        'flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ',
        disabled
          ? 'border-gray-100 bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
        className,
      )}
      // Always disabled while loading
      disabled={disabled || loading}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {label}
    </button>
  );
};
