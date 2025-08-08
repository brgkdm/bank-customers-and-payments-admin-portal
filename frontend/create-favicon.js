const sharp = require('sharp');
const toIco = require('to-ico');
const fs = require('fs');

async function createFavicon() {
    try {
        // Convert SVG to PNG with different sizes
        const sizes = [16, 32, 48];
        const pngBuffers = [];
        
        for (const size of sizes) {
            const pngBuffer = await sharp('./public/bank-icon.svg')
                .resize(size, size)
                .png()
                .toBuffer();
            pngBuffers.push(pngBuffer);
        }
        
        // Create ICO file
        const icoBuffer = await toIco(pngBuffers);
        fs.writeFileSync('./public/favicon.ico', icoBuffer);
        
        console.log('Favicon created successfully!');
        
        // Also create a 16x16 PNG for modern browsers
        await sharp('./public/bank-icon.svg')
            .resize(16, 16)
            .png()
            .toFile('./public/favicon-16x16.png');
            
        // Create a 32x32 PNG for modern browsers
        await sharp('./public/bank-icon.svg')
            .resize(32, 32)
            .png()
            .toFile('./public/favicon-32x32.png');
            
        console.log('PNG favicons created successfully!');
        
    } catch (error) {
        console.error('Error creating favicon:', error);
    }
}

createFavicon();
