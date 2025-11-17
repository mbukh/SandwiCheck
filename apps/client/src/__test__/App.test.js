import { render, screen } from '@testing-library/react';
import App from '../App';
import AuthGlobalContextProvider from '../context/AuthGlobalContext';
import IngredientsGlobalContextProvider from '../context/IngredientsGlobalContext';
import { fakeLocalStorage } from './localStorageMock';

describe('Render the App', () => {
  const originalLocalStorage = window.localStorage;

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: fakeLocalStorage,
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
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
