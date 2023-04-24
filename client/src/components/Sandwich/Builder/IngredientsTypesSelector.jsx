import { isBreadType } from "../../../constants/ingredients-constants";
import { checkIngredientTypeInSandwich } from "../../../utils/sandwich-utils";

const IngredientsTypesSelector = ({
    ingredients,
    currentType,
    sandwich,
    setCurrentType,
    swiperContainerRef,
}) => {
    const retainSwiperHeight = () => {
        if (!swiperContainerRef.current) return;
        swiperContainerRef.current.style.height =
            swiperContainerRef.current.offsetHeight + "px";
    };

    let getButtonClasses = (type) => {
        const classes = "my-2 md:my-4  text-xs md:text-sm md:text-base fit-content";
        const activeClass = type === currentType ? " active" : "";

        const presetType = checkIngredientTypeInSandwich(type, sandwich)
            ? " text-cyan2"
            : "";

        return classes + activeClass + presetType;
    };

    return (
        <div className="create-sandwich-menu my-2">
            <ul className="flex flex-wrap md:flex-row justify-center">
                {Object.keys(ingredients).map((type) => (
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
            </ul>
        </div>
    );
};

export default IngredientsTypesSelector;
