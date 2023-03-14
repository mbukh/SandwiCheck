import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { IngredientsSwiper, Loading, SandwichImage, SignupModal } from "../";

import { useSandwichGlobalContext, useAuthGlobalContext } from "../../context/";

import { useSandwich } from "../../hooks/";

const SandwichEditor = () => {
    const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);
    const swiperContainerRef = useRef(
        document.querySelector("div:has(>.swiper-initialized)") || null
    );
    const { ingredients, areIngredientsReady } = useSandwichGlobalContext();
    const { user, isUserReady } = useAuthGlobalContext();
    const {
        ingredientTypes,
        currentIngredientType,
        setCurrentIngredientType,
        sandwich,
        updateSandwich,
        clearSandwich,
        sandwichName,
        setSandwichName,
        saveSandwich,
        isSavingSandwich,
    } = useSandwich();
    const navigate = useNavigate();

    const isSandwichReady =
        sandwich?.bread && Object.values(sandwich).filter((val) => val).length > 1;

    const submitSandwichHandler = async (e) => {
        e.preventDefault();
        const newSandwichId = await saveSandwich();
        setTimeout(() => navigate("/sandwich/" + newSandwichId), 500);
    };

    const guestUserSubmitHandler = async (e) => {
        e.preventDefault();
        setIsOpenLoginModal(true);
    };

    const updateSandwichIngredientsHandler = (newSandwichData) =>
        updateSandwich(newSandwichData);

    const changeSandwichNameHandler = (e) => {
        setSandwichName(e.target.value);
    };

    const saveSwiperSize = () => {
        if (!swiperContainerRef.current) return;
        swiperContainerRef.current.style.height =
            swiperContainerRef.current.offsetHeight + "px";
    };

    useEffect(() => {
        if (!swiperContainerRef.current) return;
        setTimeout(() => (swiperContainerRef.current.style.height = ""), 200);
    }, [currentIngredientType, swiperContainerRef]);

    if (!areIngredientsReady || !isUserReady) return <Loading />;

    return (
        <div className="create-sandwich flex flex-col min-h-full py-6 md:pt-9 lg:pt-12 mb-4">
            <h1 className="text-center text-l uppercase">Create a sandwich</h1>
            <div className="creation-section flex-col md:flex-row">
                <div className="create-sandwich-menu my-2">
                    <ul className="flex flex-wrap md:flex-row justify-center">
                        {ingredientTypes.map((ingredientType) => (
                            <li key={ingredientType}>
                                <button
                                    className={`my-2 md:my-4  text-xs md:text-sm md:text-base fit-content ${
                                        ingredientType === currentIngredientType
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        saveSwiperSize();
                                        setCurrentIngredientType(ingredientType);
                                    }}
                                    disabled={
                                        ingredientType !== "bread" && !sandwich?.bread
                                    }
                                >
                                    {ingredientType}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div
                    className="thumb__wrapper flex flex-col flex-shrink-0 justify-between"
                    ref={swiperContainerRef}
                >
                    {currentIngredientType && (
                        <IngredientsSwiper
                            sandwich={sandwich}
                            ingredients={ingredients}
                            currentIngredientType={currentIngredientType}
                            updateSandwichIngredients={updateSandwichIngredientsHandler}
                        />
                    )}
                </div>
            </div>

            <div className="result-section relative aspect-ratio-3/2 mx-4 w-full md:w-2/3 lg:w-1/3 mx-auto">
                <SandwichImage
                    sandwich={sandwich}
                    ingredientTypes={ingredientTypes}
                    ingredients={ingredients}
                />
            </div>

            {currentIngredientType ? (
                <>
                    <div className="flex justify-center my-4">
                        <button className="btn-wrapper" onClick={clearSandwich}>
                            Clear all
                        </button>
                    </div>

                    {isSavingSandwich ? (
                        <Loading />
                    ) : (
                        <div className="save-sandwich-section flex justify-center text-center">
                            <form onSubmit={submitSandwichHandler}>
                                <input
                                    type="text"
                                    name="sandwichName"
                                    placeholder={
                                        user.info?.name
                                            ? user.info?.name.split(" ")[0] +
                                              "'s Sandwich"
                                            : "Sandwich name"
                                    }
                                    maxLength={25}
                                    onChange={changeSandwichNameHandler}
                                    value={sandwichName}
                                />
                                {user.uid ? (
                                    <input
                                        type="submit"
                                        placeholder="save sandwich"
                                        className="my-4"
                                        disabled={!isSandwichReady}
                                        value="Save sandwich"
                                    />
                                ) : (
                                    <>
                                        <button
                                            placeholder="save sandwich"
                                            className="my-4"
                                            disabled={!isSandwichReady}
                                            onClick={guestUserSubmitHandler}
                                        >
                                            Save sandwich
                                        </button>
                                        {isOpenLoginModal && (
                                            <SignupModal
                                                setIsOpenLoginModal={setIsOpenLoginModal}
                                                closeLink="stay"
                                            />
                                        )}
                                    </>
                                )}
                            </form>
                        </div>
                    )}
                </>
            ) : (
                <Loading />
            )}
        </div>
    );
};

export default SandwichEditor;
