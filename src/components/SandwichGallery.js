import { debug } from "../constants/debug";

import { Loading } from "../components";

import { useState, useEffect } from "react";

import useIngredients from "../hooks/use-sandwich";

const SandwichGallery = () => {
    const [sandwiches, setSandwiches] = useState([]);
    const [loading, setLoading] = useState(true);

    const {
        ingredients,      
    } = useIngredients();

    useEffect(() => {
        Object.keys(ingredients).length &&
            sandwiches.length &&
            setLoading(false);

        return () => setLoading(true);
    }, [ingredients, sandwiches]);

    useEffect(() => {
        Object.keys(ingredients).length &&
            sandwiches.length &&
            setLoading(false);

        return () => setLoading(true);
    }, [ingredients, sandwiches]);

    return loading ? <Loading /> : <></>;
};

export default SandwichGallery;
