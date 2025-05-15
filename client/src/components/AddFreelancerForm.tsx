import React, { useState, FormEvent, Dispatch, SetStateAction } from 'react';
import TagInput from './TagInput';
import { ENDPOINTS, apiRequest } from '@/utils/api';

interface SkillRating {
  skill: string;
  rating: number;
}

interface FormData {
  name: string;
  email: string;
  location: string;
  skills: string[];
  skillRatings: SkillRating[];
  description: string;
}

interface FreelancerResponse {
  _id: string;
  name: string;
  email: string;
  location: string;
  skills: string[];
  skillRatings: SkillRating[];
  description: string;
  createdAt: string;
}

const AddFreelancerForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    location: '',
    skills: [],
    skillRatings: [],
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

  // Handle rating change for a specific skill
  const handleRatingChange = (skill: string, rating: number) => {
    const updatedRatings = [...formData.skillRatings];
    const existingIndex = updatedRatings.findIndex(sr => sr.skill === skill.toLowerCase());
    
    if (existingIndex >= 0) {
      // Update existing rating
      updatedRatings[existingIndex] = { ...updatedRatings[existingIndex], rating };
    } else {
      // Add new rating
      updatedRatings.push({ skill: skill.toLowerCase(), rating });
    }
    
    setFormData({ ...formData, skillRatings: updatedRatings });
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
      
      // Ensure every skill has a rating
      const completeSkillRatings = formData.skills.map(skill => {
        const existingRating = formData.skillRatings.find(sr => sr.skill === skill.toLowerCase());
        return existingRating || { skill: skill.toLowerCase(), rating: 3 }; // Default to 3 if not rated
      });
      
      // Prepare final data with complete skill ratings
      const finalData = {
        ...formData,
        skillRatings: completeSkillRatings
      };
      
      // Debug logging to check what's being sent
      console.log("Submitting freelancer data:", finalData);
      
      const response = await apiRequest<FreelancerResponse>(ENDPOINTS.freelancers, {
        method: 'POST',
        body: JSON.stringify(finalData)
      });
      
      // Debug logging to check the response
      console.log("Server response:", response);
      
      setMessage({ text: 'Freelancer added successfully!', type: 'success' });
      setFormData({ 
        name: '', 
        email: '', 
        location: '',
        skills: [], 
        skillRatings: [],
        description: '' 
      });
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
    let newSkills: string[];
    
    if (typeof value === 'function') {
      newSkills = value(formData.skills);
    } else {
      newSkills = value;
    }
    
    // When skills change, ensure skillRatings is kept in sync
    const updatedRatings = formData.skillRatings.filter(rating => 
      newSkills.includes(rating.skill)
    );
    
    setFormData(prevData => ({
      ...prevData,
      skills: newSkills,
      skillRatings: updatedRatings
    }));
  };

  // Star rating component
  const StarRating = ({ skill, currentRating, onChange }: { 
    skill: string, 
    currentRating: number, 
    onChange: (rating: number) => void 
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
            aria-label={`Rate ${skill} ${star} out of 5 stars`}
          >
            <svg 
              className={`w-5 h-5 ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  // Get the current rating for a skill
  const getSkillRating = (skill: string): number => {
    const rating = formData.skillRatings.find(sr => sr.skill === skill.toLowerCase());
    return rating ? rating.rating : 3; // Default to 3
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
          <label htmlFor="location" className="block text-gray-700 font-medium mb-2">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="City, Country"
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
        
        {formData.skills.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Skill Ratings (1-5)</label>
            <div className="space-y-2 bg-gray-50 p-3 rounded border border-gray-200">
              {formData.skills.map((skill) => (
                <div key={skill} className="flex justify-between items-center">
                  <span className="text-gray-700">{skill}</span>
                  <StarRating 
                    skill={skill}
                    currentRating={getSkillRating(skill)}
                    onChange={(rating) => handleRatingChange(skill, rating)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
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