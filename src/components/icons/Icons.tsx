/* 24 grid, currentColor; same strokes as the design file. */

function svg(children: JSX.Element, size = 19, stroke = 1.7) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function MenuIcon() {
  return svg(<path d="M4 7h16M4 12h16M4 17h16"></path>, 20);
}

export function CloseIcon() {
  return svg(<path d="M6 6l12 12M18 6L6 18"></path>, 18);
}

export function AlertIcon() {
  return svg(
    <>
      <path d="M12 8.5v4.8M12 16.6v.1"></path>
      <circle cx="12" cy="12" r="8.5"></circle>
    </>,
    19,
    2
  );
}

export function UploadFileIcon() {
  return svg(
    <>
      <path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"></path>
      <path d="M14 3.5v5h5"></path>
      <path d="M12 17v-6M9.5 13.5L12 11l2.5 2.5"></path>
    </>,
    18,
    1.9
  );
}
