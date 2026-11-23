import { QRPreset, QRStyleConfig, LogoConfig } from '../types';

export const DEFAULT_STYLE: QRStyleConfig = {
  dotStyle: 'rounded',
  eyeFrameStyle: 'rounded',
  eyeBallStyle: 'circle',
  dotScale: 1.0,
  eyeScale: 1.0,
  eyeBallScale: 1.0,
  fgGradient: {
    type: 'solid',
    color1: '#000000',
  },
  customEyeColor: false,
  bgGradient: {
    type: 'solid',
    color1: '#ffffff',
  },
  useTransparentBg: false,
  bgRounded: 0,
  bgBorderWidth: 0,
  bgBorderColor: '#ffffff',
  margin: 4,
};

export const DEFAULT_LOGO: LogoConfig = {
  sourceType: 'none',
  sizePercent: 18,
  bgColor: '#ffffff',
  bgType: 'rounded',
  borderWidth: 2,
  borderColor: '#ffffff',
  clearModules: true,
};

export const PRESETS: QRPreset[] = [
  {
    id: 'crimson_gamer',
    name: 'Crimson Gamer Profile',
    description: 'Deep crimson canvas with white micro-circles and circular finder eyes, inspired by high-end gaming and streaming profiles.',
    style: {
      dotStyle: 'circle',
      eyeFrameStyle: 'circle',
      eyeBallStyle: 'circle',
      dotScale: 0.8,
      fgGradient: {
        type: 'solid',
        color1: '#ffffff',
      },
      customEyeColor: false,
      bgGradient: {
        type: 'solid',
        color1: '#2b0002', // deep gaming crimson
      },
      useTransparentBg: false,
      bgRounded: 0,
      bgBorderWidth: 0,
      margin: 4,
    },
    logo: {
      sourceType: 'none',
      sizePercent: 28,
      bgColor: '#2b0002',
      bgType: 'rounded',
      borderWidth: 0,
      borderColor: '#ffffff',
      clearModules: true,
    },
  },
  {
    id: 'stealth_obsidian_circle',
    name: 'Stealth Obsidian Circle',
    description: 'Absolute black canvas with white micro-circles and circular eyes. Sleek, minimalist design optimized for custom profile photos.',
    style: {
      dotStyle: 'circle',
      eyeFrameStyle: 'circle',
      eyeBallStyle: 'circle',
      dotScale: 0.8,
      fgGradient: {
        type: 'solid',
        color1: '#ffffff',
      },
      customEyeColor: false,
      bgGradient: {
        type: 'solid',
        color1: '#000000', // absolute dark theme black
      },
      useTransparentBg: false,
      bgRounded: 0,
      bgBorderWidth: 0,
      margin: 4,
    },
    logo: {
      sourceType: 'none',
      sizePercent: 28,
      bgColor: '#000000',
      bgType: 'rounded',
      borderWidth: 0,
      borderColor: '#ffffff',
      clearModules: true,
    },
  },
  {
    id: 'cyber_neon',
    name: 'Neon Synthwave',
    description: 'Vibrant hot pink to cyan gradient with rounded eyes and fluid liquid dots.',
    style: {
      dotStyle: 'fluid',
      eyeFrameStyle: 'rounded',
      eyeBallStyle: 'circle',
      dotScale: 1.0,
      fgGradient: {
        type: 'linear',
        color1: '#f43f5e', // rose-500
        color2: '#06b6d4', // cyan-500
        angle: 45,
      },
      customEyeColor: true,
      eyeFrameGradient: {
        type: 'solid',
        color1: '#06b6d4',
      },
      eyeBallGradient: {
        type: 'solid',
        color1: '#f43f5e',
      },
      bgGradient: {
        type: 'solid',
        color1: '#0f172a', // slate-900
      },
      useTransparentBg: false,
      margin: 4,
    },
    logo: {
      sourceType: 'none',
      sizePercent: 20,
      bgColor: '#0f172a',
      bgType: 'circle',
      borderWidth: 2,
      borderColor: '#06b6d4',
      clearModules: true,
    },
  },
  {
    id: 'sunset_gold',
    name: 'Sunset Gold',
    description: 'Warm, elegant amber to red metallic gold gradient with decorative stars and shields.',
    style: {
      dotStyle: 'star',
      eyeFrameStyle: 'shield',
      eyeBallStyle: 'diamond',
      dotScale: 0.85,
      fgGradient: {
        type: 'linear',
        color1: '#f59e0b', // amber-500
        color2: '#ef4444', // red-500
        angle: 135,
      },
      customEyeColor: false,
      bgGradient: {
        type: 'solid',
        color1: '#ffffff',
      },
      useTransparentBg: false,
      margin: 4,
    },
    logo: {
      sourceType: 'none',
      sizePercent: 18,
      bgColor: '#ffffff',
      bgType: 'rounded',
      borderWidth: 2,
      borderColor: '#f59e0b',
      clearModules: true,
    },
  },
  {
    id: 'emerald_eco',
    name: 'Forest Leaf',
    description: 'Organic leaf shapes and clean circular patterns with a refreshing emerald gradient.',
    style: {
      dotStyle: 'circle',
      eyeFrameStyle: 'leaf',
      eyeBallStyle: 'leaf',
      dotScale: 0.9,
      fgGradient: {
        type: 'linear',
        color1: '#10b981', // emerald-500
        color2: '#047857', // emerald-700
        angle: 90,
      },
      customEyeColor: true,
      eyeFrameGradient: {
        type: 'solid',
        color1: '#047857',
      },
      eyeBallGradient: {
        type: 'solid',
        color1: '#10b981',
      },
      bgGradient: {
        type: 'solid',
        color1: '#ffffff',
      },
      useTransparentBg: true,
      margin: 4,
    },
    logo: {
      sourceType: 'none',
      sizePercent: 18,
      bgColor: '#ffffff',
      bgType: 'circle',
      borderWidth: 3,
      borderColor: '#10b981',
      clearModules: true,
    },
  },
  {
    id: 'royal_velvet',
    name: 'Royal Velvet',
    description: 'Premium corporate indigo to deep violet gradient with soft rounded modules.',
    style: {
      dotStyle: 'rounded',
      eyeFrameStyle: 'circle',
      eyeBallStyle: 'circle',
      dotScale: 1.0,
      fgGradient: {
        type: 'linear',
        color1: '#6366f1', // indigo-500
        color2: '#a855f7', // violet-500
        angle: 45,
      },
      customEyeColor: false,
      bgGradient: {
        type: 'solid',
        color1: '#ffffff',
      },
      useTransparentBg: false,
      margin: 4,
    },
    logo: {
      sourceType: 'none',
      sizePercent: 18,
      bgColor: '#ffffff',
      bgType: 'rounded',
      borderWidth: 2,
      borderColor: '#6366f1',
      clearModules: true,
    },
  },
  {
    id: 'stealth_dark',
    name: 'Stealth Obsidian',
    description: 'Ultra-minimalistic matte obsidian theme with pure transparent background.',
    style: {
      dotStyle: 'diamond',
      eyeFrameStyle: 'square',
      eyeBallStyle: 'square',
      dotScale: 0.85,
      fgGradient: {
        type: 'solid',
        color1: '#18181b', // zinc-900
      },
      customEyeColor: false,
      bgGradient: {
        type: 'solid',
        color1: '#000000',
      },
      useTransparentBg: true,
      margin: 4,
    },
    logo: {
      sourceType: 'none',
      sizePercent: 16,
      bgColor: '#ffffff',
      bgType: 'circle',
      borderWidth: 2,
      borderColor: '#18181b',
      clearModules: true,
    },
  },
  {
    id: 'rainbow_cyber',
    name: 'Rainbow Cyber Studio',
    description: 'Spectacular multi-stop neon rainbow gradient spanning pink, yellow, green, and deep purple with fluid dots and shielding finders.',
    style: {
      dotStyle: 'fluid',
      eyeFrameStyle: 'shield',
      eyeBallStyle: 'circle',
      dotScale: 0.95,
      fgGradient: {
        type: 'diagonal',
        color1: '#ff007f', // hot pink
        color2: '#ffaa00', // orange-yellow
        color3: '#00ffcc', // turquoise
        color4: '#9900ff', // violet-purple
      },
      customEyeColor: true,
      eyeFrameGradient: {
        type: 'linear',
        color1: '#00ffcc',
        color2: '#9900ff',
        angle: 45,
      },
      eyeBallGradient: {
        type: 'solid',
        color1: '#ff007f',
      },
      bgGradient: {
        type: 'solid',
        color1: '#050711', // ultra dark cyber slate
      },
      useTransparentBg: false,
      bgRounded: 25,
      bgBorderWidth: 5,
      bgBorderColor: '#ffbb00',
      margin: 4,
    },
    logo: {
      sourceType: 'none',
      sizePercent: 20,
      bgColor: '#050711',
      bgType: 'circle',
      borderWidth: 3,
      borderColor: '#00ffcc',
      clearModules: true,
    },
  },
];
