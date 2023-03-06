import { debug } from "../constants/debug";

import { useNavigate } from "react-router";

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
                        <div key={child.id}>{child.name}</div>
                    ))}{" "}
                    <br />
                </div>
            )}

            <div className="d-grid gap-2">
                <button onClick={handleLogout}>Log out</button>
            </div>

            <hr/>
        </>
    ) : (
        <Loading />
    );
};

export default Navbar;
