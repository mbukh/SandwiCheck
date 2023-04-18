import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useAuthGlobalContext, useSandwichGlobalContext } from "../../context";

import { useSandwich } from "../../hooks";

import { TYPES } from "../../constants/ingredientTypes";

import { SandwichCard, Modal } from "..";

const SandwichModal = ({ closeLink = "" }) => {
    const [isModalLoading, setIsModalLoading] = useState(true);
    const { currentUser: user } = useAuthGlobalContext();
    const { ingredients, areIngredientsReady } = useSandwichGlobalContext();
    const { sandwichId } = useParams();
    const {
        sandwich,
        fetchSandwich,
        hasUserVotedUserForSandwich,
        voteForSandwich,
        updateLocalSandwich,
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
                    TYPES={TYPES}
                    ingredients={ingredients}
                    closeBasePath=""
                    hasUserVoted={hasUserVotedUserForSandwich(sandwich, user)}
                    voteForSandwich={voteForSandwich}
                    updateLocalSandwich={updateLocalSandwich}
                />
            </div>
        </Modal>
    );
};

export default SandwichModal;
