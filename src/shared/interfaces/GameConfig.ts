export interface GameConfig {
    general: GameGeneralConfig,
    copy?: { [from: string]: string } 
}

export interface GameGeneralConfig {
    sourceFolder?: string,
    outputFolder?: string
}