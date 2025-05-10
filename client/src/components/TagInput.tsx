import React, { useState, KeyboardEvent, useRef, useEffect, Dispatch, SetStateAction } from 'react';

interface TagInputProps {
  tags: string[];
  setTags: Dispatch<SetStateAction<string[]>>;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ 
  tags, 
  setTags, 
  placeholder = 'Type a skill and press Enter' 
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  // Normalize tag (trim and lowercase)
  const normalizeTag = (tag: string): string => {
    return tag.trim().toLowerCase();
  };
  
  // Handle key down events to add tags
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      
      const normalizedInput = normalizeTag(input);
      
      // Don't add duplicate tags (case insensitive)
      if (!tags.map(tag => normalizeTag(tag)).includes(normalizedInput)) {
        setTags(prevTags => [...prevTags, normalizedInput]);
      }
      
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      setTags(prevTags => prevTags.slice(0, -1));
    }
  };
  
  // Remove a specific tag
  const removeTag = (tagToRemove: string) => {
    setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  };
  
  // Focus input when clicking on the container
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className="flex flex-wrap items-center p-2 border border-gray-300 rounded-md min-h-[40px] focus-within:border-blue-500"
      onClick={focusInput}
    >
      {tags.map((tag, index) => (
        <div key={index} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 mr-2 mb-2">
          <span>{tag}</span>
          <button
            type="button"
            className="ml-2 text-blue-600 hover:text-blue-900 focus:outline-none"
            onClick={() => removeTag(tag)}
          >
            &times;
          </button>
        </div>
      ))}
      
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="flex-grow border-none outline-none bg-transparent py-1"
        placeholder={tags.length === 0 ? placeholder : ''}
      />
    </div>
  );
};

export default TagInput; 