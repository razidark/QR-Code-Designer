const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

async function main() {
  const sizes = {
    'electron/icons/icon.png': 256,
    'build/icon.png': 256,
  };

  for (const [file, size] of Object.entries(sizes)) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await QRCode.toFile(file, 'PixelCraft QR Studio', {
      type: 'png',
      width: size,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#e0f7fa',
      },
    });
    console.log(`Created ${file} (${size}x${size})`);
  }

  // Create .ico from the 256px PNG (ICO format wraps PNG data directly)
  const pngPath = 'build/icon.png';
  const pngData = fs.readFileSync(pngPath);
  const icoPath = 'build/icon.ico';

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // ICO type
  header.writeUInt16LE(1, 4);     // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0);         // width (0=256)
  entry.writeUInt8(0, 1);         // height (0=256)
  entry.writeUInt8(0, 2);         // color palette
  entry.writeUInt8(0, 3);         // reserved
  entry.writeUInt16LE(1, 4);      // planes
  entry.writeUInt16LE(32, 6);     // bpp
  entry.writeUInt32LE(pngData.length, 8);   // image size
  entry.writeUInt32LE(22, 12);    // offset (6 + 16)

  const icoData = Buffer.concat([header, entry, pngData]);
  fs.writeFileSync(icoPath, icoData);
  console.log(`Created ${icoPath}`);
}

main().catch(console.error);
