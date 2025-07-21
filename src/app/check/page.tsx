"use client";
import { useState, useEffect } from 'react';

interface ExamData {
  success: boolean;
  data: {
    exams: Array<{
      id: string;
      name: string;
      isPublished: boolean;
      isDraft: boolean;
      questions?: Array<unknown>;
      [key: string]: unknown;
    }>;
  };
}

export default function CheckPage() {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔥 Fetching from: http://localhost:3000/api/exams');
      
      const response = await fetch('api/exams?page=1&limit=10&published=true', {
        method: 'GET',
        cache: 'no-store',

        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('🔥 Response status:', response.status);
      console.log('🔥 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔥 Raw response data:', data);
      
      setExamData(data);
    } catch (err) {
      console.error('🚨 Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch on component mount
    fetchExams();
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Test - Exams Endpoint</h1>
      
      <div className="mb-4">
        <button 
          onClick={fetchExams}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
        >
          {loading ? 'Fetching...' : 'Fetch Exams'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {examData && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Response Structure:</h2>
          
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Raw JSON Response:</h3>
            <pre className="text-sm overflow-auto max-h-96 bg-black text-green-400 p-4 rounded">
              {JSON.stringify(examData, null, 2)}
            </pre>
          </div>

          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Data Analysis:</h3>
            <ul className="space-y-1 text-sm">
              <li><strong>Response type:</strong> {typeof examData}</li>
              <li><strong>Has &apos;success&apos; property:</strong> {examData.hasOwnProperty('success') ? '✅ Yes' : '❌ No'}</li>
              <li><strong>Has &apos;data&apos; property:</strong> {examData.hasOwnProperty('data') ? '✅ Yes' : '❌ No'}</li>
              {examData.data && (
                <>
                  <li><strong>Data type:</strong> {typeof examData.data}</li>
                  <li><strong>Has &apos;exams&apos; in data:</strong> {examData.data.hasOwnProperty('exams') ? '✅ Yes' : '❌ No'}</li>
                  {examData.data.exams && (
                    <>
                      <li><strong>Exams is array:</strong> {Array.isArray(examData.data.exams) ? '✅ Yes' : '❌ No'}</li>
                      <li><strong>Exams count:</strong> {examData.data.exams.length}</li>
                    </>
                  )}
                </>
              )}
            </ul>
          </div>

          {examData.data?.exams && Array.isArray(examData.data.exams) && (
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Exams Found ({examData.data.exams.length}):</h3>
              {examData.data.exams.map((exam, index) => (
                <div key={exam.id || index} className="border-b pb-2 mb-2 last:border-b-0">
                  <p><strong>Name:</strong> {exam.name}</p>
                  <p><strong>ID:</strong> {exam.id}</p>
                  <p><strong>Published:</strong> {exam.isPublished ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Draft:</strong> {exam.isDraft ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Questions:</strong> {exam.questions?.length || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
