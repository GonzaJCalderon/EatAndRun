import sharp from 'sharp';
import fs from 'fs';

async function processImage(file) {
  const buffer = await sharp(file).resize(20).blur(10).toBuffer();
  const b64 = buffer.toString('base64');
  console.log(file + ' => ' + b64.substring(0, 50) + '...');
  return 'data:image/webp;base64,' + b64;
}

async function run() {
  const hero1 = await processImage('./public/fotos/sin-frase.webp');
  const hero2 = await processImage('./public/fotos/actividad.webp');
  
  let homeCss = fs.readFileSync('./src/pages/public/Home.css', 'utf8');
  if(!homeCss.includes('background-image')) {
    homeCss = homeCss.replace('.home-hero {', '.home-hero {\n  background-image: url("' + hero1 + '");\n  background-size: cover;\n  background-position: center;\n');
    fs.writeFileSync('./src/pages/public/Home.css', homeCss);
  }

  let pubCss = fs.readFileSync('./src/styles/public.css', 'utf8');
  if(!pubCss.includes('.page-hero {\\n  background-image')) {
    pubCss = pubCss.replace('.page-hero {', '.page-hero {\n  background-image: url("' + hero2 + '");\n  background-size: cover;\n  background-position: center;\n');
    fs.writeFileSync('./src/styles/public.css', pubCss);
  }
}
run();
