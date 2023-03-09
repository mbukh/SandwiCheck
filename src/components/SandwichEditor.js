import { Loading, SandwichImage } from ".";

import { ingredientTypes } from "../constants/ingredientTypes";

import useSandwich from "../hooks/use-sandwich";

const SandwichEditor = () => {
    const {
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

    const lastIngredient =
        ingredientTypes.indexOf(currentIngredientType) + 1 ===
        ingredientTypes.length;

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
                                    ingredientType !== "bread" &&
                                    !sandwich?.bread
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
                                    {!lastIngredient ? (
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
                                            disabled={!sandwich?.bread}
                                        >
                                            next
                                        </button>
                                    ) : (
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                saveSandwich();
                                            }}
                                        >
                                            <input
                                                type="text"
                                                name="sandwichName"
                                                placeholder="Sandwich name"
                                                onChange={(e) =>
                                                    setSandwichName(
                                                        e.target.value
                                                    )
                                                }
                                                value={sandwichName}
                                            />
                                            <input
                                                type="submit"
                                                value="save sandwich"
                                            />
                                        </form>
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
