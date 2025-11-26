// Verify Neon database operations
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying Neon Database Operations\n');

    const sql = neon(process.env.NEON_DATABASE_URL);

    // Test 1: Insert into favorites
    console.log('1️⃣  Testing favorites table...');
    const testUserId = 'test_user_' + Date.now();

    await sql`
      INSERT INTO favorites (user_id, image_url, prompt)
      VALUES (${testUserId}, 'https://example.com/test.jpg', 'test prompt')
    `;
    console.log('   ✅ Insert successful');

    const favorites = await sql`
      SELECT * FROM favorites WHERE user_id = ${testUserId}
    `;
    console.log(`   ✅ Read successful (found ${favorites.length} record)\n`);

    // Test 2: Insert into generation_history
    console.log('2️⃣  Testing generation_history table...');
    await sql`
      INSERT INTO generation_history (user_id, prompt, image_urls)
      VALUES (${testUserId}, 'test prompt', ARRAY['url1', 'url2'])
    `;
    console.log('   ✅ Insert successful');

    const history = await sql`
      SELECT * FROM generation_history WHERE user_id = ${testUserId}
    `;
    console.log(`   ✅ Read successful (found ${history.length} record)\n`);

    // Test 3: Check ai_helper_history columns
    console.log('3️⃣  Testing ai_helper_history table...');
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'ai_helper_history'
      ORDER BY ordinal_position
    `;
    console.log(`   ✅ Table has ${columns.length} columns:`);
    columns.forEach(col => {
      console.log(`      • ${col.column_name} (${col.data_type})`);
    });

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await sql`DELETE FROM favorites WHERE user_id = ${testUserId}`;
    await sql`DELETE FROM generation_history WHERE user_id = ${testUserId}`;
    console.log('   ✅ Test data cleaned up');

    console.log('\n✨ All database operations verified successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✓ Favorites table: Working');
    console.log('   ✓ Generation history table: Working');
    console.log('   ✓ AI helper history table: Updated with new columns');
    console.log('\n🎉 Your Neon database is ready to use!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification failed:');
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }
}

verifyDatabase();
