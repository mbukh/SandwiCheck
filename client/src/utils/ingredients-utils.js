import {
    TYPES,
    EXTENSION,
    SHAPES,
    DEFAULT_PORTION,
    INGREDIENTS_IMAGES_PATH,
} from "../constants/ingredients-constants";

export const generateIngredientImageSrc = ({
    ingredient,
    sandwich,
    imageType = "swiper",
}) => {
    const { imageBase, type, portion = DEFAULT_PORTION } = ingredient;

    const path = `${process.env.REACT_APP_API_SERVER}/${INGREDIENTS_IMAGES_PATH}`;

    const breadShape = sandwich.ingredients[0]?.shape || SHAPES.long;

    const breadImageIndex =
        imageType === "swiper" || sandwich.ingredients.length < 2 ? 0 : 1;

    const suffix = {
        [TYPES.bread]: ["", "_sliced"][breadImageIndex],
        [TYPES.protein]: `_${breadShape}_${portion}`,
        [TYPES.cheese]: `_${breadShape}_${portion}`,
        [TYPES.toppings]: `_${breadShape}_${portion}`,
        [TYPES.condiments]: `_${breadShape}_${portion}`,
    };

    const extension = `.${EXTENSION}`;

    return path + imageBase + suffix[type] + extension;
};

export const groupIngredientsByTypes = (ingredients) => {
    const groupedIngredients = ingredients.reduce((acc, ingredient) => {
        if (!acc[ingredient.type]) {
            acc[ingredient.type] = [];
        }
        acc[ingredient.type].push(ingredient);
        return acc;
    }, {});

    return groupedIngredients;
};
