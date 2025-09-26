import { useState } from 'react';
import apiClient from '@/api/apiClient';

const ApiTestPage = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult('Testing API...');
    
    try {
      const response = await apiClient.get('/news/languages');
      setResult(`✅ API Test Successful! Status: ${response.status}, Data: ${JSON.stringify(response.data).substring(0, 200)}...`);
    } catch (error: any) {
      setResult(`❌ API Test Failed: ${error.message} (Type: ${error.type || 'Unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  const testNewsApi = async () => {
    setLoading(true);
    setResult('Testing News API...');
    
    try {
      const response = await apiClient.get('/news/filter-multi-categories', {
        params: {
          categoryIds: '9c70fa99-10a7-42c1-8dcb-db0cbfed8bb0',
          language_id: '5dd95034-d533-4b09-8687-cd2ed3682ab6',
          limit: 1,
          page: 1
        }
      });
      setResult(`✅ News API Test Successful! Status: ${response.status}, Data: ${JSON.stringify(response.data).substring(0, 200)}...`);
    } catch (error: any) {
      setResult(`❌ News API Test Failed: ${error.message} (Type: ${error.type || 'Unknown'})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="space-y-4">
          <button 
            onClick={testApi} 
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded disabled:bg-gray-400 mr-4"
          >
            {loading ? 'Testing...' : 'Test Languages API'}
          </button>
          
          <button 
            onClick={testNewsApi} 
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test News API'}
          </button>
        </div>
        
        {result && (
          <div className="mt-6 p-4 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Test Result:</h3>
            <pre className="text-sm whitespace-pre-wrap bg-gray-100 p-3 rounded">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTestPage;


