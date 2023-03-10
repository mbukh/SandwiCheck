import { Link } from "react-router-dom";

import SandwichImage from "./SandwichImage";

const SandwichCard = ({ index, sandwich, ingredientTypes, ingredients }) => {
    const bgIndex = (index % 4) + 1;

    return (
        <div
            className="sandwich-card w-1/2 sm:w-1/2 lg:w-1/3 xl:w-1/4 xxl:w-1/5"
            key={sandwich.id}
        >
            <div
                className={`card-wrapper flex flex-col flex-1 justify-between m-2 sm:m-3 p-2 sm:p-4 box-shadow-10 card-bg-${bgIndex}`}
            >
                <div className="card-header text-center">
                    {sandwich?.name && (
                        <h3 className="card-title text-sm sm:text-base xl:text-lg font-bold uppercase text-shadow-5">
                            {sandwich.name}
                        </h3>
                    )}
                    {sandwich?.author && (
                        <h5 className="card-name text-xs sm:text-sm text-shadow-5">
                            by <span className="capitalize">{sandwich.author}</span>
                        </h5>
                    )}
                </div>
                <div className="card-middle">
                    <div className="card-orb w-full mt-auto mx-auto cursor-pointer">
                        <Link to={`/sandwich/${sandwich.id}`}>
                            <div className="relative aspect-ratio-square">
                                <SandwichImage
                                    sandwich={sandwich}
                                    ingredientTypes={ingredientTypes}
                                    ingredients={ingredients}
                                />
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="card-footer relative flex justify-between items-center">
                    <div className="card-footer-start w-1/3 flex justify-start items-center">
                        <i
                            className="icon icon-votes w-auto h-7"
                            title="Favorites counter"
                        ></i>
                        <span className="votesCount text-xs sm:text-sm text-shadow-5">
                            {sandwich?.votesCount}234
                        </span>
                    </div>

                    <div className="card-footer-mid w-1/3 text-center">
                        <button className="btn-wrapper">
                            <i className="icon icon-heart" title="Add to favorites"></i>
                        </button>
                    </div>

                    <div className="card-footer-end w-1/3 flex justify-end">
                        <a
                            className="inline-block ml-1"
                            href={`https://wa.me/?text=This+sandwich+from+SandwiCheck+looks+yummy%21+${window.location.protocol}%2F%2F${window.location.hostname}%2Fsandwich%2F${sandwich.id}`}
                        >
                            <i
                                className="icon icon-whatsapp w-auto h-7"
                                title="Share via Whatsapp"
                            ></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SandwichCard;
