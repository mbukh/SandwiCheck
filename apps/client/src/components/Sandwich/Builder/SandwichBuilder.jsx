import { useEffect } from 'react';

import { TYPES } from '../../../constants/ingredients-constants';

import { isTypeInSandwich } from '../../../utils/sandwich-utils';

import { useSandwichContext } from '../../../context/SandwichContext';

import Loading from '../../Loading';
import IngredientsSwiper from './IngredientsSwiper';
import IngredientsTypesSelector from './IngredientsTypesSelector';
import SandwichBuildButtons from './SandwichBuildButtons';
import SandwichBuilderImage from './SandwichBuilderImage';
import SandwichSaveForm from './SandwichSaveForm';

const SandwichBuilder = () => {
  const { currentType, currentIngredient, sandwich, swiperContainerRef, areIngredientsReady, isCurrentUserReady } =
    useSandwichContext();

  useEffect(() => {
    if (swiperContainerRef.current) {
      setTimeout(() => (swiperContainerRef.current.style.height = ''), 200);
    }
  }, [currentType, swiperContainerRef]);

  if (!areIngredientsReady || !isCurrentUserReady) {
    return <Loading />;
  }

  return (
    <div className="create-sandwich flex flex-col min-h-full py-6 md:pt-9 lg:pt-12 mb-4">
      <h1 className="text-center text-l uppercase">Create a sandwich</h1>
      <div className="creation-section flex-col md:flex-row">
        <IngredientsTypesSelector />

        <div className="thumb__wrapper flex flex-col flex-shrink-0 justify-between" ref={swiperContainerRef}>
          {currentType && <IngredientsSwiper />}
        </div>
      </div>

      <div className="builder-section flex justify-center mt-5">
        {currentType && currentIngredient && <SandwichBuildButtons />}
      </div>

      {isTypeInSandwich(TYPES.bread, sandwich) && (
        <div className="result-section relative aspect-ratio-3/2 mx-4 w-full md:w-2/3 lg:w-1/3 mx-auto">
          <SandwichBuilderImage />
        </div>
      )}

      {currentType ? <SandwichSaveForm /> : <Loading />}
    </div>
  );
};

export default SandwichBuilder;
