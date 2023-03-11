import { Link } from "react-router-dom";

import { SandwichImage } from "../";

const SandwichCard = ({
    isModal = false,
    index,
    sandwich,
    ingredientTypes,
    ingredients,
}) => {
    const bgIndex = (index % 4) + 1;

    const TheSandwichImage = () => (
        <div className="relative aspect-ratio-square">
            <SandwichImage
                sandwich={sandwich}
                ingredientTypes={ingredientTypes}
                ingredients={ingredients}
            />
        </div>
    );

    return (
        <>
            <div
                key={sandwich.id}
                className={`sandwich-card ${true && "voted"} ${
                    !isModal
                        ? "thumb flex w-1/2 sm:w-1/2 lg:w-1/3 xl:w-1/4 xxl:w-1/5"
                        : "thumb modal__thumb flex flex-col md:flex-row justify-center voted"
                }`}
            >
                <div
                    className={`card-wrapper card-bg-${bgIndex} ${
                        !isModal
                            ? "thumb__wrapper flex flex-col flex-1 justify-between m-2 sm:m-3 p-2 sm:p-4 box-shadow-10"
                            : "thumb__wrapper md:w-2/3 flex flex-col flex-shrink-0 justify-between p-2 sm:p-4 box-shadow-10"
                    }`}
                >
                    <div className="card-header text-center">
                        {sandwich?.name && (
                            <h3
                                className={`card-title ${
                                    !isModal
                                        ? "thumb__title text-sm sm:text-base xl:text-lg font-bold uppercase text-shadow-5"
                                        : "thumb__title text-base sm:text-lg lg:text-xl font-bold uppercase text-shadow-5"
                                }`}
                            >
                                {sandwich.name}
                            </h3>
                        )}
                        {sandwich?.author && (
                            <h5
                                className={`card-name ${
                                    !isModal
                                        ? "thumb__name text-xs sm:text-sm text-shadow-5"
                                        : "thumb__name text-sm sm:text-base lg:text-lg text-shadow-5"
                                }`}
                            >
                                by <span className="capitalize">{sandwich.author}</span>
                            </h5>
                        )}
                    </div>
                    <div className="card-middle">
                        <div className="card-orb w-full mt-auto mx-auto">
                            {!isModal ? (
                                <Link to={`${sandwich.id}`}>
                                    <TheSandwichImage />
                                </Link>
                            ) : (
                                <TheSandwichImage />
                            )}
                        </div>
                    </div>
                    <div className="card-footer relative flex justify-between items-center">
                        <div className="card-footer-start w-1/3 flex justify-start items-center">
                            <i
                                className="icon icon-votes w-auto h-7 sm:h-8"
                                title="Favorites counter"
                            ></i>
                            <span className="votesCount text-xs sm:text-sm text-shadow-5">
                                {sandwich?.votesCount}234
                            </span>
                        </div>
                        <div className="card-footer-mid w-1/3 text-center">
                            <button className="btn-wrapper">
                                <i
                                    className={`icon icon-heart ${
                                        !isModal
                                            ? "thumb__vote-btn w-auto h-10 mx-auto leading-none"
                                            : "thumb__vote-btn w-auto h-10 md:h-16 mx-auto leading-none"
                                    }`}
                                    title="Add to favorites"
                                ></i>
                            </button>
                        </div>
                        <div className="card-footer-end w-1/3 flex justify-end">
                            <Link
                                to={`https://wa.me/?text=This+sandwich+from+SandwiCheck+looks+yummy%21+${window.location.protocol}%2F%2F${window.location.hostname}%2Fsandwich%2F${sandwich.id}`}
                                target="_blank"
                                className="inline-block ml-1 md:ml-2"
                            >
                                <i
                                    className="icon icon-whatsapp w-auto h-8 sm:h-10 md:h-12"
                                    title="Share via Whatsapp"
                                ></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {isModal && (
                    <div className="thumb__ingredients flex md:flex-col md:justify-center text-left mx-auto pt-8 pb-0 pr-4 md:py-0 md:pl-8 md:pr-4 text-shadow-5">
                        <div>
                            <h5 className="ml-4 mb-4 text-sm sm:text-base uppercase">
                                Ingredients:
                            </h5>
                            <ul className="text-sm sm:text-base">
                                {ingredientTypes.map(
                                    (ingredientType) =>
                                        sandwich.hasOwnProperty(ingredientType) &&
                                        sandwich[ingredientType] && (
                                            <li key={ingredientType}>
                                                {
                                                    ingredients[ingredientType].find(
                                                        (ingredient) =>
                                                            ingredient.id ===
                                                            sandwich[ingredientType]
                                                    ).name
                                                }
                                            </li>
                                        )
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SandwichCard;
