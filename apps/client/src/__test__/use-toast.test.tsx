import { fireEvent, render, screen } from '@testing-library/react';
import useToast from '@/hooks/use-toast';

const Harness = (): React.JSX.Element => {
  const { showToast, toastComponents } = useToast();
  return (
    <>
      <button onClick={() => showToast('Same message')}>fire</button>
      {toastComponents}
    </>
  );
};

describe('useToast keys', () => {
  it('gives identical messages distinct keys so dismissing one keeps the other', () => {
    render(<Harness />);
    const fire = screen.getByText('fire');

    // Two identical messages — under the old `message + Date.now()` scheme these could share a key.
    fireEvent.click(fire);
    fireEvent.click(fire);
    expect(screen.getAllByText('Same message')).toHaveLength(2);

    // Dismiss the first toast; with collision-free keys only it is removed, the second survives.
    const firstClose = screen.getAllByText('X')[0];
    if (!firstClose) throw new Error('expected a toast close button');
    fireEvent.click(firstClose);
    expect(screen.getAllByText('Same message')).toHaveLength(1);
  });
});
