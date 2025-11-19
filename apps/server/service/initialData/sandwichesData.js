import { PORTION } from '../../constants/ingredientsConstants.js';

// Helper function to create sandwich data structure
// Ingredients will be resolved to ObjectIds in initDatabase.js
const createSandwich = (name, authorEmail, ingredients, comment = null, votesCount = 0, childName = null) => ({
  name,
  authorEmail, // Will be used to find user ObjectId (parent email for tethered children)
  childName, // Child's name if this is a tethered child's sandwich
  ingredients, // Array of { name: string, portion: string }
  comment,
  votesCount,
});

// Greek family sandwiches (Mediterranean flavors, kosher-compatible, vegetarian-friendly)
export const papadopoulosSandwiches = [
  // Dimitri Papadopoulos - Greek, kosher, vegetarian
  createSandwich(
    'Greek Garden Delight',
    'dimitri.papadopoulos@sandwicheck.app',
    [
      { name: 'Ciabatta' },
      { name: 'Feta', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Olives', portion: PORTION.half },
      { name: 'Oil & Vinegar', portion: PORTION.half },
    ],
    'A taste of the Mediterranean! Perfect for a sunny day.',
    24, // Popular Mediterranean option
  ),
  // Elena Papadopoulos - Greek, kosher, vegetarian, fish
  createSandwich(
    'Aegean Breeze',
    'elena.papadopoulos@sandwicheck.app',
    [
      { name: 'Whole Wheat' },
      { name: 'Tuna Salad', portion: PORTION.full },
      { name: 'Feta', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Olives', portion: PORTION.half },
    ],
    'Fresh and light, just like the Greek islands!',
    12, // Good fish option
  ),
  // Alexandros Papadopoulos - Greek child, kosher, vegetarian
  createSandwich(
    'My Favorite Sandwich 🥪',
    'dimitri.papadopoulos@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'White' },
      { name: 'Feta', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Oil & Vinegar', portion: PORTION.half },
    ],
    'I love this one! 😊',
    3, // Child sandwich, some votes
    'Alexandros Papadopoulos', // Child name
  ),
  // Sofia Papadopoulos - Greek child, kosher, vegetarian
  createSandwich(
    'Sofia Special',
    'dimitri.papadopoulos@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'Whole Wheat' },
      { name: 'Feta', portion: PORTION.full },
      { name: 'Olives', portion: PORTION.half },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
    ],
    'Yummy! 🥰',
    2, // Child sandwich, fewer votes
    'Sofia Papadopoulos', // Child name
  ),
];

// Middle Eastern family sandwiches (Halal, traditional Middle Eastern)
export const alRashidSandwiches = [
  // Fatima Al-Rashid - Middle Eastern, halal, meat
  createSandwich(
    'Halal Delight',
    'fatima.alrashid@sandwicheck.app',
    [
      { name: 'Whole Wheat' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Baked Chicken', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Onions', portion: PORTION.half },
    ],
    'Traditional and delicious. Perfect halal option!',
    18, // Popular halal option
  ),
  // Omar Al-Rashid - Middle Eastern child, halal
  createSandwich(
    "Omar's Sandwich 🍗",
    'fatima.alrashid@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'White' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Baked Chicken', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
    ],
    'My mom makes the best! 💪',
    4, // Child sandwich, some votes
    'Omar Al-Rashid', // Child name
  ),
];

// American family sandwiches
export const johnsonSandwiches = [
  // Michael Johnson - American, meat
  createSandwich(
    'Classic American',
    'michael.johnson@sandwicheck.app',
    [
      { name: 'White' },
      { name: 'Mayonnaise', portion: PORTION.half },
      { name: 'Roast Beef', portion: PORTION.full },
      { name: 'Cheddar', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Onions', portion: PORTION.half },
    ],
    "Can't go wrong with a classic!",
    28, // Very popular classic
  ),
  // Jennifer Johnson - American, vegetarian
  createSandwich(
    'Garden Fresh',
    'jennifer.johnson@sandwicheck.app',
    [
      { name: 'Whole Wheat' },
      { name: 'Avocado', portion: PORTION.full },
      { name: 'Mozzarella', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Balsamic Dressing', portion: PORTION.half },
    ],
    'Healthy and satisfying. My go-to lunch!',
    15, // Popular vegetarian option
  ),
  // Jennifer Johnson - Another vegetarian option (no cheese for variety)
  createSandwich(
    'Veggie Delight',
    'jennifer.johnson@sandwicheck.app',
    [
      { name: 'Whole Wheat' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Avocado', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Spinach', portion: PORTION.full },
    ],
    'Light and fresh. Perfect for a healthy lifestyle!',
    9, // Good vegetarian option
  ),
  // Emma Johnson - American child, no restrictions
  createSandwich(
    "Emma's Pick",
    'michael.johnson@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'White' },
      { name: 'Mayonnaise', portion: PORTION.half },
      { name: 'Turkey', portion: PORTION.full },
      { name: 'American', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
    ],
    'I like this one! 🎉',
    2, // Child sandwich, fewer votes
    'Emma Johnson', // Child name
  ),
];

// Israeli Jewish family sandwiches (Strict kosher, traditional Jewish)
export const cohenSandwiches = [
  // Yitzhak Cohen - Israeli, kosher, meat
  createSandwich(
    'Kosher Deli Classic',
    'yitzhak.cohen@sandwicheck.app',
    [
      { name: 'Rye' },
      { name: 'Pastrami', portion: PORTION.double },
      { name: 'Corned Beef', portion: PORTION.full },
      { name: 'Pickles', portion: PORTION.half },
      { name: 'Spicy Brown Mustard', portion: PORTION.half },
    ],
    'Authentic kosher deli taste. No dairy with meat!',
    26, // Very popular kosher option
  ),
  // Rivka Cohen - Israeli, kosher, vegetarian
  createSandwich(
    'Kosher Veggie',
    'rivka.cohen@sandwicheck.app',
    [
      { name: 'Whole Wheat' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Olives', portion: PORTION.half },
    ],
    'Perfect kosher vegetarian option. Fresh and healthy!',
    14, // Good kosher vegetarian option
  ),
  // Avi Cohen - Israeli child, kosher, meat
  createSandwich(
    "Avi's Favorite",
    'yitzhak.cohen@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'Rye' },
      { name: 'Pastrami', portion: PORTION.full },
      { name: 'Pickles', portion: PORTION.half },
      { name: 'Spicy Brown Mustard', portion: PORTION.half },
    ],
    'So good! 😋',
    3, // Child sandwich, some votes
    'Avi Cohen', // Child name
  ),
  // Shira Cohen - Israeli child, kosher, vegetarian
  createSandwich(
    "Shira's Special",
    'yitzhak.cohen@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'Whole Wheat' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
    ],
    'Yummy veggie sandwich! 🌱',
    1, // Child sandwich, minimal votes
    'Shira Cohen', // Child name
  ),
  // Eli Cohen - Israeli child, kosher
  createSandwich(
    "Eli's Sandwich",
    'yitzhak.cohen@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'White' },
      { name: 'Mayonnaise', portion: PORTION.half },
      { name: 'Turkey', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
    ],
    'I like it! 👍',
    2, // Child sandwich, fewer votes
    'Eli Cohen', // Child name
  ),
  // Tamar Cohen - Israeli child, kosher, vegetarian
  createSandwich(
    "Tamar's Delight",
    'yitzhak.cohen@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'Whole Wheat' },
      { name: 'Avocado', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
    ],
    'My favorite! 💚',
    1, // Child sandwich, minimal votes
    'Tamar Cohen', // Child name
  ),
];

// Single adults sandwiches
export const singleAdultsSandwiches = [
  // Marco Rossi - Italian-American, meat
  createSandwich(
    'Italian Classic',
    'marco.rossi@sandwicheck.app',
    [
      { name: 'Ciabatta' },
      { name: 'Prosciutto', portion: PORTION.full },
      { name: 'Capocollo', portion: PORTION.full },
      { name: 'Provolone', portion: PORTION.full },
      { name: 'Arugula', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Oil & Vinegar', portion: PORTION.half },
    ],
    'Brings me back to Italy! Authentic flavors.',
    11, // Good Italian option
  ),
  // David Goldstein - Jewish-American, kosher, meat
  createSandwich(
    'NYC Deli Style',
    'david.goldstein@sandwicheck.app',
    [
      { name: 'Rye' },
      { name: 'Pastrami', portion: PORTION.double },
      { name: 'Corned Beef', portion: PORTION.full },
      { name: 'Sauerkraut', portion: PORTION.half },
      { name: 'Spicy Brown Mustard', portion: PORTION.half },
    ],
    "Just like Katz's! Strictly kosher, no dairy.",
    19, // Popular NYC-style deli
  ),
  // Sarah Mitchell - American, vegetarian, vegan
  createSandwich(
    'Plant Power',
    'sarah.mitchell@sandwicheck.app',
    [
      { name: 'Lettuce Wrap' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Avocado', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Spinach', portion: PORTION.full },
      { name: 'Balsamic Dressing', portion: PORTION.half },
    ],
    '100% plant-based and delicious! No animal products.',
    7, // Good vegan option
  ),
  // Yusuf Hassan - Middle Eastern, halal, meat
  createSandwich(
    'Halal Special',
    'yusuf.hassan@sandwicheck.app',
    [
      { name: 'Whole Wheat' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Baked Chicken', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Onions', portion: PORTION.half },
      { name: 'Spicy Brown Mustard', portion: PORTION.half },
    ],
    'Perfect halal option. Tasty and traditional!',
    13, // Good halal option
  ),
  // Isabella Martinez - Hispanic-American, vegetarian
  createSandwich(
    'Mediterranean Veggie',
    'isabella.martinez@sandwicheck.app',
    [
      { name: 'Ciabatta' },
      { name: 'Mozzarella', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Arugula', portion: PORTION.full },
      { name: 'Balsamic Dressing', portion: PORTION.half },
    ],
    'Fresh and flavorful. Reminds me of home!',
    8, // Good Mediterranean option
  ),
  // James Thompson - American, meat (using default name - small part)
  createSandwich(
    'My Sandwich', // Default-style name
    'james.thompson@sandwicheck.app',
    [
      { name: 'White' },
      { name: 'Mayonnaise', portion: PORTION.half },
      { name: 'Roast Beef', portion: PORTION.full },
      { name: 'Bacon', portion: PORTION.half },
      { name: 'Cheddar', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Onions', portion: PORTION.half },
    ],
    'Hearty and satisfying. My go-to!',
    6, // Moderate votes
  ),
];

// Additional sandwiches with variations (some with typos, more comments, etc.)
export const additionalSandwiches = [
  // Another sandwich for Dimitri with a typo
  createSandwich(
    'Greek Favorit', // Typo: "Favorit" instead of "Favorite"
    'dimitri.papadopoulos@sandwicheck.app',
    [
      { name: 'Semolina' },
      { name: 'Feta', portion: PORTION.full },
      { name: 'Roasted Red Peppers', portion: PORTION.full },
      { name: 'Olives', portion: PORTION.half },
      { name: 'Oil & Vinegar', portion: PORTION.half },
    ],
    'Another great option from the Mediterranean!',
    2, // Typo in name, fewer votes
  ),
  // Another sandwich for Elena - kosher, vegetarian, fish (fish + dairy OK in kosher)
  createSandwich(
    'Seaside Special',
    'elena.papadopoulos@sandwicheck.app',
    [
      { name: 'Whole Wheat' },
      { name: 'Mayonnaise', portion: PORTION.half },
      { name: 'Tuna Salad', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
    ],
    'Perfect for a seaside lunch! Fresh and kosher.',
    5, // Moderate votes
  ),
  // Another sandwich for Fatima
  createSandwich(
    'Middle Eastern Classic',
    'fatima.alrashid@sandwicheck.app',
    [
      { name: 'Whole Wheat Wrap' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Baked Chicken', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Pickles', portion: PORTION.half },
    ],
    'Traditional wrap style. Delicious!',
    10, // Good halal wrap option
  ),
  // Another sandwich for Michael
  createSandwich(
    'BBQ Beef',
    'michael.johnson@sandwicheck.app',
    [
      { name: 'White' },
      { name: 'BBQ Sauce', portion: PORTION.half },
      { name: 'Roast Beef', portion: PORTION.full },
      { name: 'Cheddar', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Onions', portion: PORTION.half },
    ],
    'Smoky and savory. Perfect for lunch!',
    16, // Popular BBQ option
  ),
  // Another sandwich for Jennifer - Avocado toast style (vegetarian, no cheese)
  createSandwich(
    'Avocado Toast Style',
    'jennifer.johnson@sandwicheck.app',
    [
      { name: 'Whole Wheat' },
      { name: 'Avocado', portion: PORTION.double },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Arugula', portion: PORTION.full },
      { name: 'Balsamic Dressing', portion: PORTION.half },
    ],
    'Like avocado toast but better! So fresh.',
    12, // Popular avocado option
  ),
  // Another sandwich for Yitzhak
  createSandwich(
    'Kosher Reuben Style',
    'yitzhak.cohen@sandwicheck.app',
    [
      { name: 'Rye' },
      { name: 'Corned Beef', portion: PORTION.double },
      { name: 'Sauerkraut', portion: PORTION.half },
      { name: 'Spicy Brown Mustard', portion: PORTION.half },
    ],
    'Kosher version of a classic. No dairy!',
    17, // Popular kosher Reuben
  ),
  // Another sandwich for Rivka
  createSandwich(
    'Fresh Garden',
    'rivka.cohen@sandwicheck.app',
    [
      { name: 'Whole Wheat' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Avocado', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
    ],
    'Light and healthy. Perfect kosher vegetarian meal!',
    6, // Moderate votes
  ),
  // Another sandwich for Marco with a typo
  createSandwich(
    'Prosciutto Delight',
    'marco.rossi@sandwicheck.app',
    [
      { name: 'Ciabatta' },
      { name: 'Prosciutto', portion: PORTION.full },
      { name: 'Mozzarella', portion: PORTION.full },
      { name: 'Arugula', portion: PORTION.full },
      { name: 'Balsamic Dressing', portion: PORTION.half },
    ],
    'Simple but elegent. Italian style!', // Typo: "elegent" instead of "elegant"
    4, // Typo in comment, fewer votes
  ),
  // Another sandwich for Sarah
  createSandwich(
    'Vegan Power Bowl',
    'sarah.mitchell@sandwicheck.app',
    [
      { name: 'Lettuce Wrap' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Avocado', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Spinach', portion: PORTION.full },
      { name: 'Roasted Red Peppers', portion: PORTION.full },
      { name: 'Balsamic Dressing', portion: PORTION.half },
    ],
    'Completely plant-based and full of flavor!',
    3, // Moderate vegan option
  ),
  // Another sandwich for Yusuf - halal, meat
  createSandwich(
    'Halal Chicken Wrap',
    'yusuf.hassan@sandwicheck.app',
    [
      { name: 'Whole Wheat Wrap' },
      { name: 'Hummus', portion: PORTION.full },
      { name: 'Baked Chicken', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Onions', portion: PORTION.half },
    ],
    'Traditional halal wrap. Delicious and authentic!',
    9, // Good halal wrap
  ),
  // Another sandwich for Isabella
  createSandwich(
    'Caprese Style',
    'isabella.martinez@sandwicheck.app',
    [
      { name: 'Ciabatta' },
      { name: 'Mozzarella', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Arugula', portion: PORTION.full },
      { name: 'Balsamic Dressing', portion: PORTION.half },
    ],
    'Inspired by Italian caprese. Fresh mozzarella is key!',
    7, // Good caprese option
  ),
  // Another sandwich for James (default name) - meat preference
  createSandwich(
    'Sandwich', // Very default name
    'james.thompson@sandwicheck.app',
    [
      { name: 'White' },
      { name: 'Mayonnaise', portion: PORTION.half },
      { name: 'Turkey', portion: PORTION.full },
      { name: 'Swiss', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
    ],
    'Simple and good.',
    1, // Very default name, minimal votes
  ),
];

// French family sandwiches (Classic French cuisine, quality ingredients)
export const duboisSandwiches = [
  // Pierre Dubois - French, meat
  createSandwich(
    'Croissant Parisien',
    'pierre.dubois@sandwicheck.app',
    [
      { name: 'Croissant' },
      { name: 'Brie', portion: PORTION.full },
      { name: 'Prosciutto', portion: PORTION.full },
      { name: 'Arugula', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Dijon Mustard', portion: PORTION.half },
    ],
    'Un délice français authentique! Classic Parisian flavors.',
    22, // Popular French option
  ),
  // Pierre Dubois - Another French classic
  createSandwich(
    'Jambon-Beurre',
    'pierre.dubois@sandwicheck.app',
    [
      { name: 'Croissant' },
      { name: 'Ham', portion: PORTION.full },
      { name: 'Brie', portion: PORTION.full },
      { name: 'Dijon Mustard', portion: PORTION.half },
      { name: 'Arugula', portion: PORTION.full },
    ],
    'Le sandwich français par excellence! Simple and elegant.',
    18, // Classic French ham and butter style
  ),
  // Sophie Dubois - French child
  createSandwich(
    "Sophie's Croissant",
    'pierre.dubois@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'Croissant' },
      { name: 'Brie', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
    ],
    "C'est délicieux! 🥐",
    4, // Child sandwich, some votes
    'Sophie Dubois', // Child name
  ),
  // Sophie Dubois - Another child sandwich
  createSandwich(
    'Petit Déjeuner',
    'pierre.dubois@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'Croissant' },
      { name: 'Ham', portion: PORTION.full },
      { name: 'Swiss', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
    ],
    'Mon sandwich préféré! 😊',
    3, // Child sandwich, some votes
    'Sophie Dubois', // Child name
  ),
  // Sophie Dubois - Third child sandwich
  createSandwich(
    'Sandwich Français',
    'pierre.dubois@sandwicheck.app', // Parent email for tethered child
    [
      { name: 'White' },
      { name: 'Brie', portion: PORTION.full },
      { name: 'Tomatoes', portion: PORTION.full },
      { name: 'Cucumbers', portion: PORTION.full },
      { name: 'Lettuce', portion: PORTION.full },
      { name: 'Dijon Mustard', portion: PORTION.half },
    ],
    'Très bon! 🌟',
    2, // Child sandwich, fewer votes
    'Sophie Dubois', // Child name
  ),
];

// Combine all sandwiches
export const sandwichesData = [
  ...papadopoulosSandwiches,
  ...alRashidSandwiches,
  ...johnsonSandwiches,
  ...cohenSandwiches,
  ...duboisSandwiches,
  ...singleAdultsSandwiches,
  ...additionalSandwiches,
];
