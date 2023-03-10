import { useEffect } from "react";

import { useParams } from "react-router-dom";

import useSandwich from "../hooks/use-sandwich";

import { SandwichCard } from "./";

import { Modal } from "./";

const SandwichModal = ({ children }) => {
    const { sandwichId } = useParams();
    const { sandwich, setSandwich, ingredientTypes, ingredients, fetchSandwich } =
        useSandwich();

    useEffect(() => {
        (async () => await fetchSandwich(sandwichId))();
    }, [fetchSandwich, sandwichId, setSandwich]);

    return (
        <Modal>
            <div id="modal-burger">
                <div className="max-w-xs sm:max-w-sm md:max-w-screen-md mx-auto text-white">
                    <div
                        g-component="Thumb"
                        g-options='{"type": "modal", "page": "gallery"}'
                        data-id="170"
                        data-county="longford"
                        data-finalist="1"
                        className="thumb modal__thumb flex flex-col md:flex-row justify-center voted"
                    >
                        {sandwich && (
                            <>
                                <SandwichCard
                                    key={sandwich.id}
                                    index={Math.ceil(Math.random() * 4)}
                                    sandwich={sandwich}
                                    ingredientTypes={ingredientTypes}
                                    ingredients={ingredients}
                                />

                                <div className="thumb__ingredients flex md:flex-col md:justify-center text-left mx-auto pt-8 pb-0 pr-4 md:py-0 md:pl-8 md:pr-4 text-shadow-5">
                                    <div>
                                        <h5 className="ml-4 mb-4 text-sm sm:text-base uppercase">
                                            Ingredients
                                        </h5>
                                        <ul className="text-sm sm:text-base">
                                            <li>Seeded bun</li>
                                            <li>Garlic mayo</li>
                                            <li>Iceberg lettuce</li>
                                            <li>
                                                Vegetarian sweet potato &amp; chilli bean
                                                burger
                                            </li>
                                            <li>Roasted peppers</li>
                                            <li>Cashel blue</li>
                                            <li>Burger sauce</li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SandwichModal;
