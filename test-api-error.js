// Simple test script to verify API error handling
// Run with: node test-api-error.js

const fetch = require('node-fetch');

async function testAIDashboardsAPI() {
  console.log('Testing AI Dashboards API error handling...\n');

  try {
    // Test suggestions endpoint
    console.log('1. Testing suggestions endpoint...');
    const suggestionsResponse = await fetch('http://localhost:3000/api/ai-dashboards/suggestions');
    const suggestionsData = await suggestionsResponse.json();
    
    console.log('Suggestions response:', {
      status: suggestionsResponse.status,
      fallback: suggestionsData.fallback,
      message: suggestionsData.message,
      suggestionsCount: suggestionsData.suggestions?.length || 0
    });

    // Test generate endpoint
    console.log('\n2. Testing generate endpoint...');
    const generateResponse = await fetch('http://localhost:3000/api/ai-dashboards/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Show me top vulnerabilities by severity' })
    });
    
    const generateData = await generateResponse.json();
    
    console.log('Generate response:', {
      status: generateResponse.status,
      error: generateData.error,
      code: generateData.code,
      details: generateData.details
    });

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAIDashboardsAPI();
