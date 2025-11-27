import { isBreadType, TYPE } from '../../constants/ingredients-constants';
import { isTypeInSandwich } from '../../utils/sandwich-utils';

const SwiperSlideElementNone = ({ currentType, isActive, sandwich }) => {
  return (
    <div className={`swiper-slide-container relative aspect-square ${isActive ? 'active' : ''}`}>
      <div className="py-2 md:py-5">&nbsp;</div>
      <div className="button mx-auto w-1/2 min-w-fit text-xxs uppercase md:text-xs lg:w-1/3">
        {isTypeInSandwich(currentType, sandwich)
          ? isBreadType(currentType)
            ? `Choose your ${TYPE.bread}`
            : `Remove ${currentType}`
          : `No ${currentType}`}
      </div>
    </div>
  );
};

export default SwiperSlideElementNone;
