export const INGREDIENTS_IMAGES_PATH = "uploads/ingredients/";

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
};
export const DEFAULT_PORTION = PORTIONS.full;

export const isBreadType = (type) => type === TYPES.bread;

export const EXTENSION = "png";

export const INGREDIENTS_CACHE_TIME_OUT_MINS = 5;
