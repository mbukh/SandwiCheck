import { useSandwichContext } from '../../../context/SandwichContext';
import { generateIngredientImageSrc } from '../../../utils/ingredients-utils';

const SandwichBuilderImage = () => {
  const { sandwich } = useSandwichContext();

  return (
    <div className="sandwich-images">
      {sandwich.ingredients.map((ingredient, index) => (
        <img
          key={ingredient.id}
          src={generateIngredientImageSrc({
            ingredient,
            sandwich,
            imageType: 'builderImage',
          })}
          className="absolute inset-0 size-full object-contain drag-none select-none"
          alt={`Sandwich ingredients layer #${index}`}
          loading="lazy"
        />
      ))}
    </div>
  );
};

export default SandwichBuilderImage;
