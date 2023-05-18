const merge = require('deepmerge')
import { Config, SoundConfig } from "../shared/interfaces/GeneratorConfigs";
import { CFG_TYPE } from "../shared/enums/assets";
import { stringify } from "../shared/helpers";

export function getDefaultSoundConfig(): Config<SoundConfig> {
    return {
        meta: 'URC',
        type: CFG_TYPE.SOUND,
        shared: {
            name: 'audiosprite',
            srcFolder: 'soundAtlases',
            destFolder: 'sounds/soundAtlases',
            optimization: {
                format: 'howler',
                silence: 1,
                bitrate: 128,
                samplerate: 44100,
                channels: 1
            }
        },
        variants: [
            {
                destFolder: 'soundAtlases',
            },
            {
                destFolder: 'soundAtlases/mobile',
                optimization: {
                    bitrate: 44,
                    samplerate: 22050,
                    channels: 1
                }
            },
        ]
    }
}

export function getSoundTemplate(name: string): string {
    const { shared: { srcFolder }, variants, meta } = getDefaultSoundConfig();

    return stringify({
        type: CFG_TYPE.SOUND,
        meta,
        shared: {
            name,
            srcFolder
        },
        variants
    });
}

export function getSoundConfigs(cfg: Config<SoundConfig>): SoundConfig[] {
    const defaultCfg = getDefaultSoundConfig();

    if (cfg.variants.length) {
        defaultCfg.variants = cfg.variants;
    }

    return defaultCfg.variants.map((variant: SoundConfig) => {
        const sharedCfg = merge(defaultCfg.shared, cfg.shared);
        return merge(sharedCfg, variant);
    });
}