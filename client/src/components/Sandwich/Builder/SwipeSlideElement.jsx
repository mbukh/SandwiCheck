import PropTypes from 'prop-types';
import { generateIngredientImageSrc } from '../../../utils/ingredients-utils';
import { useSwiperSlide } from 'swiper/react';

const SwipeSlideElement = ({ ingredient, sandwich }) => {
  const swiperSlide = useSwiperSlide();
  const { isActive } = swiperSlide;

  return (
    <div className={`swiper-slide-container relative aspect-ration-4/3 ${isActive ? 'active' : ''}`}>
      <img
        src={generateIngredientImageSrc({
          ingredient,
          sandwich,
        })}
        className="inset-0 object-contain size-full no-drag"
        alt={ingredient.name}
      />
      <div className="inline-block max-w-full rounded box-shadow-5 bg-white text-magenta text-xxs uppercase fit-content py-1 px-4">
        {ingredient.name}
      </div>
    </div>
  );
};

SwipeSlideElement.propTypes = {
  ingredient: PropTypes.object.isRequired,
  sandwich: PropTypes.object.isRequired,
  isActive: PropTypes.bool,
};

SwipeSlideElement.displayName = 'SwiperSlide';

export default SwipeSlideElement;
