const merge = require('deepmerge')
import { Config, SoundConfig, SoundOptConfig } from '../shared/interfaces/GeneratorConfigs';
import { CFG_TYPE } from '../shared/enums/assets';
import { stringify } from '../shared/helpers';

// ffmpeg's native AC-3 encoder (always one of audiosprite's export targets) only
// accepts bit rates from the fixed ATSC A/52 table below - anything else fails at encode time.
const VALID_AC3_BITRATES = [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384, 448, 512, 576, 640];
const VALID_SAMPLERATES = [8000, 11025, 16000, 22050, 24000, 32000, 44100, 48000];

function validateOptimization(optimization: SoundOptConfig = {}, sourceLabel: string): void {
    const { silence, bitrate, samplerate, channels } = optimization;

    if (silence !== undefined && (!Number.isFinite(silence) || silence < 0)) {
        throw new Error(`Invalid sound config optimization.silence (${silence}) in ${sourceLabel}: must be a number >= 0`);
    }

    if (bitrate !== undefined && (!Number.isInteger(bitrate) || !VALID_AC3_BITRATES.includes(bitrate))) {
        throw new Error(`Invalid sound config optimization.bitrate (${bitrate}) in ${sourceLabel}: must be one of ${VALID_AC3_BITRATES.join(', ')} kbps (valid ffmpeg AC-3 bitrates)`);
    }

    if (samplerate !== undefined && !VALID_SAMPLERATES.includes(samplerate)) {
        throw new Error(`Invalid sound config optimization.samplerate (${samplerate}) in ${sourceLabel}: must be one of ${VALID_SAMPLERATES.join(', ')}`);
    }

    if (channels !== undefined && channels !== 1 && channels !== 2) {
        throw new Error(`Invalid sound config optimization.channels (${channels}) in ${sourceLabel}: must be 1 or 2`);
    }
}

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
                    bitrate: 40,
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

export function getSoundConfigs(cfg: Config<SoundConfig>, sourceLabel: string = 'sound config'): SoundConfig[] {
    const defaultCfg = getDefaultSoundConfig();

    if (cfg.variants.length) {
        defaultCfg.variants = cfg.variants;
    }

    return defaultCfg.variants.map((variant: SoundConfig) => {
        const sharedCfg = merge(defaultCfg.shared, cfg.shared);
        const mergedCfg = merge(sharedCfg, variant);

        validateOptimization(mergedCfg.optimization, `${sourceLabel} (variant: ${variant.destFolder || variant.name || 'default'})`);

        return mergedCfg;
    });
}