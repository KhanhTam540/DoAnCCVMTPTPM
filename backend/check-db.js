var db  = require('./src/config/db');

async function check() {
  let [rows] = await db.query('SELECT spec_name FROM part_specifications WHERE spec_name LIKE "%nh%" LIMIT 1');
  let str = rows[0].spec_name;
  console.log('String:', str);
  console.log('Length:', str.length);
  
  let codes = [];
  for (let i = 0; i < str.length; i++) {
    codes.push(str.charCodeAt(i));
  }
  console.log('Char codes:', codes);
  process.exit(0);
}
check();
