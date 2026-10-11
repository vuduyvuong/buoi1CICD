const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bansac-api-'));
process.env.DATA_DIR = testDir;
process.env.NODE_ENV = 'test';
const app = require('./index');

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let cookie = '';
  async function request(route, options) {
    const config = Object.assign({ headers: {} }, options || {});
    if (config.body && typeof config.body !== 'string') { config.headers['Content-Type'] = 'application/json'; config.body = JSON.stringify(config.body); }
    if (cookie) config.headers.Cookie = cookie;
    const response = await fetch(`${base}${route}`, config);
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
    const data = response.status === 204 ? null : await response.json();
    return { response, data };
  }

  try {
    let result = await request('/health'); assert.equal(result.response.status, 200);
    result = await request('/auth/register', { method:'POST', body:{ name:'API Test', email:'api@test.local', phone:'0901234567', password:'Password123' } }); assert.equal(result.response.status, 201);
    result = await request('/products'); assert.equal(result.data.products.length, 12);
    result = await request('/promos/validate', { method:'POST', body:{ code:'BANSAC10', subtotal:1450000 } }); assert.equal(result.data.discount, 145000);
    result = await request('/orders', { method:'POST', body:{ items:[{id:1,quantity:1,size:'M',color:'#8c6648'}], promoCode:'BANSAC10', payment:'cod', shippingMethod:'standard', address:{name:'API Test',email:'api@test.local',phone:'0901234567',address:'123 Test',district:'Quan 1',city:'HCM'} } }); assert.equal(result.response.status, 201); assert.equal(result.data.order.total, 1305000);
    result = await request('/orders/my'); assert.equal(result.data.orders.length, 1);
    console.log('API integration tests passed.');
  } catch (error) {
    console.error(error); process.exitCode = 1;
  } finally {
    server.close(() => { fs.rmSync(testDir, { recursive:true, force:true }); });
  }
});
