import classNames from 'classnames';
import React, { useState } from 'react';

export const DragDiv = ({
  className,
  children,
  addFiles,
  dragOverClassName,
}: {
  className?: string;
  children: React.ReactNode;
  addFiles: (files: FileList) => void;
  dragOverClassName?: string;
}) => {
  const [count, setCount] = useState(0);

  return (
    <div
      className={classNames(className, count > 0 && dragOverClassName)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={async (e) => {
        e.preventDefault();
        addFiles(e.dataTransfer.files);
        setCount((previous) => previous - 1);
      }}
      onDragEnter={() => setCount((previous) => previous + 1)}
      onDragLeave={() => setCount((previous) => previous - 1)}
    >
      {children}
    </div>
  );
};
