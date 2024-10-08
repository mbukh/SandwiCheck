import { TYPES } from '../../constants/ingredientsConstants.js';

export const breadData = [
  {
    name: 'Ciabatta',
    type: TYPES.bread,
    imageBase: '20200620_101006',
    shape: 'long',
    dietaryPreferences: ['vegetarian', 'vegan', 'kosher'],
    displayPriority: 80,
    createdAt: new Date('2020-06-20T06:10:06.000Z'),
  },
  {
    name: 'Semolina',
    type: TYPES.bread,
    imageBase: '20200620_101033',
    shape: 'long',
    dietaryPreferences: ['vegetarian', 'vegan', 'kosher'],
    displayPriority: 60,
    createdAt: new Date('2020-06-20T06:10:33.000Z'),
  },
  {
    name: 'Multi-Grain',
    type: TYPES.bread,
    imageBase: '20200620_101059',
    shape: 'long',
    dietaryPreferences: ['vegetarian', 'vegan', 'kosher', 'halal'],
    displayPriority: 85,
    createdAt: new Date('2020-06-20T06:10:59.000Z'),
  },
  {
    name: 'Rye',
    type: TYPES.bread,
    imageBase: '20200620_101114',
    shape: 'trapezoid',
    dietaryPreferences: ['vegetarian', 'vegan', 'kosher'],
    displayPriority: 70,
    createdAt: new Date('2020-06-20T06:11:14.000Z'),
  },
  {
    name: 'Croissant',
    type: TYPES.bread,
    imageBase: '20200620_101131',
    shape: 'trapezoid',
    dietaryPreferences: ['vegetarian', 'kosher'],
    displayPriority: 75,
    createdAt: new Date('2020-06-20T06:11:31.000Z'),
  },
  {
    name: 'Whole Wheat',
    type: TYPES.bread,
    imageBase: '20200620_101224',
    shape: 'round',
    dietaryPreferences: ['vegetarian', 'vegan', 'kosher', 'halal'],
    displayPriority: 90,
    createdAt: new Date('2020-06-20T06:12:24.000Z'),
  },
  {
    name: 'White',
    type: TYPES.bread,
    imageBase: '20200620_101152',
    shape: 'round',
    dietaryPreferences: ['vegetarian', 'vegan', 'kosher', 'halal'],
    displayPriority: 100,
    createdAt: new Date('2020-06-20T06:11:52.000Z'),
  },
  {
    name: 'Whole Wheat Wrap',
    type: TYPES.bread,
    imageBase: '20180222_030637',
    shape: 'long',
    dietaryPreferences: ['vegetarian', 'vegan', 'kosher', 'halal'],
    displayPriority: 65,
    createdAt: new Date('2018-02-21T23:06:37.000Z'),
  },
  {
    name: 'Lettuce Wrap',
    type: TYPES.bread,
    imageBase: '20200620_101255',
    shape: 'long',
    dietaryPreferences: ['vegetarian', 'vegan', 'kosher', 'halal'],
    displayPriority: 55,
    createdAt: new Date('2020-06-20T06:12:55.000Z'),
  },
  {
    name: 'Gluten-Free',
    type: TYPES.bread,
    imageBase: '20220202_050837',
    shape: 'trapezoid',
    dietaryPreferences: ['vegetarian', 'vegan', 'kosher', 'halal'],
    displayPriority: 40,
    createdAt: new Date('2022-02-02T01:08:37.000Z'),
  },
];

// =================
// =================

export const proteinData = [
  {
    name: 'Turkey',
    type: TYPES.protein,
    imageBase: '20200621_081721',
    dietaryPreferences: ['halal', 'kosher', 'meat'],
    displayPriority: 100,
    createdAt: new Date('2020-06-21T04:17:21.000Z'),
  },
  {
    name: 'Roast Beef',
    type: TYPES.protein,
    imageBase: '20200621_082049',
    dietaryPreferences: ['kosher', 'halal', 'meat'],
    displayPriority: 90,
    createdAt: new Date('2020-06-21T04:20:49.000Z'),
  },
  {
    name: 'Ham',
    type: TYPES.protein,
    imageBase: '20200621_081904',
    dietaryPreferences: ['meat'],
    displayPriority: 85,
    createdAt: new Date('2020-06-21T04:19:04.000Z'),
  },
  {
    name: 'Prosciutto',
    type: TYPES.protein,
    imageBase: '20200621_082227',
    dietaryPreferences: ['meat'],
    displayPriority: 70,
    createdAt: new Date('2020-06-21T04:22:27.000Z'),
  },
  {
    name: 'Corned Beef',
    type: TYPES.protein,
    imageBase: '20200621_082443',
    dietaryPreferences: ['kosher', 'halal', 'meat'],
    displayPriority: 80,
    createdAt: new Date('2020-06-21T04:24:43.000Z'),
  },
  {
    name: 'Pastrami',
    type: TYPES.protein,
    imageBase: '20200621_082538',
    dietaryPreferences: ['kosher', 'halal', 'meat'],
    displayPriority: 75,
    createdAt: new Date('2020-06-21T04:25:38.000Z'),
  },
  {
    name: 'Genoa Salami',
    type: TYPES.protein,
    imageBase: '20200621_082005',
    dietaryPreferences: ['meat'],
    displayPriority: 65,
    createdAt: new Date('2020-06-21T04:20:05.000Z'),
  },
  {
    name: 'Soppressata',
    type: TYPES.protein,
    imageBase: '20200813_113834',
    dietaryPreferences: ['meat'],
    displayPriority: 60,
    createdAt: new Date('2020-08-13T07:38:34.000Z'),
  },
  {
    name: 'Capocollo',
    type: TYPES.protein,
    imageBase: '20200909_100415',
    dietaryPreferences: ['meat'],
    displayPriority: 55,
    createdAt: new Date('2020-09-09T06:04:15.000Z'),
  },
  {
    name: 'Pepperoni',
    type: TYPES.protein,
    imageBase: '20200621_082346',
    dietaryPreferences: ['meat'],
    displayPriority: 50,
    createdAt: new Date('2020-06-21T04:23:46.000Z'),
  },
  {
    name: 'Baked Chicken',
    type: TYPES.protein,
    imageBase: '20200621_082626',
    dietaryPreferences: ['halal', 'kosher', 'meat'],
    displayPriority: 95,
    createdAt: new Date('2020-06-21T04:26:26.000Z'),
  },
  {
    name: 'Bacon',
    type: TYPES.protein,
    imageBase: '20200621_082719',
    dietaryPreferences: ['meat'],
    displayPriority: 45,
    createdAt: new Date('2020-06-21T04:27:19.000Z'),
  },
  {
    name: 'Chicken Salad',
    type: TYPES.protein,
    imageBase: '20200621_082821',
    dietaryPreferences: ['halal', 'kosher', 'meat'],
    displayPriority: 40,
    createdAt: new Date('2020-06-21T04:28:21.000Z'),
  },
  {
    name: 'Tuna Salad',
    type: TYPES.protein,
    imageBase: '20200621_082909',
    dietaryPreferences: ['kosher', 'halal', 'fish'],
    displayPriority: 30,
    createdAt: new Date('2020-06-21T04:29:09.000Z'),
  },
  {
    name: 'Egg Salad',
    type: TYPES.protein,
    imageBase: '20200621_082959',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal'],
    displayPriority: 20,
    createdAt: new Date('2020-06-21T04:29:59.000Z'),
  },
];

// =================
// =================

export const cheeseData = [
  {
    name: 'Swiss',
    type: TYPES.cheese,
    imageBase: '20200621_083351',
    dietaryPreferences: ['vegetarian', 'kosher', 'diary'],
    displayPriority: 80,
    createdAt: new Date('2020-06-21T04:33:51.000Z'),
  },
  {
    name: 'Provolone',
    type: TYPES.cheese,
    imageBase: '20200621_083450',
    dietaryPreferences: ['vegetarian', 'kosher', 'diary'],
    displayPriority: 70,
    createdAt: new Date('2020-06-21T04:34:50.000Z'),
  },
  {
    name: 'Mozzarella',
    type: TYPES.cheese,
    imageBase: '20200621_083553',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'diary'],
    displayPriority: 100,
    createdAt: new Date('2020-06-21T04:35:53.000Z'),
  },
  {
    name: 'Cheddar',
    type: TYPES.cheese,
    imageBase: '20200621_083659',
    dietaryPreferences: ['vegetarian', 'kosher', 'diary'],
    displayPriority: 90,
    createdAt: new Date('2020-06-21T04:36:59.000Z'),
  },
  {
    name: 'Pepper Jack',
    type: TYPES.cheese,
    imageBase: '20200621_083757',
    dietaryPreferences: ['vegetarian', 'kosher', 'diary'],
    displayPriority: 75,
    createdAt: new Date('2020-06-21T04:37:57.000Z'),
  },
  {
    name: 'Muenster',
    type: TYPES.cheese,
    imageBase: '20200621_083858',
    dietaryPreferences: ['vegetarian', 'kosher', 'diary'],
    displayPriority: 60,
    createdAt: new Date('2020-06-21T04:38:58.000Z'),
  },
  {
    name: 'American',
    type: TYPES.cheese,
    imageBase: '20200621_083946',
    dietaryPreferences: ['vegetarian', 'kosher', 'diary'],
    displayPriority: 95,
    createdAt: new Date('2020-06-21T04:39:46.000Z'),
  },
  {
    name: 'Brie',
    type: TYPES.cheese,
    imageBase: '20200621_084108',
    dietaryPreferences: ['vegetarian', 'diary'],
    displayPriority: 50,
    createdAt: new Date('2020-06-21T04:41:08.000Z'),
  },
  {
    name: 'Parmesan',
    type: TYPES.cheese,
    imageBase: '20200621_084307',
    dietaryPreferences: ['vegetarian', 'diary'],
    displayPriority: 65,
    createdAt: new Date('2020-06-21T04:43:07.000Z'),
  },
  {
    name: 'Feta',
    type: TYPES.cheese,
    imageBase: '20200621_092955',
    dietaryPreferences: ['vegetarian', 'halal', 'diary'],
    displayPriority: 55,
    createdAt: new Date('2020-06-21T05:29:55.000Z'),
  },
];

// =================
// =================

export const condimentData = [
  {
    name: 'Mayonnaise',
    type: TYPES.condiments,
    imageBase: '20200621_115703',
    dietaryPreferences: ['vegetarian', 'kosher'],
    displayPriority: 100,
    createdAt: new Date('2020-06-21T07:57:03.000Z'),
  },
  {
    name: 'Spicy Mayonnaise',
    type: TYPES.condiments,
    imageBase: '20200621_121311',
    dietaryPreferences: ['vegetarian', 'kosher'],
    displayPriority: 90,
    createdAt: new Date('2020-06-21T08:13:11.000Z'),
  },
  {
    name: 'Spicy Brown Mustard',
    type: TYPES.condiments,
    imageBase: '20200621_121727',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal'],
    displayPriority: 60,
    createdAt: new Date('2020-06-21T08:17:27.000Z'),
  },
  {
    name: 'Dijon Mustard',
    type: TYPES.condiments,
    imageBase: '20200621_121826',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal'],
    displayPriority: 70,
    createdAt: new Date('2020-06-21T08:18:26.000Z'),
  },
  {
    name: 'Honey Mustard',
    type: TYPES.condiments,
    imageBase: '20200621_121913',
    dietaryPreferences: ['vegetarian', 'kosher'],
    displayPriority: 50,
    createdAt: new Date('2020-06-21T08:19:13.000Z'),
  },
  {
    name: 'Oil & Vinegar',
    type: TYPES.condiments,
    imageBase: '20200621_122357',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 30,
    createdAt: new Date('2020-06-21T08:23:57.000Z'),
  },
  {
    name: 'Pesto',
    type: TYPES.condiments,
    imageBase: '20200621_122152',
    dietaryPreferences: ['vegetarian'],
    displayPriority: 20,
    createdAt: new Date('2020-06-21T08:21:52.000Z'),
  },
  {
    name: 'Balsamic Dressing',
    type: TYPES.condiments,
    imageBase: '20200621_122059',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal'],
    displayPriority: 10,
    createdAt: new Date('2020-06-21T08:20:59.000Z'),
  },
  {
    name: 'Russian Dressing',
    type: TYPES.condiments,
    imageBase: '20200621_122003',
    dietaryPreferences: ['kosher', 'diary'],
    displayPriority: 5,
    createdAt: new Date('2020-06-21T08:20:03.000Z'),
  },
  {
    name: 'Horseradish',
    type: TYPES.condiments,
    imageBase: '20200621_122556',
    dietaryPreferences: ['vegetarian', 'kosher'],
    displayPriority: 40,
    createdAt: new Date('2020-06-21T08:25:56.000Z'),
  },
  {
    name: 'BBQ Sauce',
    type: TYPES.condiments,
    imageBase: '20200621_122455',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal'],
    displayPriority: 80,
    createdAt: new Date('2020-06-21T08:24:55.000Z'),
  },
  {
    name: 'Ranch',
    type: TYPES.condiments,
    imageBase: '20200621_123243',
    dietaryPreferences: ['vegetarian', 'kosher'],
    displayPriority: 95,
    createdAt: new Date('2020-06-21T08:32:43.000Z'),
  },
  {
    name: 'Sriracha',
    type: TYPES.condiments,
    imageBase: '20200621_123445',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal'],
    displayPriority: 85,
    createdAt: new Date('2020-06-21T08:34:45.000Z'),
  },
  {
    name: 'Thai Peanut',
    type: TYPES.condiments,
    imageBase: '20200621_123357',
    dietaryPreferences: ['vegetarian'],
    displayPriority: 15,
    createdAt: new Date('2020-06-21T08:33:57.000Z'),
  },
  {
    name: 'Honey',
    type: TYPES.condiments,
    imageBase: '20200723_023043',
    dietaryPreferences: ['vegetarian', 'kosher'],
    displayPriority: 25,
    createdAt: new Date('2020-07-22T22:30:43.000Z'),
  },
  {
    name: 'Hummus',
    type: TYPES.condiments,
    imageBase: '20200621_102757',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 45,
    createdAt: new Date('2020-06-21T06:27:57.000Z'),
  },
  {
    name: 'Peanut Butter',
    type: TYPES.condiments,
    imageBase: '20220904_112536',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal'],
    displayPriority: 35,
    createdAt: new Date('2022-09-04T07:25:36.000Z'),
  },
  {
    name: 'Strawberry Preserves',
    type: TYPES.condiments,
    imageBase: '20220904_112727',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal'],
    displayPriority: 55,
    createdAt: new Date('2022-09-04T07:27:27.000Z'),
  },
];

// =================
// =================

export const toppingData = [
  {
    name: 'Tomatoes',
    type: TYPES.toppings,
    imageBase: '20200621_093051',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 90,
    createdAt: new Date('2020-06-21T05:30:51.000Z'),
  },
  {
    name: 'Lettuce',
    type: TYPES.toppings,
    imageBase: '20200621_093526',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 95,
    createdAt: new Date('2020-06-21T05:35:26.000Z'),
  },
  {
    name: 'Onions',
    type: TYPES.toppings,
    imageBase: '20200621_095313',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 85,
    createdAt: new Date('2020-06-21T05:53:13.000Z'),
  },
  {
    name: 'Arugula',
    type: TYPES.toppings,
    imageBase: '20200621_095441',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 60,
    createdAt: new Date('2020-06-21T05:54:41.000Z'),
  },
  {
    name: 'Spinach',
    type: TYPES.toppings,
    imageBase: '20200621_095524',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 75,
    createdAt: new Date('2020-06-21T05:55:24.000Z'),
  },
  {
    name: 'Kale',
    type: TYPES.toppings,
    imageBase: '20200621_095607',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 55,
    createdAt: new Date('2020-06-21T05:56:07.000Z'),
  },
  {
    name: 'Alfalfa Sprouts',
    type: TYPES.toppings,
    imageBase: '20200621_095722',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 40,
    createdAt: new Date('2020-06-21T05:57:22.000Z'),
  },
  {
    name: 'Cucumbers',
    type: TYPES.toppings,
    imageBase: '20200621_095400',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 70,
    createdAt: new Date('2020-06-21T05:54:00.000Z'),
  },
  {
    name: 'Pickles',
    type: TYPES.toppings,
    imageBase: '20200621_095938',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 80,
    createdAt: new Date('2020-06-21T05:59:38.000Z'),
  },
  {
    name: 'Olives',
    type: TYPES.toppings,
    imageBase: '20200621_100026',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 65,
    createdAt: new Date('2020-06-21T06:00:26.000Z'),
  },
  {
    name: 'Banana Peppers',
    type: TYPES.toppings,
    imageBase: '20200621_100115',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 50,
    createdAt: new Date('2020-06-21T06:01:15.000Z'),
  },
  {
    name: 'Jalapenos',
    type: TYPES.toppings,
    imageBase: '20200621_100218',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 45,
    createdAt: new Date('2020-06-21T06:02:18.000Z'),
  },
  {
    name: 'Roasted Red Peppers',
    type: TYPES.toppings,
    imageBase: '20200621_100648',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 35,
    createdAt: new Date('2020-06-21T06:06:48.000Z'),
  },
  {
    name: 'Sliced Apple',
    type: TYPES.toppings,
    imageBase: '20200621_100309',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 25,
    createdAt: new Date('2020-06-21T06:03:09.000Z'),
  },
  {
    name: 'Coleslaw',
    type: TYPES.toppings,
    imageBase: '20200621_100450',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 30,
    createdAt: new Date('2020-06-21T06:04:50.000Z'),
  },
  {
    name: 'Sauerkraut',
    type: TYPES.toppings,
    imageBase: '20200621_100559',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 20,
    createdAt: new Date('2020-06-21T06:05:59.000Z'),
  },
  {
    name: 'Kettle Cooked Chips',
    type: TYPES.toppings,
    imageBase: '20200621_100356',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 15,
    createdAt: new Date('2020-06-21T06:03:56.000Z'),
  },
  {
    name: 'Avocado',
    type: TYPES.toppings,
    imageBase: '20200621_100736',
    dietaryPreferences: ['vegetarian', 'kosher', 'halal', 'vegan'],
    displayPriority: 100,
    createdAt: new Date('2020-06-21T06:07:36.000Z'),
  },
];

// =================
// =================
