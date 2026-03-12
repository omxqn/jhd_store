const fs = require('fs');
const path = require('path');

const emailPath = path.join(__dirname, '..', 'lib', 'email.ts');
let content = fs.readFileSync(emailPath, 'utf8');

// Replace standard links
const oldImgTag = /<img src="\$\{process\.env\.NEXT_PUBLIC_BASE_URL \|\| 'https:\/\/jhd-line\.com'\}\/email-header\.png" alt="JHD Line Banner" width="100%" style="display: block; max-width: 100%; height: auto; border: 0;">/g;
const newImgTag = '<img src="${headerImgSrc}" alt="JHD Line Banner" width="100%" style="display: block; max-width: 100%; height: auto; border: 0; background-color: transparent;">';

content = content.replace(oldImgTag, newImgTag);

// Remove the yellow background from the td wrapping the image
const oldTdTag = /<td align="center" style="background-color: #fdf5ce;">\s*<img src="\$\{headerImgSrc\}"/g;
const newTdTag = '<td align="center" style="background-color: transparent;">\n                        <img src="${headerImgSrc}"';

content = content.replace(oldTdTag, newTdTag);

fs.writeFileSync(emailPath, content);
console.log('Done');
