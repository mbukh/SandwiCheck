import { Link, Navigate } from "react-router-dom";

import { useAuthGlobalContext } from "../context/";

import { Loading, UserCard } from "../components";

const Family = () => {
    const { user, isUserReady } = useAuthGlobalContext();

    if (!isUserReady) return <Loading />;
    if (isUserReady && !user.uid) return <Navigate to="/login" replace={true} />;

    return (
        <div className="sandwich-gallery pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
            <h1 className="text-center text-l uppercase">My family</h1>
            <div className="sandwich-gallery-title w-full py-4 px-5 md:py-5 md:px-12 xl:px-20">
                <div>
                    {user.info?.type === "parent" && (
                        <>
                            <Link
                                className="button bg-magenta inline-block p-2 mr-4 md:my-4 text-xs md:text-sm md:text-base fit-content"
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
                            or
                            <Link
                                className="button bg-magenta text-white inline-block p-2 pr-4 my-2 ml-4 md:my-4 relative text-xs md:text-sm md:text-base fit-content no-wrap"
                                to={`https://wa.me/?text=Hey%20kids%2C%20join%20me%20at%20SandwiCheck%20and%20be%20a%20part%20of%20my%20sandwich%20squad%21+${window.location.protocol}%2F%2F${window.location.hostname}%2Fsignup%2Fparent%2F${user.uid}`}
                                target="_blank"
                            >
                                Send a link &nbsp; &nbsp; &nbsp;{" "}
                                <i className="icon icon-whatsapp abs top-0 bottom-0 right-0"></i>
                            </Link>
                        </>
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
