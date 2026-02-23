export interface StyleGuidePreset {
    id: string;
    name: string;
    description: string;
    colors: string[];
    fonts: string[];
    fontSizes: number[];
}

export const STYLE_GUIDE_PRESETS: StyleGuidePreset[] = [
    {
        id: 'corporate',
        name: 'Medieninformatik',
        description: 'Drucksachen Styleguide ',
        colors: ['#EFEFEF', '#ED1B65', '#00AB42', '#9829C8', '#241F20', '#AAAAAA', '#EFEFEF'],
        fonts: ['Roboto Slab', 'PT Sans'],
        fontSizes: [25, 32, 40, 50, 63]
    },
    {
        id: 'vibrant',
        name: 'Vibrant & Fun',
        description: 'Beispiel 2',
        colors: ['#ff006e', '#8338ec', '#3a86ff', '#ffbe0b', '#fb5607', '#ffffff'],
        fonts: ['Outfit', 'Montserrat', 'Lato'],
        fontSizes: [24, 36, 48, 64, 72, 96, 128]
    },
    {
        id: 'minimal',
        name: 'Minimalist',
        description: 'Beispiel 3',
        colors: ['#000000', '#ffffff', '#171717', '#262626', '#404040', '#e5e5e5'],
        fonts: ['Inter', 'Lato'],
        fontSizes: [12, 16, 24, 48, 96]
    },
    {
        id: 'elegant',
        name: 'Elegant Serif',
        description: 'Beispiel 4',
        colors: ['#2c3e50', '#e74c3c', '#ecf0f1', '#34495e', '#ffffff'],
        fonts: ['Playfair Display', 'Merriweather', 'Lora'],
        fontSizes: [14, 18, 24, 36, 48, 60]
    }
];
