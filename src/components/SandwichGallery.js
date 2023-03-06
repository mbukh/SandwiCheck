import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";

import { Loading, SandwichImage } from "../components";

import useSandwich from "../hooks/use-sandwich";

const SandwichGallery = () => {
    const [loading, setLoading] = useState(true);
    const [child, setChild] = useState(null);
    const params = useParams();
    const { user } = useUserAuth();
    const {
        ingredients,
        ingredientTypes,
        userSandwiches,
        fetchUserSandwiches,
    } = useSandwich();

    useEffect(() => {
        if (!params?.childId) return;
        const child = user.info.children.find(
            (child) => child.id === params.childId
        );
        setChild(child);
        return () => setChild(null);
    }, [params?.childId]);

    useEffect(() => {
        Object.keys(ingredients).length && userSandwiches && setLoading(false);
        return () => setLoading(true);
    }, [ingredients, userSandwiches]);

    useEffect(() => {
        (async () => await fetchUserSandwiches(child?.id))();
    }, [child?.id, fetchUserSandwiches]);

    return loading ? (
        <Loading />
    ) : (
        <>
            {!child ? (
                <h3>My sandwich Gallery</h3>
            ) : (
                <h3>{child.name} sandwich Gallery</h3>
            )}
            {userSandwiches.length ? (
                userSandwiches.map((sandwich) => (
                    <div className="userSandwich" key={sandwich.id}>
                        <div>{sandwich.name}</div>
                        <SandwichImage
                            sandwich={sandwich}
                            ingredientTypes={ingredientTypes}
                            ingredients={ingredients}
                        />
                    </div>
                ))
            ) : !child ? (
                <div>
                    You currently have no saved sandwiches. <br />
                    <Link to="/createSandwich">Create you own sandwich.</Link>
                </div>
            ) : (
                <div>The gallery is empty.</div>
            )}
        </>
    );
};

export default SandwichGallery;
