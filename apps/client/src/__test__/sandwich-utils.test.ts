import { MAX_NAME_LENGTH, PORTION, PRODUCT } from '@sandwicheck/shared';
import type { Ingredient, Sandwich, SandwichLayer } from '@/types/domain';
import {
  buildDefaultSandwichName,
  doesStayKosherWithIngredient,
  hydrateSandwichIngredientsData,
} from '@/utils/sandwich-utils';

const ingredient = (id: string, name: string): Ingredient => ({
  id,
  name,
  type: 'bread',
  imageBase: `${id}.png`,
  dietaryPreferences: [],
  displayPriority: 1,
});

const wireSandwich = (ingredients: unknown[]): Sandwich =>
  ({
    id: 's1',
    name: 'BLT',
    authorName: 'Author',
    image: 'image',
    votesCount: 0,
    ingredients,
    dietaryPreferences: [],
    createdAt: '',
    updatedAt: '',
  }) as Sandwich;

describe('hydrateSandwichIngredientsData', () => {
  const rawList = [ingredient('a', 'Sourdough'), ingredient('b', 'Tomato')];

  it('hydrates wire layers from the raw list and preserves their portion', () => {
    const result = hydrateSandwichIngredientsData(
      wireSandwich([{ ingredientId: 'a', portion: PORTION.full }]),
      rawList,
    );

    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]).toMatchObject({ id: 'a', name: 'Sourdough', portion: PORTION.full });
  });

  it('drops a layer whose ingredient id is not in the raw list', () => {
    const result = hydrateSandwichIngredientsData(wireSandwich([{ ingredientId: 'does-not-exist' }]), rawList);

    expect(result.ingredients).toHaveLength(0);
  });

  it('passes through a layer that already carries full catalog data', () => {
    const alreadyHydrated = {
      id: 'a',
      name: 'Sourdough',
      type: 'bread',
      imageBase: 'a.png',
      dietaryPreferences: [],
      displayPriority: 1,
      portion: PORTION.half,
    };

    // Pass an empty raw list to prove the layer was kept as-is, not looked up.
    const result = hydrateSandwichIngredientsData(wireSandwich([alreadyHydrated]), []);

    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]).toMatchObject({ id: 'a', name: 'Sourdough', portion: PORTION.half });
  });
});

describe('doesStayKosherWithIngredient', () => {
  const withDiet = (id: string, ...prefs: string[]): SandwichLayer =>
    ({ ...ingredient(id, id), dietaryPreferences: prefs }) as unknown as SandwichLayer;

  it('does not throw when an existing layer has no dietaryPreferences', () => {
    // A cached/legacy layer missing the field used to crash the .includes() call.
    const legacyLayer = { id: 'a', name: 'Bread', type: 'bread' } as unknown as SandwichLayer;
    const sandwich = { ingredients: [legacyLayer, withDiet('b')] };
    const dairy = { ...ingredient('c', 'Cheese'), dietaryPreferences: [PRODUCT.dairy] } as Ingredient;

    expect(() => doesStayKosherWithIngredient(dairy, sandwich)).not.toThrow();
  });

  it('rejects adding dairy when an existing layer is meat', () => {
    const sandwich = { ingredients: [withDiet('m', PRODUCT.meat), withDiet('b')] };
    const dairy = { ...ingredient('c', 'Cheese'), dietaryPreferences: [PRODUCT.dairy] } as Ingredient;

    expect(doesStayKosherWithIngredient(dairy, sandwich)).toBe(false);
  });
});

describe('buildDefaultSandwichName', () => {
  it('returns "My Sandwich" for an absent or empty firstName', () => {
    const absentName: string | undefined = undefined;
    expect(buildDefaultSandwichName(absentName)).toBe('My Sandwich');
    expect(buildDefaultSandwichName('')).toBe('My Sandwich');
  });

  it('keeps a short firstName as-is', () => {
    expect(buildDefaultSandwichName('Mo')).toBe("Mo's Sandwich");
  });

  it('clamps a long firstName so the whole name fits MAX_NAME_LENGTH with the suffix intact', () => {
    const result = buildDefaultSandwichName('Bartholomew-Maximilian-The-Third');

    expect(result.length).toBeLessThanOrEqual(MAX_NAME_LENGTH);
    expect(result.endsWith("'s Sandwich")).toBe(true);
  });
});
