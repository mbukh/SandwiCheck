import { generateIngredientImageSrc } from '../../../utils/ingredients-utils';

const SwipeSlideElement = ({ ingredient, sandwich, isActive }) => {
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

SwipeSlideElement.displayName = 'SwiperSlide';

export default SwipeSlideElement;
