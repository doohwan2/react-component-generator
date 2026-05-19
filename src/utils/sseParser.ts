export interface SSEParsedEvent {
  event: string;
  data: Record<string, unknown>;
}

export interface SSEParseResult {
  parsed: SSEParsedEvent[];
  remainder: string;
}

export function parseSSEBuffer(buffer: string): SSEParseResult {
  const parsed: SSEParsedEvent[] = [];
  const parts = buffer.split('\n\n');

  // 마지막 항목은 완성되지 않은 이벤트일 수 있으므로 remainder로 반환
  const remainder = parts.pop() ?? '';

  for (const part of parts) {
    if (!part.trim()) continue;

    const lines = part.split('\n');
    let event = 'message';
    const dataLines: string[] = [];

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        event = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        dataLines.push(line.slice(6).trim());
      }
    }

    if (dataLines.length > 0) {
      const dataStr = dataLines.join('\n');
      try {
        const data = JSON.parse(dataStr);
        parsed.push({ event, data });
      } catch {
        // 파싱 실패 무시
      }
    }
  }

  return { parsed, remainder };
}
