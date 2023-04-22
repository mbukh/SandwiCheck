import { generateIngredientImageSrc } from "../../utils/ingredients-utils";

const SandwichBuildImage = ({ sandwich }) => {
    return (
        <div className="sandwich-images">
            {sandwich.ingredients.map((ingredient, index) => (
                <img
                    key={ingredient.id}
                    src={generateIngredientImageSrc({
                        ingredient,
                        sandwich,
                        imageType: "builderImage",
                    })}
                    className="absolute inset-0 object-contain size-full no-drag no-select"
                    alt={`Sandwich ingredients layer #${index}`}
                    loading="lazy"
                />
            ))}
        </div>
    );
};

export default SandwichBuildImage;
