const fs = require('fs');
const data = fs.readFileSync('audio_mapping.json', 'utf16le');
const methods = JSON.parse(data);

let tsCode = 'const HEART_METHODS = [\n';
methods.forEach(method => {
  const escapedText = method.text.replace(/'/g, "\\'");
  tsCode += `  {code: '${method.code}', text: '${escapedText}', file: '${method.file}'},\n`;
});
tsCode += '];\n\nexport default HEART_METHODS;\n';

fs.writeFileSync('src/heart_methods.ts', tsCode, 'utf8');
console.log('Generated src/heart_methods.ts');