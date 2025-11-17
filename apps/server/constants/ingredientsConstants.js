export const TYPE = {
  bread: 'bread',
  protein: 'protein',
  cheese: 'cheese',
  toppings: 'toppings',
  condiments: 'condiments',
};

export const DIETARY_PREFERENCE = {
  vegetarian: 'vegetarian',
  kosher: 'kosher',
  halal: 'halal',
  vegan: 'vegan',
  meat: 'meat',
  dairy: 'dairy',
  fish: 'fish',
};

export const SHAPE = {
  long: 'long',
  round: 'round',
  trapezoid: 'trapezoid',
};

export const PORTION = {
  full: 'full',
  half: 'half',
  double: 'double',
};

export const IMAGE_FIELDS = [
  {
    fieldName: 'imageLongDouble',
    title: `shape: ${SHAPE.long}, portion: ${PORTION.double}`,
    suffix: `_${SHAPE.long}_${PORTION.double}`,
  },
  {
    fieldName: 'imageLongFull',
    title: `shape: ${SHAPE.long}, portion: ${PORTION.full}`,
    suffix: `_${SHAPE.long}_${PORTION.full}`,
  },
  {
    fieldName: 'imageLongHalf',
    title: `shape: ${SHAPE.long}, portion: ${PORTION.half}`,
    suffix: `_${SHAPE.long}_${PORTION.half}`,
  },
  {
    fieldName: 'imageRoundDouble',
    title: `shape: ${SHAPE.round}, portion: ${PORTION.double}`,
    suffix: `_${SHAPE.round}_${PORTION.double}`,
  },
  {
    fieldName: 'imageRoundFull',
    title: `shape: ${SHAPE.round}, portion: ${PORTION.full}`,
    suffix: `_${SHAPE.round}_${PORTION.full}`,
  },
  {
    fieldName: 'imageRoundHalf',
    title: `shape: ${SHAPE.round}, portion: ${PORTION.half}`,
    suffix: `_${SHAPE.round}_${PORTION.half}`,
  },
  {
    fieldName: 'imageTrapezoidDouble',
    title: `shape: ${SHAPE.trapezoid}, portion: ${PORTION.double}`,
    suffix: `_${SHAPE.trapezoid}_${PORTION.double}`,
  },
  {
    fieldName: 'imageTrapezoidFull',
    title: `shape: ${SHAPE.trapezoid}, portion: ${PORTION.full}`,
    suffix: `_${SHAPE.trapezoid}_${PORTION.full}`,
  },
  {
    fieldName: 'imageTrapezoidHalf',
    title: `shape: ${SHAPE.trapezoid}, portion: ${PORTION.half}`,
    suffix: `_${SHAPE.trapezoid}_${PORTION.half}`,
  },
];

export const IMAGE_FIELDS_BREAD = [
  {
    fieldName: 'imageBread',
    title: `whole unsliced bread`,
    suffix: ``,
  },
  {
    fieldName: 'imageBreadSliced',
    title: `sliced bread`,
    suffix: `_sliced`,
  },
];

export const ALL_IMAGE_FIELDS = [...IMAGE_FIELDS, ...IMAGE_FIELDS_BREAD];

export const imageFieldsByType = (type) => {
  return isBreadType(type) ? IMAGE_FIELDS_BREAD : IMAGE_FIELDS;
};

export const isBreadType = (type) => type === TYPE.bread;

export const PRODUCT = {
  meat: 'meat',
  fish: 'fish',
  dairy: 'dairy',
};
