import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { TYPES } from "../../constants/ingredients-constants";

import { hasUserVotedUserForSandwich, voteForSandwich } from "../../services/votes";

import { updateSandwichInCache } from "../../services/api-sandwiches";

import { useAuthGlobalContext } from "../../context";

import SandwichImage from "./SandwichImage";

const SandwichCard = ({ index, sandwich, ingredients, closeBasePath = "" }) => {
    const [isUserVoting, setIsUserVoting] = useState(false);
    const { currentUser } = useAuthGlobalContext;

    const navigate = useNavigate();

    const isModal = closeBasePath ? true : false;

    const isVotedByUser = hasUserVotedUserForSandwich(sandwich, currentUser);

    const bgIndex = (index % 4) + 1;

    const copyThisSandwichHandler = (e) => {
        e.preventDefault();

        updateSandwichInCache(sandwich);
        navigate("/create");
    };

    const voteForSandwichHandler = async (e) => {
        setIsUserVoting(true);
        await voteForSandwich({ userId: currentUser.id, sandwichId: sandwich.id });
    };

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
                        by <span className="capitalize">{sandwich.authorName}</span>
                    </h5>
                </div>
                <div className="card-middle">
                    <div className="card-orb w-full mt-auto mx-auto">
                        <SandwichImage
                            sandwich={sandwich}
                            closeBasePath={closeBasePath}
                        />
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
                            {!isVotedByUser && (
                                <button
                                    className={`btn-wrapper ${
                                        isUserVoting ? "fadeout" : ""
                                    }`}
                                    onClick={voteForSandwichHandler}
                                >
                                    <i
                                        className="icon icon-heart abs inset-0 h-full w-full"
                                        title="Add to favorites"
                                    ></i>
                                </button>
                            )}
                            {(isVotedByUser || isUserVoting) && (
                                <Link
                                    to="/create"
                                    onClick={copyThisSandwichHandler}
                                    className="fade-in abs flex fl-cc inset-0 h-full w-full"
                                    title="Copy this sandwich"
                                >
                                    <svg
                                        version="1.1"
                                        width={isModal ? "35" : "24"}
                                        height={isModal ? "35" : "24"}
                                        viewBox="0 0 15 15"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M 15 7.5 C 15 11.642 11.642 15 7.5 15 C 3.358 15 0 11.642 0 7.5 C 0 3.358 3.358 0 7.5 0 C 11.642 0 15 3.358 15 7.5 Z M 8.001 11.5 L 8.001 7.999 L 11.5 7.999 L 11.5 7 L 8.001 7 L 8.001 3.499 L 7 3.499 L 7 7 L 3.501 7 L 3.501 7.999 L 7 7.999 L 7 11.5 L 8.001 11.5 Z"
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
                            {TYPES.map(
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
