import { useEffect, useRef, useState } from 'react';

/** Copies text to the clipboard; `copied` holds the key of the last copy for 1.8s. */
export function useCopy<K = true>() {
  const [copied, setCopied] = useState<K | null>(null);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(text: string, key: K = true as K) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(key);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1800);
  }

  return { copied, copy };
}
