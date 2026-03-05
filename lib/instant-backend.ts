import { init } from '@instantdb/admin'

if (!process.env.INSTANT_APP_ID) {
  console.error('❌ INSTANT_APP_ID environment variable is not set')
  console.error('   Add it to your .env file: INSTANT_APP_ID="79804a5a-fce5-4e35-8548-a53f8f50c6bb"')
  throw new Error('INSTANT_APP_ID environment variable is required')
}

if (!process.env.INSTANT_ADMIN_TOKEN) {
  console.error('❌ INSTANT_ADMIN_TOKEN environment variable is not set')
  console.error('   Get your admin token from: https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb')
  console.error('   Then add it to your .env file: INSTANT_ADMIN_TOKEN="admin_your_token_here"')
  console.error('   See START_HERE.md for detailed instructions')
  throw new Error('INSTANT_ADMIN_TOKEN environment variable is required. See console for instructions.')
}

export const db = init({
  appId: process.env.INSTANT_APP_ID,
  adminToken: process.env.INSTANT_ADMIN_TOKEN,
})

export async function queryInstant<T = any>(query: any): Promise<T> {
  try {
    const result = await db.query(query)
    return result as T
  } catch (error) {
    console.error('InstantDB query error:', error)
    throw error
  }
}

export async function transactInstant(txs: any[]) {
  try {
    return await db.transact(txs)
  } catch (error) {
    console.error('InstantDB transaction error:', error)
    throw error
  }
}
