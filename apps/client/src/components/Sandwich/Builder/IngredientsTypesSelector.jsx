import { isBreadType } from '../../../constants/ingredients-constants';
import { useSandwichContext } from '../../../context/SandwichContext';
import { isTypeInSandwich } from '../../../utils/sandwich-utils';

const IngredientsTypesSelector = () => {
  const { ingredients, currentType, sandwich, setCurrentType, swiperContainerRef, randomizeSandwich } =
    useSandwichContext();

  const retainSwiperHeight = () => {
    if (!swiperContainerRef.current) return;
    swiperContainerRef.current.style.height = swiperContainerRef.current.offsetHeight + 'px';
  };

  const getButtonClasses = (type) => {
    const classes = 'my-2 md:my-4  text-xs md:text-sm md:text-base min-w-fit';
    const activeClass = type === currentType ? ' active' : '';

    const presetType = isTypeInSandwich(type, sandwich) ? ' text-cyan2-500' : '';

    return classes + activeClass + presetType;
  };

  const ingredientTypes = Object.keys(ingredients);
  // const con  dimentsIndex = ingredientTypes.indexOf('condiments');

  return (
    <div className="create-sandwich-menu my-2">
      <ul className="flex flex-wrap justify-center md:flex-row">
        {ingredientTypes.map((type, _index) => (
          <li key={type}>
            <button
              className={getButtonClasses(type)}
              onClick={() => {
                retainSwiperHeight();
                setCurrentType(type);
              }}
              disabled={sandwich.ingredients.length === 0 && !isBreadType(type)}
            >
              {type}
            </button>
          </li>
        ))}
        <li key="randomize">
          <button
            className="my-2 min-w-fit text-xs md:my-4 md:text-base"
            onClick={randomizeSandwich}
            title="Randomize sandwich"
          >
            <span className="text-[1.5em] leading-none md:text-[1.5em]">🎲</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default IngredientsTypesSelector;
