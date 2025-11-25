export const IconPlay = ({ className, style, fill = 'currentColor' }: { className?: string, style?: any, fill?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill={fill} className={className} style={style}>
    <path d='M8 5v14l11-7z'/>
  </svg>
);

export const IconPause = ({ className, style, fill = 'currentColor' }: { className?: string, style?: any, fill?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill={fill} className={className} style={style}>
    <path d='M6 19h4V5H6v14zm8-14v14h4V5h-4z'/>
  </svg>
);

export const IconReset = ({ className, style, fill = 'currentColor' }: { className?: string, style?: any, fill?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill={fill} className={className} style={style}>
    <path d='M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'/>
  </svg>
);

export const IconSkipBack = ({ className, style, fill = 'currentColor' }: { className?: string, style?: any, fill?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill={fill} className={className} style={style}>
    <path d='M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z'/>
  </svg>
);

export const IconSkipForward = ({ className, style, fill = 'currentColor' }: { className?: string, style?: any, fill?: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill={fill} className={className} style={style}>
    <path d='M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z'/>
  </svg>
);
