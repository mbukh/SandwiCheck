import { isBreadType, TYPE } from '@sandwicheck/shared';
import type { SandwichLayer } from '@/types/domain';
import { cn } from '@/utils/cn';
import { isTypeInSandwich } from '@/utils/sandwich-utils';

interface SwiperSlideElementNoneProps {
  currentType: string;
  isActive: boolean;
  sandwich: { ingredients: SandwichLayer[] };
}

const SwiperSlideElementNone = ({
  currentType,
  isActive,
  sandwich,
}: SwiperSlideElementNoneProps): React.JSX.Element => {
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
