const CONCURRENT_REQUESTS = 150;
const TARGET_URL = 'http://localhost:3003/api/v1/sessions';

console.log(`Starting load test with ${CONCURRENT_REQUESTS} concurrent requests...`);

let successCount = 0;
let rateLimitedCount = 0;
let errorCount = 0;

const makeRequest = async () => {
  try {
    const res = await fetch(TARGET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ store_id: 'store_1' })
    });
    
    if (res.status === 201) successCount++;
    else if (res.status === 429) rateLimitedCount++;
    else {
      errorCount++;
      console.log(`Received status: ${res.status}`);
    }
  } catch (err) {
    errorCount++;
    console.log(`Error: ${err.message}`);
  }
};

const run = async () => {
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(makeRequest());
  }
  
  await Promise.all(promises);
  const duration = Date.now() - startTime;
  
  console.log(`\nLoad test completed in ${duration}ms`);
  console.log(`Successful (201): ${successCount}`);
  console.log(`Rate Limited (429): ${rateLimitedCount}`);
  console.log(`Errors (Other Status/Network): ${errorCount}`);
  
  if (rateLimitedCount > 0) {
    console.log('\n✅ Rate limiting (Throttler) is successfully blocking excess traffic.');
  } else {
    console.log('\n❌ Rate limiting did not trigger. Check Throttler configuration.');
  }
  process.exit(0);
};

run();

const run = async () => {
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(makeRequest());
  }
  
  await Promise.all(promises);
  const duration = Date.now() - startTime;
  
  console.log(`\nLoad test completed in ${duration}ms`);
  console.log(`Successful (201): ${successCount}`);
  console.log(`Rate Limited (429): ${rateLimitedCount}`);
  console.log(`Errors: ${errorCount}`);
  
  if (rateLimitedCount > 0) {
    console.log('\n✅ Rate limiting (Throttler) is successfully blocking excess traffic.');
  } else {
    console.log('\n❌ Rate limiting did not trigger. Check Throttler configuration.');
  }
};

run();
