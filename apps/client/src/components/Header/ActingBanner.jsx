import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useAuthGlobalContext } from '../../context/AuthGlobalContext';
import { ROUTE_PATHS } from '../../routes';

const ActingBanner = ({ className = '' }) => {
  const { currentUser, parentUser, actingAsChild, switchToParent } = useAuthGlobalContext();
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
    <div
      className={`bg-magenta text-white w-full z-50 ${className}`}
    >
      <div className="px-5 md:px-12 xl:px-20 py-2 md:py-3 flex flex-col items-center gap-2 text-xs md:text-sm text-shadow-10">
        <span className="text-center">
          You are managing <strong>{currentUser.name}</strong>&apos;s account.
        </span>
        <button
          type="button"
          onClick={handleSwitch}
          className="button bg-white text-magenta px-3 py-1 md:py-2 text-xs uppercase tracking-wide rounded font-bold hover:scale-105 transition-transform whitespace-nowrap flex-shrink-0 w-full md:w-auto self-center"
          disabled={isSwitching}
        >
          {isSwitching ? 'Switching…' : 'Return to parent'}
        </button>
      </div>
    </div>
  );
};

export default ActingBanner;

