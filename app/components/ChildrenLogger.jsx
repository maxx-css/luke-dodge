// components/ChildrenLogger.jsx
'use client';

import { useEffect } from 'react';

export default function ChildrenLogger({ children }) {
  useEffect(() => {
    console.log('Children props:', children);

    // For a more detailed inspection:
    console.log('Children type:', typeof children);
    console.log('Children props:', children.props);

    // If children is an array:
    if (Array.isArray(children)) {
      children.forEach((child, index) => {
        console.log(`Child ${index}:`, child);
      });
    }
  }, [children]);

  return <>{children}</>;
}
