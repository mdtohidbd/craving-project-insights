const fs = require('fs');

const enPath = 'e:/MY-Portfolio/lovable/restaurant-1/craving-project-insights/src/locales/en/translation.json';
const bnPath = 'e:/MY-Portfolio/lovable/restaurant-1/craving-project-insights/src/locales/bn/translation.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const bnData = JSON.parse(fs.readFileSync(bnPath, 'utf8'));

let added = 0;

for (let i = 2; i < process.argv.length; i++) {
    const file = process.argv[i];
    const content = fs.readFileSync(file, 'utf8');
    
    // Match t("category.key", "Default text"
    // Also match t('category.key', 'Default text'
    // Also match t(`category.key`, `Default text`
    const regex = /t\(\s*['"`]([^'"`]+)\.([^'"`]+)['"`]\s*,\s*(?:['"`]([^'"`]+)['"`]|`([^`]+)`)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const category = match[1];
        const key = match[2];
        const defaultText = match[3] || match[4];
        
        if (!enData[category]) enData[category] = {};
        if (!bnData[category]) bnData[category] = {};
        
        if (!enData[category][key]) {
            enData[category][key] = defaultText;
            added++;
        }
        
        if (!bnData[category][key]) {
            bnData[category][key] = defaultText;
        }
    }
}

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(bnPath, JSON.stringify(bnData, null, 2));

console.log(`Extracted ${added} new keys!`);
