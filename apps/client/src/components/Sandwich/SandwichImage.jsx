import { Link, useNavigate } from '@tanstack/react-router';

import { SANDWICH_IMAGES_PATH } from '../../constants/sandwich-constants';
import { ROUTE_PATHS } from '../../routes';

const SandwichImage = ({ sandwich, galleryPath, isModal }) => {
  const path = `${import.meta.env.VITE_API_SERVER}/${SANDWICH_IMAGES_PATH}`;
  const navigate = useNavigate();

  const TheSandwichImage = () => (
    <div className="relative aspect-ratio-square">
      <div className="sandwich-images">
        <img
          src={path + sandwich.image}
          className="absolute inset-0 object-contain size-full no-drag no-select"
          alt={sandwich.name}
          loading="lazy"
        />
      </div>
    </div>
  );

  const handleClick = (e) => {
    // Preserve native link behavior for middle-click, ctrl/cmd-click, and right-click
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) {
      return; // Let the browser handle it (open in new tab/window)
    }

    // Prevent default navigation when clicking from gallery
    if (!isModal && galleryPath) {
      e.preventDefault();
      // Navigate to gallery route with sandwichId query param
      navigate({
        to: galleryPath,
        search: { sandwichId: sandwich.id },
      });
    }
  };

  return isModal ? (
    <TheSandwichImage />
  ) : (
    <Link to={ROUTE_PATHS.SANDWICH} params={{ sandwichId: sandwich.id }} onClick={handleClick}>
      <TheSandwichImage />
    </Link>
  );
};

export default SandwichImage;
