import React, { useState, useEffect } from 'react';
import TagInput from './TagInput';
import { ENDPOINTS, apiRequest } from '@/utils/api';

interface Freelancer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  createdAt: string;
}

const SearchFreelancers: React.FC = () => {
  const [searchSkills, setSearchSkills] = useState<string[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Search for freelancers whenever searchSkills changes
  useEffect(() => {
    if (searchSkills.length > 0) {
      searchFreelancersBySkills();
    } else {
      // If no search skills, fetch all freelancers
      fetchAllFreelancers();
    }
  }, [searchSkills]);

  const fetchAllFreelancers = async () => {
    try {
      setIsLoading(true);
      setError('');
      setDebugInfo('Fetching all freelancers...');
      
      const data = await apiRequest<Freelancer[]>(ENDPOINTS.freelancers);
      setFreelancers(data);
      setDebugInfo(`Found ${data.length} total freelancers`);
      
      // Log all freelancers' skills for debugging
      if (data.length > 0) {
        const skillsLog = data.map(f => `${f.name}: [${f.skills.join(', ')}]`).join('\n');
        setDebugInfo(prev => `${prev}\n\nFreelancers skills:\n${skillsLog}`);
      }
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while fetching freelancers');
      setFreelancers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchFreelancersBySkills = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Normalize skills before sending
      const normalizedSkills = searchSkills.map(skill => skill.trim().toLowerCase());
      
      // For one skill, just use a simple parameter
      if (normalizedSkills.length === 1) {
        const searchTerm = normalizedSkills[0];
        setDebugInfo(`Searching for freelancers with skill: ${searchTerm}`);
        
        const data = await apiRequest<Freelancer[]>(
          `${ENDPOINTS.freelancerSearch}?skills=${encodeURIComponent(searchTerm)}`
        );
        
        setFreelancers(data);
        setDebugInfo(prev => `${prev}\n\nFound ${data.length} matching freelancers`);
      } 
      // For multiple skills, use a manual client-side approach
      else {
        setDebugInfo(`Fetching all freelancers to filter by skills: ${normalizedSkills.join(', ')}`);
        
        // Get all freelancers
        const allFreelancers = await apiRequest<Freelancer[]>(ENDPOINTS.freelancers);
        
        // Filter freelancers that have ALL the required skills
        const matchingFreelancers = allFreelancers.filter(freelancer => 
          normalizedSkills.every(searchSkill => 
            freelancer.skills.some(freelancerSkill => 
              freelancerSkill.toLowerCase() === searchSkill.toLowerCase()
            )
          )
        );
        
        setFreelancers(matchingFreelancers);
        setDebugInfo(prev => `${prev}\n\nFound ${matchingFreelancers.length} freelancers with ALL skills`);
      }
      
      // Show matched freelancers and their skills
      if (freelancers.length > 0) {
        const skillsLog = freelancers.map(f => `${f.name}: [${f.skills.join(', ')}]`).join('\n');
        setDebugInfo(prev => `${prev}\n\nMatching freelancers:\n${skillsLog}`);
      }
      
    } catch (error) {
      console.error('Error searching freelancers:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while searching freelancers');
      setFreelancers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Find Freelancers</h2>
      
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Search by Skills</label>
        <TagInput 
          tags={searchSkills} 
          setTags={setSearchSkills}
          placeholder="Enter skills to search for freelancers"
        />
        <p className="text-sm text-gray-500 mt-1">
          Add multiple skills to search for freelancers that have ALL of these skills
        </p>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      {debugInfo && (
        <div className="p-4 mb-4 bg-gray-100 text-gray-800 rounded text-xs font-mono whitespace-pre-line">
          {debugInfo}
        </div>
      )}
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : freelancers.length > 0 ? (
          freelancers.map((freelancer) => (
            <div key={freelancer._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <h3 className="text-lg font-semibold">{freelancer.name}</h3>
              <p className="text-gray-600">{freelancer.email}</p>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Skills:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {freelancer.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            {searchSkills.length > 0 
              ? `No freelancers found with all these skills: ${searchSkills.join(', ')}`
              : 'No freelancers found. Try adding some first!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFreelancers; 