import { isBreadType, TYPES } from "../../constants/ingredients-constants";
import { checkIngredientTypeInSandwich } from "../../utils/sandwich-utils";

const SwiperSlideElementNone = ({ currentType, isActive, sandwich }) => {
    const isTypeInSandwich = checkIngredientTypeInSandwich(currentType, sandwich);
    return (
        <div
            className={`swiper-slide-container relative aspect-ration-4/3 ${
                isActive ? "active" : ""
            }`}
        >
            <div className="py-2 md:py-5">&nbsp;</div>
            <div className="button text-xxs md:text-xs w-1/2 lg:w-1/3 mx-auto uppercase fit-content">
                {isTypeInSandwich
                    ? isBreadType(currentType)
                        ? `Choose your ${TYPES.bread}`
                        : `Remove ${currentType}`
                    : `No ${currentType}`}
            </div>
        </div>
    );
};

export default SwiperSlideElementNone;
