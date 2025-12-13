import { isBreadType, TYPE } from '../../constants/ingredients-constants';
import { cn } from '../../utils/cn';
import { isTypeInSandwich } from '../../utils/sandwich-utils';

const SwiperSlideElementNone = ({ currentType, isActive, sandwich }) => {
  return (
    <div
      className={cn('swiper-slide-container relative flex h-full w-full flex-col items-center justify-center', {
        active: isActive,
      })}
    >
      <div className="button w-1/2 min-w-fit text-xxs uppercase md:text-xs lg:w-1/3">
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
