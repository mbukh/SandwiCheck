import { Link } from '@tanstack/react-router';

import { ROUTE_PATHS } from '../routes';
import { BUTTON_BASE_CLASSES } from '../constants/ui-constants';

const Error404 = () => {
  return (
    <div className="pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
      <div className="grid place-items-center min-h-[calc(100vh-var(--headerHeight)-var(--footerHeight))] py-8">
        <div className="max-w-2xl w-full text-center error404-content">
          <h1 className="text-white text-sh-5 uppercase font-bold text-2xl md:text-3xl lg:text-4xl mb-4 leading-tight">
            Oops! This Sandwich Got Away!
          </h1>

          <p className="text-white text-sh-5 text-lg md:text-xl lg:text-2xl mb-8 leading-relaxed max-w-lg mx-auto">
            We couldn&apos;t find the page you&apos;re looking for. It might have been eaten or moved to a different
            location.
          </p>

          <div className="flex justify-center gap-4 md:gap-6 mb-8">
            <span className="error404-digit font-bold text-magenta">4</span>
            <div className="error404-sandwich-orb">
              <div className="card-orb">
                <div className="error404-sandwich-emoji">🥪</div>
              </div>
            </div>
            <span className="error404-digit font-bold text-magenta">4</span>
          </div>

          <p className="text-white text-sh-5 text-sm md:text-base mb-8 leading-relaxed max-w-md mx-auto opacity-90">
            Don&apos;t worry though - we have plenty of other delicious sandwiches waiting for you!
          </p>

          <div className="flex justify-center gap-8">
            <Link to={ROUTE_PATHS.CREATE} className={`${BUTTON_BASE_CLASSES} bg-magenta text-white`}>
              Build a Sandwich
            </Link>
            <Link to={ROUTE_PATHS.LATEST} className={`${BUTTON_BASE_CLASSES} bg-white text-magenta`}>
              Browse Gallery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404;
