import { IngredientsSwiper, Loading, SandwichImage } from "../";

import { ingredientTypes } from "../../constants/";

import { useSandwich } from "../../hooks/";

const SandwichEditor = () => {
    const {
        isDataLoading,
        ingredients,
        currentIngredientType,
        setCurrentIngredientType,
        sandwich,
        setSandwich,
        clearSandwich,
        sandwichName,
        setSandwichName,
        saveSandwich,
    } = useSandwich();

    const isSandwichReady =
        sandwich?.bread && Object.values(sandwich).filter((val) => val).length > 1;

    const submitSandwichHandler = (e) => {
        e.preventDefault();
        saveSandwich();
    };

    const updateSandwichIngredientsHandler = (newData) => {
        setSandwich((prev) => ({
            ...prev,
            ...newData,
        }));
    };

    return (
        <div className="flex flex-col justify-end min-h-full pt-6 md:pt-9 lg:pt-12">
            <h1 className="text-center text-l uppercase">Create a sandwich</h1>
            <div className="creation-section flex-col md:flex-row">
                <div className="create-sandwich-menu my-2">
                    <ul className="flex flex-wrap md:flex-row justify-center">
                        {ingredientTypes.map((ingredientType) => (
                            <li key={ingredientType}>
                                <button
                                    className={`my-2 md:my-4  text-xs md:text-sm md:text-base ${
                                        ingredientType === currentIngredientType
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setCurrentIngredientType(ingredientType)
                                    }
                                    disabled={
                                        ingredientType !== "bread" && !sandwich?.bread
                                    }
                                >
                                    {ingredientType}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {isDataLoading ? (
                    <Loading />
                ) : (
                    <>
                        <div className="ingredients-menu">
                            {ingredientTypes.map((ingredientType) => (
                                <div
                                    key={ingredientType}
                                    style={{
                                        display:
                                            currentIngredientType !== ingredientType
                                                ? "none"
                                                : "",
                                    }}
                                ></div>
                            ))}
                        </div>

                        <div className="thumb__wrapper flex flex-col flex-shrink-0 justify-between">
                            {currentIngredientType && (
                                <IngredientsSwiper
                                    sandwich={sandwich}
                                    ingredients={ingredients}
                                    currentIngredientType={currentIngredientType}
                                    updateSandwichIngredients={
                                        updateSandwichIngredientsHandler
                                    }
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
            {!isDataLoading && (
                <div className="result-section relative aspect-ratio-3/2 mx-4 w-full md:w-2/3 lg:w-1/3 mx-auto">
                    <SandwichImage
                        sandwich={sandwich}
                        ingredientTypes={ingredientTypes}
                        ingredients={ingredients}
                    />
                </div>
            )}

            {currentIngredientType ? (
                <>
                    <div className="flex justify-center my-4">
                        <button className="btn-wrapper" onClick={clearSandwich}>
                            clear all
                        </button>
                    </div>

                    <div className="save-sandwich-section flex justify-center text-center">
                        <form onSubmit={submitSandwichHandler}>
                            <input
                                type="text"
                                name="sandwichName"
                                placeholder="Sandwich name"
                                onChange={(e) => setSandwichName(e.target.value)}
                                value={sandwichName}
                            />
                            <input
                                type="submit"
                                placeholder="save sandwich"
                                className="my-4"
                                disabled={!isSandwichReady}
                            />
                        </form>
                    </div>
                </>
            ) : (
                <Loading />
            )}
        </div>
    );
};

export default SandwichEditor;
