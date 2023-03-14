import { useState } from "react";

import { Link } from "react-router-dom";

import { SandwichImage } from "../";

const SandwichCard = ({
    isModal = false,
    index,
    sandwich,
    ingredientTypes,
    ingredients,
    closeBasePath = "",
    hasUserVoted,
    voteForSandwich,
}) => {
    const [isUserVoting, setIsUserVoting] = useState(false);

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
        <div
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
                    <h3
                        className={`card-title ${
                            !isModal
                                ? "thumb__title text-sm sm:text-base xl:text-lg font-bold uppercase text-shadow-5"
                                : "thumb__title text-base sm:text-lg lg:text-xl font-bold uppercase text-shadow-5"
                        }`}
                    >
                        {sandwich.name || "Sandwich eater"}
                    </h3>
                    <h5
                        className={`card-name ${
                            !isModal
                                ? "thumb__name text-xs sm:text-sm text-shadow-5"
                                : "thumb__name text-sm sm:text-base lg:text-lg text-shadow-5"
                        }`}
                    >
                        by{" "}
                        <span className="capitalize">
                            {sandwich.author || "an anonymous user"}
                        </span>
                    </h5>
                </div>
                <div className="card-middle">
                    <div className="card-orb w-full mt-auto mx-auto">
                        {!isModal ? (
                            <Link to={`${closeBasePath}/sandwich/${sandwich.id}`}>
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
                            className={`icon icon-votes w-auto h-7 sm:h-8 ${
                                isUserVoting ? "bounce" : ""
                            }`}
                            title="Favorites counter"
                        ></i>
                        <span className="votesCount text-xs sm:text-sm text-shadow-5">
                            {(sandwich?.votesCount || 0) + isUserVoting}
                        </span>
                    </div>
                    <div className="card-footer-mid w-1/3 text-center">
                        <div
                            className={`thumb__vote-btn relative w-auto h-10 mx-auto leading-none
                                ${isModal ? "md:h-16" : ""}
                            `}
                        >
                            {!hasUserVoted && (
                                <button
                                    className={`btn-wrapper ${
                                        isUserVoting ? "fadeout" : ""
                                    }`}
                                    onClick={async () => {
                                        setIsUserVoting(true);
                                        voteForSandwich(sandwich.id);
                                    }}
                                >
                                    <i
                                        className="icon icon-heart abs inset-0 h-full w-full"
                                        title="Add to favorites"
                                    ></i>
                                </button>
                            )}
                            {(hasUserVoted || isUserVoting) && isModal && (
                                <Link
                                    to="/create"
                                    className="fade-in abs flex fl-cc inset-0 h-full w-full"
                                >
                                    <svg
                                        version="1.1"
                                        width="35"
                                        height="35"
                                        viewBox="0 0 15 15"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <circle
                                            cx="7"
                                            cy="7"
                                            r="7"
                                            style={{ fill: "var(--magenta)" }}
                                        ></circle>
                                        <path
                                            d="m6.5333 10.733v-3.2667h-3.2667v-0.93333h3.2667v-3.2667h0.93333v3.2667h3.2667v0.93333h-3.2667v3.2667z"
                                            fill="#FFF"
                                        ></path>
                                    </svg>
                                </Link>
                            )}
                        </div>
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
    );
};

export default SandwichCard;
