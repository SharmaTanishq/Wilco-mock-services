#!/usr/bin/env node

/**
 * Unbxd Mock API Load Test Script
 * 
 * Usage:
 *   node load-test.js                    # Default: 1000 requests, 50 concurrent
 *   node load-test.js 2000 100           # 2000 requests, 100 concurrent
 * 
 * Prerequisites:
 *   - Mock service running on http://localhost:3000
 *   - Node.js 14+
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'api-key';
const SITE_KEY = 'site-key';

// Test queries to cycle through
const SEARCH_QUERIES = [
  'dog food',
  'cat food',
  'bird seed',
  'fish food',
  'rabbit feed',
];

const CATEGORY_PATHS = [
  'u_categoryPathId:dog_food',
  'u_categoryPathId:cat_food',
  'u_categoryPathId:bird_supplies',
  'u_categoryPathId:fish_supplies',
];

/**
 * Make an HTTP GET request and parse JSON response
 */
async function makeRequest(path, params = {}) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams(params).toString();
    const fullUrl = `${BASE_URL}${path}${query ? '?' + query : ''}`;

    const startTime = Date.now();

    http.get(fullUrl, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const duration = Date.now() - startTime;

        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            duration,
            data: json,
            url: fullUrl,
          });
        } catch (err) {
          reject(new Error(`Failed to parse JSON from ${fullUrl}: ${err.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`HTTP request failed for ${fullUrl}: ${err.message}`));
    });
  });
}

/**
 * Validate search/category response format
 */
function validateSearchResponse(response) {
  assert(response.data.response, 'Missing response.response');
  assert(Array.isArray(response.data.response.products), 'Missing response.products array');
  assert(typeof response.data.response.numberOfProducts === 'number', 'Missing numberOfProducts');
  assert(response.data.facets, 'Missing facets');
  assert(response.data.searchMetaData, 'Missing searchMetaData');
}

/**
 * Validate autosuggest response format
 */
function validateAutosuggestResponse(response) {
  assert(response.data.response, 'Missing response.response');
  assert(Array.isArray(response.data.response.products), 'Missing response.products array');
  assert(response.data.response.products.every(p => p.doctype === 'KEYWORD_SUGGESTION'), 'Invalid suggestion doctype');
}

/**
 * Run load test with mixed endpoint types
 */
async function runLoadTest(numRequests = 1000, concurrency = 50) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║      🚀 Unbxd Mock API Load Test                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('📊 Configuration:');
  console.log(`   Base URL:        ${BASE_URL}`);
  console.log(`   Total Requests:  ${numRequests}`);
  console.log(`   Concurrency:     ${concurrency}`);
  console.log(`   Endpoints:       Search, Category, Autosuggest`);
  console.log('');

  let totalRequests = 0;
  let successCount = 0;
  let errorCount = 0;
  let totalDuration = 0;
  const responseTimes = [];
  const errors = [];

  const globalStartTime = Date.now();

  // Run requests in batches
  for (let batch = 0; batch < numRequests; batch += concurrency) {
    const batchSize = Math.min(concurrency, numRequests - batch);
    const promises = [];

    // Create batch of concurrent requests
    for (let i = 0; i < batchSize; i++) {
      const endpoint = Math.random();
      let promise;

      try {
        if (endpoint < 0.5) {
          // Search endpoint
          const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
          promise = makeRequest(`/${API_KEY}/${SITE_KEY}/search`, {
            q: query,
            rows: 50,
          })
            .then((result) => {
              validateSearchResponse(result);
              return result;
            });
        } else if (endpoint < 0.8) {
          // Category endpoint
          const categoryPath = CATEGORY_PATHS[Math.floor(Math.random() * CATEGORY_PATHS.length)];
          promise = makeRequest(`/${API_KEY}/${SITE_KEY}/category`, {
            p: categoryPath,
            rows: 50,
          })
            .then((result) => {
              validateSearchResponse(result);
              return result;
            });
        } else {
          // Autosuggest endpoint
          const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
          promise = makeRequest(`/${API_KEY}/${SITE_KEY}/autosuggest`, {
            q: query.split(' ')[0], // Use first word for better matching
            'keywordSuggestions.count': 6,
          })
            .then((result) => {
              validateAutosuggestResponse(result);
              return result;
            });
        }

        promises.push(
          promise
            .then((result) => {
              successCount++;
              totalDuration += result.duration;
              responseTimes.push(result.duration);

              if (result.status !== 200) {
                throw new Error(`Unexpected status ${result.status}`);
              }

              return {
                success: true,
                duration: result.duration,
              };
            })
            .catch((err) => {
              errorCount++;
              errors.push(err.message);
              return {
                success: false,
                error: err.message,
              };
            })
        );
      } catch (err) {
        errorCount++;
        errors.push(err.message);
      }
    }

    // Wait for all promises in batch
    await Promise.all(promises);
    totalRequests += batchSize;

    // Progress update
    const progressPercent = ((totalRequests / numRequests) * 100).toFixed(1);
    const elapsed = (Date.now() - globalStartTime) / 1000;
    process.stdout.write(
      `\r  ⏱️  Progress: ${totalRequests}/${numRequests} (${progressPercent}%) - ${elapsed.toFixed(1)}s`
    );
  }

  const globalEndTime = Date.now();
  const totalElapsed = (globalEndTime - globalStartTime) / 1000;
  const avgDuration = totalDuration / successCount;
  const minDuration = Math.min(...responseTimes);
  const maxDuration = Math.max(...responseTimes);
  const medianDuration = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)];
  const p95Duration = responseTimes[Math.floor(responseTimes.length * 0.95)];
  const p99Duration = responseTimes[Math.floor(responseTimes.length * 0.99)];
  const throughput = (successCount / totalElapsed).toFixed(2);

  console.log(`\n\n📈 Test Results:`);
  console.log(`\n   Timing:`);
  console.log(`   ├─ Total Duration:       ${totalElapsed.toFixed(2)}s`);
  console.log(`   ├─ Throughput:           ${throughput} req/s`);
  console.log(`   └─ Requests/min:         ${(throughput * 60).toFixed(0)} req/min`);

  console.log(`\n   Requests:`);
  console.log(`   ├─ Total:                ${totalRequests}`);
  console.log(`   ├─ Successful:           ${successCount} (${((successCount / totalRequests) * 100).toFixed(1)}%)`);
  console.log(`   └─ Failed:               ${errorCount} (${((errorCount / totalRequests) * 100).toFixed(1)}%)`);

  console.log(`\n   Response Times:`);
  console.log(`   ├─ Min:                  ${minDuration}ms`);
  console.log(`   ├─ Max:                  ${maxDuration}ms`);
  console.log(`   ├─ Average:              ${avgDuration.toFixed(2)}ms`);
  console.log(`   ├─ Median:               ${medianDuration}ms`);
  console.log(`   ├─ P95:                  ${p95Duration}ms`);
  console.log(`   └─ P99:                  ${p99Duration}ms`);

  if (errors.length > 0 && errors.length <= 5) {
    console.log(`\n   Errors (showing first ${Math.min(errors.length, 5)}):`);
    errors.slice(0, 5).forEach((err, idx) => {
      console.log(`   ├─ ${idx + 1}. ${err}`);
    });
  }

  console.log('\n✨ Load test complete!\n');

  // Return results for programmatic use
  return {
    totalRequests,
    successCount,
    errorCount,
    totalElapsed,
    throughput: parseFloat(throughput),
    avgDuration,
    minDuration,
    maxDuration,
    p95Duration,
    p99Duration,
  };
}

// Parse command-line arguments
const args = process.argv.slice(2);
const numRequests = parseInt(args[0], 10) || 1000;
const concurrency = parseInt(args[1], 10) || 50;

// Validate arguments
if (isNaN(numRequests) || isNaN(concurrency) || numRequests <= 0 || concurrency <= 0) {
  console.error('❌ Invalid arguments. Usage: node load-test.js [numRequests] [concurrency]');
  console.error('   Example: node load-test.js 2000 100');
  process.exit(1);
}

// Run the test
runLoadTest(numRequests, concurrency)
  .then((results) => {
    // Exit with success code if all requests succeeded
    process.exit(results.errorCount === 0 ? 0 : 1);
  })
  .catch((err) => {
    console.error('❌ Load test failed:', err.message);
    process.exit(1);
  });
