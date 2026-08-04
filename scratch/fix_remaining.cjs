const fs = require('fs');

// Fix remaining patterns in AdminPOS.tsx
let content = fs.readFileSync('src/pages/admin/AdminPOS.tsx', 'utf8');
const orig = content;

// Find and fix remaining a_name_join patterns in template literals or JSX
const lines = content.split('\n');
let fixCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('a_name_join')) {
        // Replace the bad pattern with the correct expression
        let fixed = line;
        // Pattern: .map(a => {t("pos.a_name_join", "a.name).join(', '}")}
        // Replace with: .map(a => a.name).join(', ')
        const badIdx = fixed.indexOf('t("pos.a_name_join"');
        if (badIdx >= 0) {
            // Find the extent of the bad replacement
            const mapStart = fixed.lastIndexOf('.map(', badIdx);
            const closeEnd = fixed.indexOf('})', badIdx);
            if (mapStart >= 0 && closeEnd >= 0) {
                fixed = fixed.slice(0, mapStart) + '.map(a => a.name).join(\', \')' + fixed.slice(closeEnd + 2);
                fixCount++;
            }
        }
        lines[i] = fixed;
    }
    // Also fix the "total)" bad key pattern
    if (line.includes('t("pos.total", "total)"')) {
        lines[i] = line.replace(/\{t\("pos\.total", "total\)"\)\}/g, 'total)');
        fixCount++;
    }
}

content = lines.join('\n');

if (content !== orig) {
    fs.writeFileSync('src/pages/admin/AdminPOS.tsx', content);
    console.log('AdminPOS.tsx fixed, applied', fixCount, 'fixes');
} else {
    console.log('No changes to AdminPOS.tsx');
}

// Fix BookTable.tsx - "Special Requests" is legitimate text, just wrong key
content = fs.readFileSync('src/pages/BookTable.tsx', 'utf8');
if (content.includes('t("pos.special_requests", "Special Requests (Optional)")')) {
    content = content.replace(
        't("pos.special_requests", "Special Requests (Optional)")',
        't("pos.special_requests_optional", "Special Requests (Optional)")'
    );
    fs.writeFileSync('src/pages/BookTable.tsx', content);
    console.log('BookTable.tsx fixed');
}

// Fix Checkout.tsx 
content = fs.readFileSync('src/pages/Checkout.tsx', 'utf8');
if (content.includes('t("pos.chef_instructions", "Chef Instructions (Optional)")')) {
    content = content.replace(
        't("pos.chef_instructions", "Chef Instructions (Optional)")',
        't("pos.chef_instructions_optional", "Chef Instructions (Optional)")'
    );
    fs.writeFileSync('src/pages/Checkout.tsx', content);
    console.log('Checkout.tsx fixed');
}

// Fix MenuDetail.tsx - "Added (" is part of a larger expression, needs removal  
content = fs.readFileSync('src/pages/MenuDetail.tsx', 'utf8');
if (content.includes('t("pos.added_count", "Added (")')) {
    // It should be just the text before an interpolation, like "Added (2)"
    // Keep the translation key but ensure the default is right
    content = content.replace(
        't("pos.added_count", "Added (")',
        't("pos.added_label", "Added")'
    );
    fs.writeFileSync('src/pages/MenuDetail.tsx', content);
    console.log('MenuDetail.tsx fixed');
}
