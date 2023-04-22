import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthGlobalContext } from "../../context";

import useToast from "../../hooks/use-toast";

import { Loading, SignupModal } from "..";

const SandwichSaveForm = ({
    sandwich,
    clearSandwich,
    isSavingSandwich,
    saveSandwich,
    sandwichDispatch,
}) => {
    const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
    const { currentUser } = useAuthGlobalContext();
    const navigate = useNavigate();
    const { showToast, toastComponents } = useToast();

    const isSandwichReady = sandwich.ingredients.length > 1;

    const validateNameAndComment = () => {
        const invalidName = sandwich.name.length > 0 && sandwich.name.length < 3;
        const invalidComment = sandwich.comment.length > 100;

        if (invalidName) {
            showToast();
        }
        if (invalidComment) {
            showToast();
        }

        if (invalidName || invalidComment) {
            return false;
        }

        return true;
    };

    const submitSandwichHandler = async (e) => {
        e.preventDefault();

        if (!validateNameAndComment()) {
            return false;
        }

        const newSandwichId = await saveSandwich();

        if (!newSandwichId) {
            // ERROR CODE;
            return;
        }
        setTimeout(() => navigate(`/sandwich/${newSandwichId}`), 500);
    };

    const guestUserSubmitHandler = async (e) => {
        e.preventDefault();
        setIsOpenLoginModal(true);
    };

    const changeSandwichNameHandler = (e) => {
        sandwichDispatch({ type: "SET_NAME", payload: e.target.value });
    };

    const changeSandwichCommentHandler = (e) => {
        sandwichDispatch({ type: "SET_COMMENT", payload: e.target.value });
    };

    return (
        <>
            <div className="flex justify-center my-4">
                <button className="btn-wrapper" onClick={clearSandwich}>
                    Clear all
                </button>
            </div>

            {isSavingSandwich ? (
                <Loading />
            ) : (
                <div className="save-sandwich-section flex justify-center text-center">
                    <form onSubmit={submitSandwichHandler}>
                        <input
                            type="text"
                            name="sandwichName"
                            placeholder={
                                currentUser?.name
                                    ? currentUser?.name.split(" ")[0] + "'s Sandwich"
                                    : "Sandwich name"
                            }
                            maxLength={25}
                            onChange={changeSandwichNameHandler}
                            value={sandwich?.name}
                        />
                        {currentUser.id ? (
                            <input
                                type="submit"
                                placeholder="save sandwich"
                                className="my-4"
                                disabled={!isSandwichReady}
                                value="Save sandwich"
                            />
                        ) : (
                            <>
                                <button
                                    placeholder="save sandwich"
                                    className="my-4"
                                    disabled={!isSandwichReady}
                                    onClick={guestUserSubmitHandler}
                                >
                                    Save sandwich
                                </button>
                                {isOpenLoginModal && (
                                    <SignupModal
                                        setIsOpenLoginModal={setIsOpenLoginModal}
                                        closeLink="stay"
                                    />
                                )}
                            </>
                        )}
                    </form>
                </div>
            )}
            {toastComponents}
        </>
    );
};

export default SandwichSaveForm;
