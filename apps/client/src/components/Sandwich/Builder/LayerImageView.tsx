import { TYPE } from '@sandwicheck/shared';
import { useSandwichContext } from '@/context/SandwichContext';
import type { SandwichLayer } from '@/types/domain';
import { cn } from '@/utils/cn';
import { generateIngredientImageSrc } from '@/utils/ingredients-utils';

interface LayerImageViewProps {
  ingredient: SandwichLayer;
  originalIndex: number;
  transitionState: string;
  showSwiper: boolean;
}

/**
 * Component for displaying the static layer image
 * Handles fade-scale animations during transitions
 */
const LayerImageView = ({
  ingredient,
  originalIndex,
  transitionState,
  showSwiper,
}: LayerImageViewProps): React.JSX.Element => {
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
