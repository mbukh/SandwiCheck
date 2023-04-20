import { assembleImageSrc } from "../../utils/index";

const SandwichBuildImage = ({ sandwich, ingredients }) => {
    return (
        <div className="sandwich-images">
            {Object.keys(ingredients).map(
                (ingredientType) =>
                    sandwich.hasOwnProperty(ingredientType) &&
                    sandwich[ingredientType] && (
                        <img
                            key={ingredientType}
                            src={assembleImageSrc({
                                sandwich,
                                ingredients,
                                ingredientType,
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

export default SandwichBuildImage;
