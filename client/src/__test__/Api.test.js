import { DIETARY_PREFERENCES } from "../constants/ingredients-constants";
import { getAllIngredients } from "../services/api-ingredients";
import { fakeLocalStorage } from "./fakeLocalStorage.mock";

describe("Check server API response", () => {
  beforeAll(() => {
    Object.defineProperty(window, "localStorage", {
      value: fakeLocalStorage,
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("reads ingredients from API", async () => {
    const response = await getAllIngredients({
      dietaryPreferences: [DIETARY_PREFERENCES.kosher],
    });

    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).not.toBe(0);

    expect(typeof window.localStorage.getItem("ingredients")).toBe("string");
    expect(window.localStorage.getItem("ingredients").length).not.toBe(0);
  });
});
