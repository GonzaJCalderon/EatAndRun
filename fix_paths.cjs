const fs=require('fs');
const path=require('path');
function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if(fs.statSync(p).isDirectory() && f !== 'node_modules') {
      walk(p);
    } else if (p.endsWith('.jsx')) {
      let c = fs.readFileSync(p, 'utf8');
      let originalC = c;
      c = c.replace(/src="\s+fotos\//g, 'src="/fotos/');
      c = c.replace(/src="\s+assets\//g, 'src="/assets/');
      if (c !== originalC) {
        console.log('Fixed', p);
        fs.writeFileSync(p, c);
      }
    }
  });
}
walk('./src');
