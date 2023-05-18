export class NoGameConfigError extends Error {
    constructor(message = 'Game was not initiated!') {
        super(message);
    }
}