import { describe, expect, it, jest } from '@jest/globals';
import { useAlphabetIndex } from '@/hooks/useAlphabetIndex';
import { act, renderHook } from '@testing-library/react-native';

const layout = (y: number) => ({ nativeEvent: { layout: { x: 0, y, width: 300, height: 200 } } }) as any;
const scrollEvent = (y: number) => ({ nativeEvent: { contentOffset: { x: 0, y } } }) as any;

const setUp = (letters: string[] = ['A', 'B', 'C']) => {
  const hook = renderHook(({ list }: { list: string[] }) => useAlphabetIndex(list), { initialProps: { list: letters } });
  const scrollTo = jest.fn();
  (hook.result.current.scrollRef as any).current = { scrollTo };

  act(() => {
    hook.result.current.handleListLayout(layout(300));
    hook.result.current.handleSectionLayout('A', layout(0));
    hook.result.current.handleSectionLayout('B', layout(200));
    hook.result.current.handleSectionLayout('C', layout(500));
  });

  return { ...hook, scrollTo };
};

describe('useAlphabetIndex', () => {
  it('starts on the first letter', () => {
    const { result } = setUp();
    expect(result.current.activeLetter).toBe('A');
  });

  it('moves to a letter once its section reaches the top of the list', () => {
    const { result } = setUp();

    act(() => result.current.handleScroll(scrollEvent(0)));
    expect(result.current.activeLetter).toBe('A');

    act(() => result.current.handleScroll(scrollEvent(419)));
    expect(result.current.activeLetter).toBe('A');
    act(() => result.current.handleScroll(scrollEvent(420)));
    expect(result.current.activeLetter).toBe('B');

    act(() => result.current.handleScroll(scrollEvent(720)));
    expect(result.current.activeLetter).toBe('C');
  });

  it('goes back up through the letters as the list scrolls back', () => {
    const { result } = setUp();

    act(() => result.current.handleScroll(scrollEvent(900)));
    expect(result.current.activeLetter).toBe('C');
    act(() => result.current.handleScroll(scrollEvent(10)));
    expect(result.current.activeLetter).toBe('A');
  });

  it('scrolls a letter’s section to sit 72pt below the top, and makes it current', () => {
    const { result, scrollTo } = setUp();

    act(() => result.current.scrollToLetter('B'));

    expect(scrollTo).toHaveBeenCalledWith({ animated: true, y: 300 + 200 - 72 });
    expect(result.current.activeLetter).toBe('B');
  });

  it('can jump to a section without animating, to keep up with a scrubbing finger', () => {
    const { result, scrollTo } = setUp();

    act(() => result.current.scrollToLetter('B', false));

    expect(scrollTo).toHaveBeenCalledWith({ animated: false, y: 300 + 200 - 72 });
    expect(result.current.activeLetter).toBe('B');
  });

  it('does not scroll above the top of the list', () => {
    const { result, scrollTo } = setUp();

    act(() => {
      result.current.handleListLayout(layout(0));
      result.current.handleSectionLayout('A', layout(10));
    });
    act(() => result.current.scrollToLetter('A'));

    expect(scrollTo).toHaveBeenCalledWith({ animated: true, y: 0 });
  });

  it('still marks a letter whose section has not been laid out yet', () => {
    const { result, scrollTo } = setUp(['A', 'B', 'C', 'D']);

    act(() => result.current.scrollToLetter('D'));

    expect(scrollTo).not.toHaveBeenCalled();
    expect(result.current.activeLetter).toBe('D');
  });

  it('falls back to the first letter when the current one is no longer listed', () => {
    const { result, rerender } = setUp();

    act(() => result.current.scrollToLetter('C'));
    expect(result.current.activeLetter).toBe('C');

    rerender({ list: ['A', 'B'] });
    expect(result.current.activeLetter).toBe('A');
  });

  it('keeps the same scroll handler as the letters change', () => {
    const { result, rerender } = setUp();
    const handler = result.current.handleScroll;

    rerender({ list: ['A', 'B', 'C', 'D'] });

    expect(result.current.handleScroll).toBe(handler);
  });

  it('copes with no letters', () => {
    const { result } = setUp([]);

    act(() => result.current.handleScroll(scrollEvent(100)));
    expect(result.current.activeLetter).toBe('');
  });
});
