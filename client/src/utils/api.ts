// API base URL - ensure it has the correct protocol
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
      const errorData = await response.json();
      throw new Error(errorData.message || `Server error: ${response.status}`);
    } catch (e) {
      // If we can't parse the error as JSON or another error occurred
      if (e instanceof Error && e.message !== `Server error: ${response.status}`) {
        throw e; // Re-throw if it's already a parsed error
      }
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