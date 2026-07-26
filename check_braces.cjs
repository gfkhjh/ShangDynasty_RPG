const fs = require('fs');
const content = fs.readFileSync('assets/scripts/YinXuCity.ts', 'utf8');
let depth = 0;
let closeCount = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') {
    depth++;
  } else if (content[i] === '}') {
    depth--;
    if (depth < 0) {
      console.log('Extra close at position', i);
      depth = 0;
    }
  }
}
console.log('open:', 0, 'close:', 0, 'diff:', 0);
console.log('Final depth:', depth);