import React from 'react';
import AIModelConfig from '@/components/AIModelConfig';

const ConfigTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-4xl font-bold text-center mb-4">🚀 AI Model Configuration Test</h1>
          <p className="text-center text-gray-600 mb-4">
            This is a test page for managing AI model configurations. 
            You can view and update the AI models used by different functions.
          </p>
          <div className="text-center text-sm text-blue-600">
            <strong>URL:</strong> http://localhost:3000/test-config
          </div>
        </div>
        <AIModelConfig />
      </div>
    </div>
  );
};

export default ConfigTestPage;

