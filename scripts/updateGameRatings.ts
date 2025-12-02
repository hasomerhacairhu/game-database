/**
 * One-time script to calculate and update averageRating and ratingCount
 * for all games in the Firestore database.
 * 
 * Run this script once after implementing the denormalized rating system.
 * 
 * Usage:
 * npx tsx scripts/updateGameRatings.ts
 */

import admin from 'firebase-admin'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync } from 'fs'

// ES module workaround for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load service account key
const serviceAccountPath = resolve(__dirname, '../somer-jatekok-firebase-service-account-key.json')
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

console.log('🔑 Firebase Project:', serviceAccount.project_id)

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
})

const db = admin.firestore()

async function updateAllGameRatings() {
  console.log('🚀 Starting game ratings update...\n')
  
  try {
    // Get all games
    const gamesSnapshot = await db.collection('games').get()
    
    console.log(`📊 Found ${gamesSnapshot.size} games to process\n`)
    
    let updated = 0
    let skipped = 0
    let errors = 0
    
    // Process each game
    for (const gameDoc of gamesSnapshot.docs) {
      const gameId = gameDoc.id
      const gameName = gameDoc.data().name || 'Unknown'
      
      try {
        // Get ratings for this game
        const ratingsSnapshot = await db.collection('games').doc(gameId).collection('ratings').get()
        
        if (ratingsSnapshot.empty) {
          console.log(`⚪ ${gameName}: No ratings, setting null`)
          await db.collection('games').doc(gameId).update({
            averageRating: null,
            ratingCount: 0
          })
          skipped++
        } else {
          // Calculate average
          const ratings = ratingsSnapshot.docs.map(doc => doc.data().stars as number)
          const sum = ratings.reduce((acc, rating) => acc + rating, 0)
          const average = sum / ratings.length
          const count = ratings.length
          
          // Update game document
          await db.collection('games').doc(gameId).update({
            averageRating: Number(average.toFixed(2)),
            ratingCount: count
          })
          
          console.log(`✅ ${gameName}: ${count} ratings, avg ${average.toFixed(2)}`)
          updated++
        }
      } catch (error) {
        console.error(`❌ ${gameName}: Error -`, error)
        errors++
      }
    }
    
    console.log('\n📈 Summary:')
    console.log(`   ✅ Updated: ${updated}`)
    console.log(`   ⚪ No ratings: ${skipped}`)
    console.log(`   ❌ Errors: ${errors}`)
    console.log(`   📊 Total: ${gamesSnapshot.size}`)
    console.log('\n✨ Done!')
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
updateAllGameRatings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
