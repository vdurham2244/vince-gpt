import sharp from 'sharp';
import { promises as fs } from 'fs';

const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'icon-192x192.png' },
    { size: 512, name: 'icon-512x512.png' }
];

async function generateIcons() {
    try {
        const svg = await fs.readFile('./public/icon.svg');
        
        for (const { size, name } of sizes) {
            await sharp(svg)
                .resize(size, size)
                .png()
                .toFile(`./public/${name}`);
            console.log(`Generated ${name}`);
        }
        
        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons(); 