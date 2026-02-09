import { TYPE } from '../../../constants/ingredients-constants';
import { useSandwichContext } from '../../../context/SandwichContext';
import { cn } from '../../../utils/cn';
import { generateIngredientImageSrc } from '../../../utils/ingredients-utils';

/**
 * Component for displaying the static layer image
 * Handles fade-scale animations during transitions
 */
const LayerImageView = ({ ingredient, originalIndex, transitionState, showSwiper }) => {
  const { sandwich, isAddingLayer } = useSandwichContext();

  return (
    <div
      className={cn(
        'layer-image-container min-w-0',
        transitionState === 'image-out' && 'image-fade-scale-out',
        transitionState === 'image-in' && 'image-fade-scale-in',
        ingredient?.unconfirmed && !showSwiper && 'opacity-0',
        showSwiper && 'absolute inset-0',
      )}
    >
      <img
        src={generateIngredientImageSrc({
          ingredient,
          sandwich,
          forceBreadSliced: ingredient?.type === TYPE.bread && isAddingLayer,
        })}
        className="size-full object-contain drag-none select-none"
        alt={`Sandwich layer ${originalIndex + 1}: ${ingredient.name}`}
        loading="lazy"
      />
    </div>
  );
};

export default LayerImageView;
