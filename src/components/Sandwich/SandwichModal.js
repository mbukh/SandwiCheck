import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { useSandwich } from "../../hooks/";

import { SandwichCard, Modal } from "../";

const SandwichModal = ({ closeLink = "" }) => {
    const [isModalLoading, setIsModalLoading] = useState(true);
    const { sandwichId } = useParams();
    const { sandwich, ingredientTypes, ingredients, fetchSandwich } = useSandwich();

    useEffect(() => {
        (async () => {
            await fetchSandwich(sandwichId);
            setIsModalLoading(false);
        })();
    }, [fetchSandwich, sandwichId]);

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
                />
            </div>
        </Modal>
    );
};

export default SandwichModal;
