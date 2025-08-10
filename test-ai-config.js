#!/usr/bin/env node

/**
 * AI Model Configuration Test Script
 * 
 * This script tests the AI model configuration API endpoints to ensure they work correctly.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAIModelConfig() {
  console.log('🚀 Testing AI Model Configuration API...\n');

  try {
    // Test 1: Get all configurations
    console.log('📋 Test 1: Getting all AI model configurations...');
    const response = await axios.get(`${BASE_URL}/api/models`);
    const configs = response.data;
    
    console.log(`✅ Found ${configs.length} configurations:`);
    configs.forEach(config => {
      console.log(`   • ${config.function_name}: ${config.model_name} (${config.description})`);
    });
    console.log();

    // Test 2: Update a configuration
    if (configs.length > 0) {
      const testConfig = configs[0];
      const originalModel = testConfig.model_name;
      const newModel = originalModel === 'moonshotai/kimi-k2' 
        ? 'anthropic/claude-3-haiku' 
        : 'moonshotai/kimi-k2';

      console.log(`🔄 Test 2: Updating ${testConfig.function_name} from ${originalModel} to ${newModel}...`);
      
      const updateResponse = await axios.put(
        `${BASE_URL}/api/models/${testConfig.function_name}`, 
        { model: newModel }
      );
      
      if (updateResponse.data.success) {
        console.log('✅ Update successful!');
        
        // Verify the update
        const verifyResponse = await axios.get(`${BASE_URL}/api/models`);
        const updatedConfig = verifyResponse.data.find(c => c.function_name === testConfig.function_name);
        
        if (updatedConfig && updatedConfig.model_name === newModel) {
          console.log('✅ Verification passed - model updated correctly');
          
          // Restore original model
          await axios.put(
            `${BASE_URL}/api/models/${testConfig.function_name}`, 
            { model: originalModel }
          );
          console.log('🔄 Restored original model');
        } else {
          console.log('❌ Verification failed - model not updated correctly');
        }
      } else {
        console.log('❌ Update failed');
      }
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📝 To test the UI, visit: http://localhost:3000/test-config');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
  }
}

// Run the test
testAIModelConfig();
