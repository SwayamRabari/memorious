import React from 'react';

interface StarProps {
  className?: string;
}

export default function Star({ className = '' }: StarProps) {
  return (
    <div>
      <svg
        width="104"
        height="104"
        viewBox="0 0 104 104"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 text-zinc-900 fill-zinc-50 scale-110 ${className} transition-all duration-300 animate-out`}
      >
        <path d="M52 0L54.0248 10.4253C57.9119 30.439 73.5611 46.0881 93.5747 49.9752L104 52L93.5747 54.0248C73.561 57.9119 57.9119 73.5611 54.0248 93.5747L52 104L49.9752 93.5747C46.0881 73.561 30.4389 57.9119 10.4253 54.0248L0 52L10.4253 49.9752C30.439 46.0881 46.0881 30.439 49.9752 10.4253L52 0Z" />
      </svg>
    </div>
  );
}
