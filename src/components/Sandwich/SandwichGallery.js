import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuthGlobalContext, useSandwichGlobalContext } from "../../context/";

import { Loading, SandwichCard } from "../../components";

import { useSandwich } from "../../hooks/";

import { capitalizeFirst } from "../../utils";

const SandwichGallery = ({ children, galleryType = "" }) => {
    const [child, setChild] = useState(null);
    const { user, isUserReady } = useAuthGlobalContext();
    const { ingredients, areIngredientsReady } = useSandwichGlobalContext();
    const { childId } = useParams();
    const {
        ingredientTypes,
        gallerySandwiches,
        fetchUserSandwiches,
        fetchLatestSandwiches,
    } = useSandwich();

    useEffect(() => {
        if (!areIngredientsReady || !isUserReady) return;

        if (childId) {
            const childInfo = user.info.children.find((child) => child.id === childId);
            if (!childInfo) return;
            (async () => {
                await fetchUserSandwiches(childInfo.id);
                setChild(childInfo);
            })();
        } else if (galleryType === "latest") {
            (async () => await fetchLatestSandwiches(30))();
        } else if (user.id) {
            (async () => await fetchUserSandwiches())();
        }
        return () => setChild(null);
    }, [
        childId,
        galleryType,
        child?.id,
        user.id,
        user.info?.children,
        fetchLatestSandwiches,
        fetchUserSandwiches,
        areIngredientsReady,
        isUserReady,
    ]);

    if (!areIngredientsReady || !isUserReady || !gallerySandwiches) return <Loading />;

    return (
        <>
            <div className="sandwich-gallery pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
                <div className="sandwich-gallery-title w-full sticky z-5 top-0 py-4 px-5 md:py-5 md:px-12 xl:px-20">
                    <h1>
                        {child?.name && child.name + "'s "}
                        {galleryType && capitalizeFirst(galleryType) + " "}
                        {!(child?.Name || galleryType) && user.id && "My "}
                        sandwich Gallery
                    </h1>
                </div>
                <div className="size-full flex flex-wrap -mx-2 sm:-mx-3">
                    {gallerySandwiches.length > 0 ? (
                        gallerySandwiches.map((sandwich, index) => (
                            <SandwichCard
                                key={sandwich.id}
                                index={index}
                                sandwich={sandwich}
                                ingredientTypes={ingredientTypes}
                                ingredients={ingredients}
                            />
                        ))
                    ) : !child ? (
                        <div>
                            You currently have no saved sandwiches. <br />
                            <Link to="/createSandwich">Create you own sandwich.</Link>
                        </div>
                    ) : (
                        <div>The gallery is empty.</div>
                    )}
                </div>
            </div>

            {children}
        </>
    );
};

export default SandwichGallery;
