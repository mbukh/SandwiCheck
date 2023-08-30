import { render, screen } from "@testing-library/react";
import App from "../App";
import AuthGlobalContextProvider from "../context/AuthGlobalContext";
import IngredientsGlobalContextProvider from "../context/IngredientsGlobalContext";

it("renders app", () => {
  const theApp = (
    <AuthGlobalContextProvider>
      <IngredientsGlobalContextProvider>
        <App />
      </IngredientsGlobalContextProvider>
    </AuthGlobalContextProvider>
  );

  render(theApp);

  const linkElement = screen.getByText(/Let us/i).closest("div");
  expect(linkElement).toBeInTheDocument();
  expect(linkElement.parentElement).toHaveClass("logo");
});
