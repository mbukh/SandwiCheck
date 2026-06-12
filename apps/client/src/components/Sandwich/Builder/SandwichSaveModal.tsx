import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MAX_COMMENT_LENGTH, MAX_COMMENT_LINES, MAX_NAME_LENGTH } from '@sandwicheck/shared';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal/Modal';
import SandwichIngredientsList from '@/components/Sandwich/Card/SandwichIngredientsList';
import SignupModal from '@/components/Signup/SignupModal';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { PENDING_SANDWICH_LOCALSTORAGE_KEY } from '@/constants/sandwich-constants';
import { useAuthGlobalContext } from '@/context/AuthGlobalContext';
import { useIngredientsGlobalContext } from '@/context/IngredientsGlobalContext';
import { useModalContext } from '@/context/ModalContext';
import { useSandwichContext } from '@/context/SandwichContext';
import useToast from '@/hooks/use-toast';
import { SANDWICH_ACTION } from '@/reducers/sandwich-reducer';
import type { BuilderSandwich, Sandwich } from '@/types/domain';
import { generateIngredientImageSrc } from '@/utils/ingredients-utils';
import { isPendingAutosaveFresh } from '@/utils/pending-autosave';
import { readJsonFromStorage } from '@/utils/storage-utils';
import validateForm from '@/utils/validate-utils';

interface SandwichSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SandwichSaveModal = ({ isOpen, onClose }: SandwichSaveModalProps): React.JSX.Element => {
  const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [showNewlineWarning, setShowNewlineWarning] = useState(false);
  const [previousCommentValue, setPreviousCommentValue] = useState('');
  const sandwichNameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuthGlobalContext();
  const { ingredientsRawList } = useIngredientsGlobalContext();
  const { closeActiveModal } = useModalContext();
  const { sandwich, isSavingSandwich, saveSandwich, sandwichDispatch, defaultName } = useSandwichContext();
  const { showToast, toastComponents } = useToast();

  // Handle modal close callback
  const handleModalClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Bump the modal key when it opens to force a remount (adjust during render, not in an effect).
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setModalKey((previous) => previous + 1);
    }
  }

  // Autofocus sandwich name input when modal opens
  useEffect(() => {
    if (isOpen && sandwichNameInputRef.current) {
      // Small delay to ensure modal is fully rendered
      const timer = setTimeout(() => {
        sandwichNameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
    return;
  }, [isOpen, modalKey]);

  const validateSandwichDetails = (): boolean => {
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

  const onSubmitSandwich = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    if (!validateSandwichDetails()) {
      return;
    }

    const readySandwich: BuilderSandwich = sandwich.name ? sandwich : { ...sandwich, name: defaultName };

    const res = await saveSandwich(readySandwich);
    if (res.error) {
      showToast(res.error.message);
    } else {
      closeActiveModal();
      // Navigate to menu page with the new sandwich opened
      if (res.data) {
        const sandwichId = res.data.id;
        setTimeout(() => navigate({ to: ROUTE_PATHS.MENU, search: { sandwichId } }), 500);
      }
    }
  };

  const onGuestUserSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    if (!validateSandwichDetails()) {
      return;
    }

    // Timestamp the flag (not 'true') so a forgotten one expires instead of arming forever.
    localStorage.setItem(PENDING_SANDWICH_LOCALSTORAGE_KEY, JSON.stringify(Date.now()));
    setIsOpenLoginModal(true);
  };

  /*
   * Clear the pending-auth flag if the signup prompt is dismissed without logging in, so a later
   * unrelated login can't auto-save a stale draft. Check localStorage synchronously (not
   * currentUser) to avoid the context-propagation race right after a successful login.
   */
  const handleSignupPromptOpenChange = useCallback((open: boolean): void => {
    if (!open && !localStorage.getItem('loggedIn')) {
      localStorage.removeItem(PENDING_SANDWICH_LOCALSTORAGE_KEY);
    }
    setIsOpenLoginModal(open);
  }, []);

  useEffect(() => {
    if (!currentUser.id || isSavingSandwich) {
      return;
    }

    // Only resume a still-fresh flag; drop missing/stale/garbled ones without auto-saving.
    const pendingSince = readJsonFromStorage<number>(PENDING_SANDWICH_LOCALSTORAGE_KEY);
    if (!isPendingAutosaveFresh(pendingSince, Date.now())) {
      localStorage.removeItem(PENDING_SANDWICH_LOCALSTORAGE_KEY);
      return;
    }

    localStorage.removeItem(PENDING_SANDWICH_LOCALSTORAGE_KEY);

    if (sandwich.ingredients.length < 2) {
      return;
    }

    const resumeSave = async (): Promise<void> => {
      const readySandwich: BuilderSandwich = sandwich.name ? sandwich : { ...sandwich, name: defaultName };
      const res = await saveSandwich(readySandwich);

      if (res?.error) {
        showToast(res.error.message);
        return;
      }

      closeActiveModal();
      if (res.data) {
        const sandwichId = res.data.id;
        setTimeout(() => navigate({ to: ROUTE_PATHS.MENU, search: { sandwichId } }), 500);
      }
    };

    void resumeSave();
  }, [currentUser.id, defaultName, isSavingSandwich, navigate, sandwich, saveSandwich, showToast, closeActiveModal]);

  const onChangeSandwichName = (e: React.ChangeEvent<HTMLInputElement>): void => {
    sandwichDispatch({ type: SANDWICH_ACTION.SET_NAME, payload: e.target.value });
  };

  const onChangeSandwichComment = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    let value = e.target.value;
    const previousValue = previousCommentValue || sandwich.comment || '';

    // Detect if a newline was just added
    const previousNewlineCount = (previousValue.match(/\n/g) || []).length;
    const currentNewlineCount = (value.match(/\n/g) || []).length;
    const newlineAdded = currentNewlineCount > previousNewlineCount;

    // If at newline limit and trying to add another, prevent it
    if (previousNewlineCount >= MAX_COMMENT_LINES - 1 && newlineAdded) {
      // Restore previous value to prevent the newline
      value = previousValue;
      setShowNewlineWarning(true);
      // Clear warning after 5 seconds
      setTimeout(() => setShowNewlineWarning(false), 5000);
      setPreviousCommentValue(value);
      sandwichDispatch({ type: SANDWICH_ACTION.SET_COMMENT, payload: value });
      return;
    }

    // Clear warning if newline count decreased or is below limit
    if (currentNewlineCount < MAX_COMMENT_LINES - 1) {
      setShowNewlineWarning(false);
    }

    // Limit to MAX_COMMENT_LENGTH
    if (value.length > MAX_COMMENT_LENGTH) {
      value = value.slice(0, MAX_COMMENT_LENGTH);
    }

    // Limit to MAX_COMMENT_LINES - 1 newlines (MAX_COMMENT_LINES lines total) - safety check
    const finalNewlineCount = (value.match(/\n/g) || []).length;
    if (finalNewlineCount > MAX_COMMENT_LINES - 1) {
      // Keep only the first MAX_COMMENT_LINES lines
      const lines = value.split('\n');
      value = lines.slice(0, MAX_COMMENT_LINES).join('\n');
    }

    // Update previous value for next change
    setPreviousCommentValue(value);
    sandwichDispatch({ type: SANDWICH_ACTION.SET_COMMENT, payload: value });
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    const currentValue = sandwich.comment || '';
    const newlineCount = (currentValue.match(/\n/g) || []).length;

    // Prevent Enter key when at newline limit
    if (e.key === 'Enter' && newlineCount >= MAX_COMMENT_LINES - 1) {
      e.preventDefault();
      setShowNewlineWarning(true);
      // Clear warning after 5 seconds
      setTimeout(() => setShowNewlineWarning(false), 5000);
      return;
    }
  };

  const handleCommentFocus = (): void => {
    setIsCommentExpanded(true);
  };

  const handleCommentBlur = (): void => {
    // Keep expanded if there's content, otherwise collapse
    if (!sandwich.comment || sandwich.comment.trim().length === 0) {
      setIsCommentExpanded(false);
    }
  };

  /*
   * While the modal is open, keep the comment box expanded when there's content and keep the
   * newline/previous-value bookkeeping in sync with the comment. Done during render (keyed on
   * isOpen + comment) rather than in an effect.
   */
  const [commentSyncKey, setCommentSyncKey] = useState({ isOpen, comment: sandwich.comment });
  if (commentSyncKey.isOpen !== isOpen || commentSyncKey.comment !== sandwich.comment) {
    setCommentSyncKey({ isOpen, comment: sandwich.comment });
    if (isOpen) {
      setIsCommentExpanded(Boolean(sandwich.comment && sandwich.comment.trim().length > 0));
      setPreviousCommentValue(sandwich.comment || '');
      setShowNewlineWarning(false);
    }
  }

  return (
    <>
      {isOpen && (
        <Modal
          key={modalKey}
          modalId="sandwich-save"
          closeLink="stay"
          isModalLoading={false}
          onClose={handleModalClose}
        >
          <div className="save-modal-wrapper max-w-4xl">
            {/* Preview Section */}
            <div className="mx-auto mb-6 max-w-xs text-white sm:max-w-sm md:max-w-screen-md">
              <div className="sandwich-card thumb modal__thumb voted flex flex-col justify-center md:flex-row">
                <div className="card-wrapper card-bg-1 thumb__wrapper box-shadow-10 flex flex-shrink-0 flex-col justify-between p-2 sm:p-4 md:w-2/3">
                  <div className="card-header text-center">
                    <input
                      ref={sandwichNameInputRef}
                      type="text"
                      name="name"
                      placeholder={currentUser.id ? defaultName : 'Sandwich name'}
                      maxLength={MAX_NAME_LENGTH}
                      onChange={onChangeSandwichName}
                      value={sandwich.name}
                      className="thumb__title text-shadow-5 w-full bg-transparent text-center text-base font-bold text-white uppercase placeholder:text-white/70 focus:ring-2 focus:ring-white/50 focus:outline-none sm:text-lg lg:text-xl"
                    />
                    <h5 className="thumb__name text-shadow-5 text-sm sm:text-base lg:text-lg">
                      by <span className="capitalize">You</span>
                    </h5>
                  </div>
                  <div className="card-middle">
                    <div className="card-orb mx-auto mt-auto w-full">
                      <div className="relative aspect-square">
                        <div className="sandwich-images">
                          {sandwich.ingredients && sandwich.ingredients.length > 0
                            ? sandwich.ingredients.map((ingredient, index) => (
                                <img
                                  key={ingredient.id || index}
                                  src={generateIngredientImageSrc({
                                    ingredient,
                                    sandwich,
                                  })}
                                  className="absolute inset-0 size-full object-contain drag-none select-none"
                                  alt={`Sandwich layer ${index + 1}: ${ingredient.name || 'ingredient'}`}
                                  loading="lazy"
                                  style={{
                                    zIndex: index + 1, // Lower index (bread) has lower z-index, appears at bottom
                                  }}
                                />
                              ))
                            : null}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer relative flex items-center justify-between">
                    {/* Empty footer to maintain spacing consistency with regular sandwich modal */}
                  </div>
                </div>

                {/* Ingredients List */}
                {sandwich.ingredients && sandwich.ingredients.length > 0 && (
                  <SandwichIngredientsList
                    sandwich={sandwich as Sandwich}
                    ingredientsRawList={ingredientsRawList}
                    hideComment={true}
                  />
                )}
              </div>
            </div>

            {/* Form Section */}
            <div className="mx-auto max-w-md">
              <div className="w-full">
                <label htmlFor="sandwich-comment" className="mb-2 block text-sm font-medium text-white">
                  <span className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Add a comment (optional)
                  </span>
                </label>
                <textarea
                  id="sandwich-comment"
                  className="box-shadow-10 xl:box-shadow-20 w-full appearance-none rounded-lg bg-white px-4 py-2 text-base text-magenta transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-white/50 focus:outline-none md:px-6 xl:px-8 xl:py-3 xl:text-xl"
                  name="comment"
                  placeholder={
                    isCommentExpanded ? 'Share your thoughts about this sandwich...' : 'Click to add a comment...'
                  }
                  maxLength={MAX_COMMENT_LENGTH}
                  onChange={onChangeSandwichComment}
                  onKeyDown={handleCommentKeyDown}
                  onFocus={handleCommentFocus}
                  onBlur={handleCommentBlur}
                  value={sandwich.comment || ''}
                  rows={isCommentExpanded ? 4 : 1}
                  style={{
                    resize: isCommentExpanded ? 'vertical' : 'none',
                    minHeight: isCommentExpanded ? 'auto' : '2.5rem',
                    overflow: isCommentExpanded ? 'auto' : 'hidden',
                  }}
                />
                {isCommentExpanded && (
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {showNewlineWarning && (
                      <span className="animate-pulse text-xs text-orange-300">
                        Maximum {MAX_COMMENT_LINES} lines allowed
                      </span>
                    )}
                    {!showNewlineWarning && <span></span>}
                    <span
                      className={`text-xs ${
                        (sandwich.comment?.length || 0) >= MAX_COMMENT_LENGTH
                          ? 'font-semibold text-red-400'
                          : (sandwich.comment?.length || 0) >= 70
                            ? 'text-orange-300'
                            : 'text-white/70'
                      }`}
                    >
                      {sandwich.comment?.length || 0} / {MAX_COMMENT_LENGTH}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Section */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-800 transition-all hover:scale-105"
                onClick={closeActiveModal}
              >
                Back to Edit
              </button>
              {isSavingSandwich ? (
                <div className="flex items-center px-6 py-2">
                  <Loading />
                </div>
              ) : (
                <button
                  onClick={currentUser.id ? onSubmitSandwich : onGuestUserSubmit}
                  className="rounded-lg bg-magenta px-6 py-2 font-medium text-white transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={sandwich.ingredients.length < 2}
                >
                  Save Sandwich
                </button>
              )}
            </div>
          </div>

          {isOpenLoginModal && <SignupModal setIsOpenLoginModal={handleSignupPromptOpenChange} closeLink="stay" />}
          {toastComponents}
        </Modal>
      )}
    </>
  );
};

export default SandwichSaveModal;
