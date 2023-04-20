import { EXTENSION, PORTIONS, TYPES } from "../constants/ingredients-constants";

export const trimObjectEmptyProperties = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));

export const capitalizeFirst = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

export const capitalize = (str) => str.replace(/\b\w/g, (l) => l.toUpperCase());

export const assembleImageSrc = ({ sandwich, ingredients, ingredientType }) => {
    const portion = PORTIONS.full;

    const ingredient = ingredients[ingredientType].find(
        (ingredient) => ingredient.id === sandwich[ingredientType]
    );

    const path = `${process.env.REACT_APP_API_SERVER}/uploads/ingredients/`;

    const breadShape =
        ingredients[TYPES.bread].find((bread) => bread.id === sandwich?.bread)
            ?.shape || "round";

    const suffix = {
        bread: ["", "_sliced"][+(Object.values(sandwich).filter((x) => !!x).length > 1)],
        protein: `_${breadShape}_${portion}`,
        cheese: `_${breadShape}_${portion}`,
        toppings: `_${breadShape}_${portion}`,
        condiments: `_${breadShape}_${portion}`,
    };

    const extension = `.${EXTENSION}`;

    return path + ingredient.imageBase + suffix[ingredientType] + extension;
};

export const timeDifference = (date1, date2) => {
    const difference = date2 - date1;
    const differenceTime = {
        days: Math.floor(difference / 1000 / 60 / 60 / 24),
        hours: Math.floor(difference / 1000 / 60 / 60),
        minutes: Math.floor(difference / 1000 / 60),
        seconds: Math.floor(difference / 1000),
    };
    return differenceTime;
};
