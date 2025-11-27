import { render, screen } from '@testing-library/react';
import AuthGlobalContextProvider from '../context/AuthGlobalContext';
import IngredientsGlobalContextProvider from '../context/IngredientsGlobalContext';
import App from '../index';
import { fakeLocalStorage } from './localStorageMock';

describe('Render the App', () => {
  const originalLocalStorage = globalThis.localStorage;

  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: fakeLocalStorage,
    });
  });

  afterAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
    });
  });

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('renders the app', () => {
    const theApp = (
      <AuthGlobalContextProvider>
        <IngredientsGlobalContextProvider>
          <App />
        </IngredientsGlobalContextProvider>
      </AuthGlobalContextProvider>
    );

    render(theApp);

    const logoText = screen.getByText(/Let us/i);
    expect(logoText).toBeInTheDocument();
  });
});
