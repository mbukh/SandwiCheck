import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../../constants/firebase.config";

const getAllDatabaseAsJSON = async () => {
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const data = {};
        const users = {};
        const sandwiches = {};
        for (const userDoc of usersSnapshot.docs) {
            data[userDoc.id] = userDoc.data();
            users[userDoc.id] = userDoc.data();
            const sandwichesSnapshot = await getDocs(
                collection(doc(db, "users", userDoc.id), "sandwiches")
            );
            const sandwichesData = {};
            for (const sandwichDoc of sandwichesSnapshot.docs) {
                sandwichesData[sandwichDoc.id] = sandwichDoc.data();
                sandwiches[sandwichDoc.id] = sandwichDoc.data();
                sandwiches[sandwichDoc.id].userId = userDoc.id;
            }
            data[userDoc.id]["sandwiches"] = sandwichesData;
        }
        console.log("======== ALL DATA ========");
        console.log(JSON.stringify(data));
        console.log("======== ALL DATA ========");
        console.log("======== USERS DATA ========");
        console.log(JSON.stringify(users));
        console.log("======== USERS DATA ========");
        console.log("======== SANDWICHES DATA ========");
        console.log(JSON.stringify(sandwiches));
        console.log("======== SANDWICHES DATA ========");
        console.log("Data exported successfully!");
    } catch (error) {
        console.error(error);
    }
};

export default getAllDatabaseAsJSON;
