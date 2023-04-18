import { debug } from "../constants";

export function log() {
    debug && console.log.apply(console, arguments);
}

export function logResponse(title, response) {
    debug && response.message && console.log(title, "(message):", response.message);
    debug && response.data && console.log(title, "(response):", response.data);
}