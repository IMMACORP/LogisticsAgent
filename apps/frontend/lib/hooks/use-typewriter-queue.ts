export interface TypewriterQueueOptions {
  /** Milliseconds between each character (default 14) */
  charDelayMs?: number;
  onUpdate: (content: string) => void;
  onComplete: () => void;
}

export interface TypewriterQueue {
  enqueue: (text: string) => void;
  complete: (finalText: string) => void;
  stop: () => void;
  getDisplayed: () => string;
}

/**
 * Reveals text character-by-character (Unicode code points) for a ChatGPT-like effect.
 */
export function createTypewriterQueue(options: TypewriterQueueOptions): TypewriterQueue {
  const { charDelayMs = 14, onUpdate, onComplete } = options;

  const queue: string[] = [];
  let buffer = "";
  let timer: number | null = null;
  let pendingComplete = false;
  let finalText: string | null = null;

  const tryFinish = () => {
    if (!pendingComplete) {
      return;
    }
    if (queue.length > 0 || timer !== null) {
      return;
    }

    const resolved = finalText ?? buffer;
    buffer = resolved;
    onUpdate(resolved);
    pendingComplete = false;
    finalText = null;
    onComplete();
  };

  const pump = () => {
    const next = queue.shift();
    if (!next) {
      timer = null;
      tryFinish();
      return;
    }

    buffer += next;
    onUpdate(buffer);
    timer = window.setTimeout(pump, charDelayMs);
  };

  const ensurePumping = () => {
    if (timer === null && queue.length > 0) {
      pump();
    }
  };

  return {
    enqueue(text: string) {
      if (!text) {
        return;
      }
      queue.push(...Array.from(text));
      ensurePumping();
    },

    complete(resolvedFinal: string) {
      finalText = resolvedFinal;
      pendingComplete = true;

      const remainder = resolvedFinal.slice(buffer.length);
      if (remainder.length > 0) {
        queue.push(...Array.from(remainder));
        ensurePumping();
      } else {
        tryFinish();
      }
    },

    stop() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      queue.length = 0;
      buffer = "";
      pendingComplete = false;
      finalText = null;
    },

    getDisplayed: () => buffer,
  };
}
