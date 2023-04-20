import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuthGlobalContext, useSandwichGlobalContext } from "../../context";

import { Loading, SandwichCard } from "..";

import useGallery from "../../hooks/use-gallery";

import useSandwich from "../../hooks/use-sandwich";

// import { TYPES } from "../../constants/ingredients-constants";

import { capitalizeFirst } from "../../utils";

const SandwichGallery = ({ children, galleryType = "" }) => {
    const [child, setChild] = useState({});
    const { currentUser, isCurrentUserReady } = useAuthGlobalContext();
    const { ingredients, areIngredientsReady } = useSandwichGlobalContext();
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
                        <div className="flex flex-col justify-center mx-auto">
                            <div className="text-center my-4 py-4">
                                This menu is empty.
                            </div>
                            {
                                (galleryType = "personal" && !childId && (
                                    <Link
                                        className="button bg-magenta text-white inline-block p-2 my-2 md:my-4 text-xs md:text-sm md:text-base fit-content"
                                        to="/create"
                                    >
                                        <svg
                                            className="mx-2"
                                            style={{ marginTop: "-3px" }}
                                            version="1.1"
                                            width="15"
                                            height="15"
                                            viewBox="0 0 10 10"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle
                                                cx="7"
                                                cy="7"
                                                r="7"
                                                fill="#e6127d"
                                            ></circle>
                                            <path
                                                d="m6.5333 10.733v-3.2667h-3.2667v-0.93333h3.2667v-3.2667h0.93333v3.2667h3.2667v0.93333h-3.2667v3.2667z"
                                                fill="#fff"
                                            ></path>
                                        </svg>
                                        Create a sandwich
                                    </Link>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>

            {children}
        </>
    );
};

export default SandwichGallery;
