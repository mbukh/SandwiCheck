import { Link, useNavigate } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { SANDWICH_IMAGES_PATH } from '@/constants/sandwich-constants';
import type { Sandwich } from '@/types/domain';

interface SandwichImageProps {
  sandwich: Sandwich;
  galleryPath: string;
  isModal: boolean;
}

const SandwichImage = ({ sandwich, galleryPath, isModal }: SandwichImageProps): React.JSX.Element | null => {
  const navigate = useNavigate();

  const path = `${import.meta.env.VITE_API_SERVER}/${SANDWICH_IMAGES_PATH}`;

  // Safety check: don't render if image is missing
  if (!sandwich?.image) {
    return null;
  }

  const theSandwichImage = (
    <div className="relative aspect-square">
      <div className="sandwich-images">
        <img
          src={path + sandwich.image}
          className="absolute inset-0 size-full object-contain drag-none select-none"
          alt={sandwich.name}
          loading="lazy"
        />
      </div>
    </div>
  );

  const handleClick = (e: React.MouseEvent): void => {
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
    theSandwichImage
  ) : (
    <Link to={ROUTE_PATHS.SANDWICH} params={{ sandwichId: sandwich.id }} onClick={handleClick}>
      {theSandwichImage}
    </Link>
  );
};

export default SandwichImage;
