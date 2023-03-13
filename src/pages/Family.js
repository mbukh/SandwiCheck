import { Link } from "react-router-dom";

import { useAuthGlobalContext } from "../context/";

import { Loading, UserCard } from "../components";

const Family = () => {
    const { user, isUserReady } = useAuthGlobalContext();

    if (!isUserReady) return <Loading />;

    return (
        <div className="sandwich-gallery pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
            <div className="sandwich-gallery-title w-full py-4 px-5 md:py-5 md:px-12 xl:px-20">
                <h1>My family</h1>
                <div>
                    {user.info?.type === "parent" && (
                        <Link
                            className="button bg-magenta inline-block p-2 my-2 md:my-4 text-xs md:text-sm md:text-base fit-content"
                            to={`/signup/parent/${user.uid}`}
                        >
                            <svg
                                class="inline-block"
                                style={{ marginTop: "-3px" }}
                                version="1.1"
                                width="15"
                                height="15"
                                viewBox="0 0 10 10"
                                xmlns="http://www.w3.org/2000/svg"
                                className="mx-2"
                            >
                                <circle cx="7" cy="7" r="7" fill="#e6127d"></circle>
                                <path
                                    d="m6.5333 10.733v-3.2667h-3.2667v-0.93333h3.2667v-3.2667h0.93333v3.2667h3.2667v0.93333h-3.2667v3.2667z"
                                    fill="#fff"
                                ></path>
                            </svg>
                            Add a child
                        </Link>
                    )}
                </div>
            </div>
            <div className="size-full flex flex-wrap -mx-2 sm:-mx-3 text-shadow-10 no-wrap flex-shrink-0">
                {user.info.children?.length > 0 &&
                    user.info.children.map((child, index) => (
                        <UserCard key={child.id} index={index} user={child} />
                    ))}
            </div>
        </div>
    );
};

export default Family;
