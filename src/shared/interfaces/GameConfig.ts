export interface GameConfig {
    general: GameGeneralConfig,
    uber?: GameUberConfig
    copy?: GameCopyConfig
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