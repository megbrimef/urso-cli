import { GameConfig } from '../../shared/interfaces/GameConfig';

export const defaultGameConfig: GameConfig = {
    general: {
        sourceFolder: 'src/assets',
        outputFolder: 'src/bin'
    },
    uber: {
        output: '.',
        folders: []
    },
    copy: {
        'images/spines': 'images/spines',
        'fonts': 'fonts',
        'sounds': 'sounds'
    }
};