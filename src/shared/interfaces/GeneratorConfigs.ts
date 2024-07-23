import { CFG_TYPE } from '../enums/assets';

export interface Config<T> {
    meta: string, 
    type: CFG_TYPE,
    shared?: T,
    variants?: T[]
}

export interface SoundConfig {
    name?: string,
    srcFolder?: string,
    destFolder?: string,
    optimization?: SoundOptConfig
}

export interface SoundOptConfig {
    format?: string,
    silence?: number,
    bitrate?: number,
    samplerate?: number,
    channels?: number
}
