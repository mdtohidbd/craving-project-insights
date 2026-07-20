const fs = require('fs');

function fixPrev(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace {t("pos.prev", "prev ?")} with prev ?
    const badStr = '{t("pos.prev", "prev ?")}';
    if (content.includes(badStr)) {
        content = content.split(badStr).join('prev ?');
        fs.writeFileSync(filePath, content);
        console.log('Fixed', filePath);
    }
}

fixPrev('src/pages/admin/AdminUsers.tsx');
