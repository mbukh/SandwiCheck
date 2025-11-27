import { useEffect } from 'react';
import { TYPE } from '../../../constants/ingredients-constants';
import { useSandwichContext } from '../../../context/SandwichContext';
import { isTypeInSandwich } from '../../../utils/sandwich-utils';
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
    <div className="create-sandwich mb-4 flex min-h-full flex-col py-6 md:pt-9 lg:pt-12">
      <h1 className="text-center text-lg uppercase">Create a sandwich</h1>
      <div className="creation-section flex-col md:flex-row">
        <IngredientsTypesSelector />

        <div className="thumb__wrapper flex flex-shrink-0 flex-col justify-between" ref={swiperContainerRef}>
          {currentType && <IngredientsSwiper />}
        </div>
      </div>

      <div className="builder-section mt-5 flex justify-center">
        {currentType && currentIngredient && <SandwichBuildButtons />}
      </div>

      {isTypeInSandwich(TYPE.bread, sandwich) && (
        <div className="result-section relative mx-auto mt-8 aspect-video w-full md:w-2/3 lg:w-1/3">
          <SandwichBuilderImage />
        </div>
      )}

      {currentType ? <SandwichSaveForm /> : <Loading />}
    </div>
  );
};

export default SandwichBuilder;
