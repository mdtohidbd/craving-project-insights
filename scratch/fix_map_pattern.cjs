const fs = require('fs');

// Fix the corrupted addOns.map pattern in AdminPOS.tsx and AdminOrders.tsx
const files = [
    'src/pages/admin/AdminPOS.tsx',
    'src/pages/admin/AdminOrders.tsx'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let orig = content;
    
    // The bad pattern looks like: .map(a=>{t("pos.a_name_join", "a.name).join(', '}")}
    // It should be: .map(a => a.name).join(', ')}
    
    // Use a regex to find and replace this broken pattern
    content = content.replace(/\.map\(a=>?\{t\("pos\.a_name_join", "a\.name\)\.join\(', '\}"\)\}/g, ".map(a => a.name).join(', ')}");
    content = content.replace(/\.map\(a=>\{t\("pos\.a_name_join", "a\.name\)\.join\(', '\}"\)\}/g, ".map(a => a.name).join(', ')}");
    
    // Also try the version without arrow curly brace
    content = content.replace(/\.map\(a=>{t\("pos\.a_name_join", "a\.name\)\.join\(', '\}")\}/g, ".map(a => a.name).join(', ')}");
    
    if (content !== orig) {
        fs.writeFileSync(file, content);
        console.log('Fixed:', file);
    } else {
        console.log('No changes in:', file);
        // Show what the bad pattern looks like
        const idx = content.indexOf('a_name_join');
        if (idx >= 0) {
            console.log('  Context:', JSON.stringify(content.slice(idx - 30, idx + 80)));
        }
    }
}
console.log('Done');
