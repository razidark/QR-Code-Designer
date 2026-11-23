/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QRContentMode = 'url' | 'text' | 'email' | 'wifi' | 'phone' | 'vcard' | 'sms' | 'pix';

export interface PixConfig {
  key: string;
  keyType: 'cpf_cnpj' | 'email' | 'phone' | 'evp';
  receiverName: string;
  receiverCity: string;
  amount?: string;
  txid?: string;
  description?: string;
}

export interface WIFIConfig {
  ssid: string;
  password?: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export interface VCardConfig {
  name: string;
  lastName?: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
}

export interface SMSConfig {
  phone: string;
  message?: string;
}

export interface EmailConfig {
  email: string;
  subject?: string;
  body?: string;
}

export type DotStyle = 'square' | 'circle' | 'rounded' | 'fluid' | 'diamond' | 'star' | 'plus' | 'ring' | 'hexagon';
export type EyeFrameStyle = 'square' | 'rounded' | 'circle' | 'shield' | 'leaf';
export type EyeBallStyle = 'square' | 'rounded' | 'circle' | 'diamond' | 'leaf';

export interface GradientColor {
  type: 'solid' | 'linear' | 'radial' | 'conic' | 'diagonal';
  color1: string; // Hex color or rgba
  color2?: string; // Optional for solid
  color3?: string; // Optional third color for multi-color gradients
  color4?: string; // Optional fourth color for multi-color gradients
  color5?: string; // Optional fifth color for multi-color gradients
  angle?: number; // Linear gradient angle (degrees)
}

export interface LogoConfig {
  sourceType: 'none' | 'preset' | 'upload';
  presetKey?: string; // e.g. 'google', 'apple', 'github', 'wifi', etc.
  uploadUrl?: string; // Data URL for uploaded file
  sizePercent: number; // 5 to 30 %
  bgColor: string; // 'transparent', '#ffffff', etc.
  bgType: 'none' | 'circle' | 'rounded';
  borderWidth: number;
  borderColor: string;
  clearModules: boolean;
}

export interface QRStyleConfig {
  dotStyle: DotStyle;
  eyeFrameStyle: EyeFrameStyle;
  eyeBallStyle: EyeBallStyle;
  dotScale?: number; // scale factor between 0.15 and 1.30
  eyeScale?: number;  // scale factor for finder outer frame (0.5 to 1.3)
  eyeBallScale?: number; // scale factor for finder inner eyeballs (0.4 to 1.3)
  
  // Foreground styling
  fgGradient: GradientColor;
  
  // Custom eye coloring (different from foreground)
  customEyeColor: boolean;
  eyeFrameGradient?: GradientColor;
  eyeBallGradient?: GradientColor;
  
  // Background styling
  bgGradient: GradientColor;
  useTransparentBg: boolean;
  bgRounded?: number; // background rounding border radius percent (0 to 50)
  bgBorderWidth?: number; // background border frame thickness (0 to 20)
  bgBorderColor?: string; // background border color hex
  
  // Margin & Quiet Zone
  margin: number;
}

export interface QRConfig {
  mode: QRContentMode;
  value: string; // The raw or built string
  
  // Individual content structures for easy restoration
  url: string;
  text: string;
  wifi: WIFIConfig;
  vcard: VCardConfig;
  sms: SMSConfig;
  email: EmailConfig;
  phone: string;
  pix: PixConfig;
  
  style: QRStyleConfig;
  logo: LogoConfig;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface QRPreset {
  id: string;
  name: string;
  description: string;
  style: QRStyleConfig;
  logo: LogoConfig;
}

export interface QRHistoryItem {
  id: string;
  createdAt: string;
  name: string;
  mode: QRContentMode;
  rawContent: string;
  config: QRConfig;
  favorite: boolean;
}
