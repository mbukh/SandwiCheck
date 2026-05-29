import { DIETARY_PREFERENCE as D_P } from '../../constants/ingredientsConstants.ts';
import { ROLE } from '../../constants/usersConstants.ts';

/*
 * Family 1: Greek Orthodox family (2 parents + 2 children)
 * Nationality: Greek | Food priorities: Mediterranean, kosher-compatible, vegetarian-friendly
 */
export const papadopoulosFamily = [
  {
    name: 'Dimitri Papadopoulos',
    email: 'dimitri.papadopoulos@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6', // Should be hashed before saving
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.kosher, D_P.vegetarian], // Prefers kosher-compatible, loves Mediterranean vegetables
    // Nationality: Greek | Tastes: Feta cheese, olives, fresh vegetables, Mediterranean flavors
  },
  {
    name: 'Elena Papadopoulos',
    email: 'elena.papadopoulos@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.kosher, D_P.vegetarian, D_P.fish], // Mediterranean diet with fish
    // Nationality: Greek | Tastes: Fresh seafood, feta, olive oil, Greek salads
  },
  {
    name: 'Alexandros Papadopoulos',
    // Email and password omitted for tethered child
    isTetheredChild: true,
    roles: [ROLE.user, ROLE.child],
    dietaryPreferences: [D_P.kosher, D_P.vegetarian], // Follows family preferences
    // Nationality: Greek | Tastes: Simple, kid-friendly Mediterranean options
    _parentEmails: ['dimitri.papadopoulos@sandwicheck.app', 'elena.papadopoulos@sandwicheck.app'], // Temporary: used by init script to link parents
  },
  {
    name: 'Sofia Papadopoulos',
    // Email and password omitted for tethered child
    isTetheredChild: true,
    roles: [ROLE.user, ROLE.child],
    dietaryPreferences: [D_P.kosher, D_P.vegetarian], // Follows family preferences
    // Nationality: Greek | Tastes: Prefers mild flavors, loves feta and olives
    _parentEmails: ['dimitri.papadopoulos@sandwicheck.app', 'elena.papadopoulos@sandwicheck.app'], // Temporary: used by init script to link parents
  },
];

/*
 * Family 2: Single mother with child (Middle Eastern/Muslim)
 * Nationality: Middle Eastern | Food priorities: Halal, traditional Middle Eastern
 */
export const alRashidFamily = [
  {
    name: 'Fatima Al-Rashid',
    email: 'fatima.alrashid@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.halal, D_P.meat], // Strict halal, prefers halal-certified meats
    // Nationality: Middle Eastern | Tastes: Hummus, halal chicken, traditional spices, no pork
  },
  {
    name: 'Omar Al-Rashid',
    // Email and password omitted for tethered child
    isTetheredChild: true,
    roles: [ROLE.user, ROLE.child],
    dietaryPreferences: [D_P.halal], // Follows mother's halal preferences
    // Nationality: Middle Eastern | Tastes: Halal meats, hummus, simple kid-friendly options
    _parentEmails: ['fatima.alrashid@sandwicheck.app'], // Temporary: used by init script to link parent
  },
];

/*
 * Family 3: American family (2 parents + 1 child)
 * Nationality: American | Food priorities: General American, flexible preferences
 */
export const johnsonFamily = [
  {
    name: 'Michael Johnson',
    email: 'michael.johnson@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.meat], // Classic American tastes, loves deli meats
    // Nationality: American | Tastes: Roast beef, turkey, classic deli sandwiches
  },
  {
    name: 'Jennifer Johnson',
    email: 'jennifer.johnson@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.vegetarian], // Prefers lighter, vegetarian options
    // Nationality: American | Tastes: Fresh vegetables, avocado, healthy options
  },
  {
    name: 'Emma Johnson',
    // Email and password omitted for tethered child
    isTetheredChild: true,
    roles: [ROLE.user, ROLE.child],
    dietaryPreferences: [], // No specific restrictions, kid-friendly
    // Nationality: American | Tastes: Simple, familiar flavors, picky eater
    _parentEmails: ['michael.johnson@sandwicheck.app', 'jennifer.johnson@sandwicheck.app'], // Temporary: used by init script to link parents
  },
];

/*
 * Family 4: Israeli Jewish family (2 parents + 4 children)
 * Nationality: Israeli | Food priorities: Strict kosher, traditional Jewish cuisine
 */
export const cohenFamily = [
  {
    name: 'Yitzhak Cohen',
    email: 'yitzhak.cohen@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.kosher, D_P.meat], // Strict kosher, traditional Israeli deli
    // Nationality: Israeli | Tastes: Pastrami, corned beef, kosher deli meats, no mixing meat/dairy
  },
  {
    name: 'Rivka Cohen',
    email: 'rivka.cohen@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.kosher, D_P.vegetarian], // Strict kosher, prefers vegetarian to avoid meat/dairy mixing
    // Nationality: Israeli | Tastes: Fresh vegetables, hummus, tahini, kosher-compliant options
  },
  {
    name: 'Avi Cohen',
    // Email and password omitted for tethered child
    isTetheredChild: true,
    roles: [ROLE.user, ROLE.child],
    dietaryPreferences: [D_P.kosher, D_P.meat], // Follows family kosher preferences
    // Nationality: Israeli | Tastes: Kosher deli meats, simple kid-friendly options
    _parentEmails: ['yitzhak.cohen@sandwicheck.app', 'rivka.cohen@sandwicheck.app'], // Temporary: used by init script to link parents
  },
  {
    name: 'Shira Cohen',
    // Email and password omitted for tethered child
    isTetheredChild: true,
    roles: [ROLE.user, ROLE.child],
    dietaryPreferences: [D_P.kosher, D_P.vegetarian], // Follows family kosher preferences
    // Nationality: Israeli | Tastes: Vegetarian kosher options, fresh vegetables
    _parentEmails: ['yitzhak.cohen@sandwicheck.app', 'rivka.cohen@sandwicheck.app'], // Temporary: used by init script to link parents
  },
  {
    name: 'Eli Cohen',
    // Email and password omitted for tethered child
    isTetheredChild: true,
    roles: [ROLE.user, ROLE.child],
    dietaryPreferences: [D_P.kosher], // Follows family kosher preferences
    // Nationality: Israeli | Tastes: Simple kosher options, kid-friendly
    _parentEmails: ['yitzhak.cohen@sandwicheck.app', 'rivka.cohen@sandwicheck.app'], // Temporary: used by init script to link parents
  },
  {
    name: 'Tamar Cohen',
    // Email and password omitted for tethered child
    isTetheredChild: true,
    roles: [ROLE.user, ROLE.child],
    dietaryPreferences: [D_P.kosher, D_P.vegetarian], // Follows family kosher preferences
    // Nationality: Israeli | Tastes: Vegetarian kosher options, prefers mild flavors
    _parentEmails: ['yitzhak.cohen@sandwicheck.app', 'rivka.cohen@sandwicheck.app'], // Temporary: used by init script to link parents
  },
];

// Single adults with diverse backgrounds
export const singleAdults = [
  {
    name: 'Marco Rossi',
    email: 'marco.rossi@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.meat], // Italian-American deli lover
    // Nationality: Italian-American | Tastes: Prosciutto, capocollo, Italian cold cuts, strong flavors
  },
  {
    name: 'David Goldstein',
    email: 'david.goldstein@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.kosher, D_P.meat], // Observant Jewish, strict kosher
    // Nationality: Jewish-American | Tastes: Pastrami, corned beef, kosher deli meats, no mixing meat/dairy
  },
  {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.vegetarian, D_P.vegan], // Health-conscious vegan
    // Nationality: American | Tastes: Plant-based options, avocado, fresh vegetables, no animal products
  },
  {
    name: 'Yusuf Hassan',
    email: 'yusuf.hassan@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.halal, D_P.meat], // Observant Muslim, halal only
    // Nationality: Middle Eastern | Tastes: Halal chicken, turkey, hummus, no pork or alcohol
  },
  {
    name: 'Isabella Martinez',
    email: 'isabella.martinez@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.vegetarian], // Vegetarian with Mediterranean influence
    // Nationality: Hispanic-American | Tastes: Fresh vegetables, cheese, Mediterranean flavors
  },
  {
    name: 'James Thompson',
    email: 'james.thompson@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.meat], // Classic American, no restrictions
    // Nationality: American | Tastes: All deli meats, bacon, hearty sandwiches
  },
];

/*
 * Family 5: French family (1 parent + 1 child)
 * Nationality: French | Food priorities: Classic French cuisine, quality ingredients
 */
export const duboisFamily = [
  {
    name: 'Pierre Dubois',
    email: 'pierre.dubois@sandwicheck.app',
    password: '$2b$10$IXTxCshR90WS74MaZsfz3.qezwppCCRAKDwsv.a..bk5P11SzW7S6',
    roles: [ROLE.user, ROLE.parent],
    dietaryPreferences: [D_P.meat], // Classic French tastes, loves quality meats and cheeses
    // Nationality: French | Tastes: Brie, prosciutto, Dijon mustard, croissant, traditional French flavors
  },
  {
    name: 'Sophie Dubois',
    // Email and password omitted for tethered child
    isTetheredChild: true,
    roles: [ROLE.user, ROLE.child],
    dietaryPreferences: [], // No specific restrictions, kid-friendly French options
    // Nationality: French | Tastes: Simple French flavors, croissant, mild cheeses
    _parentEmails: ['pierre.dubois@sandwicheck.app'], // Temporary: used by init script to link parent
  },
];

// Combine all users into a single export
export const usersData = [
  ...papadopoulosFamily,
  ...alRashidFamily,
  ...johnsonFamily,
  ...cohenFamily,
  ...duboisFamily,
  ...singleAdults,
];
