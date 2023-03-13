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
