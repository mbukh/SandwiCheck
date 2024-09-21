import { DIETARY_PREFERENCES } from '../constants/ingredients-constants';
import { getAllIngredients } from '../services/api-ingredients';

jest.mock('../services/api-ingredients', () => ({
  getAllIngredients: jest.fn(),
}));

describe('Check server API response', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads ingredients from API', async () => {
    const mockIngredientsData = [
      { id: 1, name: 'Ingredient 1', dietaryPreferences: [DIETARY_PREFERENCES.kosher] },
      { id: 2, name: 'Ingredient 2', dietaryPreferences: [DIETARY_PREFERENCES.kosher] },
    ];

    getAllIngredients.mockResolvedValue({ data: mockIngredientsData });

    const response = await getAllIngredients({
      dietaryPreferences: [DIETARY_PREFERENCES.kosher],
    });

    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).not.toBe(0);

    expect(getAllIngredients).toHaveBeenCalledWith({
      dietaryPreferences: [DIETARY_PREFERENCES.kosher],
    });

    expect(response.data).toEqual(mockIngredientsData);
  });
});
