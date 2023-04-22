export const TYPES = {
    bread: "bread",
    protein: "protein",
    cheese: "cheese",
    toppings: "toppings",
    condiments: "condiments",
};

export const SHAPES = {
    long: "long",
    round: "round",
    trapezoid: "trapezoid",
};

export const PORTIONS = {
    half: "half",
    full: "full",
    double: "double",
    defaultPortion: "half",
};

export const isBreadType = (type) => type === TYPES.bread;

export const EXTENSION = "png";

export const INGREDIENTS_CACHE_TIME_OUT_MINS = 5;
