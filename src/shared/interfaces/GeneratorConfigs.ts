import {TexturePackerOptions} from "free-tex-packer-core";
import {CFG_TYPE} from "../enums/assets";

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

export interface TextureConfig {
    srcFolder?: string,
    destFolder?: string,
    packer?: TexturePackerOptions,
    optimize?: OptimizationConfig,
    webp?: WebpConfig
}

export interface WebpConfig {
    enabled: boolean;
    webpPath: string;
}

export interface OptimizationConfig {
    enabled: boolean;
}

export interface SoundOptConfig {
    format?: string,
    silence?: number,
    bitrate?: number,
    samplerate?: number,
    channels?: number
}
