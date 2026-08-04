const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/locales/en/translation.json', 'utf8'));
const bn = JSON.parse(fs.readFileSync('src/locales/bn/translation.json', 'utf8'));

let enCount = 0, bnCount = 0, bnEnglishCount = 0;
for (const cat in en) {
    enCount += Object.keys(en[cat]).length;
}
for (const cat in bn) {
    bnCount += Object.keys(bn[cat]).length;
    for (const key in bn[cat]) {
        const val = bn[cat][key];
        // Check if value has Bengali characters
        if (!/[\u0980-\u09FF]/.test(val)) {
            bnEnglishCount++;
        }
    }
}

console.log('EN keys:', enCount);
console.log('BN keys:', bnCount);
console.log('BN keys still in English (no Bengali chars):', bnEnglishCount);
console.log('BN keys translated to Bengali:', bnCount - bnEnglishCount);
console.log('Translation coverage:', ((bnCount - bnEnglishCount) / bnCount * 100).toFixed(1) + '%');
