const axios = require('axios');
async function run() {
  try {
    const auth = await axios.post('http://localhost:3001/api/v1/auth/guest', { store_id: 'STORE_001' });
    const token = auth.data.data.token;
    console.log("Got token");
    const res = await axios.post('http://localhost:3001/api/v1/sessions', {
      store_id: 'STORE_001',
      device_fingerprint: 'test-fingerprint'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.message);
    if (err.response) console.error(err.response.data);
  }
}
run();

