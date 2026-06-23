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
      c = c.replace(/\/\s*decoding="async"/g, 'decoding="async"');
      if (c !== originalC) {
        console.log('Cleaned JSX:', p);
        fs.writeFileSync(p, c);
      }
    }
  });
}
walk('./src');
