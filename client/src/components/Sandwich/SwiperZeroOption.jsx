const SwiperZeroOption = ({ isActive, currentIngredientType }) => {
    return (
        <div
            className={`swiper-slide-container relative aspect-ration-4/3 ${
                isActive ? "active" : ""
            }`}
        >
            <div className="py-2 md:py-5">&nbsp;</div>
            <div className="button text-xxs md:text-xs w-1/2 lg:w-1/3 mx-auto uppercase fit-content">
                No {currentIngredientType}
            </div>
        </div>
    );
};

export default SwiperZeroOption;
