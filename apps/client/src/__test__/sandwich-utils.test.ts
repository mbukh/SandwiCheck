import { MAX_NAME_LENGTH, PORTION } from '@sandwicheck/shared';
import type { Ingredient, Sandwich } from '@/types/domain';
import { buildDefaultSandwichName, hydrateSandwichIngredientsData } from '@/utils/sandwich-utils';

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
