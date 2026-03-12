const fs = require('fs');
const path = require('path');
const fontPath = path.join(__dirname, 'public', 'fonts', 'ff-wahm-two.otf');
const buffer = fs.readFileSync(fontPath);
const base64 = buffer.toString('base64');
fs.writeFileSync('font_base64.txt', base64);
console.log('Font encoded to font_base64.txt');
