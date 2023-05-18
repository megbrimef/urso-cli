export class GameConfigWasCreatedError extends Error {
    constructor(message = 'Game config was created already!') {
        super(message);
    }
}