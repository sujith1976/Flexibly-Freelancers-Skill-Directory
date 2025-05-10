// API base URL - ensure it has the correct protocol
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://databaseapp-qb42.onrender.com';

// API endpoints
export const ENDPOINTS = {
  freelancers: `${API_URL}/api/freelancers`,
  freelancerSearch: `${API_URL}/api/freelancers/search`,
};

// Default fetch options with CORS settings
export const defaultFetchOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
  mode: 'cors',
  credentials: 'same-origin',
};

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || `Error: ${response.status}`);
    } catch (e) {
      // If we can't parse the error as JSON
      throw new Error(`Server error: ${response.status}`);
    }
  }
  
  try {
    return await response.json();
  } catch (e) {
    console.error('Error parsing response:', e);
    throw new Error('Failed to parse server response');
  }
}

// Helper function for API requests
export async function apiRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...defaultFetchOptions,
      ...options,
    });
    
    return await handleApiResponse<T>(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
} 