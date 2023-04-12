import fs from "fs/promises";
import path from "path";

import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });

import connectDB from "./config/db.js";

import colors from "colors";

import mongoose from "mongoose";

import Ingredient from "./models/IngredientModel.js";

import {
    breadData,
    proteinData,
    cheeseData,
    toppingData,
    condimentData,
} from "./service/initialData/ingredientsData.js";

const waitForConnection = () => {
    return new Promise((resolve) => {
        mongoose.connection.once("connected", () => {
            resolve();
        });
    });
};

const addData = async ({ data, Model }) => {
    const type = data[0].type;
    try {
        await Model.insertMany(data);

        console.log(`Added to ${type}: ${data.length}`);
    } catch (error) {
        console.error(`Error adding to ${type}:`.red, error);
    }
};

const main = async () => {
    try {
        connectDB();

        await waitForConnection();

        const tuplesDataModelToProcess = [
            [breadData, Ingredient],
            [proteinData, Ingredient],
            [cheeseData, Ingredient],
            [toppingData, Ingredient],
            [condimentData, Ingredient],
        ];

        await Promise.all(
            tuplesDataModelToProcess.map(([data, Model]) => addData({ data, Model }))
        );

        console.log("All data added to database");
    } catch (error) {
        console.log(error);
    } finally {
        mongoose.connection.close();
    }
};

main();
