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
                        <div className="relative aspect-ratio-square">
                            <SandwichImage
                                sandwich={sandwich}
                                ingredientTypes={ingredientTypes}
                                ingredients={ingredients}
                            />
                        </div>
                    </div>
                </div>

                <div class="card-footer relative flex justify-between items-center">
                    <div class="card-footer-start w-1/3 flex justify-start items-center">
                        <img
                            class="icon icon-votes w-auto h-7"
                            src="/theme/images/icons/heart.svg"
                            alt="Heart icon"
                            width="20"
                            height="28"
                        />
                        <span class="votesCount text-xs sm:text-sm text-shadow-5">
                            {sandwich?.votesCount}
                        </span>
                    </div>

                    <div class="card-footer-mid w-1/3 text-center">
                        <img
                            g-ref="Thumb:voteBtn"
                            class="thumb__vote-btn w-auto h-10 mx-auto leading-none cursor-pointer"
                            src="/theme/images/icons/like.svg"
                            alt="Vote icon"
                            width="40"
                            height="40"
                        />
                    </div>

                    <div class="card-footer-end w-1/3 flex justify-end">
                        <a
                            g-ref="Thumb:shareTwBtn"
                            class="inline-block ml-1"
                            href="https://twitter.com/intent/tweet?url=https%3A%2F%2Flidlburgerbuilder.ie%2Fgallery%3Fburger%3D24&amp;text=Vote%20for%20your%20favourite%20entry%20at%20Lidl%E2%80%99s%20Build%20a%20Burger.&amp;hashtags=IrelandsBestBurger,Lidlburgercomp&amp;related=lidl_ireland"
                        >
                            <img
                                class="w-auto h-7"
                                src="/theme/images/icons/twitter.svg"
                                alt="Twitter logo"
                                width="32"
                                height="28"
                            />
                        </a>
                        <a g-ref="Thumb:shareFbBtn" class="inline-block ml-1" href="#">
                            <img
                                class="w-auto h-7"
                                src="/theme/images/icons/facebook.svg"
                                alt="Facebook logo"
                                width="20"
                                height="28"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SandwichCard;
