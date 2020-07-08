const fs = require('fs');

console.log('Create Env');
fs.createReadStream('./src/environments/config/env.example.ts').pipe(fs.createWriteStream('./src/environments/config/env.ts'));