const fs = require('fs');
const path = require('path');

const targetFile = process.argv[2];
if (!targetFile) {
    console.error('Please provide a file path');
    process.exit(1);
}

let content = fs.readFileSync(targetFile, 'utf8');

// Helper to safely convert text to a key
const toKey = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').substring(0, 40);
};

// 1. Replace toast.success('...') and toast.error('...')
content = content.replace(/toast\.(success|error|info)\(\s*(['"`])(.*?)\2\s*\)/g, (match, type, quote, text) => {
    if (text.includes('${')) return match; // skip template literals for now
    if (!/[a-zA-Z]/.test(text)) return match;
    const key = `pos.${toKey(text)}`;
    return `toast.${type}(t("${key}", "${text}"))`;
});

// 2. Replace toast with template literals toast.success(`...`)
// Handled manually if few, but let's try a simple one:
content = content.replace(/toast\.(success|error|info)\(\s*`([^`]*)`\s*\)/g, (match, type, text) => {
    if (!/[a-zA-Z]/.test(text)) return match;
    const key = `pos.${toKey(text.replace(/\$\{[^}]+\}/g, ''))}`;
    
    // Convert template literal to key-value pairs for i18next
    let vars = {};
    let tText = text;
    let matchVar;
    let i = 0;
    const regex = /\$\{([^}]+)\}/g;
    while ((matchVar = regex.exec(text)) !== null) {
        const varName = `var${i++}`;
        vars[varName] = matchVar[1];
        tText = tText.replace(matchVar[0], `{${varName}}`);
    }
    
    if (Object.keys(vars).length > 0) {
        const varsStr = Object.entries(vars).map(([k, v]) => `${k}: ${v}`).join(', ');
        return `toast.${type}(t("${key}", \`${tText}\`, { ${varsStr} }))`;
    }
    
    return `toast.${type}(t("${key}", \`${text}\`))`;
});

// 3. Replace >Text< in JSX
// This is tricky. Let's do it carefully.
// Only replace lines that look like ">Some Text<" or ">Some Text {"
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Replace text inside JSX tags
    line = line.replace(/>([^<>{]+)</g, (match, text) => {
        const trimmed = text.trim();
        if (trimmed && /[a-zA-Z]/.test(trimmed) && !trimmed.includes('৳') && !trimmed.includes('&&') && !trimmed.includes('||')) {
            const key = `pos.${toKey(trimmed)}`;
            return `>{t("${key}", "${trimmed}")}<`;
        }
        return match;
    });

    // Replace text before JSX expression: >Text {
    line = line.replace(/>([^<>{]+)\{/g, (match, text) => {
        const trimmed = text.trim();
        if (trimmed && /[a-zA-Z]/.test(trimmed) && !trimmed.includes('৳') && !trimmed.includes('&&') && !trimmed.includes('||')) {
            const key = `pos.${toKey(trimmed)}`;
            const spaceBefore = text.startsWith(' ') ? ' ' : '';
            const spaceAfter = text.endsWith(' ') ? ' ' : '';
            return `>${spaceBefore}{t("${key}", "${trimmed}")}${spaceAfter}{`;
        }
        return match;
    });

    // Replace text after JSX expression: } Text<
    line = line.replace(/\}([^<>{]+)</g, (match, text) => {
        const trimmed = text.trim();
        if (trimmed && /[a-zA-Z]/.test(trimmed) && !trimmed.includes('৳') && !trimmed.includes('&&') && !trimmed.includes('||')) {
            const key = `pos.${toKey(trimmed)}`;
            const spaceBefore = text.startsWith(' ') ? ' ' : '';
            const spaceAfter = text.endsWith(' ') ? ' ' : '';
            return `}${spaceBefore}{t("${key}", "${trimmed}")}${spaceAfter}<`;
        }
        return match;
    });
    
    lines[i] = line;
}

fs.writeFileSync(targetFile, lines.join('\n'));
console.log('Done');
