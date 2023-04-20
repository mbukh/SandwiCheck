import { Link } from "react-router-dom";

const EmptyGallery = ({ galleryType, childId }) => {
    return (
        <div className="flex flex-col justify-center mx-auto">
            <div className="text-center my-4 py-4">This menu is empty.</div>
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
                            <circle cx="7" cy="7" r="7" fill="#e6127d"></circle>
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
    );
};

export default EmptyGallery;
