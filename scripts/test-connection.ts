import { init } from '@instantdb/admin'
import { config } from 'dotenv'

config()

async function testConnection() {
  const APP_ID = process.env.INSTANT_APP_ID || '79804a5a-fce5-4e35-8548-a53f8f50c6bb'
  const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN

  console.log('🔍 Testing InstantDB Connection...')
  console.log('📱 App ID:', APP_ID)
  console.log('🔑 Admin Token:', ADMIN_TOKEN ? `${ADMIN_TOKEN.substring(0, 10)}...` : 'NOT SET')

  if (!ADMIN_TOKEN) {
    console.error('\n❌ INSTANT_ADMIN_TOKEN is not set in your .env file')
    console.error('\n📝 To fix this:')
    console.error('   1. Go to: https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb')
    console.error('   2. Click "Settings" in the left sidebar')
    console.error('   3. Scroll to "Admin Tokens"')
    console.error('   4. Click "Create Admin Token" or copy existing one')
    console.error('   5. Copy the ENTIRE token (it should be much longer than a UUID)')
    console.error('   6. Update your .env file: INSTANT_ADMIN_TOKEN="your_token_here"')
    process.exit(1)
  }

  console.log('\n🔌 Initializing InstantDB client...')

  try {
    const db = init({
      appId: APP_ID,
      adminToken: ADMIN_TOKEN,
    })
    
    console.log('✅ Client initialized successfully')
    console.log('\n📊 Testing query...')
    
    const result = await db.query({ customers: {} })
    
    console.log('✅ Query successful!')
    console.log(`   Found ${result.customers?.length || 0} customers`)
    
    if (result.customers && result.customers.length > 0) {
      console.log('\n📋 Sample customer:')
      console.log('   -', result.customers[0].companyName)
    } else {
      console.log('\n⚠️  No customers found. Run: npm run db:seed')
    }
    
    console.log('\n🎉 Connection test PASSED!')
    console.log('   Your InstantDB setup is working correctly.')
    
  } catch (error: any) {
    console.error('\n❌ Connection test FAILED!')
    console.error('\nError details:', error.message)
    
    if (error.message.includes('authorization') || error.message.includes('Malformed')) {
      console.error('\n🔍 This looks like an authentication error.')
      console.error('\n💡 The token in your .env file is NOT a valid admin token.')
      console.error('   Current token:', ADMIN_TOKEN)
      console.error('\n📝 To fix:')
      console.error('   1. Go to: https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb')
      console.error('   2. Click "Settings" → "Admin Tokens"')
      console.error('   3. Create a NEW admin token (click the button)')
      console.error('   4. Copy the ENTIRE token (it will be MUCH longer than what you have)')
      console.error('   5. Update .env: INSTANT_ADMIN_TOKEN="paste_the_long_token_here"')
      console.error('   6. Run: npm run test:connection')
    }
    
    process.exit(1)
  }
}

testConnection()
