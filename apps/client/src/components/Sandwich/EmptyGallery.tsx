import { Link } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { BUTTON_BASE_CLASSES } from '@/constants/ui-constants';

interface EmptyGalleryProps {
  galleryType: string;
  childId?: string;
}

const EmptyGallery = ({ galleryType, childId }: EmptyGalleryProps): React.JSX.Element => {
  return (
    <div className="mx-auto flex flex-col justify-center">
      <div className="my-4 py-4 text-center">This menu is empty.</div>
      {galleryType === 'personal' && !childId && (
        <Link className={`${BUTTON_BASE_CLASSES} bg-magenta text-white`} to={ROUTE_PATHS.CREATE}>
          <svg
            className="mx-2"
            style={{ marginTop: '-3px' }}
            version="1.1"
            width="15"
            height="15"
            viewBox="0 0 10 10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="7" cy="7" r="7" fill="#e6127d"></circle>
            <path
              d="m6.5333 10.733v-3.2667h-3.2667v-0.93333h3.2667v-3.2667h0.93333v3.2667h3.2667v0.93333h-3.2667v3.2667z"
              fill="#fff"
            ></path>
          </svg>
          Create a sandwich
        </Link>
      )}
    </div>
  );
};

export default EmptyGallery;
