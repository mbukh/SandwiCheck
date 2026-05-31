import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import SandwichImage from '@/components/Sandwich/SandwichImage';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { useAuthGlobalContext } from '@/context/AuthGlobalContext';
import { useIngredientsGlobalContext } from '@/context/IngredientsGlobalContext';
import useToast from '@/hooks/use-toast';
import { updateSandwichInCache } from '@/services/api-sandwiches';
import { hasUserVotedForSandwich, voteForSandwich } from '@/services/votes';
import type { Sandwich } from '@/types/domain';
import { hydrateSandwichIngredientsData } from '@/utils/sandwich-utils';
import SandwichIngredientsList from './SandwichIngredientsList';

interface SandwichCardProps {
  index: number;
  sandwich: Sandwich;
  galleryPath?: string;
  isModal: boolean;
}

const SandwichCard = ({ index, sandwich, galleryPath = '', isModal }: SandwichCardProps): React.JSX.Element => {
  const { currentUser, setCurrentUser } = useAuthGlobalContext();
  const { ingredientsRawList } = useIngredientsGlobalContext();
  const { showToast, toastComponents } = useToast();

  const [votesCount, setVotesCount] = useState(sandwich.votesCount);
  const [isProcessingVote, setIsProcessingVote] = useState(false);
  const [isOptimisticallyVoted, setIsOptimisticallyVoted] = useState(() =>
    hasUserVotedForSandwich(sandwich, currentUser),
  );

  const navigate = useNavigate();

  const isVotedByUser = isOptimisticallyVoted;

  /*
   * Re-sync optimistic vote state from props during render (instead of effects): reset the local
   * votes count when the server count changes, and recompute whether the current user has voted
   * when the sandwich or user changes.
   */
  const [previousVotesCount, setPreviousVotesCount] = useState(sandwich.votesCount);
  if (previousVotesCount !== sandwich.votesCount) {
    setPreviousVotesCount(sandwich.votesCount);
    setVotesCount(sandwich.votesCount);
  }

  const [voteSyncKey, setVoteSyncKey] = useState({ sandwich, currentUser });
  if (voteSyncKey.sandwich !== sandwich || voteSyncKey.currentUser !== currentUser) {
    setVoteSyncKey({ sandwich, currentUser });
    setIsOptimisticallyVoted(hasUserVotedForSandwich(sandwich, currentUser));
  }

  const bgIndex = (index % 4) + 1;

  const copyThisSandwichHandler = (e: React.MouseEvent): void => {
    e.preventDefault();

    const hydratedSandwich = hydrateSandwichIngredientsData(sandwich, ingredientsRawList);
    updateSandwichInCache(hydratedSandwich);
    navigate({ to: ROUTE_PATHS.CREATE });
  };

  const voteForSandwichHandler = async (event: React.MouseEvent): Promise<void> => {
    event.preventDefault();

    if (isProcessingVote || isVotedByUser) {
      return;
    }

    if (!currentUser.id) {
      showToast('Please log in to vote for sandwiches');
      return;
    }

    setIsProcessingVote(true);

    try {
      const response = await voteForSandwich({ userId: currentUser.id, sandwichId: sandwich.id });

      if (!response?.success) {
        showToast(response?.error?.message || 'Unable to add this sandwich to your favorites');
        return;
      }

      setVotesCount((prev) => response?.data?.votesCount ?? prev + 1);
      setIsOptimisticallyVoted(true);

      setCurrentUser((previousUser) => {
        if (!previousUser?.id) {
          return previousUser;
        }

        const favorites = new Set(previousUser.favoriteSandwiches || []);
        favorites.add(sandwich.id);

        return {
          ...previousUser,
          favoriteSandwiches: [...favorites],
        };
      });
    } catch (error) {
      const fallbackMessage = extractErrorMessage(error) || 'Unable to add this sandwich to your favorites';
      showToast(fallbackMessage);
    } finally {
      setIsProcessingVote(false);
    }
  };

  return (
    <div
      // FIXME: implement voted class from real data
      // eslint-disable-next-line no-constant-binary-expression
      className={`sandwich-card ${true && 'voted'} ${
        isModal
          ? 'thumb modal__thumb voted flex flex-col justify-center md:flex-row'
          : 'thumb xxl:w-1/5 flex w-1/2 sm:w-1/2 lg:w-1/3 xl:w-1/4'
      }`}
    >
      <div
        className={`card-wrapper card-bg-${bgIndex} ${
          isModal
            ? 'thumb__wrapper box-shadow-10 flex flex-shrink-0 flex-col justify-between p-2 sm:p-4 md:w-2/3'
            : 'thumb__wrapper box-shadow-10 m-2 flex flex-1 flex-col justify-between p-2 sm:m-3 sm:p-4'
        }`}
      >
        <div className="card-header text-center">
          <h3
            className={`card-title ${
              isModal
                ? 'thumb__title text-shadow-5 text-base font-bold uppercase sm:text-lg lg:text-xl'
                : 'thumb__title text-shadow-5 text-sm font-bold uppercase sm:text-base xl:text-lg'
            }`}
          >
            {sandwich.name || 'Sandwich eater'}
          </h3>
          <h5
            className={`card-name ${
              isModal
                ? 'thumb__name text-shadow-5 text-sm sm:text-base lg:text-lg'
                : 'thumb__name text-shadow-5 text-xs sm:text-sm'
            }`}
          >
            by <span className="capitalize">{sandwich.authorName}</span>
          </h5>
        </div>
        <div className="card-middle">
          <div className="card-orb mx-auto mt-auto w-full">
            <SandwichImage sandwich={sandwich} galleryPath={galleryPath} isModal={isModal} />
          </div>
        </div>
        <div className="card-footer relative flex items-center justify-between">
          <div className="card-footer-start flex w-1/3 items-center justify-start">
            <i
              className={`icon icon-votes h-7 w-auto sm:h-8 ${isProcessingVote ? 'animate-bounce' : ''}`}
              title="Favorites counter"
            ></i>
            <span className="votesCount text-shadow-5 text-xs sm:text-sm">{votesCount}</span>
          </div>
          <div className="card-footer-mid w-1/3 text-center">
            <div className={`thumb__vote-btn relative mx-auto h-10 w-auto leading-none ${isModal ? 'md:h-16' : ''} `}>
              {!isVotedByUser && (
                <button
                  className={`btn-wrapper ${isProcessingVote ? 'fadeout' : ''}`}
                  onClick={voteForSandwichHandler}
                  disabled={isProcessingVote}
                >
                  <i className="icon icon-heart absolute inset-0 h-full w-full" title="Add to favorites"></i>
                </button>
              )}
              {(isVotedByUser || isProcessingVote) && (
                <Link
                  to={ROUTE_PATHS.CREATE}
                  onClick={copyThisSandwichHandler}
                  className="fade-in absolute inset-0 grid h-full w-full place-items-center"
                  title="Copy this sandwich"
                >
                  <svg
                    version="1.1"
                    width={isModal ? '35' : '24'}
                    height={isModal ? '35' : '24'}
                    viewBox="0 0 15 15"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 15 7.5 C 15 11.642 11.642 15 7.5 15 C 3.358 15 0 11.642 0 7.5 C 0 3.358 3.358 0 7.5 0 C 11.642 0 15 3.358 15 7.5 Z M 8.001 11.5 L 8.001 7.999 L 11.5 7.999 L 11.5 7 L 8.001 7 L 8.001 3.499 L 7 3.499 L 7 7 L 3.501 7 L 3.501 7.999 L 7 7.999 L 7 11.5 L 8.001 11.5 Z"
                      fill="#FFF"
                    ></path>
                  </svg>
                </Link>
              )}
            </div>
          </div>
          <div className="card-footer-end flex w-1/3 justify-end">
            <Link
              to={`https://wa.me/?text=This+sandwich+from+SandwiCheck+looks+yummy%21+${globalThis.location.protocol}%2F%2F${globalThis.location.hostname}%2Fsandwich%2F${sandwich.id}`}
              target="_blank"
              className="ml-1 inline-block md:ml-2"
            >
              <i className="icon icon-whatsapp h-8 w-auto sm:h-10 md:h-12" title="Share via Whatsapp"></i>
            </Link>
          </div>
        </div>
      </div>

      {isModal && <SandwichIngredientsList sandwich={sandwich} ingredientsRawList={ingredientsRawList} />}
      {toastComponents}
    </div>
  );
};

/** Best-effort extraction of an error message from an unknown thrown value. */
const extractErrorMessage = (error: unknown): string | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const maybeResponseMessage = (error as { response?: { data?: { error?: { message?: unknown } } } }).response?.data
    ?.error?.message;
  if (typeof maybeResponseMessage === 'string') {
    return maybeResponseMessage;
  }

  const maybeMessage = (error as { message?: unknown }).message;
  if (typeof maybeMessage === 'string') {
    return maybeMessage;
  }

  return undefined;
};

export default SandwichCard;
