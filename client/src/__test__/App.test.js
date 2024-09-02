import { render, screen } from '@testing-library/react';
import App from '../App';
import AuthGlobalContextProvider from '../context/AuthGlobalContext';
import IngredientsGlobalContextProvider from '../context/IngredientsGlobalContext';
import { fakeLocalStorage } from './fakeLocalStorage.mock';

describe('Render the App', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: fakeLocalStorage,
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

    const linkElement = screen.getByText(/Let us/i).closest('div');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.parentElement).toHaveClass('logo');
  });
});
