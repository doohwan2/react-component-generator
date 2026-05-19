import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { parseSSEBuffer } from '../utils/sseParser';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const placeholder: GeneratedComponent = {
      id,
      prompt,
      code: '',
      createdAt: new Date(),
      isStreaming: true,
    };

    setComponents((prev) => [placeholder, ...prev]);

    try {
      const res = await fetch('/api/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok) {
        const data = (await res.json()) as Record<string, unknown>;
        throw new Error((data.error as string) || 'Failed to generate component');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { parsed: events, remainder } = parseSSEBuffer(buffer);
        buffer = remainder;

        for (const event of events) {
          if (event.event === 'chunk') {
            setComponents((prev) =>
              prev.map((c) =>
                c.id === id
                  ? { ...c, code: c.code + (event.data.text as string) }
                  : c
              )
            );
          } else if (event.event === 'done') {
            setComponents((prev) =>
              prev.map((c) =>
                c.id === id
                  ? { ...c, code: event.data.code as string, isStreaming: false }
                  : c
              )
            );
          } else if (event.event === 'error') {
            throw new Error(event.data.message as string);
          }
        }
      }
    } catch (err) {
      setComponents((prev) => prev.filter((c) => c.id !== id));
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isStreaming: false } : c))
      );
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
