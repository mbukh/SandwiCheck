import { hydrateSandwichIngredientsData } from '../../../utils/sandwich-utils';
import { capitalizeFirst } from '../../../utils/utils';

const SandwichIngredientsList = ({ sandwich, ingredientsRawList, hideComment = false }) => {
  const hydratedSandwich = hydrateSandwichIngredientsData(sandwich, ingredientsRawList);

  return (
    <div className="thumb__ingredients text-shadow-5 mx-auto flex pt-8 pr-4 pb-0 text-left md:flex-col md:justify-center md:py-0 md:pr-4 md:pl-8">
      <div>
        <h5 className="mb-4 ml-4 text-sm uppercase sm:text-base">Ingredients:</h5>
        <ul className="text-sm sm:text-base">
          {hydratedSandwich.ingredients.map((ingredient) => (
            <li key={ingredient.id}>
              {capitalizeFirst(ingredient.type)}: {ingredient.name}
              <br />
              <span className="text-sm">({ingredient.portion} portion)</span>
            </li>
          ))}
        </ul>
        {!hideComment && sandwich.comment && (
          <div className="my-5">
            <h5 className="mb-4 ml-4 text-sm uppercase sm:text-base">Comment:</h5>
            <div className="ml-1">{sandwich.comment}</div>
          </div>
        )}
        {sandwich.dietaryPreferences && sandwich.dietaryPreferences.length > 0 && (
          <div className="my-5">
            <h5 className="mb-4 ml-4 text-sm uppercase sm:text-base">Dietary preferences:</h5>
            <ul className="text-sm sm:text-base">
              {sandwich.dietaryPreferences.map((value) => (
                <li key={value}>{capitalizeFirst(value)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SandwichIngredientsList;
