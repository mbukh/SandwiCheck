import { db } from "../../constants/firebase.config";
import { writeBatch, doc, collection } from "firebase/firestore";

const users = [
    { id: "8aXzQ46Advaptpeq7sSdAJ1I62f2", name: "Moshe Bukhman" },
    {
        id: "948nG8lvrlQQT19CUlN5QLvFqJT2",
        name: "Parent One & Two",
        children: [
            "v5Vr4TVb7EezZwpSHwgrEqeLyo73",
            "b419OJ3mzShG1cXNByTHH5af5Rh2",
        ],
        type: "parent",
    },
    { id: "wY0AHX6NADeP9q9FQQzBYVTVvXi2", name: "Parent Two" },
    { id: "DfNZXGMzLJbRHTdyFr2WVK3JBOf2", name: "Parent Three" },
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
    { id: "MMnxO1NqhfNNC2w1L7EVMe4itPN2", name: "Child Three" },
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
