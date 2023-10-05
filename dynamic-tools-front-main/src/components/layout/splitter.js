import React, { useState } from 'react';
import clsx from 'clsx';

function LayoutSplitter({ id = 'drag-bar', dir, isDragging, ...props }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      id={id}
      data-testid={id}
      className={clsx('drag-bar', {
        horizontal: dir === 'horizontal',
        dragging: isDragging || isFocused,
      })}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  );
}

export default LayoutSplitter;
