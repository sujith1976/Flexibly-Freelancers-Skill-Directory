import React, { useState, FormEvent, Dispatch, SetStateAction } from 'react';
import TagInput from './TagInput';
import { ENDPOINTS, apiRequest } from '@/utils/api';

interface FormData {
  name: string;
  email: string;
  skills: string[];
  description: string;
}

interface FreelancerResponse {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  description: string;
  createdAt: string;
}

const AddFreelancerForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    skills: [],
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [wordCount, setWordCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      // Count words in description
      const words = value.trim() ? value.trim().split(/\s+/).length : 0;
      setWordCount(words);
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Improved validation
    if (!formData.name.trim()) {
      setMessage({ text: 'Name is required', type: 'error' });
      return;
    }
    
    if (!formData.email.trim()) {
      setMessage({ text: 'Email is required', type: 'error' });
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    
    if (formData.skills.length === 0) {
      setMessage({ text: 'At least one skill must be added', type: 'error' });
      return;
    }
    
    if (wordCount > 300) {
      setMessage({ text: 'Description cannot exceed 300 words', type: 'error' });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Debug logging to check what's being sent
      console.log("Submitting freelancer data:", formData);
      
      const response = await apiRequest<FreelancerResponse>(ENDPOINTS.freelancers, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      // Debug logging to check the response
      console.log("Server response:", response);
      
      setMessage({ text: 'Freelancer added successfully!', type: 'success' });
      setFormData({ name: '', email: '', skills: [], description: '' });
      setWordCount(0);
    } catch (error) {
      console.error('Error adding freelancer:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        setMessage({ 
          text: 'A freelancer with this email already exists',
          type: 'error' 
        });
      } else {
        setMessage({ 
          text: error instanceof Error ? error.message : 'An error occurred while adding the freelancer', 
          type: 'error' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Properly typed skill tags handler
  const setSkillTags: Dispatch<SetStateAction<string[]>> = (value) => {
    if (typeof value === 'function') {
      setFormData(prevData => ({
        ...prevData,
        skills: value(prevData.skills)
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        skills: value
      }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add Freelancer</h2>
      
      {message.text && (
        <div 
          className={`p-4 mb-4 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Freelancer's name"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Freelancer's email"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="skills" className="block text-gray-700 font-medium mb-2">Skills</label>
          <TagInput 
            tags={formData.skills} 
            setTags={setSkillTags} 
            placeholder="Type a skill and press Enter"
          />
          <p className="text-sm text-gray-500 mt-1">
            Type a skill and press Enter to add it. Examples: web dev, javascript, react, design
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description <span className="font-normal">(up to 300 words)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the freelancer's experience, expertise, and background..."
          />
          <div className={`text-sm mt-1 flex justify-end ${wordCount > 300 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
            {wordCount}/300 words
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || wordCount > 300}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
            isLoading || wordCount > 300 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Adding...' : 'Add Freelancer'}
        </button>
      </form>
    </div>
  );
};

export default AddFreelancerForm; 