import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

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
    const navigate = useNavigate();

    useEffect(() => {
        if (
            childId &&
            isUserReady &&
            !user.info?.children?.some((child) => child.id === childId)
        ) {
            navigate("/login");
            return;
        }

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
        } else if (user.uid) {
            (async () => await fetchUserSandwiches())();
        }
    }, [
        childId,
        galleryType,
        child?.id,
        user.uid,
        user.info?.children,
        fetchLatestSandwiches,
        fetchUserSandwiches,
        areIngredientsReady,
        isUserReady,
        navigate,
    ]);

    if (!areIngredientsReady || !isUserReady || !gallerySandwiches) return <Loading />;

    return (
        <>
            <div className="sandwich-gallery pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
                <div className="sandwich-gallery-title w-full py-4 px-5 md:py-5 md:px-12 xl:px-20">
                    <h1>
                        {child?.name && (
                            <>
                                {child?.name}"'s sandwich menu"{" "}
                                <Link
                                    to="/family"
                                    className="button bg-magenta inline-block p-2 mr-4 md:my-4 text-xs md:text-sm md:text-base fit-content"
                                >
                                    Back
                                </Link>
                            </>
                        )}
                        {galleryType && capitalizeFirst(galleryType) + " sandwiches"}
                        {!childId && !galleryType && "My sandwich menu"}
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
                                closeBasePath={childId ? "/family/" + childId : ""}
                            />
                        ))
                    ) : (
                        <div>
                            This menu is empty. <br />
                            {!childId && (
                                <Link
                                    className="button bg-magenta inline-block p-2 my-2 md:my-4 text-xs md:text-sm md:text-base fit-content"
                                    to="/create"
                                >
                                    Create a sandwich
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {children}
        </>
    );
};

export default SandwichGallery;
