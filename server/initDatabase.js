import dotenv from "dotenv";
import connectDB from "./config/db.js";

import expressAsyncHandler from "express-async-handler";

import colors from "colors";

import mongoose from "mongoose";
import { Bread, Protein, Cheese, Topping, Condiment } from "./models/ingredientSchema.js";

import { breadData } from "./service/initialData/breadData.js";
import { proteinData } from "./service/initialData/proteinData.js";
import { cheeseData } from "./service/initialData/cheeseData.js";
import { condimentData } from "./service/initialData/condimentData.js";
import { toppingData } from "./service/initialData/toppingData.js";

dotenv.config({ path: "./config/config.env" });
connectDB();

console.log(process.env.MONGO_URI);

const addData = expressAsyncHandler(async ({ data, Model }) => {
    try {
        for (const item of data) {
            const newModel = await Model.create(item);
            console.log(`Added ${newModel.type}: ${newModel.name}`);
        }
    } catch (error) {
        console.error(`Error adding ${Model.collection.collectionName}:`, error);
    }
});

const tuplesToProcess = [
    [breadData, Bread],
    [proteinData, Protein],
    [cheeseData, Cheese],
    [condimentData, Condiment],
    [toppingData, Topping],
];

Promise.all(tuplesToProcess.map(([data, Model]) => addData({ data, Model })))
    .then(() => console.log("All data added to database"))
    .catch((error) => console.log(error))
    .finally(() => mongoose.connection.close());
