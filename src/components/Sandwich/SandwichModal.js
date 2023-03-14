import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useAuthGlobalContext, useSandwichGlobalContext } from "../../context";

import { useSandwich } from "../../hooks/";

import { SandwichCard, Modal } from "../";

const SandwichModal = ({ closeLink = "" }) => {
    const [isModalLoading, setIsModalLoading] = useState(true);
    const { user } = useAuthGlobalContext();
    const { ingredients, areIngredientsReady } = useSandwichGlobalContext();
    const { sandwichId } = useParams();
    const {
        sandwich,
        ingredientTypes,
        fetchSandwich,
        hasUserVotedUserForSandwich,
        voteForSandwich,
    } = useSandwich();

    useEffect(() => {
        (async () => {
            await fetchSandwich(sandwichId);
            areIngredientsReady && setIsModalLoading(false);
        })();
    }, [areIngredientsReady, fetchSandwich, sandwichId]);

    return (
        <Modal isModalLoading={isModalLoading} closeLink={closeLink}>
            <div className="max-w-xs sm:max-w-sm md:max-w-screen-md mx-auto text-white">
                <SandwichCard
                    isModal
                    key={sandwichId}
                    index={Math.ceil(Math.random() * 4)}
                    sandwich={sandwich}
                    ingredientTypes={ingredientTypes}
                    ingredients={ingredients}
                    closeBasePath=""
                    hasUserVoted={hasUserVotedUserForSandwich(sandwich, user)}
                    voteForSandwich={voteForSandwich}
                />
            </div>
        </Modal>
    );
};

export default SandwichModal;
