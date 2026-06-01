import { Link } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { BUTTON_BASE_CLASSES } from '@/constants/ui-constants';

const Error404 = (): React.JSX.Element => {
  return (
    <div className="px-5 pt-4 pb-12 md:px-12 md:pt-6 md:pb-16 lg:pb-20 xl:px-20">
      <div className="grid min-h-[calc(100vh-var(--headerHeight)-var(--footerHeight))] place-items-center py-8">
        <div className="error404-content w-full max-w-2xl text-center">
          <h1 className="text-sh-5 mb-4 text-2xl leading-tight font-bold text-white uppercase md:text-3xl lg:text-4xl">
            Oops! This Sandwich Got Away!
          </h1>

          <p className="text-sh-5 mx-auto mb-8 max-w-lg text-lg leading-relaxed text-white md:text-xl lg:text-2xl">
            We couldn&apos;t find the page you&apos;re looking for. It might have been eaten or moved to a different
            location.
          </p>

          <div className="mb-8 flex justify-center gap-4 md:gap-6">
            <span className="error404-digit font-bold text-magenta">4</span>
            <div className="error404-sandwich-orb">
              <div className="card-orb">
                <div className="error404-sandwich-emoji">🥪</div>
              </div>
            </div>
            <span className="error404-digit font-bold text-magenta">4</span>
          </div>

          <p className="text-sh-5 mx-auto mb-8 max-w-md text-sm leading-relaxed text-white opacity-90 md:text-base">
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
