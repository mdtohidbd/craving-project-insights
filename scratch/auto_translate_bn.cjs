const fs = require('fs');

async function translateText(text, targetLang) {
    try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        return data[0].map(item => item[0]).join('');
    } catch (err) {
        console.error("Translation error:", err);
        return text;
    }
}

async function main() {
    const bnPath = 'e:/MY-Portfolio/lovable/restaurant-1/craving-project-insights/src/locales/bn/translation.json';
    const bn = JSON.parse(fs.readFileSync(bnPath, 'utf8'));
    let count = 0;
    
    for (const category in bn) {
        for (const key in bn[category]) {
            const text = bn[category][key];
            // Only translate if it contains english letters
            if (/[a-zA-Z]/.test(text)) {
                console.log(`Translating: ${text}`);
                const translated = await translateText(text, 'bn');
                bn[category][key] = translated;
                count++;
                if (count % 10 === 0) {
                    fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2));
                    console.log(`Saved ${count} translations`);
                    await new Promise(r => setTimeout(r, 1000)); // Sleep to prevent rate limit
                }
            }
        }
    }
    
    fs.writeFileSync(bnPath, JSON.stringify(bn, null, 2));
    console.log(`Finished translating ${count} items.`);
}

main();
