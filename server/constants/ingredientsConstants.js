export const types = {
    bread: "bread",
    protein: "protein",
    cheese: "cheese",
    topping: "topping",
    condiment: "condiment",
};

export const dietaryPreferences = {
    vegetarian: "vegetarian",
    kosher: "kosher",
    halal: "halal",
    vegan: "vegan",
};

export const shapes = {
    long: "long",
    round: "round",
    trapezoid: "trapezoid",
};

export const portions = {
    full: "full",
    half: "half",
    double: "double",
};

export const imageFieldsForAll = [
    {
        fieldName: "imageLongDouble",
        title: `shape: ${shapes.long}, portion: ${portions.double}`,
        suffix: `_${shapes.long}_${portions.double}`,
    },
    {
        fieldName: "imageLongFull",
        title: `shape: ${shapes.long}, portion: ${portions.full}`,
        suffix: `_${shapes.long}_${portions.full}`,
    },
    {
        fieldName: "imageLongHalf",
        title: `shape: ${shapes.long}, portion: ${portions.half}`,
        suffix: `_${shapes.long}_${portions.half}`,
    },
    {
        fieldName: "imageRoundDouble",
        title: `shape: ${shapes.round}, portion: ${portions.double}`,
        suffix: `_${shapes.round}_${portions.double}`,
    },
    {
        fieldName: "imageRoundFull",
        title: `shape: ${shapes.round}, portion: ${portions.full}`,
        suffix: `_${shapes.round}_${portions.full}`,
    },
    {
        fieldName: "imageRoundHalf",
        title: `shape: ${shapes.round}, portion: ${portions.half}`,
        suffix: `_${shapes.round}_${portions.half}`,
    },
    {
        fieldName: "imageTrapezoidDouble",
        title: `shape: ${shapes.trapezoid}, portion: ${portions.double}`,
        suffix: `_${shapes.trapezoid}_${portions.double}`,
    },
    {
        fieldName: "imageTrapezoidFull",
        title: `shape: ${shapes.trapezoid}, portion: ${portions.full}`,
        suffix: `_${shapes.trapezoid}_${portions.full}`,
    },
    {
        fieldName: "imageTrapezoidHalf",
        title: `shape: ${shapes.trapezoid}, portion: ${portions.half}`,
        suffix: `_${shapes.trapezoid}_${portions.half}`,
    },
];

export const imageFieldsForBread = [
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

export const allImageFields = [...imageFieldsForAll, ...imageFieldsForBread];

export const imageFieldsByType = (type) => {
    return isBreadType(type) ? imageFieldsForBread : imageFieldsForAll;
};

export const isBreadType = (type) => type === types.bread;
