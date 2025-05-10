import React, { useEffect, useState } from 'react';
import { API_URL } from '@/utils/api';

const ServerStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Attempt to ping the server with a simple GET request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`${API_URL}/api/freelancers`, {
          method: 'GET',
          mode: 'cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setStatus('online');
          setErrorMessage('');
        } else {
          setStatus('offline');
          setErrorMessage(`Server responded with status: ${response.status}`);
        }
      } catch (error) {
        setStatus('offline');
        setErrorMessage(
          error instanceof Error 
            ? (error.name === 'AbortError' 
              ? 'Connection timeout - server is not responding'
              : error.message)
            : 'Unknown error occurred'
        );
      }
    };

    checkServerStatus();
  }, []);

  if (status === 'checking') {
    return (
      <div className="bg-gray-100 p-3 rounded mb-4 text-center">
        <p className="text-gray-700">Checking server status...</p>
      </div>
    );
  }

  if (status === 'offline') {
    return (
      <div className="bg-red-100 p-3 rounded mb-4">
        <h3 className="text-red-800 font-medium">Server Connection Error</h3>
        <p className="text-red-700 text-sm mt-1">
          {errorMessage}
        </p>
        <div className="mt-2 text-sm">
          <p className="font-medium">Troubleshooting Steps:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Ensure the server is running (cd server && npm run dev)</li>
            <li>Check if port 5001 is available and not blocked by a firewall</li>
            <li>Verify MongoDB is properly connected</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-100 p-3 rounded mb-4">
      <p className="text-green-700">
        Server is online and ready to handle requests
      </p>
    </div>
  );
};

export default ServerStatus; 