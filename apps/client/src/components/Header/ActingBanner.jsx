import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthGlobalContext } from '../../context/AuthGlobalContext';
import { ROUTE_PATHS } from '../../routes';

const ActingBanner = ({ className = '' }) => {
  const { currentUser, parentUser: _, actingAsChild, switchToParent } = useAuthGlobalContext();
  const [isSwitching, setIsSwitching] = useState(false);
  const navigate = useNavigate();

  if (!actingAsChild) return null;

  const handleSwitch = async () => {
    if (isSwitching) return;
    setIsSwitching(true);
    const res = await switchToParent();
    setIsSwitching(false);
    if (res?.success) {
      navigate({ to: ROUTE_PATHS.FAMILY });
    }
  };

  return (
    <div className={`z-50 w-full bg-magenta text-white ${className}`}>
      <div className="text-shadow-10 flex flex-col items-center gap-2 px-5 py-2 text-xs md:px-12 md:py-3 md:text-sm xl:px-20">
        <span className="text-center">
          You are managing <strong>{currentUser.name}</strong>&apos;s account.
        </span>
        <button
          type="button"
          onClick={handleSwitch}
          className="button w-full shrink-0 self-center rounded bg-white px-3 py-1 text-xs font-bold tracking-wide whitespace-nowrap text-magenta uppercase transition-transform hover:scale-105 md:w-auto md:py-2"
          disabled={isSwitching}
        >
          {isSwitching ? 'Switching…' : 'Return to parent'}
        </button>
      </div>
    </div>
  );
};

export default ActingBanner;
