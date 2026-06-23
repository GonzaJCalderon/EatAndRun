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
      c = c.replace(/<img([^>]*?)\/\s*(decoding="async"|loading="lazy"|fetchPriority="high"|loading="eager")([^>]*?)>/g, '<img  />');
      c = c.replace(/<img([^>]*?)\/\s*>/g, '<img />');
      c = c.replace(/src="\s+fotos\//g, 'src="/fotos/');
      c = c.replace(/src="\s+assets\//g, 'src="/assets/');
      c = c.replace(/\/ \/>/g, '/>');
      c = c.replace(/<img([^>]+?)(?<!\/)>/g, (match) => {
        if(match.endsWith('/>')) return match;
        return match.substring(0, match.length-1) + ' />';
      });
      if (c !== originalC) fs.writeFileSync(p, c);
    }
  });
}
walk('./src');
