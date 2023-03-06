import { debug } from "../constants/debug";

import { useNavigate, NavLink, Link } from "react-router-dom";

import { useUserAuth } from "../context/UserAuthContext";

import { Loading } from "../components";

const Navbar = () => {
    const navigate = useNavigate();
    const { logOut, user } = useUserAuth();

    const handleLogout = () => {
        try {
            logOut();
            navigate("/");
        } catch (error) {
            debug && console.log(error.message);
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
                                style={{}}
                                to={`/child/${child.id}`}
                                className={({ isActive }) =>
                                    isActive ? "current" : ""
                                }
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
