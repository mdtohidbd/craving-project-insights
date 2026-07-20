const fs = require('fs');

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let orig = content;
    
    // Find all occurrences of a_name_join pattern and fix them
    // The pattern looks like: c.addOns.map(a=>{t("pos.a_name_join", "a.name).join(', '}")}
    // Should be: c.addOns.map(a => a.name).join(', ')
    
    // Use indexOf to find and manually replace
    let idx;
    while ((idx = content.indexOf('t("pos.a_name_join"')) >= 0) {
        // Find the start of the broken expression - go back to find 'map('
        const start = content.lastIndexOf('.map(a=>', idx);
        if (start < 0) break;
        
        // Find the end of the expression - the closing of the backtick template or the parent closing
        const end = content.indexOf('"})', idx);
        if (end < 0) break;
        
        const before = content.slice(0, start);
        const after = content.slice(end + 3); // skip "})
        
        content = before + '.map(a => a.name).join(\', \')' + after;
        console.log('Fixed a_name_join occurrence');
    }
    
    // Fix {t("pos.bdt", "BDT $")}{amount} in template literals (not JSX)
    // These appear as bare {t(...)} in template string context, not JSX
    content = content.split('\n').map((line, i) => {
        // Only fix lines that appear to be in template literal context (contain backtick or HTML)
        if (line.includes('{t("pos.bdt", "BDT $")}{') && (line.includes('</div>') || line.includes('<span>'))) {
            const fixed = line.replace(/\{t\("pos\.bdt", "BDT \$"\)\}\{/g, '\u09f3{');
            if (fixed !== line) console.log('Fixed BDT on line ' + (i + 1));
            return fixed;
        }
        return line;
    }).join('\n');
    
    if (content !== orig) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
}

const filesToFix = [
    'src/pages/admin/AdminPOS.tsx',
    'src/pages/admin/AdminOrders.tsx'
];

for (const file of filesToFix) {
    const fixed = fixFile(file);
    console.log(file + ':', fixed ? 'FIXED' : 'No changes');
}
