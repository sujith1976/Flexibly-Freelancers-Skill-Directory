import React, { useState, useEffect, useRef } from 'react';
import TagInput from './TagInput';
import { ENDPOINTS, apiRequest } from '@/utils/api';
import AIFreelancerBot from './AIFreelancerBot';

interface SkillRating {
  skill: string;
  rating: number;
}

interface Freelancer {
  _id: string;
  name: string;
  email: string;
  location?: string;
  skills: string[];
  skillRatings?: SkillRating[];
  description?: string;
  createdAt: string;
}

interface EditingState {
  isEditing: boolean;
  freelancerId: string | null;
  skills: string[];
}

const SearchFreelancers: React.FC = () => {
  const [searchSkills, setSearchSkills] = useState<string[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    freelancerId: null,
    skills: []
  });

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
      
      const data = await apiRequest<Freelancer[]>(ENDPOINTS.freelancers);
      console.log("Fetched freelancers:", data); // Debug log to see the raw data
      setFreelancers(data);
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
        
        const data = await apiRequest<Freelancer[]>(
          `${ENDPOINTS.freelancerSearch}?skills=${encodeURIComponent(searchTerm)}`
        );
        
        setFreelancers(data);
      } 
      // For multiple skills, use a manual client-side approach
      else {
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
      }
    } catch (error) {
      console.error('Error searching freelancers:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while searching freelancers');
      setFreelancers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (freelancer: Freelancer) => {
    setEditingState({
      isEditing: true,
      freelancerId: freelancer._id,
      skills: [...freelancer.skills]
    });
    setMessage({ text: '', type: '' });
  };

  const cancelEditing = () => {
    setEditingState({
      isEditing: false,
      freelancerId: null,
      skills: []
    });
  };

  const handleSkillsChange = (newSkills: string[]) => {
    setEditingState(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const saveSkills = async (freelancerId: string, freelancer: Freelancer) => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get the updated freelancer data
      const updatedFreelancer = {
        ...freelancer,
        skills: editingState.skills
      };
      
      // Make sure we don't lose the description if it exists
      if (freelancer.description) {
        updatedFreelancer.description = freelancer.description;
      }
      
      await apiRequest(ENDPOINTS.freelancerById(freelancerId), {
        method: 'PUT',
        body: JSON.stringify(updatedFreelancer)
      });
      
      // Update the local state
      setFreelancers(prev => prev.map(f => 
        f._id === freelancerId ? {...f, skills: editingState.skills} : f
      ));
      
      setMessage({ text: 'Skills updated successfully!', type: 'success' });
      cancelEditing();
    } catch (error) {
      console.error('Error updating freelancer:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating skills');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFreelancer = async (freelancerId: string) => {
    if (!confirm('Are you sure you want to delete this freelancer? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      await apiRequest(ENDPOINTS.freelancerById(freelancerId), {
        method: 'DELETE'
      });
      
      // Update the local state
      setFreelancers(prev => prev.filter(f => f._id !== freelancerId));
      
      setMessage({ text: 'Freelancer deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting freelancer:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while deleting freelancer');
    } finally {
      setIsLoading(false);
    }
  };

  // Open modal with freelancer details
  const openFreelancerDetails = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedFreelancer(null);
  };

  // Handle click outside of modal to close it
  const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Description Modal component
  const DescriptionModal = () => {
    if (!selectedFreelancer || !showModal) return null;

    // State for auto-scrolling
    const [autoScrollActive, setAutoScrollActive] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('down');
    const [scrollSpeed, setScrollSpeed] = useState(1); // 1 = slow, 2 = medium, 3 = fast
    const descriptionRef = useRef<HTMLDivElement>(null);
    
    // Toggle auto-scroll
    const toggleAutoScroll = () => {
      setAutoScrollActive(!autoScrollActive);
    };
    
    // Change scroll direction
    const toggleScrollDirection = () => {
      setScrollDirection(prev => prev === 'down' ? 'up' : 'down');
    };
    
    // Change scroll speed
    const changeScrollSpeed = () => {
      setScrollSpeed(prev => (prev % 3) + 1); // Cycle between 1, 2, 3
    };
    
    // Handle manual scroll controls
    const scrollContent = (direction: 'up' | 'down') => {
      if (descriptionRef.current) {
        const scrollValue = direction === 'down' ? 50 : -50;
        descriptionRef.current.scrollTop += scrollValue;
      }
    };
    
    // Effect for auto-scrolling
    useEffect(() => {
      if (!autoScrollActive || !descriptionRef.current) return;
      
      const scrollAmount = scrollDirection === 'down' ? 1 : -1;
      const scrollInterval = 4 - scrollSpeed; // Convert speed (1,2,3) to interval (slower is higher)
      
      const interval = setInterval(() => {
        if (descriptionRef.current) {
          descriptionRef.current.scrollTop += scrollAmount;
          
          // Check if we've reached the end or beginning of content
          const { scrollTop, scrollHeight, clientHeight } = descriptionRef.current;
          
          // If at bottom and scrolling down, or at top and scrolling up, stop auto-scroll
          if ((scrollTop + clientHeight >= scrollHeight && scrollDirection === 'down') || 
              (scrollTop <= 0 && scrollDirection === 'up')) {
            setAutoScrollActive(false);
          }
        }
      }, 25 * scrollInterval);
      
      return () => clearInterval(interval);
    }, [autoScrollActive, scrollDirection, scrollSpeed]);

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleModalBackdropClick}
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden animate-fadeIn">
          <div className="bg-blue-600 text-white py-3 px-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">{selectedFreelancer.name}</h3>
            <button 
              onClick={closeModal}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{selectedFreelancer.email}</p>
            </div>
            
            {selectedFreelancer.location && (
              <div className="mb-4">
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {selectedFreelancer.location}
                </p>
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Skills</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedFreelancer.skills.map((skill, index) => {
                  // Find skill rating if available
                  const skillRating = selectedFreelancer.skillRatings?.find(sr => 
                    sr.skill.toLowerCase() === skill.toLowerCase()
                  );
                  
                  return (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center"
                    >
                      {skill}
                      {skillRating && (
                        <span className="ml-1 flex items-center">
                          <span className="mx-1 text-gray-400">•</span>
                          <span className="text-yellow-600 flex items-center">
                            {skillRating.rating}
                            <svg 
                              className="w-3 h-3 ml-0.5 text-yellow-500" 
                              fill="currentColor" 
                              viewBox="0 0 20 20" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </span>
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
            
            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-500">Description</p>
                
                {/* Scroll controls */}
                {selectedFreelancer.description && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => scrollContent('up')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-1 rounded"
                      title="Scroll up"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => scrollContent('down')}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-1 rounded"
                      title="Scroll down"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={toggleAutoScroll}
                      className={`p-1 rounded ${autoScrollActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                      title={`${autoScrollActive ? 'Stop auto-scroll' : 'Start auto-scroll'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    
                    {/* Only show these when auto-scroll is active */}
                    {autoScrollActive && (
                      <>
                        <button 
                          onClick={toggleScrollDirection}
                          className="bg-blue-200 text-blue-800 p-1 rounded"
                          title={`Direction: ${scrollDirection}`}
                        >
                          {scrollDirection === 'down' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                            </svg>
                          )}
                        </button>
                        <button 
                          onClick={changeScrollSpeed}
                          className="bg-blue-200 text-blue-800 p-1 rounded"
                          title={`Speed: ${scrollSpeed === 1 ? 'Slow' : scrollSpeed === 2 ? 'Medium' : 'Fast'}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {selectedFreelancer.description ? (
                <div 
                  ref={descriptionRef}
                  className="mt-1 text-gray-700 max-h-64 overflow-y-auto pr-2 description-scrollbar border border-gray-100 rounded p-3"
                >
                  {selectedFreelancer.description}
                </div>
              ) : (
                <p className="mt-1 text-gray-400 italic">No description available</p>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-3 flex justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle freelancer selection from AI bot
  const handleAIFreelancerSelect = (freelancer: Freelancer) => {
    setSelectedFreelancer(freelancer);
    setShowModal(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold">Find Freelancers</h2>
          <AIFreelancerBot onSelectFreelancer={handleAIFreelancerSelect} />
        </div>
      </div>
      
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
      
      {message.text && (
        <div className={`p-4 mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded`}>
          {message.text}
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : freelancers.length > 0 ? (
          freelancers.map((freelancer) => (
            <div 
              key={freelancer._id} 
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => openFreelancerDetails(freelancer)}
                  >
                    {freelancer.name}
                  </h3>
                  <div className="flex items-center text-gray-600">
                    <span>{freelancer.email}</span>
                    {freelancer.location && (
                      <span className="ml-3 flex items-center text-gray-500 text-sm">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {freelancer.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {editingState.isEditing && editingState.freelancerId === freelancer._id ? (
                    <>
                      <button 
                        onClick={() => saveSkills(freelancer._id, freelancer)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button 
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => startEditing(freelancer)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Edit Skills
                      </button>
                      <button 
                        onClick={() => deleteFreelancer(freelancer._id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Skills:</span>
                {editingState.isEditing && editingState.freelancerId === freelancer._id ? (
                  <div className="mt-1">
                    <TagInput 
                      tags={editingState.skills} 
                      setTags={(value: React.SetStateAction<string[]>) => handleSkillsChange(
                        typeof value === 'function' 
                          ? value(editingState.skills) 
                          : value
                      )}
                      placeholder="Edit skills"
                    />
                  </div>
                ) : (
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
                )}
              </div>
              
              <div className="mt-2 text-right">
                <button
                  onClick={() => openFreelancerDetails(freelancer)}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  View Details
                </button>
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
      
      {/* Render the modal */}
      <DescriptionModal />
    </div>
  );
};

export default SearchFreelancers; 