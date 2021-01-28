import classNames from 'classnames';
import React from 'react';

export const RadioIconButton = ({
  icon: Icon,
  checked,
  setChecked,
  name,
  id,
  label,
  disableOpacity,
}: {
  icon: (props: { className?: string }) => JSX.Element;
  checked: boolean;
  setChecked: () => void;
  name: string;
  id: string;
  label: string;
  disableOpacity: boolean;
}) => {
  return (
    <>
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={(e) => e.target.checked && setChecked()}
        className="absolute opacity-0"
      />
      <label
        htmlFor={id}
        className={classNames(
          'transform duration-150 hover:scale-110 flex flex-col items-center',
          checked ? 'scale-110' : !disableOpacity && 'opacity-50',
        )}
      >
        <Icon className="h-20 w-20" />
        <span className="font-bold">{label}</span>
      </label>
    </>
  );
};
