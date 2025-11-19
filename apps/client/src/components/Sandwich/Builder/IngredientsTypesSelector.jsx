import { isBreadType } from '../../../constants/ingredients-constants';
import { isTypeInSandwich } from '../../../utils/sandwich-utils';

import { useSandwichContext } from '../../../context/SandwichContext';

const IngredientsTypesSelector = () => {
  const { ingredients, currentType, sandwich, setCurrentType, swiperContainerRef, randomizeSandwich } =
    useSandwichContext();

  const retainSwiperHeight = () => {
    if (!swiperContainerRef.current) return;
    swiperContainerRef.current.style.height = swiperContainerRef.current.offsetHeight + 'px';
  };

  const getButtonClasses = (type) => {
    const classes = 'my-2 md:my-4  text-xs md:text-sm md:text-base fit-content';
    const activeClass = type === currentType ? ' active' : '';

    const presetType = isTypeInSandwich(type, sandwich) ? ' text-cyan2' : '';

    return classes + activeClass + presetType;
  };

  const ingredientTypes = Object.keys(ingredients);
  const condimentsIndex = ingredientTypes.indexOf('condiments');

  return (
    <div className="create-sandwich-menu my-2">
      <ul className="flex flex-wrap md:flex-row justify-center">
        {ingredientTypes.map((type, index) => (
          <li key={type}>
            <button
              className={getButtonClasses(type)}
              onClick={() => {
                retainSwiperHeight();
                setCurrentType(type);
              }}
              disabled={!sandwich.ingredients.length && !isBreadType(type)}
            >
              {type}
            </button>
          </li>
        ))}
        <li key="randomize">
          <button
            className="my-2 md:my-4 text-xs md:text-sm md:text-base fit-content"
            onClick={randomizeSandwich}
            title="Randomize sandwich"
          >
            <span className="text-[1.5em] md:text-[1.5em] leading-none">🎲</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default IngredientsTypesSelector;
