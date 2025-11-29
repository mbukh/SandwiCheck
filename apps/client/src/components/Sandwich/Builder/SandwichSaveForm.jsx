import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  MAX_COMMENT_LENGTH,
  MAX_NAME_LENGTH,
  PENDING_SANDWICH_LOCALSTORAGE_KEY,
} from '../../../constants/sandwich-constants';
import { useAuthGlobalContext } from '../../../context/AuthGlobalContext';
import { useSandwichContext } from '../../../context/SandwichContext';
import useToast from '../../../hooks/use-toast';
import { ROUTE_PATHS } from '../../../routes';
import validateForm from '../../../utils/validate-utils';
import Loading from '../../Loading';
import SignupModal from '../../Signup/SignupModal';

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

  const validateSandwichDetails = () => {
    const errorMessages = validateForm({
      sandwichName: sandwich.name,
      sandwichComment: sandwich.comment,
    });

    if (errorMessages.length > 0) {
      for (const message of errorMessages) {
        showToast(message);
      }
      return false;
    }

    if (sandwich.ingredients.length < 2) {
      showToast('Please add at least two ingredients to your sandwich');
      return false;
    }

    return true;
  };

  const onSubmitSandwich = async (e) => {
    e.preventDefault();

    if (!validateSandwichDetails()) {
      return;
    }

    let readySandwich = sandwich.name ? sandwich : { ...sandwich, name: defaultName };

    const res = await saveSandwich(readySandwich);
    if (res.error) {
      showToast(res.error.message);
    } else {
      // Navigate to menu page with the new sandwich opened
      setTimeout(() => navigate({ to: ROUTE_PATHS.MENU, search: { sandwichId: res.data.id } }), 500);
    }
  };

  const onGuestUserSubmit = async (e) => {
    e.preventDefault();

    if (!validateSandwichDetails()) {
      return;
    }

    localStorage.setItem(PENDING_SANDWICH_LOCALSTORAGE_KEY, 'true');
    setIsOpenLoginModal(true);
  };

  useEffect(() => {
    if (!currentUser.id || isSavingSandwich) {
      return;
    }

    const shouldResume = localStorage.getItem(PENDING_SANDWICH_LOCALSTORAGE_KEY);
    if (!shouldResume) {
      return;
    }

    localStorage.removeItem(PENDING_SANDWICH_LOCALSTORAGE_KEY);

    if (sandwich.ingredients.length < 2) {
      return;
    }

    const resumeSave = async () => {
      const readySandwich = sandwich.name ? sandwich : { ...sandwich, name: defaultName };
      const res = await saveSandwich(readySandwich);

      if (res?.error) {
        showToast(res.error.message);
        return;
      }

      setTimeout(() => navigate({ to: ROUTE_PATHS.MENU, search: { sandwichId: res.data.id } }), 500);
    };

    void resumeSave();
  }, [currentUser.id, defaultName, isSavingSandwich, navigate, sandwich, saveSandwich, showToast]);

  const onChangeSandwichName = (e) => {
    sandwichDispatch({ type: 'SET_NAME', payload: e.target.value });
  };

  const onChangeSandwichComment = (e) => {
    sandwichDispatch({ type: 'SET_COMMENT', payload: e.target.value });
  };

  if (sandwich.ingredients.length === 0 && !sandwich.name && !sandwich.comment) {
    return <></>;
  }

  return (
    <>
      <div className="my-4 flex justify-center gap-4">
        {sandwich.ingredients.length > 0 && canGoNextType && (
          <button
            className="font-bold text-cyan2-500 uppercase transition-all duration-200 hover:scale-105 hover:text-cyan-600"
            onClick={goToNextType}
          >
            next
          </button>
        )}
        {(sandwich.ingredients.length > 0 || sandwich.name || sandwich.comment) && (
          <button
            className="btn-wrapper font-bold text-magenta uppercase transition-all duration-200 hover:scale-105 hover:text-pink-600"
            onClick={clearSandwich}
          >
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
            className="flex w-full max-w-md flex-col"
          >
            <input
              type="text"
              name="name"
              placeholder={currentUser.id ? defaultName : 'Sandwich name'}
              maxLength={MAX_NAME_LENGTH}
              onChange={onChangeSandwichName}
              value={sandwich.name}
              className="my-4 transition-shadow focus:shadow-lg"
            />
            <div className="w-full">
              {isCommentOpen || sandwich.comment ? (
                <textarea
                  className="w-full text-gray-800 transition-shadow focus:shadow-lg"
                  type="text"
                  name="comment"
                  placeholder="Comment"
                  maxLength={MAX_COMMENT_LENGTH}
                  onChange={onChangeSandwichComment}
                  value={sandwich.comment}
                ></textarea>
              ) : (
                <button
                  className="text-xs text-gray-500 text-magenta transition-all hover:underline"
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
              className="my-4 transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            />
          </form>
        </div>
      )}
      {isOpenLoginModal && <SignupModal setIsOpenLoginModal={setIsOpenLoginModal} closeLink="stay" />}
      {toastComponents}
    </>
  );
};

export default SandwichSaveForm;
