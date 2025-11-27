import { useSwiperSlide } from 'swiper/react';
import { generateIngredientImageSrc as generateIngredientImageSource } from '../../../utils/ingredients-utils';

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
        className="inset-0 size-full object-contain drag-none"
        alt={ingredient.name}
      />
      <div className="box-shadow-5 inline-block max-w-full min-w-fit rounded bg-white px-4 py-1 text-xxs text-magenta uppercase">
        {ingredient.name}
      </div>
    </div>
  );
};

SwipeSlideElement.displayName = 'SwiperSlide';

export default SwipeSlideElement;
