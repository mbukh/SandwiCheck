import { debug } from "../constants/debug";

export async function handleResponse(requestFunction) {
    try {
        const response = await requestFunction();
        return response.data;
    } catch (error) {
        debug && console.error("Error request: ", error.response.data);
        return error.response.data;
    }
}
