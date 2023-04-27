import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    MAX_COMMENT_LENGTH,
    MAX_NAME_LENGTH,
} from "../../../constants/sandwich-constants";
import validateForm from "../../../utils/validate-utils";

import { useAuthGlobalContext } from "../../../context/AuthGlobalContext";
import { useSandwichContext } from "../../../context/SandwichContext";

import useToast from "../../../hooks/use-toast";

import Loading from "../../Loading";
import SignupModal from "../../Signup/SignupModal";

const SandwichSaveForm = () => {
    const [isCommentOpen, setIsCommentOpen] = useState(false);
    const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
    const navigate = useNavigate();
    const { currentUser } = useAuthGlobalContext();
    const {
        sandwich,
        isSavingSandwich,
        saveSandwich,
        sandwichDispatch,
        canGoNextType,
        goToNextType,
        clearSandwich,
        defaultName,
        isSandwichReady,
    } = useSandwichContext();
    const { showToast, toastComponents } = useToast();

    const onSubmitSandwich = async (e) => {
        e.preventDefault();

        const errorMessages = validateForm({
            sandwichName: sandwich.name,
            sandwichComment: sandwich.comment,
        });

        if (errorMessages.length > 0) {
            return errorMessages.forEach((message) => showToast(message));
        }

        let readySandwich = !sandwich.name
            ? { ...sandwich, name: defaultName }
            : sandwich;

        const res = await saveSandwich(readySandwich);
        if (res.error) {
            showToast(res.error.message);
        } else {
            setTimeout(() => navigate(`/sandwich/${res.data.id}`), 500);
        }
    };

    const onGuestUserSubmit = async (e) => {
        e.preventDefault();
        setIsOpenLoginModal(true);
    };

    const onChangeSandwichName = (e) => {
        sandwichDispatch({ type: "SET_NAME", payload: e.target.value });
    };

    const onChangeSandwichComment = (e) => {
        sandwichDispatch({ type: "SET_COMMENT", payload: e.target.value });
    };

    if (!sandwich.ingredients.length && !sandwich.name && !sandwich.comment) {
        return <></>;
    }

    return (
        <>
            <div className="flex justify-center my-4">
                {sandwich.ingredients.length > 0 && canGoNextType && (
                    <button className="text-cyan2" onClick={goToNextType}>
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
                        onSubmit={currentUser.id ? onSubmitSandwich : onGuestUserSubmit}
                        className="flex flex-col"
                    >
                        <input
                            type="text"
                            name="name"
                            placeholder={currentUser.id ? defaultName : "Sandwich name"}
                            maxLength={MAX_NAME_LENGTH}
                            onChange={onChangeSandwichName}
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
                                    maxLength={MAX_COMMENT_LENGTH}
                                    onChange={onChangeSandwichComment}
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
