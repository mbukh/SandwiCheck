import { collection, doc, getDocs } from "firebase/firestore";
import { db } from "../../constants/firebase.config";

const getAllDatabaseAsJSON = async () => {
    try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const data = {};
        for (const userDoc of usersSnapshot.docs) {
            data[userDoc.id] = userDoc.data();
            const sandwichesSnapshot = await getDocs(
                collection(doc(db, "users", userDoc.id), "sandwiches")
            );
            const sandwichesData = {};
            for (const sandwichDoc of sandwichesSnapshot.docs) {
                sandwichesData[sandwichDoc.id] = sandwichDoc.data();
            }
            data[userDoc.id]["sandwiches"] = sandwichesData;
        }
        console.log(JSON.stringify(data));
        console.log("Data exported successfully!");
    } catch (error) {
        console.error(error);
    }
};

export default getAllDatabaseAsJSON;
