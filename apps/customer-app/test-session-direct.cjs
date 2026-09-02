const axios = require('axios');
async function run() {
  try {
    const res = await axios.post('http://localhost:3003/api/v1/sessions', {
      store_id: 'STORE_001',
      device_fingerprint: 'test-fingerprint',
      customer_type: 'guest'
    }, {
      headers: { 'x-user-id': '2d299464-9a34-4785-9d47-5dea7334b0f6', 'x-store-id': 'STORE_001' }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.message);
    if (err.response) console.error(err.response.data);
  }
}
run();
