import { debug } from "../../constants/";

import { useNavigate, NavLink, Link } from "react-router-dom";

import { useUserAuth } from "../../context/UserAuthContext";

import { Loading } from "..";

const Navbar = () => {
    const navigate = useNavigate();
    const { logOut, user } = useUserAuth();

    const handleLogout = () => {
        try {
            logOut();
            navigate("/");
        } catch (error) {
            debug && console.error(error.message);
        }
    };

    return user.uid ? (
        <>
            <h3>Navbar</h3>
            <div>
                Hello, {user.info.name} <br />
            </div>

            {user.info.children?.length && (
                <div>
                    You kids are
                    {user.info.children.map((child) => (
                        <div key={child.id}>
                            <NavLink
                                to={`/child/${child.id}`}
                                className={({ isActive }) => (isActive ? "current" : "")}
                                preventScrollReset={true}
                            >
                                {child.name}
                            </NavLink>
                        </div>
                    ))}
                    <br />
                </div>
            )}

            {!user.info?.parents && (
                <div>
                    <Link to={`/signup/parent/${user.uid}`}>Add a child</Link>
                </div>
            )}

            <div className="d-grid gap-2">
                <button onClick={handleLogout}>Log out</button>
            </div>

            <hr />
        </>
    ) : (
        <Loading />
    );
};

export default Navbar;
