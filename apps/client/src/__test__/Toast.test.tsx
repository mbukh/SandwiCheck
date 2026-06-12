import { act, fireEvent, render, screen } from '@testing-library/react';
import Toast from '@/components/Toast/Toast';

// TOAST_TIMEOUT (3500) + FADE_DURATION (1500) = full lifetime before auto-remove.
const TOAST_LIFETIME_MS = 5000;

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onHide immediately when the close button is clicked', () => {
    const onHide = vi.fn();
    render(<Toast message="Saved" onHide={onHide} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('calls onHide once the auto-dismiss timer elapses', () => {
    const onHide = vi.fn();
    render(<Toast message="Saved" onHide={onHide} />);

    expect(onHide).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(TOAST_LIFETIME_MS);
    });

    expect(onHide).toHaveBeenCalledTimes(1);
  });
});
