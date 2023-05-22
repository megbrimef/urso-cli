import { yellow, red, blue, green } from 'chalk';

export enum MESSAGE_TYPES {
    INFO = 'INFO:',
    SUCCESS = 'SUCCESS:',
    WARNING = 'WARNING:',
    ERROR = 'ERROR:',
};

function getPrefix(type, label) {
    const lbl = ` ${label ? label.toString().toUpperCase() : type} `;

    switch (type) {
        case MESSAGE_TYPES.SUCCESS:
            return `${green.inverse.bold(lbl)}`;

        case MESSAGE_TYPES.WARNING:
            return `${yellow.inverse.bold(lbl)}`;

        case MESSAGE_TYPES.ERROR:
            return `${red.inverse.bold(lbl)}`;

        default:
            return `${blue.inverse.bold(lbl)}`;
    }
}

function printToConsole(type, label, message) {
    const prefix = getPrefix(type, label);
    console.log(`${prefix} ${message.trim()}`);
}

export function greet(message) {
    const msg = ` ${message.toUpperCase()} `;
    console.log(blue.inverse(msg));
}

export function logError(message, label = '') {
    printToConsole(MESSAGE_TYPES.ERROR, label, red(message));
}

export function logInfo(message, label = '') {
    printToConsole(MESSAGE_TYPES.INFO, label, blue(message));
}

export function logSuccess(message, label = '') {
    printToConsole(MESSAGE_TYPES.SUCCESS, label, green(message));
}

export function logWarning(message, label = '') {
    printToConsole(MESSAGE_TYPES.WARNING, label, yellow(message));
}

export function getProgressText(msg) {
    return yellow(msg);
}