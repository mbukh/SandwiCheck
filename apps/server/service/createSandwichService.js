import Sandwich from '../models/SandwichModel.js';
import User from '../models/UserModel.js';
import { generateSandwichImage } from '../utils/manageSandwichesImages.js';

/**
 * Service function to create a sandwich (replicates controller logic)
 * This allows creating sandwiches programmatically while maintaining API consistency
 * @param {Object} params - Sandwich creation parameters
 * @param {string} params.name - Sandwich name
 * @param {Array<{ingredientId: ObjectId, portion: string}>} params.ingredients - Array of ingredients with ObjectIds and portions
 * @param {string} params.authorId - User ObjectId who is creating the sandwich
 * @param {string} params.authorName - User's full name (will extract firstName to match API behavior)
 * @param {string} [params.comment] - Optional comment
 * @param {number} [params.votesCount] - Optional initial vote count (default: 0)
 * @returns {Promise<Sandwich>} The created sandwich
 */
export const createSandwichService = async ({
  name,
  ingredients,
  authorId,
  authorName,
  comment = null,
  votesCount = 0,
}) => {
  // Extract first name to match API behavior (controller uses req.user.firstName)
  const firstName = authorName && authorName.split(' ')[0];
  // Convert ingredients to the format expected by the model
  // Ingredients should already be in format: [{ ingredientId: ObjectId, portion: string }]
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

  // Validate the sandwich structure (ingredients, name, etc.)
  // Note: pre-save hooks (like setting dietaryPreferences) run during save(), not validate()
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
