const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dirs = ['./public/fotos', './public/assets', './src/assets/imgs', './src/assets'];

async function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.size > 200 * 1024) { 
        console.log(`Compressing ${filePath} (${(stat.size/1024/1024).toFixed(2)} MB)`);
        const tempPath = filePath + '.tmp';
        
        try {
            const image = sharp(filePath);
            const metadata = await image.metadata();
            
            if (metadata.format === 'png') {
                await image.png({ palette: true, quality: 60 }).toFile(tempPath);
            } else {
                await image.jpeg({ quality: 60 }).toFile(tempPath);
            }
            
            fs.renameSync(tempPath, filePath);
            const newStat = fs.statSync(filePath);
            console.log(`Done: ${(newStat.size/1024/1024).toFixed(2)} MB`);
        } catch (e) {
            console.error('Error with ' + filePath, e);
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
      }
    }
  }
}

async function run() {
  for (const dir of dirs) {
    await processDir(dir);
  }
  console.log("ALL DONE");
}
run();
