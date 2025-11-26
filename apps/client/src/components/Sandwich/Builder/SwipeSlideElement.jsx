import { generateIngredientImageSrc as generateIngredientImageSource } from '../../../utils/ingredients-utils';
import { useSwiperSlide } from 'swiper/react';

const SwipeSlideElement = ({ ingredient, sandwich }) => {
  const swiperSlide = useSwiperSlide();
  const { isActive } = swiperSlide;

  return (
    <div className={`swiper-slide-container relative aspect-video ${isActive ? 'active' : ''}`}>
      <img
        src={generateIngredientImageSource({
          ingredient,
          sandwich,
        })}
        className="inset-0 object-contain size-full drag-none"
        alt={ingredient.name}
      />
      <div className="inline-block max-w-full rounded box-shadow-5 bg-white text-magenta text-xxs uppercase min-w-fit py-1 px-4">
        {ingredient.name}
      </div>
    </div>
  );
};

SwipeSlideElement.displayName = 'SwiperSlide';

export default SwipeSlideElement;
