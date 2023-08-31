export const TYPES = {
  bread: "bread",
  protein: "protein",
  cheese: "cheese",
  toppings: "toppings",
  condiments: "condiments",
};

export const DIETARY_PREFERENCES = {
  vegetarian: "vegetarian",
  kosher: "kosher",
  halal: "halal",
  vegan: "vegan",
  meat: "meat",
  diary: "diary",
  fish: "fish",
};

export const SHAPES = {
  long: "long",
  round: "round",
  trapezoid: "trapezoid",
};

export const PORTIONS = {
  full: "full",
  half: "half",
  double: "double",
};

export const IMAGE_FIELDS = [
  {
    fieldName: "imageLongDouble",
    title: `shape: ${SHAPES.long}, portion: ${PORTIONS.double}`,
    suffix: `_${SHAPES.long}_${PORTIONS.double}`,
  },
  {
    fieldName: "imageLongFull",
    title: `shape: ${SHAPES.long}, portion: ${PORTIONS.full}`,
    suffix: `_${SHAPES.long}_${PORTIONS.full}`,
  },
  {
    fieldName: "imageLongHalf",
    title: `shape: ${SHAPES.long}, portion: ${PORTIONS.half}`,
    suffix: `_${SHAPES.long}_${PORTIONS.half}`,
  },
  {
    fieldName: "imageRoundDouble",
    title: `shape: ${SHAPES.round}, portion: ${PORTIONS.double}`,
    suffix: `_${SHAPES.round}_${PORTIONS.double}`,
  },
  {
    fieldName: "imageRoundFull",
    title: `shape: ${SHAPES.round}, portion: ${PORTIONS.full}`,
    suffix: `_${SHAPES.round}_${PORTIONS.full}`,
  },
  {
    fieldName: "imageRoundHalf",
    title: `shape: ${SHAPES.round}, portion: ${PORTIONS.half}`,
    suffix: `_${SHAPES.round}_${PORTIONS.half}`,
  },
  {
    fieldName: "imageTrapezoidDouble",
    title: `shape: ${SHAPES.trapezoid}, portion: ${PORTIONS.double}`,
    suffix: `_${SHAPES.trapezoid}_${PORTIONS.double}`,
  },
  {
    fieldName: "imageTrapezoidFull",
    title: `shape: ${SHAPES.trapezoid}, portion: ${PORTIONS.full}`,
    suffix: `_${SHAPES.trapezoid}_${PORTIONS.full}`,
  },
  {
    fieldName: "imageTrapezoidHalf",
    title: `shape: ${SHAPES.trapezoid}, portion: ${PORTIONS.half}`,
    suffix: `_${SHAPES.trapezoid}_${PORTIONS.half}`,
  },
];

export const IMAGE_FIELDS_BREAD = [
  {
    fieldName: "imageBread",
    title: `whole unsliced bread`,
    suffix: ``,
  },
  {
    fieldName: "imageBreadSliced",
    title: `sliced bread`,
    suffix: `_sliced`,
  },
];

export const ALL_IMAGE_FIELDS = [...IMAGE_FIELDS, ...IMAGE_FIELDS_BREAD];

export const imageFieldsByType = (type) => {
  return isBreadType(type) ? IMAGE_FIELDS_BREAD : IMAGE_FIELDS;
};

export const isBreadType = (type) => type === TYPES.bread;

export const PRODUCTS = {
  meat: "meat",
  fish: "fish",
  diary: "diary",
};
