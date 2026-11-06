const http = require('https');
const crypto = require('crypto');

const BASE_URL = 'https://unihopefoundation.org';

function makeRequest(method, endpoint, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const postData = body ? JSON.stringify(body) : '';

    const req = http.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'UNIHOPE-API-Security-Audit/1.0',
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.status, statusCode: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.status, statusCode: res.statusCode, headers: res.headers, rawData: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runApiAudit() {
  const results = [];

  console.log('Testing /api/razorpay/create-order with invalid payloads...');

  // Test 1: Zero amount
  try {
    const res1 = await makeRequest('POST', '/api/razorpay/create-order', {}, { amount: 0 });
    results.push({ test: 'create-order zero amount', status: res1.statusCode, passed: res1.statusCode >= 400 });
  } catch (e) {
    results.push({ test: 'create-order zero amount', error: e.message });
  }

  // Test 2: Negative amount
  try {
    const res2 = await makeRequest('POST', '/api/razorpay/create-order', {}, { amount: -500 });
    results.push({ test: 'create-order negative amount', status: res2.statusCode, passed: res2.statusCode >= 400 });
  } catch (e) {
    results.push({ test: 'create-order negative amount', error: e.message });
  }

  // Test 3: Missing body
  try {
    const res3 = await makeRequest('POST', '/api/razorpay/create-order', {}, {});
    results.push({ test: 'create-order empty body', status: res3.statusCode, passed: res3.statusCode >= 400 });
  } catch (e) {
    results.push({ test: 'create-order empty body', error: e.message });
  }

  // Test 4: verify-payment forged signature
  console.log('Testing /api/razorpay/verify-payment with forged signature...');
  try {
    const res4 = await makeRequest('POST', '/api/razorpay/verify-payment', {}, {
      razorpay_order_id: 'order_fake_12345',
      razorpay_payment_id: 'pay_fake_67890',
      razorpay_signature: 'fake_tampered_signature_abcd1234ef5678'
    });
    results.push({ test: 'verify-payment forged signature', status: res4.statusCode, passed: res4.statusCode === 400 });
  } catch (e) {
    results.push({ test: 'verify-payment forged signature', error: e.message });
  }

  // Test 5: webhook without signature header
  console.log('Testing /api/razorpay/webhook without signature header...');
  try {
    const res5 = await makeRequest('POST', '/api/razorpay/webhook', {}, { event: 'payment.captured' });
    results.push({ test: 'webhook missing signature', status: res5.statusCode, passed: res5.statusCode >= 400 });
  } catch (e) {
    results.push({ test: 'webhook missing signature', error: e.message });
  }

  // Test 6: webhook with forged signature
  console.log('Testing /api/razorpay/webhook with forged signature...');
  try {
    const res6 = await makeRequest('POST', '/api/razorpay/webhook', {
      'x-razorpay-signature': '0000000000000000000000000000000000000000000000000000000000000000'
    }, { event: 'payment.captured' });
    results.push({ test: 'webhook forged signature', status: res6.statusCode, passed: res6.statusCode === 400 });
  } catch (e) {
    results.push({ test: 'webhook forged signature', error: e.message });
  }

  // Test 7: bank-pledge validation
  console.log('Testing /api/donations/bank-pledge with invalid fields...');
  try {
    const res7 = await makeRequest('POST', '/api/donations/bank-pledge', {}, {
      amount: -10,
      donorEmail: 'not-an-email'
    });
    results.push({ test: 'bank-pledge invalid input', status: res7.statusCode, passed: res7.statusCode >= 400 });
  } catch (e) {
    results.push({ test: 'bank-pledge invalid input', error: e.message });
  }

  // Test 8: partnership-enquiry validation
  console.log('Testing /api/partnership-enquiry with empty body...');
  try {
    const res8 = await makeRequest('POST', '/api/partnership-enquiry', {}, {});
    results.push({ test: 'partnership-enquiry empty body', status: res8.statusCode, passed: res8.statusCode >= 400 });
  } catch (e) {
    results.push({ test: 'partnership-enquiry empty body', error: e.message });
  }

  console.log('\n--- API Security Audit Summary ---');
  console.log(JSON.stringify(results, null, 2));

  const fs = require('fs');
  fs.writeFileSync('./scratch/api_audit_results.json', JSON.stringify(results, null, 2));
}

runApiAudit().catch(console.error);

