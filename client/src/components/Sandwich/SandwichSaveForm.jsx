import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthGlobalContext } from "../../context";

import useToast from "../../hooks/use-toast";

import validateForm from "../../utils/validate-utils";

import { Loading, SignupModal } from "..";

const SandwichSaveForm = ({
    sandwich,
    isSavingSandwich,
    saveSandwich,
    sandwichDispatch,
    canGoNextType,
    goToNextIngredientsType,
    clearSandwich,
}) => {
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
    const { currentUser } = useAuthGlobalContext();
    const navigate = useNavigate();
    const { showToast, toastComponents } = useToast();

    const defaultName = currentUser.firstName + "'s Sandwich";

    const isSandwichReady = sandwich.ingredients.length > 1;

    const submitSandwichHandler = async (e) => {
        // e.preventDefault();

        // const errorMessages = validateForm({
        //     sandwichName: sandwich.name,
        //     sandwichComment: sandwich.comment,
        // });
        // errorMessages.forEach((message) => showToast(message));

        // if (errorMessages.length > 0) {
        //     return false;
        // }

        // let res;
        // if (!sandwich.name) {
        //     res = await saveSandwich(sandwich);
        // } else {
        //     res = await saveSandwich({ ...sandwich, name: defaultName });
        // }

        // if (!res.error) {
        //     showToast("Error ocurred while saving the sandwich");
        //     showToast(res.error.me);


        //     return;
        // }

        // setTimeout(() => navigate(`/sandwich/${newSandwichId}`), 500);
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

    if (!sandwich.ingredients.length && !sandwich.name && !sandwich.comment) {
        return;
    }

    return (
        <>
            <div className="flex justify-center my-4">
                {sandwich.ingredients.length > 0 && canGoNextType && (
                    <button className="text-cyan2" onClick={goToNextIngredientsType}>
                        next
                    </button>
                )}
                {(sandwich.ingredients.length > 0 ||
                    sandwich.name ||
                    sandwich.comment) && (
                    <button className="btn-wrapper" onClick={clearSandwich}>
                        Clear all
                    </button>
                )}
            </div>
            {isSavingSandwich ? (
                <Loading />
            ) : (
                <div className="save-sandwich-section flex justify-center text-center">
                    <form
                        onSubmit={
                            currentUser.id
                                ? submitSandwichHandler
                                : guestUserSubmitHandler
                        }
                        className="flex flex-col"
                    >
                        <input
                            type="text"
                            name="name"
                            placeholder={currentUser.id ? defaultName : "Sandwich name"}
                            maxLength={15}
                            onChange={changeSandwichNameHandler}
                            value={sandwich.name}
                            className="my-4"
                        />
                        <div>
                            {isCommentOpen || sandwich.comment ? (
                                <textarea
                                    className="text-gray-800"
                                    type="text"
                                    name="comment"
                                    placeholder="Comment"
                                    maxLength={100}
                                    onChange={changeSandwichCommentHandler}
                                    value={sandwich.comment}
                                ></textarea>
                            ) : (
                                <button
                                    className="text-xs text-magenta text-gray-500"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsCommentOpen(true);
                                    }}
                                >
                                    Add comment...
                                </button>
                            )}
                        </div>
                        <input
                            type="submit"
                            placeholder="save sandwich"
                            disabled={!isSandwichReady}
                            value="Save sandwich"
                            className="my-4"
                        />
                    </form>
                </div>
            )}
            {isOpenLoginModal && (
                <SignupModal setIsOpenLoginModal={setIsOpenLoginModal} closeLink="stay" />
            )}
            {toastComponents}
        </>
    );
};

export default SandwichSaveForm;
