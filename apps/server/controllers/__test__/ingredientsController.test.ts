import type { Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#models/IngredientModel.ts', () => ({ default: { findByIdAndDelete: vi.fn(), exists: vi.fn() } }));
vi.mock('#models/SandwichModel.ts', () => ({ default: { findOne: vi.fn() } }));
vi.mock('#utils/fileUtils.ts', () => ({ getTimeBasedFilename: vi.fn(() => 'base') }));
vi.mock('#utils/manageIngredientsImages.ts', () => ({
  removeAllIngredientImagesByImageBase: vi.fn(async () => {}),
  saveIngredientImages: vi.fn(),
}));
vi.mock('#utils/logger.ts', () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const { deleteIngredient } = await import('../ingredientsController.ts');
const { default: Ingredient } = await import('#models/IngredientModel.ts');
const { default: Sandwich } = await import('#models/SandwichModel.ts');
const { removeAllIngredientImagesByImageBase } = await import('#utils/manageIngredientsImages.ts');

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const makeRes = (): { res: Response; status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } => {
  const status = vi.fn();
  const json = vi.fn();
  const res = { status, json } as unknown as Response;
  status.mockReturnValue(res);
  json.mockReturnValue(res);
  return { res, status, json };
};

describe('deleteIngredient image-cleanup guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // No sandwich references the ingredient, so deletion proceeds to the cleanup branch.
    vi.mocked(Sandwich.findOne).mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes the orphaned images when no sibling shares the imageBase', async () => {
    vi.mocked(Ingredient.findByIdAndDelete).mockResolvedValue({ _id: 'ing1', imageBase: 'base-1' });
    vi.mocked(Ingredient.exists).mockResolvedValue(null);

    const { res, status } = makeRes();
    const req = { params: { ingredientId: 'ing1' } } as unknown as Request;
    const next = vi.fn();

    deleteIngredient(req, res, next);
    await flush();

    // The guard queries for a different ingredient on the same base, finds none, and deletes the images.
    expect(Ingredient.exists).toHaveBeenCalledWith({ imageBase: 'base-1', _id: { $ne: 'ing1' } });
    expect(removeAllIngredientImagesByImageBase).toHaveBeenCalledWith('base-1');
    expect(status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it('keeps the images when another ingredient still shares the imageBase', async () => {
    vi.mocked(Ingredient.findByIdAndDelete).mockResolvedValue({ _id: 'ing1', imageBase: 'base-1' });
    vi.mocked(Ingredient.exists).mockResolvedValue({ _id: 'sibling' } as never);

    const { res, status } = makeRes();
    const req = { params: { ingredientId: 'ing1' } } as unknown as Request;
    const next = vi.fn();

    deleteIngredient(req, res, next);
    await flush();

    expect(Ingredient.exists).toHaveBeenCalledWith({ imageBase: 'base-1', _id: { $ne: 'ing1' } });
    expect(removeAllIngredientImagesByImageBase).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });
});
