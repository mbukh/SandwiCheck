import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useAuthGlobalContext, useSandwichGlobalContext } from "../../context";

import { useSandwich } from "../../hooks";

import { TYPES } from "../../constants/ingredients-constants";

import { SandwichCard, Modal } from "..";

const SandwichModal = ({ closeLink = "" }) => {
    const [isModalLoading, setIsModalLoading] = useState(true);
    const { currentUser } = useAuthGlobalContext();
    const { ingredients, areIngredientsReady } = useSandwichGlobalContext();
    const { sandwichId } = useParams();
    const {
        sandwich,
        getSandwich,
        hasUserVotedUserForSandwich,
        voteForSandwich,
        updateSandwichInCache,
    } = useSandwich();

    useEffect(() => {
        (async () => {
            await getSandwich(sandwichId);
            areIngredientsReady && setIsModalLoading(false);
        })();
    }, [areIngredientsReady, getSandwich, sandwichId]);

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
                    isVotedByUser={hasUserVotedUserForSandwich(sandwich, currentUser)}
                    voteForSandwich={voteForSandwich}
                    updateSandwichInCache={updateSandwichInCache}
                />
            </div>
        </Modal>
    );
};

export default SandwichModal;
