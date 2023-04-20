import { Link } from "react-router-dom";

const SandwichImage = ({ sandwich, closeBasePath }) => {
    const TheSandwichImage = () => (
        <div className="relative aspect-ratio-square">
            <div className="sandwich-images">
                <img
                    src={sandwich.image}
                    className="absolute inset-0 object-contain size-full no-drag no-select"
                    alt={sandwich.name}
                    loading="lazy"
                />
            </div>
        </div>
    );

    return closeBasePath ? (
        <Link to={`${closeBasePath}/sandwich/${sandwich.id}`}>
            <TheSandwichImage />
        </Link>
    ) : (
        <TheSandwichImage />
    );
};

export default SandwichImage;
