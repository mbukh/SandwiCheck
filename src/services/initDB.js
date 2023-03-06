import { db } from "../constants/firebase.config";

import { collection, doc, getDocs, writeBatch } from "firebase/firestore";

import { bread, protein, cheese, toppings, condiments } from "./initialDataDB/";

import { rebuildUsers } from "../constants/debug";

import fillDatabaseWithUsers from "./initialDataDB/users";

// import fillDatabaseWithUsers from "./initialDataDB/users";

//
// IMAGE_FORMAT_BREAD "20200620_101033[''/sliced].png"
// IMAGE_FORMAT_PROTEIN "image_[BREAD:trapezoid/round/long]_[7/1/2].png"
// IMAGE_FORMAT_CHEESE "image_[BREAD:trapezoid/round/long]_[8/5/6].png"
// IMAGE_FORMAT_TOPPING "image_[BREAD:trapezoid/round/long]_[8/5/6].png"
// IMAGE_FORMAT_CONDIMENTS "image_[BREAD:trapezoid/round/long]_[8/5/6].png"
//

const dataBaseCollections = {
    bread,
    protein,
    cheese,
    toppings,
    condiments,
};

const removeCollection = async (collectionName) => {
    const batch = writeBatch(db);
    try {
        const collectionRef = collection(db, collectionName);
        const querySnapshot = await getDocs(collectionRef);
        querySnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log("Collection -" + collectionName + "- removed.");
    } catch (error) {
        console.log("Collection  -" + collectionName + "- not removed:", error);
    }
};

const fillCollectionWithData = async (collectionName, collectionData) => {
    const batch = writeBatch(db);
    try {
        for (const data of collectionData) {
            const docRef = doc(collection(db, collectionName));
            batch.set(docRef, data);
        }
        await batch.commit();
        console.log("Collection -" + collectionName + "- filled.");
    } catch (error) {
        console.log("Collection  -" + collectionName + "- not filled:", error);
    }
};

const initDB = async () => {
    !rebuildUsers && Promise.all(
        Object.entries(dataBaseCollections).map(
            ([collectionName, collectionData]) =>
                (async () => {
                    await removeCollection(collectionName);
                    await fillCollectionWithData(
                        collectionName,
                        collectionData
                    );
                })()
        )
    );

    if (rebuildUsers) {
        await removeCollection('users');
        await fillDatabaseWithUsers();
    }
};

export default initDB;
