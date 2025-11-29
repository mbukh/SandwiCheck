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
    const baseClasses =
      'my-2 md:my-4 text-xs md:text-sm md:text-base min-w-fit transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed';

    const isActive = type === currentType;
    const isIncluded = isTypeInSandwich(type, sandwich) && !isActive;

    // Use Tailwind utility classes for states, ensuring no transparency on hover for unused items
    const stateClasses = isActive
      ? ' active ring-2 ring-magenta ring-offset-2'
      : isIncluded
        ? ' ingredients-type--included'
        : ' hover:bg-gray-50'; // Explicit background on hover to prevent "transparent" feel if any

    return `${baseClasses}${stateClasses}`;
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
            className="my-2 min-w-fit text-xs transition-transform duration-200 hover:scale-110 active:scale-95 md:my-4 md:text-base"
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
