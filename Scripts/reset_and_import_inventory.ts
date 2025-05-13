import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseKey = 'YOUR_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const csvFile = 'scripts/shop_inventory_final_merged.csv';
const records: any[] = [];

fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', (row) => {
    row.quantity = parseInt(row.quantity || '1', 10);
    records.push(row);
  })
  .on('end', async () => {
    console.log(`🚨 Truncating 'items' table...`);

    const truncate = await supabase.rpc('truncate_items_table');
    if (truncate.error) {
      console.error('❌ Truncate failed:', truncate.error.message);
      return;
    }

    console.log(`✅ Table cleared. Importing ${records.length} items...`);

    for (const row of records) {
      const { error } = await supabase.from('items').insert(row);
      if (error) {
        console.error(`❌ Insert failed for:`, row.photo_ref, error.message);
      } else {
        console.log(`✅ Inserted:`, row.photo_ref);
      }
    }

    console.log(`🎉 Import complete!`);
  });
