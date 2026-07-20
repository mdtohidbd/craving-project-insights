const fs = require('fs');
const path = require('path');

// Fix bad auto-translations that wrapped code patterns in t()
// These are JavaScript expressions that were misidentified as text to translate

const fixes = [
  // AdminCategories.tsx
  {
    file: 'src/pages/admin/AdminCategories.tsx',
    find: /t\("pos\.setformdata", "setFormData\(("\))/g,
    replace: 'setFormData('
  },
  // Pattern for all setFormData( replacements
  {
    file: null, // apply to all
    findStr: 't("pos.setformdata", "setFormData(")',
    replaceStr: 'setFormData('
  },
  {
    file: null,
    findStr: 't("pos.setcategoryformdata", "setCategoryFormData(")',
    replaceStr: 'setCategoryFormData('
  },
  {
    file: null,
    findStr: 't("pos.setpendingchanges", "setPendingChanges(")',
    replaceStr: 'setPendingChanges('
  },
  {
    file: null,
    findStr: 't("pos.setform", "setForm(")',
    replaceStr: 'setForm('
  },
  {
    file: null,
    findStr: 't("pos.n_id_id", "n._id === id ?")',
    replaceStr: 'n._id === id ?'
  },
  {
    file: null,
    findStr: 't("pos.dm_id_id", "dm._id === id ?")',
    replaceStr: 'dm._id === id ?'
  },
  {
    file: null,
    findStr: 't("pos.nextstatus_delivered", ": nextStatus === \'delivered\' ?")',
    replaceStr: ': nextStatus === \'delivered\' ?'
  },
  {
    file: null,
    findStr: 't("pos.0_emerald_100_neutral_200_text", "0 ? \'emerald-100\' : \'neutral-200\'} text-$")',
    replaceStr: "0 ? 'emerald-100' : 'neutral-200'} text-$"
  },
  {
    file: null,
    findStr: 't("pos.a_name_join", "a.name).join(\', \'}}")',
    replaceStr: "a.name).join(', ')}"
  },
  {
    file: null,
    findStr: 't("pos.0_return", "0) return `$")',
    replaceStr: '0) return `$'
  },
  {
    file: null,
    findStr: 't("pos.setsearch_e_target_value_placeholder", "setSearch(e.target.value)} placeholder=")',
    replaceStr: 'setSearch(e.target.value)} placeholder='
  },
  {
    file: null,
    findStr: 't("pos.c_id_customid", "c.id === customId ?")',
    replaceStr: 'c.id === customId ?'
  },
  {
    file: null,
    findStr: 't("pos.c_name_all", "c.name === \'All\' ?")',
    replaceStr: "c.name === 'All' ?"
  },
  {
    file: null,
    findStr: 't("pos.n_a", "N/A")',
    replaceStr: '"N/A"'  // N/A is universal, don't need translation key
  },
  {
    file: null,
    findStr: 't("pos.navigate_track_order_id", "navigate(`/track-order?id=$")',
    replaceStr: 'navigate(`/track-order?id=$'
  },
  {
    file: null,
    findStr: 't("pos.window_location_href_menu", "window.location.href = `/menu/$")',
    replaceStr: 'window.location.href = `/menu/$'
  },
  {
    file: null,
    findStr: 't("pos.sum_p_amount_0", "sum + p.amount, 0)")',
    replaceStr: 'sum + p.amount, 0)'
  },
  {
    file: null,
    findStr: 't("pos.method_method", "`, method.method)}")',
    replaceStr: '`, method.method)}'
  },
  // Fix AdminModules unsaved_change_s_click
  {
    file: null,
    findStr: 't("pos.unsaved_change_s_click", "unsaved change(s). Click")',
    replaceStr: 'unsaved change(s). Click'
  },
  // Fix AdminStaff m placeholder
  {
    file: null,
    findStr: 't("pos.m", "`, m)}")',
    replaceStr: '`, m)}'
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
    
    for (const fix of fixes) {
        if (fix.file && !file.endsWith(fix.file)) continue;
        if (fix.findStr && content.includes(fix.findStr)) {
            while (content.includes(fix.findStr)) {
                content = content.replace(fix.findStr, fix.replaceStr);
                totalFixed++;
            }
            changed = true;
        }
    }
    
    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Fixed: ' + path.basename(file));
    }
}

console.log('Total fixes applied:', totalFixed);
