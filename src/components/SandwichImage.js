const SandwichImage = ({ sandwich, ingredientTypes, ingredients }) => {
    const assembleImageSrc = (ingredientType, proteinPortion, optionSize) => {
        const ingredient = ingredients[ingredientType].find(
            (ingredient) => ingredient.id === sandwich[ingredientType]
        );
        const folder = "/assets/food_images/";
        const filenameBase = ingredient.imageBase;
        const breadShape =
            ingredients["bread"].find((bread) => bread.id === sandwich?.bread)
                ?.shape || "round";
        const extension = ".png";
        const suffix = {
            bread: ["", "sliced"][
                +(Object.values(sandwich).filter((x) => !!x).length > 1)
            ],
            protein: breadShape + ingredient[proteinPortion],
            cheese: breadShape + ingredient[optionSize],
            toppings: breadShape + ingredient[optionSize],
            condiments: breadShape + ingredient[optionSize],
        };
        return folder + filenameBase + suffix[ingredientType] + extension;
    };

    return (
        <div className="sandwich-images" style={{ position: "relative" }}>
            {ingredientTypes.map((ingredientType) => (
                <div className={`${ingredientType}-image`} key={ingredientType}>
                    <div
                        className="image-holder"
                        style={{ position: "absolute" }}
                    >
                        {sandwich.hasOwnProperty(ingredientType) &&
                            sandwich[ingredientType] && (
                                <img
                                    src={assembleImageSrc(
                                        ingredientType,
                                        "full",
                                        "normal"
                                    )}
                                    alt={ingredientType}
                                />
                            )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SandwichImage;
