import {
    BitmapFilterType,
    PackerExporterType,
    PackerType,
    ScaleMethod,
    TextureFormat,
    TrimMode
} from "free-tex-packer-core";
import {stringify} from "../shared/helpers";

const merge = require('deepmerge')
import {CFG_TYPE} from "../shared/enums/assets";
import {Config, TextureConfig} from "../shared/interfaces/GeneratorConfigs";
import { logInfo } from "../shared/logger";

export function getDefaultTextureConfig(): Config<TextureConfig> {
    return {
        meta: 'URC',
        type: CFG_TYPE.TEXTURE,
        shared: {
            srcFolder: 'images',
            destFolder: 'images/atlases',
            packer: {
                width: 2048,
                height: 2048,
                fixedSize: false,
                powerOfTwo: true,
                padding: 0,
                extrude: 0,
                allowRotation: true,
                detectIdentical: true,
                allowTrim: true,
                trimMode: 'trim' as TrimMode,
                alphaThreshold: 0,
                removeFileExtension: false,
                prependFolderName: true,
                textureFormat: 'png' as TextureFormat.PNG,
                base64Export: false,
                scale: 1,
                scaleMethod: 'NEAREST_NEIGHBOR' as ScaleMethod.NEAREST_NEIGHBOR,
                packer: 'OptimalPacker' as PackerType.OPTIMAL_PACKER,
                exporter: 'JsonArray' as PackerExporterType.JSON_ARRAY,
                filter: 'none' as BitmapFilterType.NONE,
            },
            optimize: {
                enabled: true,
            },    
            webp: {
                enabled: false,
                webpPath: 'webp'
            }
        },
        variants: [
            {
                destFolder: 'images/high/atlases',
            },
            {
                destFolder: 'images/hd/atlases',
                packer: {
                    scale: 0.75
                }
            },
            {
                destFolder: 'images/medium/atlases',
                packer: {
                    scale: 0.5
                }
            }
        ]
    }
}

export function getTextureTemplate(name: string): string {
    logInfo(`Creating texture config file with name: '${name}'`);

    const {shared: {srcFolder}, variants, meta} = getDefaultTextureConfig();

    return stringify({
        type: CFG_TYPE.TEXTURE,
        meta,
        shared: {
            srcFolder,
            packer: {
                textureName: name
            }
        },
        variants
    });
}


export async function getTextureConfigs(cfg: Config<TextureConfig>): Promise<TextureConfig[]> {
    const defaultCfg = getDefaultTextureConfig();

    if (cfg.variants.length) {
        defaultCfg.variants = cfg.variants;
    }

    return defaultCfg.variants
        .map((variant: TextureConfig) => {
            const sharedCfg = merge(defaultCfg.shared, cfg.shared);
            return merge(sharedCfg, variant);
        });
}