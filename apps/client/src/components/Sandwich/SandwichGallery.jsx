import { useState, useEffect } from 'react';
import { Link, useNavigate, useMatchRoute, useSearch } from '@tanstack/react-router';

import { ROUTE_PATHS } from '../../routes';
import { capitalizeFirst } from '../../utils/utils';

import useGallery from '../../hooks/use-gallery';

import { useAuthGlobalContext } from '../../context/AuthGlobalContext';
import { useIngredientsGlobalContext } from '../../context/IngredientsGlobalContext';

import Loading from '../Loading';
import EmptyGallery from './EmptyGallery';
import SandwichCard from '../Sandwich/Card/SandwichCard';
import SandwichModal from './SandwichModal';

const SandwichGallery = ({ children, galleryType = '' }) => {
  const [child, setChild] = useState({});
  const { currentUser, isCurrentUserReady } = useAuthGlobalContext();
  const { areIngredientsReady } = useIngredientsGlobalContext();
  const { gallerySandwiches, setGallerySandwiches, fetchSandwiches, fetchUserSandwiches } = useGallery();
  const matchRoute = useMatchRoute();
  const familyRouteMatch = matchRoute({ to: '/family/$childId' });
  const familySandwichRouteMatch = matchRoute({ to: '/family/$childId/sandwich/$sandwichId' });
  const childId = familyRouteMatch?.childId || familySandwichRouteMatch?.childId;
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const sandwichIdFromQuery = search?.sandwichId;

  useEffect(() => {
    if (isCurrentUserReady && childId && !currentUser?.children?.some((child) => child.id === childId)) {
      navigate({ to: '/login' });
      return;
    }

    if (!areIngredientsReady || !isCurrentUserReady) {
      return;
    }

    const dietaryPreferences = currentUser.dietaryPreferences || [];

    (async () => {
      if (childId) {
        const childInfo = currentUser.children.find((child) => child.id === childId);
        if (childInfo) {
          await fetchUserSandwiches(childInfo.id);
          setChild(childInfo);
        }
      } else if (galleryType === 'latest') {
        await fetchSandwiches({ dietaryPreferences });
      } else if (galleryType === 'best') {
        await fetchSandwiches({ dietaryPreferences, sortBy: 'votesCount' });
      } else if (currentUser.id) {
        // Sort sandwiches by createdAt (newest first) for personal menu
        const sortedSandwiches = [...(currentUser.sandwiches || [])].sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        setGallerySandwiches(sortedSandwiches);
      }
    })();
  }, [
    areIngredientsReady,
    childId,
    currentUser,
    fetchSandwiches,
    fetchUserSandwiches,
    galleryType,
    isCurrentUserReady,
    navigate,
    setGallerySandwiches,
  ]);

  const childGalleryTitle = child?.name ? child.name + "'s sandwich menu" : '';

  const galleryTypeTitle = galleryType === 'latest' ? capitalizeFirst(galleryType) + ' sandwiches' : '';

  const userGalleryTitle = galleryType === 'personal' ? 'My sandwich menu' : '';

  // Determine current gallery path for modal closeLink and passing to cards
  const getGalleryPath = () => {
    if (childId) {
      return ROUTE_PATHS.FAMILY_CHILD.replace('$childId', childId);
    } else if (galleryType === 'personal') {
      return ROUTE_PATHS.MENU;
    } else if (galleryType === 'best') {
      return ROUTE_PATHS.BEST;
    } else if (galleryType === 'latest') {
      return ROUTE_PATHS.LATEST;
    }
    return ROUTE_PATHS.LATEST; // default
  };

  const galleryPath = getGalleryPath();

  if (!areIngredientsReady || !isCurrentUserReady) {
    return <Loading />;
  }

  return (
    <>
      <div className="sandwich-gallery pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
        <h1 className="text-center text-l uppercase text-shadow-10">
          {childId && (
            <Link
              to={ROUTE_PATHS.FAMILY}
              className="button bg-magenta inline-block p-2 mr-4 md:my-4 text-xs md:text-sm md:text-base fit-content"
            >
              Back
            </Link>
          )}
          {childGalleryTitle || galleryTypeTitle || userGalleryTitle}
        </h1>
        <div className="size-full flex flex-wrap -mx-2 sm:-mx-3">
          {gallerySandwiches.length > 0 ? (
            gallerySandwiches.map((sandwich, index) => (
              <SandwichCard
                key={sandwich.id}
                index={index}
                sandwich={sandwich}
                galleryPath={galleryPath}
                isModal={false}
              />
            ))
          ) : (
            <EmptyGallery galleryType childId />
          )}
        </div>
      </div>

      {children}
      {sandwichIdFromQuery && <SandwichModal closeLink={galleryPath} />}
    </>
  );
};

export default SandwichGallery;
