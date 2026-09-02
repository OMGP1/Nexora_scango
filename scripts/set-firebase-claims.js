#!/usr/bin/env node
/**
 * Set Firebase custom claims for ScanGo staff users.
 * The API Gateway reads `role` and `store_id` from these claims.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json node scripts/set-firebase-claims.js
 */

const path = require('path');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const STAFF_USERS = [
  {
    uid: 'WHGremEryaSuumJoMZtzWffenm43',
    email: 'omparabomgp12@gmail.com',
    claims: { role: 'admin' },
  },
  {
    uid: 'lySscgzq4WbIHipDx1iZOF6ZpzI3',
    email: 'omparabomgp123@gmail.com',
    claims: { role: 'associate', store_id: 'STORE_001' },
  },
];

async function main() {
  const credPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.resolve(__dirname, '../firebase-service-account.json');

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;

  initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID || 'om-nexora-7bd28',
  });

  const auth = getAuth();

  for (const user of STAFF_USERS) {
    await auth.setCustomUserClaims(user.uid, user.claims);
    const record = await auth.getUser(user.uid);
    console.log(`✓ ${record.email}`);
    console.log(`  UID:    ${user.uid}`);
    console.log(`  Claims: ${JSON.stringify(user.claims)}`);
  }

  console.log('\nDone. Users must sign out and sign back in for claims to take effect.');
}

main().catch((err) => {
  console.error('Failed to set claims:', err.message);
  process.exit(1);
});
