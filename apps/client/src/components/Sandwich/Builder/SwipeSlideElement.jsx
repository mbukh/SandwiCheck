import { useSwiperSlide } from 'swiper/react';
import { cn } from '../../../utils/cn';
import { generateIngredientImageSrc as generateIngredientImageSource } from '../../../utils/ingredients-utils';

const SwipeSlideElement = ({ ingredient, sandwich }) => {
  const swiperSlide = useSwiperSlide();
  const { isActive } = swiperSlide;

  return (
    <div
      className={cn(
        'swiper-slide-container relative flex aspect-video size-full flex-col items-center justify-center gap-32',
        {
          active: isActive,
        },
      )}
    >
      <img
        key={`${ingredient.id}-${ingredient.portion || 'default'}`}
        src={generateIngredientImageSource({
          ingredient,
          sandwich,
        })}
        className="drag-none"
        alt={ingredient.name}
      />
      <div className="box-shadow-5 absolute bottom-2 left-1/2 inline-block max-w-full min-w-fit -translate-x-1/2 rounded bg-white px-4 py-1 text-sm text-magenta uppercase">
        {ingredient.name}
      </div>
    </div>
  );
};

SwipeSlideElement.displayName = 'SwiperSlide';

export default SwipeSlideElement;
