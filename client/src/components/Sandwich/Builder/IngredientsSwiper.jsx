import { useEffect, useRef, useState } from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper";

import "swiper/css";
import "../../../styles/Swiper.css";

import { isBreadType } from "../../../constants/ingredients-constants";
import { breakpoints } from "../../../constants/swiper-constants";

import { getTopIngredientOfCurrentType } from "../../../utils/sandwich-utils";

import SwiperSlideElementNone from "../SwiperSlideElementNone";
import SwiperNavigationButton from "../SwiperNavigationButton";
import SwipeSlideElement from "../SwipeSlideElement";

import useIngredientsGlobalContext from "../../../context/IngredientsContext";

const IngredientsSwiper = ({
    sandwich,
    currentType,
    sandwichDispatch,
    currentIngredient,
    setCurrentIngredient,
}) => {
    const [navigation, setNavigation] = useState({ prev: false, next: true });
    const swiperRef = useRef();
    const { ingredients } = useIngredientsGlobalContext();

    const ingredientsOfType = ingredients[currentType];

    const topIngredientOfCurrentType = getTopIngredientOfCurrentType(
        sandwich,
        ingredientsOfType,
        currentType
    );

    const currentSwipeIndex = ingredientsOfType.indexOf(topIngredientOfCurrentType) + 1;

    useEffect(() => {
        if (!currentIngredient) {
            // set last ingredient of this type when switching type
            setCurrentIngredient(topIngredientOfCurrentType);
        }
    }, [
        currentType,
        currentIngredient,
        topIngredientOfCurrentType,
        setCurrentIngredient,
    ]);

    useEffect(() => {
        // rewind when swipe is being rerendered
        swiperRef.current.slideTo(currentSwipeIndex);
    }, [currentType, currentSwipeIndex]);

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
            if (isBreadType(currentType) && !sandwich.ingredients.length)
                setTimeout(() => {
                    swiper.slideTo(1);

                    setCurrentIngredient(ingredientsOfType[0]);
                }, 400);

            swiper.slideTo(currentSwipeIndex);
        }, 100);
    };

    const slideChangeHandler = (swiper) => {
        // swipe action
        if (isBreadType(currentType) && swiper.activeIndex === 0) {
            setTimeout(() => initSwiperHandler(swiper), 300);
            return;
        }

        setCurrentIngredient(ingredientsOfType[swiper.activeIndex - 1] || {});

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
            a11y={{ enabled: true }}
            slideToClickedSlide={true}
            onSwiper={initSwiperHandler}
            onSlideChange={slideChangeHandler}
            onReachBeginning={() => setNavigation({ prev: false, next: true })}
            onReachEnd={() => setNavigation({ prev: true, next: false })}
            breakpoints={breakpoints}
            modules={[A11y, Keyboard]}
        >
            <SwiperSlide className="choice-null no-select">
                {({ isActive }) => (
                    <SwiperSlideElementNone
                        currentType={currentType}
                        isActive={isActive}
                        sandwich={sandwich}
                    />
                )}
            </SwiperSlide>

            {ingredientsOfType.map((ingredient) => (
                <SwiperSlide key={ingredient.id} className="no-select">
                    {({ isActive }) => (
                        <SwipeSlideElement
                            ingredient={ingredient}
                            sandwich={sandwich}
                            currentType={currentType}
                            isActive={isActive}
                        />
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
