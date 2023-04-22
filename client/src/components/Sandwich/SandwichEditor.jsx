import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { TYPES } from "../../constants/ingredients-constants";

import { checkIngredientTypeInSandwich } from "../../utils/sandwich-utils";

import { useIngredientsGlobalContext, useAuthGlobalContext } from "../../context";

import { useSandwich } from "../../hooks";

import { IngredientsSwiper, Loading, SandwichBuildImage } from "..";

import SandwichBuildButtons from "./SandwichBuildButtons";
import IngredientsTypesSelector from "./IngredientsTypesSelector";
import SandwichSaveForm from "./SandwichSaveForm";

const SandwichEditor = () => {
    const [currentIngredient, setCurrentIngredient] = useState({});
    const swiperContainerRef = useRef(null);
    const { ingredients, areIngredientsReady } = useIngredientsGlobalContext();
    const { isCurrentUserReady } = useAuthGlobalContext();
    const {
        currentType,
        setCurrentType,
        sandwich,
        sandwichDispatch,
        clearSandwich,
        saveSandwich,
        isSavingSandwich,
    } = useSandwich();

    useEffect(() => {
        if (swiperContainerRef.current) {
            setTimeout(() => (swiperContainerRef.current.style.height = ""), 200);
        }
    }, [currentType, swiperContainerRef]);

    if (!areIngredientsReady || !isCurrentUserReady) {
        return <Loading />;
    }

    return (
        <div className="create-sandwich flex flex-col min-h-full py-6 md:pt-9 lg:pt-12 mb-4">
            <h1 className="text-center text-l uppercase">Create a sandwich</h1>
            <div className="creation-section flex-col md:flex-row">
                <IngredientsTypesSelector
                    ingredients={ingredients}
                    currentType={currentType}
                    sandwich={sandwich}
                    setCurrentType={setCurrentType}
                    swiperContainerRef={swiperContainerRef}
                />

                <div
                    className="thumb__wrapper flex flex-col flex-shrink-0 justify-between"
                    ref={swiperContainerRef}
                >
                    {currentType && (
                        <IngredientsSwiper
                            sandwich={sandwich}
                            currentType={currentType}
                            currentIngredient={currentIngredient}
                            setCurrentIngredient={setCurrentIngredient}
                            sandwichDispatch={sandwichDispatch}
                        />
                    )}
                </div>
            </div>

            <div className="builder-section flex justify-center mt-5">
                <SandwichBuildButtons
                    sandwich={sandwich}
                    sandwichDispatch={sandwichDispatch}
                    currentIngredient={currentIngredient}
                    currentType={currentType}
                />
            </div>

            {checkIngredientTypeInSandwich(TYPES.bread, sandwich) && (
                <div className="result-section relative aspect-ratio-3/2 mx-4 w-full md:w-2/3 lg:w-1/3 mx-auto">
                    <SandwichBuildImage
                        sandwich={sandwich}
                        currentIngredient={currentIngredient}
                    />
                </div>
            )}

            {currentType ? (
                <SandwichSaveForm
                    sandwich={sandwich}
                    clearSandwich={clearSandwich}
                    isSavingSandwich={isSavingSandwich}
                    saveSandwich={saveSandwich}
                    sandwichDispatch={sandwichDispatch}
                />
            ) : (
                <Loading />
            )}
        </div>
    );
};

export default SandwichEditor;
