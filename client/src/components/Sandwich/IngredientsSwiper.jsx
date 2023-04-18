import { useEffect, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import "../../styles/Swiper.css";
import "swiper/css";
import nextImg from "../../assets/images/icons/arrow-next.svg";
import prevImg from "../../assets/images/icons/arrow-previous.svg";

import { assembleImageSrc } from "../../utils";
import { isBreadType } from "../../constants/ingredientTypes";

const breakpoints = {
    640: {
        slidesPerView: 3,
        spaceBetween: 0,
    },
    768: {
        slidesPerView: 3,
        spaceBetween: 0,
    },
    1024: {
        slidesPerView: 5,
        spaceBetween: 0,
    },
    1280: {
        slidesPerView: 5,
        spaceBetween: 100,
    },
    1500: {
        slidesPerView: 7,
        spaceBetween: 50,
    },
    1900: {
        slidesPerView: 7,
        spaceBetween: 100,
    },
};

const IngredientsSwiper = ({
    sandwich,
    ingredients,
    currentIngredientType,
    updateSandwich,
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
                    updateSandwich({ bread: ingredientsOfType[0].id });
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
        updateSandwich({
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

            <button
                className={`swiper-button-prev btn-wrapper lg:hidden w-10 md:w-15 h-10 md:h-15 -mt-9 md:-mt-11 no-select no-drag ${
                    !navigation.prev ? "swiper-button-disabled" : ""
                }`}
                onClick={() => swiperRef.current.slidePrev()}
            >
                <img
                    className="w-full h-full"
                    src={prevImg}
                    alt="Go to previous slide"
                    width="120"
                    height="120"
                />
            </button>

            <button
                className={`swiper-button-next btn-wrapper lg:hidden w-10 md:w-15 h-10 md:h-15 -mt-9 md:-mt-11 no-select no-drag ${
                    !navigation.next ? "swiper-button-disabled" : ""
                }`}
                onClick={() => swiperRef.current.slideNext()}
            >
                <img
                    className="w-full h-full"
                    src={nextImg}
                    alt="Go to next slide"
                    width="120"
                    height="120"
                />
            </button>
        </Swiper>
    );
};

export default IngredientsSwiper;
