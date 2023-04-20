import { useEffect, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "../../styles/Swiper.css";

import { assembleImageSrc } from "../../utils/index";
import { isBreadType } from "../../constants/ingredients-constants";
import { breakpoints } from "../../constants/swiper-constants";

import SwiperZeroOption from "./SwiperZeroOption";
import SwiperNavigationButton from "./SwiperNavigationButton";

const IngredientsSwiper = ({
    sandwich,
    ingredients,
    currentIngredientType,
    sandwichDispatch,
}) => {
    const [navigation, setNavigation] = useState({ prev: false, next: true });
    const swiperRef = useRef();

    const ingredientsOfType = ingredients[currentIngredientType];

    const chosenCurrentIngredientOfType = ingredientsOfType.find(
        (ingredient) => ingredient.id === sandwich[currentIngredientType]
    );
    const currentSwipeIndex =
        ingredientsOfType.indexOf(chosenCurrentIngredientOfType) + 1;

    useEffect(() => {
        // swipe is being rerendered
        swiperRef.current.slideTo(currentSwipeIndex);
    }, [currentSwipeIndex, ingredientsOfType?.length]);

    const updateNavigationButtons = (activeIndex) => {
        const navUpdate = {
            0: { prev: true, next: true },
            1: { prev: false, next: true },
            2: { prev: true, next: false },
        };
        const start = +(activeIndex === 0) * 1;
        const end = +(activeIndex === ingredientsOfType.length) * 2;
        setNavigation(navUpdate[start + end]);
    };

    const initSwiperHandler = (swiper) => {
        // first swiper is rendered
        swiperRef.current = swiper;
        setTimeout(() => {
            if (isBreadType(currentIngredientType) && !sandwich?.bread)
                setTimeout(() => {
                    swiper.slideTo(1);
                    sandwichDispatch({ bread: ingredientsOfType[0].id });
                }, 400);
            swiper.slideTo(currentSwipeIndex);
        }, 100);
    };

    const slideChangeHandler = (swiper) => {
        // swipe action
        if (isBreadType(currentIngredientType) && swiper.activeIndex === 0) {
            setTimeout(() => initSwiperHandler(swiper), 400);
            return;
        }
        sandwichDispatch({
            [currentIngredientType]:
                ingredientsOfType[swiper.activeIndex - 1]?.id || null,
        });
        updateNavigationButtons(swiper.activeIndex);
    };

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
            slideToClickedSlide={true}
            onSwiper={initSwiperHandler}
            onSlideChange={slideChangeHandler}
            onReachBeginning={() => setNavigation({ prev: false, next: true })}
            onReachEnd={() => setNavigation({ prev: true, next: false })}
            breakpoints={breakpoints}
        >
            <SwiperSlide className="choice-null no-select">
                {({ isActive }) => (
                    <SwiperZeroOption
                        isActive={isActive}
                        currentIngredientType={currentIngredientType}
                    />
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
                                })}
                                className="inset-0 object-contain size-full no-drag"
                                alt={ingredient.name}
                            />
                            <div className="inline-block max-w-full rounded box-shadow-5 bg-white text-magenta text-xxs uppercase fit-content py-1 px-4">
                                {ingredient.name}
                            </div>
                        </div>
                    )}
                </SwiperSlide>
            ))}

            <SwiperNavigationButton
                navigation={navigation}
                swiperRef={swiperRef}
                direction="previous"
            />

            <SwiperNavigationButton
                navigation={navigation}
                swiperRef={swiperRef}
                direction="next"
            />
        </Swiper>
    );
};

export default IngredientsSwiper;
