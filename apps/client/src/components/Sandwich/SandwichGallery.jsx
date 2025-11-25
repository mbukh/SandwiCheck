import { useState, useEffect, useLayoutEffect } from 'react';
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

  // Redirect checks - use useLayoutEffect to prevent content flash
  useLayoutEffect(() => {
    // Redirect to login if user is not authenticated and trying to access personal menu
    if (isCurrentUserReady && galleryType === 'personal' && !currentUser?.id) {
      navigate({
        to: ROUTE_PATHS.LOGIN,
        search: { returnTo: '/menu' },
      });
      return;
    }

    // Redirect if childId doesn't match user's children
    if (isCurrentUserReady && childId && !currentUser?.children?.some((child) => child.id === childId)) {
      navigate({ to: '/login' });
      return;
    }
  }, [isCurrentUserReady, galleryType, currentUser, childId, navigate]);

  // Data fetching - use useEffect for async operations
  useEffect(() => {
    if (!areIngredientsReady || !isCurrentUserReady) {
      return;
    }

    // Don't fetch data if we're redirecting (unauthenticated personal menu)
    if (galleryType === 'personal' && !currentUser?.id) {
      return;
    }

    // Don't fetch data if childId doesn't match
    if (childId && !currentUser?.children?.some((child) => child.id === childId)) {
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
        /*
         * For personal menu, fetch user sandwiches to ensure all fields (including images) are properly populated
         * This prevents race conditions where currentUser.sandwiches might not have all fields after login
         * Sort by createdAt (newest first) for personal menu
         */
        await fetchUserSandwiches(currentUser.id, true);
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
    setGallerySandwiches,
  ]);

  // Clear gallery when user logs out (for personal menu)
  useEffect(() => {
    if (galleryType === 'personal' && isCurrentUserReady && !currentUser?.id) {
      setGallerySandwiches([]);
    }
  }, [currentUser, galleryType, isCurrentUserReady, setGallerySandwiches]);

  const childGalleryTitle = child?.name ? child.name + "'s sandwich menu" : '';

  const galleryTypeTitle = galleryType === 'latest' ? capitalizeFirst(galleryType) + ' sandwiches' : '';

  const userGalleryTitle = galleryType === 'personal' ? 'My sandwich menu' : '';

  // Determine current gallery path for modal closeLink and passing to cards
  const getGalleryPath = () => {
    if (childId) {
      return ROUTE_PATHS.FAMILY_CHILD.replace('$childId', childId);
    } else
      switch (galleryType) {
        case 'personal': {
          return ROUTE_PATHS.MENU;
        }
        case 'best': {
          return ROUTE_PATHS.BEST;
        }
        case 'latest': {
          return ROUTE_PATHS.LATEST;
        }
        // No default
      }
    return ROUTE_PATHS.LATEST; // default
  };

  const galleryPath = getGalleryPath();

  if (!areIngredientsReady || !isCurrentUserReady) {
    return <Loading />;
  }

  // For personal menu, require authentication
  if (galleryType === 'personal' && !currentUser?.id) {
    // Don't render anything - the useLayoutEffect will handle the redirect
    return null;
  }

  return (
    <>
      <div className="sandwich-gallery pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
        <h1 className="text-center text-l uppercase text-shadow-10 pb-2 md:pb-3">
          {childId && (
            <Link
              to={ROUTE_PATHS.FAMILY}
              className="button bg-magenta text-white inline-block p-2 mr-4 md:my-4 text-xs md:text-sm fit-content"
            >
              Back
            </Link>
          )}
          {childGalleryTitle || galleryTypeTitle || userGalleryTitle}
        </h1>
        {childId && <div className="mx-auto mt-2 mb-4 h-px w-24 bg-magenta/30"></div>}
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
