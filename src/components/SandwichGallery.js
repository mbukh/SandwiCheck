import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";

import { Loading, SandwichCard } from "../components";

import useSandwich from "../hooks/use-sandwich";

const SandwichGallery = ({ galleryType }) => {
    const [loading, setLoading] = useState(true);
    const [child, setChild] = useState(null);
    const params = useParams();
    const { user } = useUserAuth();
    const {
        ingredients,
        ingredientTypes,
        userSandwiches,
        fetchUserSandwiches,
        fetchLatestSandwiches,
    } = useSandwich();

    useEffect(() => {
        Object.keys(ingredients).length && userSandwiches && setLoading(false);
        return () => setLoading(true);
    }, [ingredients, userSandwiches]);

    useEffect(() => {
        if (params?.childId) {
            const child = user.info.children.find((child) => child.id === params.childId);
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
        params?.childId,
        galleryType,
        fetchLatestSandwiches,
        fetchUserSandwiches,
    ]);

    return loading ? (
        <Loading />
    ) : (
        <>
            <h3>{child?.Name || galleryType || "My"}My sandwich Gallery</h3>
            <div className="sandwich-gallery size-full fl fl-wrap">
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
        </>
    );
};

export default SandwichGallery;
