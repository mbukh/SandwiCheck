import portionImg from "../../../assets/images/icons/portion.svg";
// import confirmImg from "../../../assets/images/icons/confirm.svg";
import arrowUpImg from "../../../assets/images/icons/arrow-up.svg";
import arrowDownImg from "../../../assets/images/icons/arrow-down.svg";
import binImg from "../../../assets/images/icons/bin.svg";

import {
    PORTIONS,
    DEFAULT_PORTION,
    isBreadType,
} from "../../../constants/ingredients-constants";
import { MAX_INGREDIENTS_COUNT } from "../../../constants/sandwich-constants";

import {
    isTypeInSandwich,
    getIngredientPlaceInSandwich,
    doesStayKosherWithIngredient,
} from "../../../utils/sandwich-utils";

import { useSandwichContext } from "../../../context/SandwichContext";

import useToast from "../../../hooks/use-toast";

const SandwichBuildButtons = () => {
    const { sandwich, sandwichDispatch, currentIngredient, currentType, hasToBeKosher } =
        useSandwichContext();
    const { showToast, toastComponents } = useToast();

    const isSandwichEmpty = !sandwich.ingredients.length;
    const isEmptyIngredient = !currentIngredient.id;
    const isCurrentlyBread = isBreadType(currentIngredient.type);
    const isMaxIngredientsReached =
        sandwich.ingredients.length + 1 > MAX_INGREDIENTS_COUNT;
    const ingredientPlace = getIngredientPlaceInSandwich(currentIngredient, sandwich);
    const isStillKosher = doesStayKosherWithIngredient(currentIngredient, sandwich);

    const confirmHandler = (e) => {
        if (isMaxIngredientsReached) {
            showToast(`Maximum of ${MAX_INGREDIENTS_COUNT} ingredients reached`);
            return;
        }
        if (!isCurrentlyBread && ingredientPlace.isPresent) {
            showToast(`The ingredient has been already added`);
            return;
        }

        if (hasToBeKosher && !isStillKosher) {
            showToast(`Account set to kosher: cannot mix meat and dairy`);
            return;
        }

        if (isCurrentlyBread) {
            sandwichDispatch({
                type: "UPDATE_INGREDIENTS",
                payload: [
                    { ...currentIngredient, portion: DEFAULT_PORTION },
                    ...sandwich.ingredients.slice(1),
                ],
            });
        } else {
            sandwichDispatch({
                type: "ADD_INGREDIENT",
                payload: currentIngredient,
            });
        }
    };

    const removeHandler = (e) => {
        sandwichDispatch({ type: "REMOVE_INGREDIENT", payload: currentIngredient.id });
    };

    const clearOfCurrentTypeHandler = (e) => {
        sandwichDispatch({ type: "REMOVE_INGREDIENTS_OF_TYPE", payload: currentType });
    };

    const moveUpHandler = (e) => {
        sandwichDispatch({ type: "MOVE_UP_INGREDIENT", payload: currentIngredient.id });
    };

    const moveDownHandler = (e) => {
        sandwichDispatch({ type: "MOVE_DOWN_INGREDIENT", payload: currentIngredient.id });
    };

    const changePortionHandler = (e) => {
        sandwichDispatch({ type: "CYCLE_PORTION", payload: currentIngredient.id });
    };

    return (
        <div className="builder__spacer-buttons inline-flex justify-center h-8 px-2 bg-white text-magenta text-xs rounded-lg box-shadow-5">
            {!isCurrentlyBread && !isEmptyIngredient && (
                <>
                    <button
                        className={`btn-wrapper px-2 ${
                            ingredientPlace.isPresent ? "fill-magenta" : "fill-cyan2"
                        }`}
                        style={
                            ingredientPlace.isPresent
                                ? {
                                      opacity:
                                          0.4 +
                                          0.2 *
                                              Object.values(PORTIONS).indexOf(
                                                  sandwich.ingredients.find(
                                                      (ingredient) =>
                                                          ingredient.id ===
                                                          currentIngredient.id
                                                  ).portion
                                              ),
                                  }
                                : {}
                        }
                        disabled={!ingredientPlace.isPresent}
                        onClick={changePortionHandler}
                    >
                        <img src={portionImg} alt="Up icon" width="54" height="54" />
                    </button>
                    <div className="mx-1"></div>
                </>
            )}
            <button
                className={`btn-wrapper px-2 ${
                    ingredientPlace.isPresent ||
                    (isEmptyIngredient && !isTypeInSandwich(currentType, sandwich))
                        ? "text-cyan2"
                        : "fill-magenta"
                } ${isSandwichEmpty ? "flex items-center justify-center" : ""}`}
                disabled={isMaxIngredientsReached && !ingredientPlace.isPresent}
                style={
                    ingredientPlace.isPresent || (hasToBeKosher && !isStillKosher)
                        ? { cursor: "not-allowed" }
                        : {}
                }
                title="Confirm ingredient"
                onClick={!isEmptyIngredient ? confirmHandler : clearOfCurrentTypeHandler}
            >
                {/* <img src={confirmImg} alt="Confirm icon" width="54" height="54" /> */}
                <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    alt="Confirm icon"
                    role="img"
                    version="1.1"
                    viewBox="0 0 18 18"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="m9 0c-4.9706 0-9 4.0294-9 9s4.0294 9 9 9 9-4.0294 9-9-4.0294-9-9-9zm0 1.7419c4.0112 0 7.2581 3.2462 7.2581 7.2581 0 4.0112-3.2462 7.2581-7.2581 7.2581-4.0112 0-7.2581-3.2462-7.2581-7.2581 0-4.0112 3.2462-7.2581 7.2581-7.2581m5.088 4.7274-0.81784-0.82444c-0.16937-0.17075-0.4451-0.17187-0.61585-0.0025l-5.1297 5.0885-2.1699-2.1875c-0.16937-0.17075-0.4451-0.17187-0.61585-0.0025l-0.82448 0.81784c-0.17075 0.16937-0.17187 0.4451-0.0025 0.61588l3.2945 3.3211c0.16937 0.17075 0.4451 0.17187 0.61585 0.0025l6.2633-6.213c0.17071-0.1694 0.1718-0.44514 0.0024-0.61588z" />
                </svg>
                {isSandwichEmpty && <div className="ml-1">add</div>}
            </button>
            {!isCurrentlyBread && !isEmptyIngredient && (
                <>
                    <div className="mx-1"></div>
                    <button
                        className="btn-wrapper px-2"
                        disabled={!ingredientPlace.isPresent || ingredientPlace.isTop}
                        onClick={moveUpHandler}
                    >
                        <img src={arrowUpImg} alt="Up icon" width="54" height="54" />
                    </button>
                    <button
                        className="btn-wrapper px-2"
                        disabled={!ingredientPlace.isPresent || ingredientPlace.isBottom}
                        onClick={moveDownHandler}
                    >
                        <img src={arrowDownImg} alt="Down icon" width="54" height="54" />
                    </button>
                    <div className="mx-1"></div>
                    <button
                        className="btn-wrapper px-2"
                        disabled={!ingredientPlace.isPresent}
                        onClick={removeHandler}
                    >
                        <img src={binImg} alt="Delete icon" width="45" height="54" />
                    </button>
                </>
            )}
            {toastComponents}
        </div>
    );
};

export default SandwichBuildButtons;
