import { Loading, SandwichImage } from "../components";

import { ingredientTypes } from "../constants/ingredientTypes";

import useIngredients from "../hooks/use-sandwich";

const SandwichEditor = () => {
    const {
        ingredients,
        currentIngredientType,
        setCurrentIngredientType,
        breadShape,
        setBreadShape,
        sandwich,
        setSandwich,
        clearSandwich,
        saveSandwich,
    } = useIngredients();

    return (
        <>
            <button onClick={clearSandwich}>clear all</button>
            <h3>Create a sandwich</h3>
            <div className="create-sandwich-menu">
                <ul>
                    {ingredientTypes.map((ingredientType) => (
                        <li key={ingredientType}>
                            <button
                                onClick={() =>
                                    setCurrentIngredientType(ingredientType)
                                }
                                disabled={
                                    ingredientType !== "bread" && !breadShape
                                }
                            >
                                {ingredientType}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            {
                <div className="ingredients-menu">
                    {!currentIngredientType && (
                        <div>
                            <h3>Get Started Now!</h3>
                        </div>
                    )}
                    {ingredientTypes.map((ingredientType) => (
                        <div
                            key={ingredientType}
                            style={{
                                display:
                                    currentIngredientType !== ingredientType
                                        ? "none"
                                        : "",
                            }}
                        >
                            <h3>Choose Your {ingredientType}</h3>
                            {ingredients.hasOwnProperty(ingredientType) ? (
                                <>
                                    <ul>
                                        {ingredients[ingredientType].map(
                                            (ingredient) => (
                                                <li key={ingredient.id}>
                                                    <input
                                                        type="radio"
                                                        name={ingredientType}
                                                        id={ingredient.id}
                                                        value={ingredient.id}
                                                        checked={
                                                            sandwich[
                                                                ingredientType
                                                            ] === ingredient.id
                                                        }
                                                        onChange={() => {
                                                            setSandwich(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    [ingredientType]:
                                                                        ingredient.id,
                                                                })
                                                            );
                                                            ingredientType ===
                                                                "bread" &&
                                                                setBreadShape(
                                                                    ingredient.shape
                                                                );
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={ingredient.id}
                                                    >
                                                        {ingredient.name}
                                                    </label>
                                                </li>
                                            )
                                        )}
                                        <li>
                                            <input
                                                type="radio"
                                                name={ingredientType}
                                                id={`${ingredientType}-none`}
                                                value="none"
                                                checked={
                                                    !sandwich[ingredientType]
                                                }
                                                onChange={() =>
                                                    setSandwich((prev) => ({
                                                        ...prev,
                                                        [ingredientType]: null,
                                                    }))
                                                }
                                            />
                                            <label
                                                htmlFor={`${ingredientType}-none`}
                                            >
                                                None of the above
                                            </label>
                                        </li>
                                    </ul>
                                    <button
                                        onClick={() => {
                                            setCurrentIngredientType(
                                                (prev) =>
                                                    ingredientTypes[
                                                        ingredientTypes.indexOf(
                                                            prev
                                                        ) - 1
                                                    ]
                                            );
                                        }}
                                        disabled={
                                            currentIngredientType === "bread"
                                        }
                                    >
                                        back
                                    </button>
                                    {ingredientTypes.indexOf(
                                        currentIngredientType
                                    ) +
                                        1 <
                                    ingredientTypes.length ? (
                                        <button
                                            onClick={() => {
                                                setCurrentIngredientType(
                                                    (prev) =>
                                                        ingredientTypes[
                                                            ingredientTypes.indexOf(
                                                                prev
                                                            ) + 1
                                                        ]
                                                );
                                            }}
                                            disabled={
                                                currentIngredientType ===
                                                    "bread" && !breadShape
                                            }
                                        >
                                            next
                                        </button>
                                    ) : (
                                        <button onClick={saveSandwich}>
                                            save sandwich
                                        </button>
                                    )}
                                </>
                            ) : (
                                <Loading />
                            )}
                            <hr />
                        </div>
                    ))}
                </div>
            }

            <SandwichImage
                sandwich={sandwich}
                ingredientTypes={ingredientTypes}
                ingredients={ingredients}
            />
        </>
    );
};

export default SandwichEditor;
