import { hydrateSandwichIngredientsData } from "../../../utils/sandwich-utils";
import { capitalizeFirst } from "../../../utils/utils";

const SandwichIngredientsList = ({ sandwich, ingredientsRawList }) => {
    const hydratedSandwich = hydrateSandwichIngredientsData(sandwich, ingredientsRawList);

    return (
        <div className="thumb__ingredients flex md:flex-col md:justify-center text-left mx-auto pt-8 pb-0 pr-4 md:py-0 md:pl-8 md:pr-4 text-shadow-5">
            <div>
                <h5 className="ml-4 mb-4 text-sm sm:text-base uppercase">Ingredients:</h5>
                <ul className="text-sm sm:text-base">
                    {hydratedSandwich.ingredients.map((ingredient) => (
                        <li key={ingredient.id}>
                            {capitalizeFirst(ingredient.type)}: {ingredient.name}
                            <br />
                            <span className="text-s">({ingredient.portion} portion)</span>
                        </li>
                    ))}
                </ul>
                <div className="my-5"></div>
                <h5 className="ml-4 mb-4 text-sm sm:text-base uppercase">Comment:</h5>
                <div className="ml-1">{sandwich.comment}</div>
            </div>
        </div>
    );
};

export default SandwichIngredientsList;
