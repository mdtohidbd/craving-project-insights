const fs = require('fs');
const path = require('path');

function getAllTsx(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllTsx(file));
        } else if (file.endsWith('.tsx') && !file.includes('.bak')) {
            results.push(file);
        }
    });
    return results;
}

const allTsx = getAllTsx('e:/MY-Portfolio/lovable/restaurant-1/craving-project-insights/src');
let issues = [];
const badPattern = /t\("pos\.[^"]+",\s*"[^"]*[(){}=][^"]*"\)/g;
for (const file of allTsx) {
    const content = fs.readFileSync(file, 'utf8');
    const matches = content.match(badPattern);
    if (matches) {
        issues.push({ file: path.basename(file), count: matches.length, examples: matches.slice(0, 2) });
    }
}
issues.forEach(i => {
    console.log(i.file + ' [' + i.count + ']:', i.examples.join('\n  '));
});
console.log('Total files with issues:', issues.length);
