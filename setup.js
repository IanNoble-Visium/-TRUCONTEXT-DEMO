#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 TruContext Demo Setup');
console.log('========================\n');

// Create .env.local file with Neo4j credentials
const envContent = `# TruContext Demo Environment Variables
NEO4J_URI=neo4j+s://ebd05d7f.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=RX8GYHKu9fH4vrpiZ7UGC0y8HbIJudrJg0ovqbeNdLM
NEO4J_DATABASE=neo4j

# Optional: Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=TruContext Demo
NEXT_PUBLIC_APP_VERSION=1.0.0
`;

const envPath = path.join(__dirname, '.env.local');

try {
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local with Neo4j credentials');
  } else {
    console.log('ℹ️  .env.local already exists');
  }
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\n📝 Please manually create .env.local with the following content:');
  console.log(envContent);
}

console.log('\n🎯 Next Steps:');
console.log('1. Run: npm run dev');
console.log('2. Open: http://localhost:3000');
console.log('3. Upload the sample-dataset.json file');
console.log('4. Explore the graph visualization!');

console.log('\n📚 Documentation:');
console.log('- README.md: Complete setup and usage guide');
console.log('- dataset-upload-guide.md: Dataset format details');
console.log('- DEPLOYMENT.md: Deployment instructions');

console.log('\n🏢 Powered by Visium Technologies');
console.log('   https://www.visiumtechnologies.com/\n'); 