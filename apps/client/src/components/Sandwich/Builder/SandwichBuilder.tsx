import { useEffect, useRef, useState } from 'react';
import { TYPE } from '@sandwicheck/shared';
import Loading from '@/components/Loading';
import { useSandwichContext } from '@/context/SandwichContext';
import { isTypeInSandwich } from '@/utils/sandwich-utils';
import LayerControls from './LayerControls';
import LayerSwiper from './LayerSwiper';
import SandwichLayerStack from './SandwichLayerStack';
import SandwichSaveModal from './SandwichSaveModal';

const SandwichBuilder = (): React.JSX.Element => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const layerStackSectionRef = useRef<HTMLDivElement>(null);
  const {
    currentType,
    sandwich,
    swiperContainerRef,
    areIngredientsReady,
    isCurrentUserReady,
    randomizeSandwich,
    clearSandwich,
    isAddingLayer,
  } = useSandwichContext();

  useEffect(() => {
    if (swiperContainerRef.current) {
      setTimeout(() => {
        if (swiperContainerRef.current) {
          swiperContainerRef.current.style.height = '';
        }
      }, 200);
    }
  }, [currentType, swiperContainerRef]);

  // When entering add-layer mode (e.g. only bread), keep layer stack in view
  useEffect(() => {
    if (isAddingLayer && sandwich.ingredients.length > 0 && layerStackSectionRef.current) {
      layerStackSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isAddingLayer, sandwich.ingredients.length]);

  if (!areIngredientsReady || !isCurrentUserReady) {
    return <Loading />;
  }

  // Determine button states
  const hasBread = isTypeInSandwich(TYPE.bread, sandwich);
  const hasValidSandwich = hasBread && sandwich.ingredients.length >= 2;
  const hasContent = sandwich.ingredients.length > 0 || sandwich.name || sandwich.comment;

  return (
    <div className="create-sandwich mb-4 flex min-h-full flex-col py-6 md:pt-9 lg:pt-12">
      <h1 className="text-center text-lg uppercase">Create a sandwich</h1>

      {/* Top Buttons - Always visible */}
      <div className="mb-6 flex flex-wrap justify-center gap-2 sm:gap-4">
        {/* Randomize Button */}
        <button
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-magenta shadow-lg transition-all hover:scale-105 sm:gap-2 sm:px-6 sm:py-2 sm:text-base"
          onClick={randomizeSandwich}
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 4V9H4.58152M4.58152 9C5.54483 7.26243 7.40169 6 9.5 6C12.5376 6 15 8.46243 15 11.5C15 12.6113 14.6125 13.635 13.9352 14.5M4.58152 9H9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 20V15H19.4185M19.4185 15C18.4552 16.7376 16.5983 18 14.5 18C11.4624 18 9 15.5376 9 12.5C9 11.3887 9.3875 10.365 10.0648 9.5M19.4185 15H14.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Randomize
        </button>

        {/* Reset Button */}
        <button
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg transition-all sm:gap-2 sm:px-6 sm:py-2 sm:text-base ${
            hasContent ? 'bg-white text-magenta hover:scale-105' : 'cursor-not-allowed bg-gray-300 text-gray-500'
          }`}
          onClick={hasContent ? clearSandwich : undefined}
          disabled={!hasContent}
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Reset
        </button>

        {/* Save Button */}
        <button
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg transition-all sm:gap-2 sm:px-6 sm:py-2 sm:text-base ${
            hasValidSandwich ? 'bg-magenta text-white hover:scale-105' : 'cursor-not-allowed bg-gray-300 text-gray-500'
          }`}
          onClick={hasValidSandwich ? () => setIsSaveModalOpen(true) : undefined}
          disabled={!hasValidSandwich}
        >
          <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.4142 20.4142 20.0391C20.0391 19.6641 19.5304 19 19 19V21Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline points="17,8 17,3 22,8" stroke="currentColor" strokeWidth="2" />
            <path
              d="M10 12L8 14L6 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Save
        </button>
      </div>

      {/* Layer-Based Builder - Always show, bread will be required */}
      <div className="layer-builder-section relative mx-auto w-full min-w-0" ref={layerStackSectionRef}>
        <SandwichLayerStack />
        <LayerSwiper />
        <LayerControls />
      </div>

      {/* Save Modal */}
      <SandwichSaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} />
    </div>
  );
};

export default SandwichBuilder;
