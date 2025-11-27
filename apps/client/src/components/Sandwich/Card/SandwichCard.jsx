import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuthGlobalContext } from '../../../context/AuthGlobalContext';
import { useIngredientsGlobalContext } from '../../../context/IngredientsGlobalContext';
import { ROUTE_PATHS } from '../../../routes';
import { updateSandwichInCache } from '../../../services/api-sandwiches';
import { hasUserVotedForSandwich, voteForSandwich } from '../../../services/votes';
import { hydrateSandwichIngredientsData } from '../../../utils/sandwich-utils';
import SandwichImage from '../SandwichImage';
import SandwichIngredientsList from './SandwichIngredientsList';

const SandwichCard = ({ index, sandwich, galleryPath = '', isModal }) => {
  const [isUserVoting, setIsUserVoting] = useState(false);
  const { currentUser } = useAuthGlobalContext();
  const { ingredientsRawList } = useIngredientsGlobalContext();

  const navigate = useNavigate();

  const isVotedByUser = hasUserVotedForSandwich(sandwich, currentUser);

  const bgIndex = (index % 4) + 1;

  const copyThisSandwichHandler = (e) => {
    e.preventDefault();

    const hydratedSandwich = hydrateSandwichIngredientsData(sandwich, ingredientsRawList);
    updateSandwichInCache(hydratedSandwich);
    navigate({ to: ROUTE_PATHS.CREATE });
  };

  const voteForSandwichHandler = async (_e) => {
    setIsUserVoting(true);
    await voteForSandwich({ userId: currentUser.id, sandwichId: sandwich.id });
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
              className={`icon icon-votes h-7 w-auto sm:h-8 ${isUserVoting ? 'animate-bounce' : ''}`}
              title="Favorites counter"
            ></i>
            <span className="votesCount text-shadow-5 text-xs sm:text-sm">
              {sandwich.votesCount + (isUserVoting ? 1 : 0)}
            </span>
          </div>
          <div className="card-footer-mid w-1/3 text-center">
            <div className={`thumb__vote-btn relative mx-auto h-10 w-auto leading-none ${isModal ? 'md:h-16' : ''} `}>
              {!isVotedByUser && (
                <button className={`btn-wrapper ${isUserVoting ? 'fadeout' : ''}`} onClick={voteForSandwichHandler}>
                  <i className="icon icon-heart absolute inset-0 h-full w-full" title="Add to favorites"></i>
                </button>
              )}
              {(isVotedByUser || isUserVoting) && (
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
    </div>
  );
};

export default SandwichCard;
