import { assembleImageSrc } from "../../utils/";

const SandwichImage = ({ sandwich, ingredientTypes, ingredients, className = "" }) => {
    return (
        <div className={`sandwich-images ${className}`}>
            {ingredientTypes.map(
                (ingredientType) =>
                    sandwich.hasOwnProperty(ingredientType) &&
                    sandwich[ingredientType] && (
                        <img
                            key={ingredientType}
                            src={assembleImageSrc(
                                sandwich,
                                ingredients,
                                ingredientType,
                                "full",
                                "normal"
                            )}
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
