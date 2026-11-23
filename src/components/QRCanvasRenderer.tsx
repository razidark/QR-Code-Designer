/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { QRConfig, DotStyle, EyeFrameStyle, EyeBallStyle, GradientColor } from '../types';
import { PRESET_LOGOS, getSvgDataUri } from './logos';

interface QRCanvasRendererProps {
  config: QRConfig;
  size?: number; // Visual size in the preview (usually 320 to 450)
  exportTrigger?: (handler: { downloadPNG: (res: number) => void; downloadSVG: () => void; getSVGString: () => string }) => void;
  onScanVerify?: (result: { success: boolean; data?: string }) => void;
}

export default function QRCanvasRenderer({ config, size = 400, exportTrigger, onScanVerify }: QRCanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrMatrix, setQrMatrix] = useState<{ size: number; data: Uint8Array } | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Generate QR matrix of data
  useEffect(() => {
    try {
      if (!config.value) {
        setQrMatrix(null);
        return;
      }
      
      const qr = QRCode.create(config.value, {
        errorCorrectionLevel: config.errorCorrectionLevel,
      });
      
      setQrMatrix({
        size: qr.modules.size,
        data: qr.modules.data as Uint8Array,
      });
    } catch (err: any) {
      console.error('Error generating QR matrix:', err);
    }
  }, [config.value, config.errorCorrectionLevel]);

  // Load Logo Image (Preset or Uploaded)
  useEffect(() => {
    setLogoImage(null);
    setImageError(null);

    const { sourceType, presetKey, uploadUrl } = config.logo;
    if (sourceType === 'none') return;

    let srcUrl = '';

    if (sourceType === 'preset' && presetKey) {
      const preset = PRESET_LOGOS.find((l) => l.id === presetKey);
      if (preset) {
        srcUrl = getSvgDataUri(preset.svg, preset.color);
      }
    } else if (sourceType === 'upload' && uploadUrl) {
      srcUrl = uploadUrl;
    }

    if (!srcUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = srcUrl;
    img.onload = () => {
      setLogoImage(img);
    };
    img.onerror = () => {
      setImageError('Failed to load selected logo image.');
    };
  }, [config.logo.sourceType, config.logo.presetKey, config.logo.uploadUrl]);

  // Determine logo overlapping cells count in grid modules
  const getLogoCellCount = (gridSize: number): number => {
    if (config.logo.sourceType === 'none' || !config.logo.clearModules) return 0;
    const P = config.logo.sizePercent;
    const count = Math.ceil(gridSize * (P / 100));
    // Must be odd for symmetry, and at least 3
    const oddCount = count % 2 === 0 ? count + 1 : count;
    return Math.max(3, oddCount);
  };

  const isCellInLogoArea = (row: number, col: number, gridSize: number): boolean => {
    const K = getLogoCellCount(gridSize);
    if (K <= 0) return false;
    
    const start = (gridSize - K) / 2;
    const end = start + K;
    return row >= start && row < end && col >= start && col < end;
  };

  // Check if a cell is part of the three outer finder patterns (Corner Eyes)
  const isCellInEye = (row: number, col: number, gridSize: number): { inEye: boolean; eyeIndex?: 'TL' | 'TR' | 'BL' } => {
    // Top-Left: (0,0) to (6,6)
    if (row < 7 && col < 7) {
      return { inEye: true, eyeIndex: 'TL' };
    }
    // Top-Right: (0, size-7) to (6, size-1)
    if (row < 7 && col >= gridSize - 7) {
      return { inEye: true, eyeIndex: 'TR' };
    }
    // Bottom-Left: (size-7, 0) to (size-1, 6)
    if (row >= gridSize - 7 && col < 7) {
      return { inEye: true, eyeIndex: 'BL' };
    }
    return { inEye: false };
  };

  // Create gradient styles for HTML Canvas
  const makeCanvasColor = (
    ctx: CanvasRenderingContext2D,
    gradient: GradientColor,
    x: number,
    y: number,
    w: number,
    h: number
  ): string | CanvasGradient => {
    const colors = [gradient.color1];
    if (gradient.color2) colors.push(gradient.color2);
    if (gradient.color3) colors.push(gradient.color3);
    if (gradient.color4) colors.push(gradient.color4);
    if (gradient.color5) colors.push(gradient.color5);

    if (gradient.type === 'solid' || colors.length <= 1) {
      return gradient.color1;
    }

    const addStops = (grad: CanvasGradient) => {
      colors.forEach((col, idx) => {
        const stop = idx / (colors.length - 1);
        grad.addColorStop(stop, col);
      });
    };

    if (gradient.type === 'linear') {
      const angleRad = ((gradient.angle || 0) * Math.PI) / 180;
      // Calculate delta coords
      const dx = Math.cos(angleRad) * w;
      const dy = Math.sin(angleRad) * h;
      const x1 = x + w/2 - dx/2;
      const y1 = y + h/2 - dy/2;
      const x2 = x + w/2 + dx/2;
      const y2 = y + h/2 + dy/2;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      addStops(grad);
      return grad;
    }
    if (gradient.type === 'diagonal') {
      // Direct high-quality diagonal gradient from top-left corner to bottom-right
      const grad = ctx.createLinearGradient(x, y, x + w, y + h);
      addStops(grad);
      return grad;
    }
    if (gradient.type === 'radial') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      const r = Math.max(w, h) / 2;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      addStops(grad);
      return grad;
    }
    if (gradient.type === 'conic') {
      const cx = x + w / 2;
      const cy = y + h / 2;
      if ((ctx as any).createConicGradient) {
        const angleRad = ((gradient.angle || 0) * Math.PI) / 180;
        const grad = (ctx as any).createConicGradient(angleRad, cx, cy);
        addStops(grad);
        return grad;
      } else {
        // Fallback to high value diagonal
        const grad = ctx.createLinearGradient(x, y, x + w, y + h);
        addStops(grad);
        return grad;
      }
    }
    return gradient.color1;
  };

  // Helper drawing functions for Canvas
  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, rSize: number) => {
    const cx = x + rSize / 2;
    const cy = y + rSize / 2;
    const r = rSize * 0.52;
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx, cy, cx + r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + r);
    ctx.quadraticCurveTo(cx, cy, cx - r, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - r);
  };

  const drawDiamond = (ctx: CanvasRenderingContext2D, x: number, y: number, rSize: number) => {
    const cx = x + rSize / 2;
    const cy = y + rSize / 2;
    const r = rSize * 0.5;
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
  };

  const drawPlus = (ctx: CanvasRenderingContext2D, x: number, y: number, rSize: number) => {
    const cx = x + rSize / 2;
    const cy = y + rSize / 2;
    const thick = rSize * 0.35;
    ctx.moveTo(cx - thick / 2, y);
    ctx.lineTo(cx + thick / 2, y);
    ctx.lineTo(cx + thick / 2, cy - thick / 2);
    ctx.lineTo(x + rSize, cy - thick / 2);
    ctx.lineTo(x + rSize, cy + thick / 2);
    ctx.lineTo(cx + thick / 2, cy + thick / 2);
    ctx.lineTo(cx + thick / 2, y + rSize);
    ctx.lineTo(cx - thick / 2, y + rSize);
    ctx.lineTo(cx - thick / 2, cy + thick / 2);
    ctx.lineTo(x, cy + thick / 2);
    ctx.lineTo(x, cy - thick / 2);
    ctx.lineTo(cx - thick / 2, cy - thick / 2);
    ctx.closePath();
  };

  const drawRing = (ctx: CanvasRenderingContext2D, x: number, y: number, rSize: number) => {
    const cx = x + rSize / 2;
    const cy = y + rSize / 2;
    const rOuter = rSize * 0.46;
    const rInner = rSize * 0.22;
    ctx.moveTo(cx + rOuter, cy);
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.moveTo(cx + rInner, cy);
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2, true);
  };

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, rSize: number) => {
    const cx = x + rSize / 2;
    const cy = y + rSize / 2;
    const r = rSize * 0.52;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = cx + Math.cos(angle) * r;
      const hy = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
  };

  const drawRoundedCell = (ctx: CanvasRenderingContext2D, x: number, y: number, rSize: number, rad: number) => {
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + rSize - rad, y);
    ctx.quadraticCurveTo(x + rSize, y, x + rSize, y + rad);
    ctx.lineTo(x + rSize, y + rSize - rad);
    ctx.quadraticCurveTo(x + rSize, y + rSize, x + rSize - rad, y + rSize);
    ctx.lineTo(x + rad, y + rSize - rad);
    ctx.quadraticCurveTo(x, y + rSize, x, y + rSize - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
  };

  const drawFluidCell = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rSize: number,
    neighbors: { top: boolean; bottom: boolean; left: boolean; right: boolean }
  ) => {
    const r = rSize * 0.45;
    const rightX = x + rSize;
    const bottomY = y + rSize;

    // Top-Left corner
    if (neighbors.top || neighbors.left) {
      ctx.moveTo(x, y);
    } else {
      ctx.moveTo(x + r, y);
      ctx.quadraticCurveTo(x, y, x, y + r);
    }

    // Bottom-Left corner
    if (neighbors.bottom || neighbors.left) {
      ctx.lineTo(x, bottomY);
    } else {
      ctx.lineTo(x, bottomY - r);
      ctx.quadraticCurveTo(x, bottomY, x + r, bottomY);
    }

    // Bottom-Right corner
    if (neighbors.bottom || neighbors.right) {
      ctx.lineTo(rightX, bottomY);
    } else {
      ctx.lineTo(rightX - r, bottomY);
      ctx.quadraticCurveTo(rightX, bottomY, rightX, bottomY - r);
    }

    // Top-Right corner
    if (neighbors.top || neighbors.right) {
      ctx.lineTo(rightX, y);
    } else {
      ctx.lineTo(rightX, y + r);
      ctx.quadraticCurveTo(rightX, y, rightX - r, y);
    }
  };

  const drawEyeOuterFramePath = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    eyeSize: number,
    mSize: number,
    style: EyeFrameStyle,
    corner: 'TL' | 'TR' | 'BL'
  ) => {
    const outerRadius = eyeSize * 0.28;
    const innerRadius = (5 * mSize) * 0.20;
    
    // Draw outer path
    ctx.beginPath();
    if (style === 'square') {
      ctx.rect(x, y, eyeSize, eyeSize);
    } else if (style === 'rounded') {
      ctx.roundRect ? ctx.roundRect(x, y, eyeSize, eyeSize, outerRadius) : ctx.rect(x, y, eyeSize, eyeSize);
    } else if (style === 'circle') {
      ctx.arc(x + eyeSize/2, y + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
    } else if (style === 'shield') {
      // Round 3 corners heavily, keep the inward-facing corner sharper
      let radii = [outerRadius, outerRadius, outerRadius, outerRadius];
      if (corner === 'TL') radii[2] = 2; // Bottom-Right corner sharper
      if (corner === 'TR') radii[3] = 2; // Bottom-Left corner sharper
      if (corner === 'BL') radii[1] = 2; // Top-Right corner sharper
      ctx.roundRect ? ctx.roundRect(x, y, eyeSize, eyeSize, radii) : ctx.rect(x, y, eyeSize, eyeSize);
    } else if (style === 'leaf') {
      // Leaf pointed at diagonal
      let radii = [outerRadius, outerRadius, outerRadius, outerRadius];
      if (corner === 'TL') { radii[0] = eyeSize * 0.55; radii[2] = eyeSize * 0.55; radii[1] = 2; radii[3] = 2; }
      if (corner === 'TR') { radii[1] = eyeSize * 0.55; radii[3] = eyeSize * 0.55; radii[0] = 2; radii[2] = 2; }
      if (corner === 'BL') { radii[1] = eyeSize * 0.55; radii[3] = eyeSize * 0.55; radii[0] = 2; radii[2] = 2; }
      ctx.roundRect ? ctx.roundRect(x, y, eyeSize, eyeSize, radii) : ctx.rect(x, y, eyeSize, eyeSize);
    }
    
    // Draw inner hole path in opposite direction (for evenodd hollow fill)
    const holeX = x + mSize;
    const holeY = y + mSize;
    const holeSize = 5 * mSize;
    
    if (style === 'square') {
      ctx.rect(holeX + holeSize, holeY, -holeSize, holeSize); // Draw counter-clockwise
    } else if (style === 'rounded' || style === 'shield') {
      if (ctx.roundRect) {
        ctx.roundRect(holeX, holeY, holeSize, holeSize, innerRadius);
      } else {
        ctx.rect(holeX, holeY, holeSize, holeSize);
      }
    } else if (style === 'circle') {
      ctx.arc(holeX + holeSize/2, holeY + holeSize/2, holeSize/2, 0, Math.PI * 2, true);
    } else if (style === 'leaf') {
      let rHole = [innerRadius, innerRadius, innerRadius, innerRadius];
      if (corner === 'TL') { rHole[0] = holeSize * 0.55; rHole[2] = holeSize * 0.55; rHole[1] = 2; rHole[3] = 2; }
      if (corner === 'TR') { rHole[1] = holeSize * 0.55; rHole[3] = holeSize * 0.55; rHole[0] = 2; rHole[2] = 2; }
      if (corner === 'BL') { rHole[1] = holeSize * 0.55; rHole[3] = holeSize * 0.55; rHole[0] = 2; rHole[2] = 2; }
      if (ctx.roundRect) {
        ctx.roundRect(holeX, holeY, holeSize, holeSize, rHole);
      } else {
        ctx.rect(holeX, holeY, holeSize, holeSize);
      }
    }
  };

  const drawEyeBallPath = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    ballSize: number,
    style: EyeBallStyle,
    corner: 'TL' | 'TR' | 'BL'
  ) => {
    ctx.beginPath();
    const rad = ballSize * 0.28;
    if (style === 'square') {
      ctx.rect(x, y, ballSize, ballSize);
    } else if (style === 'rounded') {
      ctx.roundRect ? ctx.roundRect(x, y, ballSize, ballSize, rad) : ctx.rect(x, y, ballSize, ballSize);
    } else if (style === 'circle') {
      ctx.arc(x + ballSize/2, y + ballSize/2, ballSize/2, 0, Math.PI * 2);
    } else if (style === 'diamond') {
      const cx = x + ballSize/2;
      const cy = y + ballSize/2;
      const r = ballSize/2;
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
    } else if (style === 'leaf') {
      let radii = [rad, rad, rad, rad];
      if (corner === 'TL') { radii[0] = ballSize * 0.5; radii[2] = ballSize * 0.5; radii[1] = 1; radii[3] = 1; }
      if (corner === 'TR') { radii[1] = ballSize * 0.5; radii[3] = ballSize * 0.5; radii[0] = 1; radii[2] = 1; }
      if (corner === 'BL') { radii[1] = ballSize * 0.5; radii[3] = ballSize * 0.5; radii[0] = 1; radii[2] = 1; }
      ctx.roundRect ? ctx.roundRect(x, y, ballSize, ballSize, radii) : ctx.rect(x, y, ballSize, ballSize);
    }
  };

  // Perform full drawing on Canvas
  const drawQR = (targetCanvas: HTMLCanvasElement, targetSize: number) => {
    if (!qrMatrix) return;
    const ctx = targetCanvas.getContext('2d');
    if (!ctx) return;

    const { size: matrixSize, data } = qrMatrix;
    const { margin } = config.style;
    const totalModules = matrixSize + 2 * margin;
    const mSize = targetSize / totalModules;

    // Clear Canvas
    ctx.clearRect(0, 0, targetSize, targetSize);

    // 1. Draw Background
    if (!config.style.useTransparentBg) {
      ctx.fillStyle = makeCanvasColor(ctx, config.style.bgGradient, 0, 0, targetSize, targetSize);
      const radius = (config.style.bgRounded ?? 0) * (targetSize / 100); // 0 to 50%
      ctx.beginPath();
      if (radius > 0 && ctx.roundRect) {
        ctx.roundRect(0, 0, targetSize, targetSize, radius);
      } else {
        ctx.rect(0, 0, targetSize, targetSize);
      }
      ctx.fill();

      // Background border
      const bgBWidth = config.style.bgBorderWidth ?? 0;
      if (bgBWidth > 0) {
        const strokeXy = (bgBWidth * (targetSize / 1000)) / 2;
        const strokeSize = targetSize - bgBWidth * (targetSize / 1000);
        const strokeRadius = Math.max(0, radius - strokeXy);
        ctx.strokeStyle = config.style.bgBorderColor || config.style.fgGradient.color1;
        ctx.lineWidth = bgBWidth * (targetSize / 1000);
        ctx.beginPath();
        if (strokeRadius > 0 && ctx.roundRect) {
          ctx.roundRect(strokeXy, strokeXy, strokeSize, strokeSize, strokeRadius);
        } else {
          ctx.rect(strokeXy, strokeXy, strokeSize, strokeSize);
        }
        ctx.stroke();
      }
    }

    // Coordinates of QR active region
    const qrMinX = margin * mSize;
    const qrMinY = margin * mSize;
    const qrActiveSize = matrixSize * mSize;

    // Build overall foreground color/gradient
    const fgColor = makeCanvasColor(ctx, config.style.fgGradient, qrMinX, qrMinY, qrActiveSize, qrActiveSize);

    // 2. Draw regular QR dots (or foreground modules)
    ctx.fillStyle = fgColor;
    ctx.beginPath();

    const S = config.style.dotScale !== undefined ? config.style.dotScale : 1.0;

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        const isActive = data[r * matrixSize + c] === 1;
        if (!isActive) continue;

        // Skip logo central area
        if (isCellInLogoArea(r, c, matrixSize)) continue;

        // Skip corner finder patterns (eyes)
        const eyeStatus = isCellInEye(r, c, matrixSize);
        if (eyeStatus.inEye) continue;

        const x = qrMinX + c * mSize;
        const y = qrMinY + r * mSize;

        const scaledSize = mSize * S;
        const offset = (mSize - scaledSize) / 2;
        const sx = x + offset;
        const sy = y + offset;

        // Depending on style
        const dotStyle = config.style.dotStyle;

        if (dotStyle === 'square') {
          ctx.rect(sx, sy, scaledSize, scaledSize);
        } else if (dotStyle === 'circle') {
          const cx = x + mSize / 2;
          const cy = y + mSize / 2;
          const radius = (mSize / 2) * S * 0.85;
          ctx.moveTo(cx + radius, cy);
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        } else if (dotStyle === 'rounded') {
          drawRoundedCell(ctx, sx, sy, scaledSize, scaledSize * 0.32);
        } else if (dotStyle === 'fluid') {
          const neighbors = {
            top: r > 0 && data[(r - 1) * matrixSize + c] === 1 && !isCellInEye(r - 1, c, matrixSize).inEye && !isCellInLogoArea(r - 1, c, matrixSize),
            bottom: r < matrixSize - 1 && data[(r + 1) * matrixSize + c] === 1 && !isCellInEye(r + 1, c, matrixSize).inEye && !isCellInLogoArea(r + 1, c, matrixSize),
            left: c > 0 && data[r * matrixSize + (c - 1)] === 1 && !isCellInEye(r, c - 1, matrixSize).inEye && !isCellInLogoArea(r, c - 1, matrixSize),
            right: c < matrixSize - 1 && data[r * matrixSize + (c + 1)] === 1 && !isCellInEye(r, c + 1, matrixSize).inEye && !isCellInLogoArea(r, c + 1, matrixSize),
          };
          drawFluidCell(ctx, sx, sy, scaledSize, neighbors);
        } else if (dotStyle === 'diamond') {
          drawDiamond(ctx, sx, sy, scaledSize);
        } else if (dotStyle === 'star') {
          drawStar(ctx, sx, sy, scaledSize);
        } else if (dotStyle === 'plus') {
          drawPlus(ctx, sx, sy, scaledSize);
        } else if (dotStyle === 'ring') {
          drawRing(ctx, sx, sy, scaledSize);
        } else if (dotStyle === 'hexagon') {
          drawHexagon(ctx, sx, sy, scaledSize);
        }
      }
    }
    // Fill all the modules at once for fast canvas rendering!
    ctx.fill();

    // 3. Draw Eyes (Finder Patterns)
    const drawEye = (r: number, c: number, corner: 'TL' | 'TR' | 'BL') => {
      const eyeScale = config.style.eyeScale ?? 1.0;
      const eyeBallScale = config.style.eyeBallScale ?? 1.0;

      const eyeX = qrMinX + c * mSize;
      const eyeY = qrMinY + r * mSize;
      const eyeSize = 7 * mSize;

      const scaledEyeSize = eyeSize * eyeScale;
      const cx = eyeX + 3.5 * mSize;
      const cy = eyeY + 3.5 * mSize;
      const x_scaled = cx - scaledEyeSize / 2;
      const y_scaled = cy - scaledEyeSize / 2;
      const mSize_scaled = mSize * eyeScale;

      // Establish colors for eye
      let eyeFrameFill = fgColor;
      let eyeBallFill = fgColor;

      if (config.style.customEyeColor) {
        if (config.style.eyeFrameGradient) {
          eyeFrameFill = makeCanvasColor(ctx, config.style.eyeFrameGradient, x_scaled, y_scaled, scaledEyeSize, scaledEyeSize);
        }
        if (config.style.eyeBallGradient) {
          const ballSize_est = 3 * mSize * eyeBallScale;
          eyeBallFill = makeCanvasColor(
            ctx,
            config.style.eyeBallGradient,
            cx - ballSize_est / 2,
            cy - ballSize_est / 2,
            ballSize_est,
            ballSize_est
          );
        }
      }

      // Draw Outer Frame
      ctx.fillStyle = eyeFrameFill;
      drawEyeOuterFramePath(ctx, x_scaled, y_scaled, scaledEyeSize, mSize_scaled, config.style.eyeFrameStyle, corner);
      ctx.fill('evenodd');

      // Draw Inner Ball
      ctx.fillStyle = eyeBallFill;
      const scaledBallSize = 3 * mSize * eyeBallScale;
      const ballX_scaled = cx - scaledBallSize / 2;
      const ballY_scaled = cy - scaledBallSize / 2;
      drawEyeBallPath(
        ctx,
        ballX_scaled,
        ballY_scaled,
        scaledBallSize,
        config.style.eyeBallStyle,
        corner
      );
      ctx.fill();
    };

    // Draw the 3 eyes
    drawEye(0, 0, 'TL'); // Top-Left
    drawEye(0, matrixSize - 7, 'TR'); // Top-Right
    drawEye(matrixSize - 7, 0, 'BL'); // Bottom-Left

    // 4. Draw Overlaid central Logo
    if (config.logo.sourceType !== 'none' && logoImage) {
      const pSize = config.logo.sizePercent;
      const logoPx = qrActiveSize * (pSize / 100);
      const logoX = qrMinX + (qrActiveSize - logoPx) / 2;
      const logoY = qrMinY + (qrActiveSize - logoPx) / 2;

      ctx.save();

      // Background or container
      if (config.logo.bgType !== 'none') {
        const border = config.logo.borderWidth;
        const totalLogoPxWithBorder = logoPx + 2 * border;
        const containerX = logoX - border;
        const containerY = logoY - border;

        ctx.fillStyle = config.logo.bgColor;
        ctx.beginPath();
        if (config.logo.bgType === 'circle') {
          ctx.arc(
            containerX + totalLogoPxWithBorder / 2,
            containerY + totalLogoPxWithBorder / 2,
            totalLogoPxWithBorder / 2,
            0,
            Math.PI * 2
          );
        } else if (config.logo.bgType === 'rounded') {
          const radius = totalLogoPxWithBorder * 0.25;
          ctx.roundRect ? ctx.roundRect(containerX, containerY, totalLogoPxWithBorder, totalLogoPxWithBorder, radius) : ctx.rect(containerX, containerY, totalLogoPxWithBorder, totalLogoPxWithBorder);
        }
        ctx.fill();

        // Optional Border
        if (border > 0 && config.logo.borderColor) {
          ctx.strokeStyle = config.logo.borderColor;
          ctx.lineWidth = border;
          ctx.stroke();
        }
      }

      // Clip logo drawing itself inside background shape
      ctx.beginPath();
      if (config.logo.bgType === 'circle') {
        ctx.arc(logoX + logoPx / 2, logoY + logoPx / 2, logoPx / 2, 0, Math.PI * 2);
        ctx.clip();
      } else if (config.logo.bgType === 'rounded') {
        ctx.roundRect ? ctx.roundRect(logoX, logoY, logoPx, logoPx, logoPx * 0.2) : ctx.rect(logoX, logoY, logoPx, logoPx);
        ctx.clip();
      }

      // Draw the image
      ctx.drawImage(logoImage, logoX, logoY, logoPx, logoPx);
      ctx.restore();
    }
  };

  // Keep preview Canvas updated and verify scannability in real time
  useEffect(() => {
    if (canvasRef.current && qrMatrix) {
      drawQR(canvasRef.current, size);
      
      // Perform real-time QR code decoding check
      try {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, size, size);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code) {
            if (onScanVerify) onScanVerify({ success: true, data: code.data });
          } else {
            if (onScanVerify) onScanVerify({ success: false });
          }
        }
      } catch (err) {
        console.error('Real-time QR verification failed:', err);
        if (onScanVerify) onScanVerify({ success: false });
      }
    }
  }, [qrMatrix, config, logoImage, size, onScanVerify]);

  // SVG Export construction
  const generateSVGString = (targetSize: number = 1024): string => {
    if (!qrMatrix) return '';
    const { size: matrixSize, data } = qrMatrix;
    const { margin } = config.style;
    const totalModules = matrixSize + 2 * margin;
    const mSize = targetSize / totalModules;

    // Coordinates coordinates helper
    const qrMinX = margin * mSize;
    const qrMinY = margin * mSize;
    const qrActiveSize = matrixSize * mSize;

    // Create SVG defs for gradients
    const makeSvgGradient = (id: string, grad: GradientColor): string => {
      const colors = [grad.color1];
      if (grad.color2) colors.push(grad.color2);
      if (grad.color3) colors.push(grad.color3);
      if (grad.color4) colors.push(grad.color4);
      if (grad.color5) colors.push(grad.color5);

      if (grad.type === 'solid' || colors.length <= 1) {
        return '';
      }

      const stopTags = colors.map((col, idx) => {
        const offset = Math.round((idx / (colors.length - 1)) * 100);
        return `<stop offset="${offset}%" stop-color="${col}" />`;
      }).join('\n            ');

      if (grad.type === 'linear' || grad.type === 'conic') {
        const x1 = Math.round(50 - Math.cos(((grad.angle || 0) * Math.PI) / 180) * 50);
        const y1 = Math.round(50 - Math.sin(((grad.angle || 0) * Math.PI) / 180) * 50);
        const x2 = Math.round(50 + Math.cos(((grad.angle || 0) * Math.PI) / 180) * 50);
        const y2 = Math.round(50 + Math.sin(((grad.angle || 0) * Math.PI) / 180) * 50);
        return `
          <linearGradient id="${id}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
            ${stopTags}
          </linearGradient>
        `;
      }
      if (grad.type === 'diagonal') {
        return `
          <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
            ${stopTags}
          </linearGradient>
        `;
      }
      if (grad.type === 'radial') {
        return `
          <radialGradient id="${id}" cx="50%" cy="50%" r="50%">
            ${stopTags}
          </radialGradient>
        `;
      }
      return '';
    };

    const gradientDefs = [
      makeSvgGradient('svgBgGrad', config.style.bgGradient),
      makeSvgGradient('svgFgGrad', config.style.fgGradient),
      config.style.customEyeColor && config.style.eyeFrameGradient ? makeSvgGradient('svgEyeFrameGrad', config.style.eyeFrameGradient) : '',
      config.style.customEyeColor && config.style.eyeBallGradient ? makeSvgGradient('svgEyeBallGrad', config.style.eyeBallGradient) : '',
    ].filter(Boolean).join('\n');

    // Solid or Gradient Fillers in SVG
    const getSvgFillValue = (id: string, grad: GradientColor) => {
      const hasGradient = grad.type !== 'solid' && (grad.color2 || grad.color3 || grad.color4 || grad.color5);
      return hasGradient ? `url(#${id})` : grad.color1;
    };

    const bgFill = config.style.useTransparentBg ? 'none' : getSvgFillValue('svgBgGrad', config.style.bgGradient);
    const fgFill = getSvgFillValue('svgFgGrad', config.style.fgGradient);

    // Dynamic Dot Paths
    let dotsPath = '';

    const addStarPath = (x: number, y: number, rSize: number) => {
      const cx = x + rSize / 2;
      const cy = y + rSize / 2;
      const r = rSize * 0.52;
      dotsPath += ` M ${cx} ${cy - r} Q ${cx} ${cy} ${cx + r} ${cy} Q ${cx} ${cy} ${cx} ${cy + r} Q ${cx} ${cy} ${cx - r} ${cy} Q ${cx} ${cy} ${cx} ${cy - r} Z`;
    };

    const addDiamondPath = (x: number, y: number, rSize: number) => {
      const cx = x + rSize / 2;
      const cy = y + rSize / 2;
      const r = rSize * 0.5;
      dotsPath += ` M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
    };

    const addPlusPath = (x: number, y: number, rSize: number) => {
      const cx = x + rSize / 2;
      const cy = y + rSize / 2;
      const thick = rSize * 0.35;
      dotsPath += ` M ${cx - thick/2} ${y} L ${cx + thick/2} ${y} L ${cx + thick/2} ${cy - thick/2} L ${x + rSize} ${cy - thick/2} L ${x + rSize} ${cy + thick/2} L ${cx + thick/2} ${cy + thick/2} L ${cx + thick/2} ${y + rSize} L ${cx - thick/2} ${y + rSize} L ${cx - thick/2} ${cy + thick/2} L ${x} ${cy + thick/2} L ${x} ${cy - thick/2} L ${cx - thick/2} ${cy - thick/2} Z`;
    };

    const addRingPath = (x: number, y: number, rSize: number) => {
      const cx = x + rSize / 2;
      const cy = y + rSize / 2;
      const rOuter = rSize * 0.46;
      const rInner = rSize * 0.22;
      dotsPath += ` M ${cx + rOuter} ${cy} A ${rOuter},${rOuter} 0 1,1 ${cx - rOuter},${cy} A ${rOuter},${rOuter} 0 1,1 ${cx + rOuter},${cy} M ${cx + rInner} ${cy} A ${rInner},${rInner} 0 1,0 ${cx - rInner},${cy} A ${rInner},${rInner} 0 1,0 ${cx + rInner},${cy}`;
    };

    const addHexagonPath = (x: number, y: number, rSize: number) => {
      const cx = x + rSize / 2;
      const cy = y + rSize / 2;
      const r = rSize * 0.52;
      dotsPath += ` M`;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const hx = cx + Math.cos(angle) * r;
        const hy = cy + Math.sin(angle) * r;
        dotsPath += ` ${hx} ${hy}${i < 5 ? ' L' : ''}`;
      }
      dotsPath += ' Z';
    };

    const addRoundedCellPath = (x: number, y: number, rSize: number, rad: number) => {
      dotsPath += ` M ${x + rad} ${y} L ${x + rSize - rad} ${y} Q ${x + rSize} ${y} ${x + rSize} ${y + rad} L ${x + rSize} ${y + rSize - rad} Q ${x + rSize} ${y + rSize} ${x + rSize - rad} ${y + rSize} L ${x + rad} ${y + rSize} Q ${x} ${y + rSize} ${x} ${y + rSize - rad} L ${x} ${y + rad} Q ${x} ${y} ${x + rad} ${y} Z`;
    };

    const addFluidCellPath = (
      x: number,
      y: number,
      rSize: number,
      neighbors: { top: boolean; bottom: boolean; left: boolean; right: boolean }
    ) => {
      const r = rSize * 0.45;
      const rightX = x + rSize;
      const bottomY = y + rSize;

      // Start path with Top-Left
      dotsPath += ' M';
      if (neighbors.top || neighbors.left) {
        dotsPath += ` ${x} ${y}`;
      } else {
        dotsPath += ` ${x + r} ${y} Q ${x} ${y} ${x} ${y + r}`;
      }

      // Bottom-Left
      if (neighbors.bottom || neighbors.left) {
        dotsPath += ` L ${x} ${bottomY}`;
      } else {
        dotsPath += ` L ${x} ${bottomY - r} Q ${x} ${bottomY} ${x + r} ${bottomY}`;
      }

      // Bottom-Right
      if (neighbors.bottom || neighbors.right) {
        dotsPath += ` L ${rightX} ${bottomY}`;
      } else {
        dotsPath += ` L ${rightX - r} ${bottomY} Q ${rightX} ${bottomY} ${rightX} ${bottomY - r}`;
      }

      // Top-Right
      if (neighbors.top || neighbors.right) {
        dotsPath += ` L ${rightX} ${y}`;
      } else {
        dotsPath += ` L ${rightX} ${y + r} Q ${rightX} ${y} ${rightX - r} ${y}`;
      }
      dotsPath += ' Z';
    };

    const S_svg = config.style.dotScale !== undefined ? config.style.dotScale : 1.0;

    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        const isActive = data[r * matrixSize + c] === 1;
        if (!isActive) continue;

        if (isCellInLogoArea(r, c, matrixSize)) continue;

        const eyeStatus = isCellInEye(r, c, matrixSize);
        if (eyeStatus.inEye) continue;

        const x = qrMinX + c * mSize;
        const y = qrMinY + r * mSize;

        const scaledSize = mSize * S_svg;
        const offset = (mSize - scaledSize) / 2;
        const sx = x + offset;
        const sy = y + offset;

        const dotStyle = config.style.dotStyle;

        if (dotStyle === 'square') {
          dotsPath += ` M ${sx} ${sy} h ${scaledSize} v ${scaledSize} h ${-scaledSize} Z`;
        } else if (dotStyle === 'circle') {
          const radius = (mSize / 2) * S_svg * 0.85;
          dotsPath += ` M ${x + mSize/2} ${y + mSize/2} m ${-radius}, 0 a ${radius},${radius} 0 1,0 ${radius*2},0 a ${radius},${radius} 0 1,0 ${-radius*2},0`;
        } else if (dotStyle === 'rounded') {
          addRoundedCellPath(sx, sy, scaledSize, scaledSize * 0.32);
        } else if (dotStyle === 'fluid') {
          const neighbors = {
            top: r > 0 && data[(r - 1) * matrixSize + c] === 1 && !isCellInEye(r - 1, c, matrixSize).inEye && !isCellInLogoArea(r - 1, c, matrixSize),
            bottom: r < matrixSize - 1 && data[(r + 1) * matrixSize + c] === 1 && !isCellInEye(r + 1, c, matrixSize).inEye && !isCellInLogoArea(r + 1, c, matrixSize),
            left: c > 0 && data[r * matrixSize + (c - 1)] === 1 && !isCellInEye(r, c - 1, matrixSize).inEye && !isCellInLogoArea(r, c - 1, matrixSize),
            right: c < matrixSize - 1 && data[r * matrixSize + (c + 1)] === 1 && !isCellInEye(r, c + 1, matrixSize).inEye && !isCellInLogoArea(r, c + 1, matrixSize),
          };
          addFluidCellPath(sx, sy, scaledSize, neighbors);
        } else if (dotStyle === 'diamond') {
          addDiamondPath(sx, sy, scaledSize);
        } else if (dotStyle === 'star') {
          addStarPath(sx, sy, scaledSize);
        } else if (dotStyle === 'plus') {
          addPlusPath(sx, sy, scaledSize);
        } else if (dotStyle === 'ring') {
          addRingPath(sx, sy, scaledSize);
        } else if (dotStyle === 'hexagon') {
          addHexagonPath(sx, sy, scaledSize);
        }
      }
    }

    // Direct eye SVG path computations
    const makeEyeSvgPath = (r: number, c: number, corner: 'TL' | 'TR' | 'BL') => {
      const eyeScale = config.style.eyeScale ?? 1.0;
      const eyeBallScale = config.style.eyeBallScale ?? 1.0;

      const eyeX = qrMinX + c * mSize;
      const eyeY = qrMinY + r * mSize;
      const eyeSize = 7 * mSize;

      const scaledEyeSize = eyeSize * eyeScale;
      const cx = eyeX + 3.5 * mSize;
      const cy = eyeY + 3.5 * mSize;
      const eyeX_scaled = cx - scaledEyeSize / 2;
      const eyeY_scaled = cy - scaledEyeSize / 2;
      const mSize_scaled = mSize * eyeScale;

      const styleFrame = config.style.eyeFrameStyle;
      const styleBall = config.style.eyeBallStyle;

      const outerRadius = scaledEyeSize * 0.28;
      const innerRadius = (5 * mSize_scaled) * 0.20;

      // 1. Frame outer path
      let frameOuterD = '';
      if (styleFrame === 'square') {
        frameOuterD = `M ${eyeX_scaled} ${eyeY_scaled} h ${scaledEyeSize} v ${scaledEyeSize} h ${-scaledEyeSize} Z`;
      } else if (styleFrame === 'rounded' || styleFrame === 'shield' || styleFrame === 'leaf') {
        let rList = [outerRadius, outerRadius, outerRadius, outerRadius];
        if (styleFrame === 'shield') {
          if (corner === 'TL') rList[2] = 2; // Bottom-Right sharper
          if (corner === 'TR') rList[3] = 2; // Bottom-Left sharper
          if (corner === 'BL') rList[1] = 2; // Top-Right sharper
        } else if (styleFrame === 'leaf') {
          if (corner === 'TL') { rList[0] = scaledEyeSize * 0.55; rList[2] = scaledEyeSize * 0.55; rList[1] = 2; rList[3] = 2; }
          if (corner === 'TR') { rList[1] = scaledEyeSize * 0.55; rList[3] = scaledEyeSize * 0.55; rList[0] = 2; rList[2] = 2; }
          if (corner === 'BL') { rList[1] = scaledEyeSize * 0.55; rList[3] = scaledEyeSize * 0.55; rList[0] = 2; rList[2] = 2; }
        }
        
        // Custom path with custom radii
        frameOuterD = `M ${eyeX_scaled + rList[0]} ${eyeY_scaled} 
          L ${eyeX_scaled + scaledEyeSize - rList[1]} ${eyeY_scaled} 
          Q ${eyeX_scaled + scaledEyeSize} ${eyeY_scaled} ${eyeX_scaled + scaledEyeSize} ${eyeY_scaled + rList[1]} 
          L ${eyeX_scaled + scaledEyeSize} ${eyeY_scaled + scaledEyeSize - rList[2]} 
          Q ${eyeX_scaled + scaledEyeSize} ${eyeY_scaled + scaledEyeSize} ${eyeX_scaled + scaledEyeSize - rList[2]} ${eyeY_scaled + scaledEyeSize} 
          L ${eyeX_scaled + rList[3]} ${eyeY_scaled + scaledEyeSize} 
          Q ${eyeX_scaled} ${eyeY_scaled + scaledEyeSize} ${eyeX_scaled} ${eyeY_scaled + scaledEyeSize - rList[3]} 
          L ${eyeX_scaled} ${eyeY_scaled + rList[0]} 
          Q ${eyeX_scaled} ${eyeY_scaled} ${eyeX_scaled + rList[0]} ${eyeY_scaled} Z`;
      } else if (styleFrame === 'circle') {
        frameOuterD = `M ${eyeX_scaled + scaledEyeSize/2} ${eyeY_scaled} a ${scaledEyeSize/2},${scaledEyeSize/2} 0 1,0 0.0001,0 Z`;
      }

      // 2. Frame inner (cutout path in counter-clockwise direction)
      const holeX = eyeX_scaled + mSize_scaled;
      const holeY = eyeY_scaled + mSize_scaled;
      const holeSize = 5 * mSize_scaled;
      let frameInnerD = '';

      if (styleFrame === 'square') {
        frameInnerD = `M ${holeX} ${holeY} v ${holeSize} h ${holeSize} v ${-holeSize} Z`; // CCW (counter-clockwise)
      } else if (styleFrame === 'rounded' || styleFrame === 'shield' || styleFrame === 'leaf') {
        let rHole = [innerRadius, innerRadius, innerRadius, innerRadius];
        if (styleFrame === 'leaf') {
          if (corner === 'TL') { rHole[0] = holeSize * 0.55; rHole[2] = holeSize * 0.55; rHole[1] = 2; rHole[3] = 2; }
          if (corner === 'TR') { rHole[1] = holeSize * 0.55; rHole[3] = holeSize * 0.55; rHole[0] = 2; rHole[2] = 2; }
          if (corner === 'BL') { rHole[1] = holeSize * 0.55; rHole[3] = holeSize * 0.55; rHole[0] = 2; rHole[2] = 2; }
        }

        frameInnerD = `M ${holeX + rHole[0]} ${holeY} 
          Q ${holeX} ${holeY} ${holeX} ${holeY + rHole[0]} 
          L ${holeX} ${holeY + holeSize - rHole[3]} 
          Q ${holeX} ${holeY + holeSize} ${holeX + rHole[3]} ${holeY + holeSize} 
          L ${holeX + holeSize - rHole[2]} ${holeY + holeSize} 
          Q ${holeX + holeSize} ${holeY + holeSize} ${holeX + holeSize} ${holeY + holeSize - rHole[2]} 
          L ${holeX + holeSize} ${holeY + rHole[1]} 
          Q ${holeX + holeSize} ${holeY} ${holeX + holeSize - rHole[1]} ${holeY} Z`; // Counter-clockwise fill orientation
      } else if (styleFrame === 'circle') {
        frameInnerD = `M ${holeX + holeSize/2} ${holeY + holeSize} a ${holeSize/2},${holeSize/2} 0 1,1 0.0001,0 Z`;
      }

      // Combined frame vector path (evenodd hollow)
      const framePath = `${frameOuterD} ${frameInnerD}`;

      // 3. Eye Ball path
      const ballSize = 3 * mSize * eyeBallScale;
      const ballX = cx - ballSize / 2;
      const ballY = cy - ballSize / 2;

      let ballD = '';
      const bRad = ballSize * 0.28;
      if (styleBall === 'square') {
        ballD = `M ${ballX} ${ballY} h ${ballSize} v ${ballSize} h ${-ballSize} Z`;
      } else if (styleBall === 'rounded' || styleBall === 'leaf') {
        let rBall = [bRad, bRad, bRad, bRad];
        if (styleBall === 'leaf') {
          if (corner === 'TL') { rBall[0] = ballSize * 0.5; rBall[2] = ballSize * 0.5; rBall[1] = 1; rBall[3] = 1; }
          if (corner === 'TR') { rBall[1] = ballSize * 0.5; rBall[3] = ballSize * 0.5; rBall[0] = 1; rBall[2] = 1; }
          if (corner === 'BL') { rBall[1] = ballSize * 0.5; rBall[3] = ballSize * 0.5; rBall[0] = 1; rBall[2] = 1; }
        }

        ballD = `M ${ballX + rBall[0]} ${ballY}
          L ${ballX + ballSize - rBall[1]} ${ballY}
          Q ${ballX + ballSize} ${ballY} ${ballX + ballSize} ${ballY + rBall[1]}
          L ${ballX + ballSize} ${ballY + ballSize - rBall[2]}
          Q ${ballX + ballSize} ${ballY + ballSize} ${ballX + ballSize - rBall[2]} ${ballY + ballSize}
          L ${ballX + rBall[3]} ${ballY + ballSize}
          Q ${ballX} ${ballY + ballSize} ${ballX} ${ballY + ballSize - rBall[3]}
          L ${ballX} ${ballY + rBall[0]}
          Q ${ballX} ${ballY} ${ballX + rBall[0]} ${ballY} Z`;
      } else if (styleBall === 'circle') {
        ballD = `M ${ballX + ballSize/2} ${ballY} a ${ballSize/2},${ballSize/2} 0 1,0 0.0001,0 Z`;
      } else if (styleBall === 'diamond') {
        const cxBall = ballX + ballSize/2;
        const cyBall = ballY + ballSize/2;
        const rBall = ballSize/2;
        ballD = `M ${cxBall} ${cyBall - rBall} L ${cxBall + rBall} ${cyBall} L ${cxBall} ${cyBall + rBall} L ${cxBall - rBall} Z`;
      }

      // Eye frame & ball colors in SVG
      let frameSvgColor = fgFill;
      let ballSvgColor = fgFill;

      if (config.style.customEyeColor) {
        if (config.style.eyeFrameGradient) frameSvgColor = getSvgFillValue('svgEyeFrameGrad', config.style.eyeFrameGradient);
        if (config.style.eyeBallGradient) ballSvgColor = getSvgFillValue('svgEyeBallGrad', config.style.eyeBallGradient);
      }

      return `
        <path d="${framePath}" fill="${frameSvgColor}" fill-rule="evenodd" />
        <path d="${ballD}" fill="${ballSvgColor}" />
      `;
    };

    const eyeTL = makeEyeSvgPath(0, 0, 'TL');
    const eyeTR = makeEyeSvgPath(0, matrixSize - 7, 'TR');
    const eyeBL = makeEyeSvgPath(matrixSize - 7, 0, 'BL');

    // Inside SVG: Draw Overlaid Vector Logo
    let logoSvgElement = '';
    if (config.logo.sourceType !== 'none') {
      const pSize = config.logo.sizePercent;
      const logoPx = qrActiveSize * (pSize / 100);
      const logoX = qrMinX + (qrActiveSize - logoPx) / 2;
      const logoY = qrMinY + (qrActiveSize - logoPx) / 2;

      let backgroundShape = '';
      if (config.logo.bgType !== 'none') {
        const border = config.logo.borderWidth;
        const totalLogoPxWithBorder = logoPx + 2 * border;
        const containerX = logoX - border;
        const containerY = logoY - border;

        if (config.logo.bgType === 'circle') {
          backgroundShape = `
            <circle cx="${containerX + totalLogoPxWithBorder / 2}" cy="${containerY + totalLogoPxWithBorder / 2}" r="${totalLogoPxWithBorder / 2}" fill="${config.logo.bgColor}" ${border > 0 ? `stroke="${config.logo.borderColor}" stroke-width="${border}"` : ''} />
          `;
        } else if (config.logo.bgType === 'rounded') {
          const r = totalLogoPxWithBorder * 0.25;
          backgroundShape = `
            <rect x="${containerX}" y="${containerY}" width="${totalLogoPxWithBorder}" height="${totalLogoPxWithBorder}" rx="${r}" ry="${r}" fill="${config.logo.bgColor}" ${border > 0 ? `stroke="${config.logo.borderColor}" stroke-width="${border}"` : ''} />
          `;
        }
      }

      // Render preset SVG icon or loaded image URL
      let logoContent = '';
      if (config.logo.sourceType === 'preset' && config.logo.presetKey) {
        const preset = PRESET_LOGOS.find((l) => l.id === config.logo.presetKey);
        if (preset) {
          // Embed direct vector tags! No rasterization!
          let inlineSvg = preset.svg
            .replace(/stroke="currentColor"/g, `stroke="${preset.color}"`)
            .replace(/fill="currentColor"/g, `fill="${preset.color}"`);

          // Strip standard svg attributes to embed nestedly
          inlineSvg = inlineSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
          logoContent = `
            <g transform="translate(${logoX}, ${logoY}) scale(${logoPx / 24})">
              ${inlineSvg}
            </g>
          `;
        }
      } else if (config.logo.sourceType === 'upload' && logoImage) {
        // Embed uploaded image or user selected SVG
        logoContent = `
          <image href="${config.logo.uploadUrl || ''}" x="${logoX}" y="${logoY}" width="${logoPx}" height="${logoPx}" />
        `;
      }

      logoSvgElement = `
        <g>
          ${backgroundShape}
          ${logoContent}
        </g>
      `;
    }

    return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${targetSize} ${targetSize}" width="100%" height="100%">
  <defs>
    ${gradientDefs}
  </defs>
  ${(() => {
    if (bgFill !== 'none') {
      const bgRadiusPercent = config.style.bgRounded ?? 0;
      const bgBWidth = config.style.bgBorderWidth ?? 0;
      const bgBColor = config.style.bgBorderColor || config.style.fgGradient.color1;
      
      let strokeAttrs = '';
      if (bgBWidth > 0) {
        strokeAttrs = `stroke="${bgBColor}" stroke-width="${bgBWidth * (targetSize / 1000)}"`;
      }
      
      const strokeOffset = (bgBWidth * (targetSize / 1000)) / 2;
      const widthVal = targetSize - bgBWidth * (targetSize / 1000);
      
      if (bgRadiusPercent > 0) {
        return `<rect x="${strokeOffset}" y="${strokeOffset}" width="${widthVal}" height="${widthVal}" rx="${bgRadiusPercent}%" ry="${bgRadiusPercent}%" fill="${bgFill}" ${strokeAttrs} />`;
      } else {
        return `<rect x="${strokeOffset}" y="${strokeOffset}" width="${widthVal}" height="${widthVal}" fill="${bgFill}" ${strokeAttrs} />`;
      }
    }
    return '';
  })()}
  
  <!-- QR Code Foreground modules -->
  <path d="${dotsPath}" fill="${fgFill}" />
  
  <!-- Customized Eyes -->
  ${eyeTL}
  ${eyeTR}
  ${eyeBL}
  
  <!-- Logo container & Content -->
  ${logoSvgElement}
</svg>`;
  };

  // Expose trigger hooks to parent
  useEffect(() => {
    if (exportTrigger) {
      exportTrigger({
        downloadPNG: (resolution: number = 1024) => {
          if (!qrMatrix) return;
          // Render a high resolution canvas temporarily
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = resolution;
          tempCanvas.height = resolution;
          drawQR(tempCanvas, resolution);

          // Convert to dataURL and save
          const link = document.createElement('a');
          link.download = `pixel-qrcode-${Date.now()}.png`;
          link.href = tempCanvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        downloadSVG: () => {
          const svgContent = generateSVGString(1024);
          const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `pixel-qrcode-${Date.now()}.svg`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        },
        getSVGString: () => {
          return generateSVGString(512);
        }
      });
    }
  }, [qrMatrix, config, logoImage, exportTrigger]);

  return (
    <div className="relative flex flex-col items-center justify-center bg-transparent max-w-full">
      {/* Background shadow accent glow based on config colors */}
      <div 
        className="absolute inset-0 rounded-3xl blur-3xl opacity-15 pointer-events-none transition-all duration-700" 
        style={{
          background: `radial-gradient(circle, ${config.style.fgGradient.color1} 0%, ${config.style.fgGradient.color2 || config.style.fgGradient.color1} 100%)`
        }} 
      />

      <div 
        className="relative z-10 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300"
        style={{
          boxShadow: `0 25px 50px -12px ${config.style.fgGradient.color1}1A`
        }}
      >
        {!config.value ? (
          <div 
            className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl w-full max-w-[280px] sm:max-w-[300px] 2xl:max-w-[400px]"
            style={{ aspectRatio: '1/1' }}
          >
            <div className="text-slate-400 font-medium text-center px-6">
              <span className="block text-2xl mb-2 text-indigo-400 font-semibold">Ready to Generate</span>
              Type something on the left to watch your designer QR Code compile live!
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-[280px] sm:max-w-[300px] 2xl:max-w-[400px]">
            <canvas
              id="qr-output-canvas"
              ref={canvasRef}
              width={size}
              height={size}
              className="rounded-lg shadow-inner block w-full h-auto"
              style={{
                aspectRatio: '1/1',
              }}
            />
            {imageError && (
              <div className="absolute inset-x-0 bottom-0 py-2 px-3 m-4 bg-red-900/90 backdrop-blur border border-red-500/20 rounded-lg text-[11px] text-red-200 text-center">
                ⚠️ {imageError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
