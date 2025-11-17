import { DIETARY_PREFERENCE } from '../constants/ingredients-constants';
import { getAllIngredients } from '../services/api-ingredients';

vi.mock('../services/api-ingredients', () => ({
  getAllIngredients: vi.fn(),
}));

describe('Check server API response', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads ingredients from API', async () => {
    const mockIngredientsData = [
      { id: 1, name: 'Ingredient 1', dietaryPreferences: [DIETARY_PREFERENCE.kosher] },
      { id: 2, name: 'Ingredient 2', dietaryPreferences: [DIETARY_PREFERENCE.kosher] },
    ];

    getAllIngredients.mockResolvedValue({ data: mockIngredientsData });

    const response = await getAllIngredients({
      dietaryPreferences: [DIETARY_PREFERENCE.kosher],
    });

    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).not.toBe(0);

    expect(getAllIngredients).toHaveBeenCalledWith({
      dietaryPreferences: [DIETARY_PREFERENCE.kosher],
    });

    expect(response.data).toEqual(mockIngredientsData);
  });
});
