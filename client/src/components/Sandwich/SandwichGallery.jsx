import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import EmptyGallery from "./EmptyGallery";

import { useAuthGlobalContext, useIngredientsGlobalContext } from "../../context";

import { Loading, SandwichCard } from "..";

import useGallery from "../../hooks/use-gallery";

import useSandwich from "../../hooks/use-sandwich";

// import { TYPES } from "../../constants/ingredients-constants";

import { capitalizeFirst } from "../../utils";

const SandwichGallery = ({ children, galleryType = "" }) => {
    const [child, setChild] = useState({});
    const { currentUser, isCurrentUserReady } = useAuthGlobalContext();
    const { ingredients, areIngredientsReady } = useIngredientsGlobalContext();
    const { gallerySandwiches, setGallerySandwiches, fetchSandwiches } = useGallery();
    const { updateSandwichInCache } = useSandwich();
    const { fetchUserSandwiches } = useGallery();

    const { childId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (
            isCurrentUserReady &&
            childId &&
            !currentUser?.children?.some((child) => child.id === childId)
        ) {
            navigate("/login");
            return;
        }

        if (!(areIngredientsReady && isCurrentUserReady)) {
            return;
        }

        (async () => {
            if (childId) {
                const childInfo = currentUser.children.find(
                    (child) => child.id === childId
                );
                if (!childInfo) return;

                await fetchUserSandwiches(childInfo.id);
                setChild(childInfo);
            } else if (galleryType === "latest") {
                await fetchSandwiches();
            } else if (galleryType === "best") {
                await fetchSandwiches({ sortBy: "votesCount" });
            } else if (currentUser.id) {
                setGallerySandwiches(currentUser.sandwiches);
            }
        })();
    }, [
        areIngredientsReady,
        childId,
        currentUser.children,
        currentUser.id,
        currentUser.sandwiches,
        fetchSandwiches,
        galleryType,
        isCurrentUserReady,
        navigate,
        setGallerySandwiches,
    ]);

    const childGalleryTitle = child?.name ? child.name + "'s sandwich menu" : "";

    const galleryTypeTitle =
        galleryType === "latest" ? capitalizeFirst(galleryType) + " sandwiches" : "";

    const userGalleryTitle = galleryType === "personal" ? "My sandwich menu" : "";

    if (!(areIngredientsReady && isCurrentUserReady && gallerySandwiches)) {
        return <Loading />;
    }

    return (
        <>
            <div className="sandwich-gallery pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
                <h1 className="text-center text-l uppercase text-shadow-10">
                    {childId && (
                        <Link
                            to="/family"
                            className="button bg-magenta inline-block p-2 mr-4 md:my-4 text-xs md:text-sm md:text-base fit-content"
                        >
                            Back
                        </Link>
                    )}
                    {childGalleryTitle || galleryTypeTitle || userGalleryTitle}
                </h1>
                <div className="size-full flex flex-wrap -mx-2 sm:-mx-3">
                    {gallerySandwiches.length > 0 ? (
                        gallerySandwiches.map((sandwich, index) => (
                            <SandwichCard
                                key={sandwich.id}
                                index={index}
                                sandwich={sandwich}
                                ingredients={ingredients}
                                closeBasePath={
                                    childId
                                        ? "/family/" + childId
                                        : galleryType === "personal"
                                        ? "/menu"
                                        : galleryType === "best"
                                        ? ""
                                        : ""
                                }
                                updateSandwichInCache={updateSandwichInCache}
                            />
                        ))
                    ) : (
                        <EmptyGallery galleryType childId />
                    )}
                </div>
            </div>

            {children}
        </>
    );
};

export default SandwichGallery;
