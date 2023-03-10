import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useUserAuth } from "../../context/UserAuthContext";

import { Loading, SandwichCard } from "../../components";

import { useSandwich } from "../../hooks/";

import { capitalizeFirst } from "../../utils";

const SandwichGallery = ({ galleryType = "" }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [child, setChild] = useState(null);
    const { childId, sandwichId } = useParams();
    const { user } = useUserAuth();
    const {
        ingredients,
        ingredientTypes,
        userSandwiches,
        fetchUserSandwiches,
        fetchLatestSandwiches,
    } = useSandwich();

    useEffect(() => {
        Object.keys(ingredients).length && userSandwiches && setIsLoading(false);
        return () => setIsLoading(true);
    }, [ingredients, userSandwiches]);

    useEffect(() => {
        if (childId) {
            const child = user.info.children.find((child) => child.id === childId);
            if (!child) return;
            (async () => await fetchUserSandwiches(child.id))();
            setChild(child);
        } else if (user?.id) {
            (async () => await fetchUserSandwiches())();
        } else if (galleryType === "latest") {
            (async () => await fetchLatestSandwiches(30))();
        }
        return () => setChild(null);
    }, [
        child?.id,
        user?.id,
        user?.info.children,
        childId,
        galleryType,
        fetchLatestSandwiches,
        fetchUserSandwiches,
    ]);

    return isLoading ? (
        <Loading />
    ) : (
        <div className={`sandwich-gallery ${sandwichId ? "no-scroll" : ""}`}>
            <div className="sandwich-gallery-title w-full sticky z-5 top-0 py-4 px-5 md:py-5 md:px-12 xl:px-20">
                <h3>
                    {child?.name && child.name + "'s "}
                    {galleryType && capitalizeFirst(galleryType) + " "}
                    {!(child?.Name || galleryType) && user?.id && "My "}
                    sandwich Gallery
                </h3>
            </div>
            <div className={`size-full fl fl-wrap`}>
                {userSandwiches.length > 0 ? (
                    userSandwiches.map((sandwich, index) => (
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
    );
};

export default SandwichGallery;
