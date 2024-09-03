import { FILE_TYPES } from "../enums/fileTypes"

export interface GameConfig {
    general: GameGeneralConfig
    uber?: GameUberConfig
    copy?: GameCopyConfig
    extraAssets?: GameExtraConfig
}

export interface GameExtraConfig {
    output: string,
    list : GameExtraAsset[]
}

export interface GameExtraAsset {
    name: string,
    lazy: boolean,
    generate: GameExtraAssetType[]
}
export interface GameExtraAssetType {
    source: string,
    output: string,
    extensions: FILE_TYPES[]
}

export interface GameCopyConfig {
    [from: string]: string
}
export interface GameGeneralConfig {
    sourceFolder?: string,
    outputFolder?: string
}

export interface GameUberConfig {
    output: string,
    folders: string[]
}