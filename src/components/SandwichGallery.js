import { debug } from "../constants/debug";

import { Loading } from "../components";

import { useState } from "react";

import { readIngredientsCollection } from "../services/apiIngredients";

import { ingredientTypes } from "../constants/ingredientTypes";

const SandwichGallery = () => {
    const [loading, setLoading] = useState(true);
    const [ingredients, setIngredients] = useState({});

    useState(() => {
        setLoading(true);

        (async () => {
            try {
                const valuesArray = await Promise.all(
                    ingredientTypes.map((ingredientType) =>
                        readIngredientsCollection(ingredientType)
                    )
                );
                const ingredientsAsObject = valuesArray.reduce(
                    (a, v, idx) => ({ ...a, [ingredientTypes[idx]]: v }),
                    {}
                );
                debug && console.log("All ingredients:", ingredientsAsObject);

                setIngredients(ingredientsAsObject);
                setLoading(false);
            } catch (error) {
                debug &&
                    console.log(
                        "Not all ingredients retrieved: ",
                        error.message
                    );

                setLoading(false);
            }
        })();
    }, []);

    return <></>;
};

export default SandwichGallery;
