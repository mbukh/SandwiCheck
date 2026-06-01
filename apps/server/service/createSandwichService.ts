import type mongoose from 'mongoose';
import type { IIngredientWithPortion, SandwichDocument } from '#models/SandwichModel.ts';
import Sandwich from '#models/SandwichModel.ts';
import User from '#models/UserModel.ts';
import { generateSandwichImage } from '#utils/manageSandwichesImages.ts';

interface CreateSandwichServiceParams {
  name: string;
  ingredients: IIngredientWithPortion[];
  authorId: mongoose.Types.ObjectId | string;
  authorName: string;
  comment?: string | null;
  votesCount?: number;
}

/*
 * Creates a sandwich programmatically, replicating the controller logic so that
 * seeds/scripts stay consistent with the API. `authorName` is reduced to its first
 * name to match `req.user.firstName` behaviour; `votesCount` defaults to 0.
 * Parameter and return types are declared on the signature below.
 */
export const createSandwichService = async ({
  name,
  ingredients,
  authorId,
  authorName,
  comment = null,
  votesCount = 0,
}: CreateSandwichServiceParams): Promise<SandwichDocument> => {
  // Extract first name to match API behavior (controller uses req.user.firstName)
  const firstName = authorName && authorName.split(' ')[0];
  /*
   * Convert ingredients to the format expected by the model
   * Ingredients should already be in format: [{ ingredientId: ObjectId, portion: string }]
   */
  const saveIngredients = ingredients.map(({ ingredientId, portion }) => ({
    ingredientId,
    portion,
  }));

  // Create new sandwich instance
  const newSandwich = new Sandwich({
    name,
    ingredients: saveIngredients,
    authorName: firstName, // Use firstName to match API behavior
    authorId,
    comment: comment || undefined,
    votesCount,
  });

  /*
   * Validate the sandwich structure (ingredients, name, etc.)
   * Note: pre-save hooks (like setting dietaryPreferences) run during save(), not validate()
   */
  await newSandwich.validate();

  // Generate sandwich image (this is the key part that needs to happen)
  newSandwich.image = await generateSandwichImage(saveIngredients);

  // Save the sandwich
  await newSandwich.save();

  // Link sandwich to user's sandwiches array
  const user = await User.findById(authorId);
  if (user) {
    // Check if sandwich is already in user's array (avoid duplicates)
    const sandwichIdString = newSandwich._id.toString();
    if (!user.sandwiches.some((id) => id.toString() === sandwichIdString)) {
      user.sandwiches.push(newSandwich._id);
      await user.save();
    }
  }

  return newSandwich;
};
