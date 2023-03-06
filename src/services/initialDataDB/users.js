import { db } from "../../constants/firebase.config";
import { writeBatch, doc, collection } from "firebase/firestore";

const users = [
    { id: "8aXzQ46Advaptpeq7sSdAJ1I62f2", name: "Moshe Bukhman" },
    { id: "MMnxO1NqhfNNC2w1L7EVMe4itPN2" },
    {
        id: "v5Vr4TVb7EezZwpSHwgrEqeLyo73",
        name: "Child One",
        parents: ["948nG8lvrlQQT19CUlN5QLvFqJT2"],
        type: "child",
    },
    {
        id: "b419OJ3mzShG1cXNByTHH5af5Rh2",
        name: "Child Two",
        parents: ["948nG8lvrlQQT19CUlN5QLvFqJT2"],
        type: "child",
    },
    { id: "DfNZXGMzLJbRHTdyFr2WVK3JBOf2" },
    { id: "wY0AHX6NADeP9q9FQQzBYVTVvXi2" },
    {
        id: "948nG8lvrlQQT19CUlN5QLvFqJT2",
        children: [
            "v5Vr4TVb7EezZwpSHwgrEqeLyo73",
            "b419OJ3mzShG1cXNByTHH5af5Rh2",
        ],
        type: "parent",
    },
];

const fillDatabaseWithUsers = async () => {
    const batch = writeBatch(db);
    for (const user of users) {
        const { id, ...userData } = user;
        const docRef = doc(collection(db, "users"), id);
        batch.set(docRef, userData);
    }
    await batch.commit();
};

export default fillDatabaseWithUsers;
