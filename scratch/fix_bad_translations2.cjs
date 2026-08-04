const fs = require('fs');
const path = require('path');

const moreFixes = [
  {
    findStr: 't("pos.a_name_join", "a.name).join(\', \'}")',
    replaceStr: "a.name).join(', ')}"
  },
  {
    findStr: 't("pos.selectedorder_ordertype_touppercase", "` : selectedOrder.orderType.toUpperCase()}")',
    replaceStr: '` : selectedOrder.orderType.toUpperCase()}'
  },
  {
    findStr: 't("pos.mod_label", "`, mod.label)}")',
    replaceStr: '`, mod.label)}'
  },
  {
    findStr: 't("pos.sr_label", "`, sr.label)}")',
    replaceStr: '`, sr.label)}'
  },
  {
    findStr: 't("pos.modal_staffrole_as_string", "`, modal.staffRole as string)}")',
    replaceStr: '`, modal.staffRole as string)}'
  },
  // Special Requests (Optional) and Chef Instructions are legit text, fix their keys
  {
    findStr: 't("pos.special_requests_optional", "Special Requests (Optional)")',
    replaceStr: 't("pos.special_requests", "Special Requests (Optional)")'
  },
  {
    findStr: 't("pos.chef_instructions_optional", "Chef Instructions (Optional)")',
    replaceStr: 't("pos.chef_instructions", "Chef Instructions (Optional)")'
  },
  // Added ( is a legit text fragment
  {
    findStr: 't("pos.added", "Added (")',
    replaceStr: 't("pos.added_count", "Added (")'
  }
];

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

let totalFixed = 0;
for (const file of allTsx) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    for (const fix of moreFixes) {
        while (content.includes(fix.findStr)) {
            content = content.replace(fix.findStr, fix.replaceStr);
            totalFixed++;
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed: ' + path.basename(file));
    }
}

console.log('Total fixes applied:', totalFixed);
