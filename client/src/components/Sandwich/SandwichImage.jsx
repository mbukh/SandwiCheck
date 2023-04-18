import { assembleImageSrc } from "../../utils";

const SandwichImage = ({ sandwich, INGREDIENT_TYPES, ingredients, className = "" }) => {
    return (
        <div className={`sandwich-images ${className}`}>
            {INGREDIENT_TYPES.map(
                (ingredientType) =>
                    sandwich.hasOwnProperty(ingredientType) &&
                    sandwich[ingredientType] && (
                        <img
                            key={ingredientType}
                            src={assembleImageSrc({
                                sandwich,
                                ingredients,
                                ingredientType,
                                proteinPortion: "full",
                                optionSize: "full",
                            })}
                            className="absolute inset-0 object-contain size-full no-drag no-select"
                            alt={ingredientType}
                            loading="lazy"
                        />
                    )
            )}
        </div>
    );
};

export default SandwichImage;
