import { useEffect, useRef } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import "../../styles/Swiper.css";
import "swiper/css";

import { assembleImageSrc } from "../../utils";

const IngredientsSwiper = ({
    sandwich,
    ingredients,
    currentIngredientType,
    updateSandwichIngredients,
}) => {
    const swiperRef = useRef();

    const ingredientsOfType = ingredients[currentIngredientType];

    const chosenCurrentIngredientOfType = ingredientsOfType.find(
        (ingredient) => ingredient.id === sandwich[currentIngredientType]
    );

    const currentSwipeIndex =
        ingredientsOfType.indexOf(chosenCurrentIngredientOfType) + 1;

    useEffect(() => {
        swiperRef.current.slideTo(currentSwipeIndex);
    }, [currentSwipeIndex]);

    const initSwiperHandler = (swiper) => {
        swiperRef.current = swiper;
        currentIngredientType === "bread" && !sandwich?.bread
            ? setTimeout(() => swiper.slideTo(1), 400)
            : swiper.slideTo(currentSwipeIndex);
    };

    const slideChangeHandler = (swiper) => {
        if (currentIngredientType === "bread" && swiper.activeIndex === 0) {
            setTimeout(() => initSwiperHandler(swiper), 400);
            return;
        }
        updateSandwichIngredients({
            [currentIngredientType]:
                ingredientsOfType[swiper.activeIndex - 1]?.id || null,
        });
    };

    console.log("🍔");
    console.log(sandwich);
    console.log(chosenCurrentIngredientOfType);

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
            onSwiper={initSwiperHandler}
            onSlideChange={slideChangeHandler}
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
            <SwiperSlide className="choice-null no-select">
                {({ isActive }) => (
                    <div
                        className={`swiper-slide-container relative aspect-ration-4/3 ${
                            isActive ? "active" : ""
                        }`}
                    >
                        <div className="py-2 md:py-5">&nbsp;</div>
                        <div className="button text-xxs md:text-xs w-1/2 lg:w-1/3 mx-auto uppercase">
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
                            <div className="button text-xxs md:text-xs w-1/2 lg:w-1/3 mx-auto uppercase">
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
