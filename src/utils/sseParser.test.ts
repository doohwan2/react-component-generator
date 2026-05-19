import { describe, it, expect } from 'vitest';
import { parseSSEBuffer } from './sseParser';

describe('parseSSEBuffer', () => {
  it('완성된 이벤트 하나를 파싱할 수 있다', () => {
    const input = 'event: chunk\ndata: {"text":"hello"}\n\n';
    const result = parseSSEBuffer(input);
    expect(result.parsed).toHaveLength(1);
    expect(result.parsed[0]).toEqual({ event: 'chunk', data: { text: 'hello' } });
    expect(result.remainder).toBe('');
  });

  it('불완전한 이벤트를 remainder로 반환한다', () => {
    const input = 'event: chunk\ndata: {"text":"hello"}\n\nevent: done\ndata: {"co';
    const result = parseSSEBuffer(input);
    expect(result.parsed).toHaveLength(1);
    expect(result.remainder).toBe('event: done\ndata: {"co');
  });

  it('여러 이벤트를 한 번에 파싱한다', () => {
    const input = 'event: chunk\ndata: {"text":"a"}\n\nevent: chunk\ndata: {"text":"b"}\n\n';
    const result = parseSSEBuffer(input);
    expect(result.parsed).toHaveLength(2);
    expect(result.parsed[0].data.text).toBe('a');
    expect(result.parsed[1].data.text).toBe('b');
  });

  it('잘못된 JSON data 라인을 조용히 무시한다', () => {
    const input = 'event: chunk\ndata: {invalid}\n\n';
    const result = parseSSEBuffer(input);
    expect(result.parsed).toHaveLength(0);
  });

  it('빈 버퍼를 처리한다', () => {
    const result = parseSSEBuffer('');
    expect(result.parsed).toHaveLength(0);
    expect(result.remainder).toBe('');
  });

  it('기본 event 값(message)을 사용한다', () => {
    const input = 'data: {"text":"test"}\n\n';
    const result = parseSSEBuffer(input);
    expect(result.parsed).toHaveLength(1);
    expect(result.parsed[0].event).toBe('message');
  });

  it('여러 data 라인을 개행으로 연결한다', () => {
    const input = 'event: chunk\ndata: {"text":"hello"}\ndata: {"extra":"world"}\n\n';
    const result = parseSSEBuffer(input);
    // 두 라인을 개행으로 연결하면 유효한 JSON이 아니므로 파싱 실패
    expect(result.parsed).toHaveLength(0);
  });

  it('단일 data 라인만 있는 경우', () => {
    const input = 'event: chunk\ndata: {"text":"test"}\n\n';
    const result = parseSSEBuffer(input);
    expect(result.parsed).toHaveLength(1);
    expect(result.parsed[0].data.text).toBe('test');
  });

  it('done 이벤트를 파싱한다', () => {
    const input = 'event: done\ndata: {"code":"const X = () => null"}\n\n';
    const result = parseSSEBuffer(input);
    expect(result.parsed).toHaveLength(1);
    expect(result.parsed[0].event).toBe('done');
    expect(result.parsed[0].data.code).toBe('const X = () => null');
  });

  it('error 이벤트를 파싱한다', () => {
    const input = 'event: error\ndata: {"message":"API error"}\n\n';
    const result = parseSSEBuffer(input);
    expect(result.parsed).toHaveLength(1);
    expect(result.parsed[0].event).toBe('error');
    expect(result.parsed[0].data.message).toBe('API error');
  });
});
