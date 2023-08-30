import { debug } from "../constants/debug";

export function log() {
    debug && console.log.apply(console, arguments);
}

export function logResponse(title, response) {
    if (response.success) {
        debug && response.message && console.log(title, "(message):", response.message);
        debug && response.data && console.log(title, "(response):", response.data);
    } else {
        debug && console.log(title, "(error):", response.error.message);
    }
}
