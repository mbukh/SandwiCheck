import { Link } from 'react-router-dom';

import { SANDWICH_IMAGES_PATH } from '../../constants/sandwich-constants';

const SandwichImage = ({ sandwich, closeBasePath, isModal }) => {
  const path = `${process.env.REACT_APP_API_SERVER}/${SANDWICH_IMAGES_PATH}`;

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

  return isModal ? (
    <TheSandwichImage />
  ) : (
    <Link to={`${closeBasePath}/sandwich/${sandwich.id}`}>
      <TheSandwichImage />
    </Link>
  );
};

export default SandwichImage;
