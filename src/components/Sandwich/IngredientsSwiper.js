import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "../../styles/Swiper.css";
import "swiper/css";

import { assembleImageSrc } from "../../utils";

const IngredientsSwiper = ({
    sandwich,
    ingredients,
    currentIngredientType,
    updateSandwichIngredients,
}) => {
    const ingredientsOfType = ingredients[currentIngredientType];

    const chosenCurrentIngredientOfType = ingredientsOfType.find(
        (ingredient) => ingredient.id === sandwich[currentIngredientType]
    );
    const currentSwipeIndex =
        ingredientsOfType.indexOf(chosenCurrentIngredientOfType) + 1;

    return (
        <Swiper
            spaceBetween={0}
            slidesPerView={3}
            centeredSlides={true}
            grabCursor={true}
            mousewheel={true}
            keyboard={{
                enabled: true,
            }}
            onSlideChange={({ activeIndex }) =>
                updateSandwichIngredients({
                    [currentIngredientType]:
                        ingredientsOfType[activeIndex - 1]?.id || null,
                })
            }
            onSwiper={(swiper) => swiper.slideTo(currentSwipeIndex)}
            breakpoints={{
                640: {
                    slidesPerView: 3,
                    spaceBetween: 0,
                },
                768: {
                    slidesPerView: 3,
                    spaceBetween: 0,
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 50,
                },
                1500: {
                    slidesPerView: 3,
                    spaceBetween: 100,
                },
                1900: {
                    slidesPerView: 5,
                    spaceBetween: 50,
                },
            }}
        >
            <SwiperSlide className="no-choice no-select">
                {({ isActive }) => (
                    <div
                        className={`swiper-slide-container flex flex-col justify-around ${
                            isActive ? "active" : ""
                        }`}
                    >
                        <div className="h-10"></div>
                        <div className="button text-xs uppercase my-auto">
                            No {currentIngredientType}
                        </div>
                    </div>
                )}
            </SwiperSlide>

            {ingredientsOfType.map((ingredient) => (
                <SwiperSlide key={ingredient.id} className="no-select">
                    {({ isActive }) => (
                        <div
                            className={`swiper-slide-container relative aspect-ration-4/3 ${
                                isActive ? "active" : ""
                            }`}
                        >
                            <img
                                src={assembleImageSrc({
                                    sandwich: {
                                        ...sandwich,
                                        [currentIngredientType]: ingredient.id,
                                    },
                                    ingredients,
                                    ingredientType: currentIngredientType,
                                    proteinPortion: "full",
                                    optionSize: "normal",
                                })}
                                className="inset-0 object-contain size-full no-drag"
                                alt={ingredient.name}
                            />
                            <div className="button text-xs uppercase">
                                {ingredient.name}
                            </div>
                        </div>
                    )}
                </SwiperSlide>
            ))}
        </Swiper>
    );
};

export default IngredientsSwiper;
