import { render, screen } from '@testing-library/react';
import App from '@/App';
import type * as ApiSandwichesModule from '@/services/api-sandwiches';
import { fakeLocalStorage } from './localStorageMock';

vi.mock('../services/api-ingredients', () => ({
  getAllIngredients: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock('../services/api-sandwiches', async (importOriginal) => {
  const actual = await importOriginal<typeof ApiSandwichesModule>();
  return {
    ...actual,
    fetchSandwiches: vi.fn().mockResolvedValue({ success: true, data: [] }),
  };
});

describe('Render the App', () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: fakeLocalStorage,
      configurable: true,
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
    });
  });

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('renders the app', async () => {
    render(<App />);

    const logoText = await screen.findByText(/Let us/i);
    expect(logoText).toBeInTheDocument();
  });
});
