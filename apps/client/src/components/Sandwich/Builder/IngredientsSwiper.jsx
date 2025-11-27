// import { A11y, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/a11y';
import '../../../styles/Swiper.css';
import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { isBreadType } from '../../../constants/ingredients-constants';
import { breakpoints } from '../../../constants/swiper-constants';
import { useIngredientsGlobalContext } from '../../../context/IngredientsGlobalContext';
import { useSandwichContext } from '../../../context/SandwichContext';
import { log } from '../../../utils/log';
import { getTopIngredientOfCurrentType } from '../../../utils/sandwich-utils';
import SwiperNavigationButton from '../SwiperNavigationButton';
import SwiperSlideElementNone from '../SwiperSlideElementNone';
import SwipeSlideElement from './SwipeSlideElement';

const IngredientsSwiper = () => {
  const [navigation, setNavigation] = useState({ prev: false, next: true });
  const swiperReference = useRef(null);
  const { ingredients } = useIngredientsGlobalContext();
  const { sandwich, currentType, currentIngredient, setCurrentIngredient } = useSandwichContext();

  const ingredientsOfType = ingredients[currentType] || [];

  const topIngredientOfCurrentType = getTopIngredientOfCurrentType(sandwich, ingredientsOfType, currentType);

  const currentSwipeIndex = ingredientsOfType.indexOf(topIngredientOfCurrentType) + 1;

  useEffect(() => {
    if (!currentIngredient) {
      // set last ingredient of this type when switching type
      setCurrentIngredient(topIngredientOfCurrentType);
    }
  }, [currentType, currentIngredient, topIngredientOfCurrentType, setCurrentIngredient]);

  useEffect(() => {
    // rewind when swipe is being rerendered
    saveSwiperSlideTo(swiperReference.current, currentSwipeIndex);
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

  const saveSwiperSlideTo = (swiper, index) => {
    try {
      swiper.slideTo?.(index);
    } catch (error) {
      log(error);
    }
  };

  const initSwiperHandler = (swiper) => {
    // first swiper is rendered
    swiperReference.current = swiper;

    setTimeout(() => {
      if (isBreadType(currentType) && sandwich.ingredients.length === 0)
        setTimeout(() => {
          saveSwiperSlideTo(swiper, 1);

          setCurrentIngredient(ingredientsOfType[0]);
        }, 400);
      saveSwiperSlideTo(swiper, currentSwipeIndex);
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
      /*
       * keyboard={{
       *   enabled: true,
       * }}
       * a11y={{ enabled: true }}
       */
      slideToClickedSlide={true}
      onSwiper={initSwiperHandler}
      onSlideChange={slideChangeHandler}
      onReachBeginning={() => setNavigation({ prev: false, next: true })}
      onReachEnd={() => setNavigation({ prev: true, next: false })}
      breakpoints={breakpoints}
      // modules={[A11y, Keyboard]}
    >
      <SwiperSlide className="choice-null select-none">
        {({ isActive }) => <SwiperSlideElementNone currentType={currentType} isActive={isActive} sandwich={sandwich} />}
      </SwiperSlide>

      {ingredientsOfType.map((ingredient) => (
        <SwiperSlide key={ingredient.id} className="select-none">
          <SwipeSlideElement ingredient={ingredient} sandwich={sandwich} currentType={currentType} />
        </SwiperSlide>
      ))}

      <SwiperNavigationButton navigation={navigation} direction="previous" />

      <SwiperNavigationButton navigation={navigation} direction="next" />
    </Swiper>
  );
};

export default IngredientsSwiper;
