import React, { useState, useRef } from 'react';
import { ENDPOINTS, apiRequest } from '@/utils/api';

interface Freelancer {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  description?: string;
  createdAt: string;
}

interface AIFreelancerBotProps {
  onSelectFreelancer: (freelancer: Freelancer) => void;
}

const AIFreelancerBot: React.FC<AIFreelancerBotProps> = ({ onSelectFreelancer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{role: string; content: string}[]>([
    { role: 'assistant', content: 'Hi! I can help you find freelancers based on your requirements. Describe the skills or expertise you need, and I\'ll find the best matches.' }
  ]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [lastQuery, setLastQuery] = useState('');

  // Gemini API key
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyA2p671B_YDp0R7JDPytQSq7OKYYjjC7F0';
  
  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Direct keyword-based matching as a reliable backup method
  const findMatchingFreelancers = (userQuery: string, allFreelancers: Freelancer[]): Freelancer[] => {
    console.log("Using direct keyword matching for: ", userQuery);
    
    // Break query into keywords and key phrases
    const keywords = userQuery.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !['and', 'the', 'for', 'with', 'who', 'can', 'has', 'have', 'need'].includes(word));
    
    // Extract possible 2-word phrases for more accurate matching
    const phrases: string[] = [];
    for (let i = 0; i < keywords.length - 1; i++) {
      phrases.push(`${keywords[i]} ${keywords[i + 1]}`);
    }
    
    console.log("Keywords extracted:", keywords);
    console.log("Phrases extracted:", phrases);
    
    if (keywords.length === 0) return [];
    
    // Score each freelancer
    const scoredFreelancers = allFreelancers.map(freelancer => {
      let score = 0;
      const skillText = freelancer.skills.join(' ').toLowerCase();
      const descriptionText = (freelancer.description || '').toLowerCase();
      
      // Check each keyword
      keywords.forEach(keyword => {
        // Check skills (higher weight)
        if (skillText.includes(keyword)) {
          score += 5;
          
          // Exact skill match is even better
          if (freelancer.skills.some(skill => skill.toLowerCase() === keyword)) {
            score += 3;
          }
        }
        
        // Check description with increased weight
        if (descriptionText.includes(keyword)) {
          score += 4; // Increased from 3 to 4
          
          // Bonus for keywords appearing near the beginning of the description
          // This often indicates more relevance
          if (descriptionText.indexOf(keyword) < 100) {
            score += 1;
          }
          
          // Bonus for multiple occurrences of the keyword in description
          const occurrences = (descriptionText.match(new RegExp(keyword, 'g')) || []).length;
          if (occurrences > 1) {
            score += Math.min(occurrences - 1, 3); // Up to 3 bonus points for repeated keywords
          }
        }
      });
      
      // Check for phrase matches which are stronger indicators of relevance
      phrases.forEach(phrase => {
        if (skillText.includes(phrase)) {
          score += 4; // Extra points for matching phrases in skills
        }
        
        if (descriptionText.includes(phrase)) {
          score += 5; // Even more points for matching phrases in description
        }
      });
      
      // Extra points if has both skill and description matches
      if (keywords.some(keyword => skillText.includes(keyword)) && 
          keywords.some(keyword => descriptionText.includes(keyword))) {
        score += 5; // Bonus for matching both skill and description
      }
      
      return { freelancer, score };
    });
    
    // Sort by score (highest first) and return top 5
    return scoredFreelancers
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.freelancer);
  };

  // Process user query with Gemini API
  const processWithGemini = async (userQuery: string, allFreelancers: Freelancer[]): Promise<Freelancer[]> => {
    setError('');
    
    // If no API key is available, fallback to direct matching
    if (!API_KEY) {
      console.log("No Gemini API key available, using direct matching");
      setError("Gemini API key not configured. Using basic matching instead.");
      return findMatchingFreelancers(userQuery, allFreelancers);
    }
    
    try {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
      
      // Simplified approach: Just get Gemini to return a list of the best freelancer IDs
      const simplifiedFreelancers = allFreelancers.map(f => ({
        id: f._id,
        name: f.name,
        skills: f.skills,
        hasDescription: !!f.description,
        // Include more of the description for better analysis
        description: f.description ? f.description : 'No description available'
      }));
      
      // Enhanced prompt with clearer instructions about analyzing both skills and descriptions
      const prompt = `
      Task: Find the best freelancers for this request: "${userQuery}"

      Available freelancers:
      ${JSON.stringify(simplifiedFreelancers, null, 2)}

      Instructions:
      1. Thoroughly analyze BOTH the skills list AND the full description of each freelancer
      2. Look for direct matches and also conceptually related skills/experience in the descriptions
      3. Pay special attention to experience details mentioned in descriptions that might not be listed in skills
      4. Consider both explicit skill matches and implicit expertise suggested in descriptions
      5. Return ONLY a valid JSON array containing IDs of the top 3-5 best matching freelancers
      6. Format must be exactly: ["id1", "id2", "id3"]
      
      Respond with ONLY the JSON array, nothing else.
      `;
      
      console.log("Sending query to Gemini API:", userQuery);
      
      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      
      // Check for API errors
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        setError(`API error: ${response.status}`);
        // Fall back to direct matching
        return findMatchingFreelancers(userQuery, allFreelancers);
      }
      
      const data = await response.json();
      
      // Handle valid response
      if (data.candidates && data.candidates[0]?.content?.parts) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        console.log("Gemini response:", aiResponse);
        
        try {
          // Find JSON in response - multiple approaches for robustness
          let idArray: string[] = [];
          
          // Approach 1: Direct JSON parse if the response is clean JSON
          try {
            idArray = JSON.parse(aiResponse.trim());
          } catch (e) {
            console.log("Direct parse failed, trying regex extraction");
            
            // Approach 2: Extract using regex
            const matches = aiResponse.match(/\[([\s\S]*?)\]/);
            if (matches) {
              idArray = JSON.parse(matches[0]);
            } else {
              // Approach 3: Extract IDs individually using a more forgiving regex
              const idMatches = aiResponse.match(/"([^"]+)"/g);
              if (idMatches) {
                idArray = idMatches.map((id: string) => id.replace(/"/g, ''));
              }
            }
          }
          
          console.log("Extracted IDs:", idArray);
          
          if (idArray && idArray.length > 0) {
            // Match IDs to freelancers
            const matchedFreelancers = allFreelancers.filter(f => 
              idArray.includes(f._id)
            );
            
            console.log(`Found ${matchedFreelancers.length} matching freelancers`);
            
            if (matchedFreelancers.length > 0) {
              return matchedFreelancers;
            }
          }
          
          // If we got here, Gemini didn't return usable results
          console.log("Gemini didn't return usable results, falling back to keyword matching");
          return findMatchingFreelancers(userQuery, allFreelancers);
          
        } catch (e: unknown) {
          console.error("Error processing with Gemini:", e);
          setError(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
          return findMatchingFreelancers(userQuery, allFreelancers);
        }
      } else {
        console.error("Unexpected Gemini response format:", data);
        setError("AI returned an unexpected response");
        return findMatchingFreelancers(userQuery, allFreelancers);
      }
    } catch (e: unknown) {
      console.error("Error processing with Gemini:", e);
      setError(`Error: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return findMatchingFreelancers(userQuery, allFreelancers);
    }
  };

  // Add a function to identify matching skills and highlight relevant parts
  const getMatchInfo = (freelancer: Freelancer, query: string) => {
    const queryTerms = query.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !['and', 'the', 'for', 'with', 'who', 'can', 'has', 'have', 'need'].includes(word));
    
    // Find matching skills
    const matchingSkills = freelancer.skills.filter(skill => 
      queryTerms.some(term => skill.toLowerCase().includes(term))
    );
    
    // Extract 2-word phrases for better context matching
    const phrases: string[] = [];
    for (let i = 0; i < queryTerms.length - 1; i++) {
      phrases.push(`${queryTerms[i]} ${queryTerms[i + 1]}`);
    }
    
    // Find relevant parts of description if it exists
    let relevantDescription = '';
    let relevantDescriptions: string[] = [];
    
    if (freelancer.description) {
      const description = freelancer.description.toLowerCase();
      
      // Try to find sentences containing query terms
      const sentences = freelancer.description.split(/[.!?]+/).filter(s => s.trim());
      
      // Check for sentences with query terms
      for (const sentence of sentences) {
        const lowerSentence = sentence.toLowerCase();
        
        // Higher priority: Check for phrase matches first
        if (phrases.some(phrase => lowerSentence.includes(phrase))) {
          relevantDescriptions.push(sentence.trim());
          continue;
        }
        
        // Then check for single term matches
        if (queryTerms.some(term => lowerSentence.includes(term))) {
          relevantDescriptions.push(sentence.trim());
        }
      }
      
      // If we found relevant sentences, join them
      if (relevantDescriptions.length > 0) {
        // Keep it to a reasonable length (max 2-3 sentences)
        relevantDescription = relevantDescriptions.slice(0, 2).join(". ") + (
          relevantDescriptions.length > 2 ? "..." : ""
        );
      } else {
        // If no direct matches, just use the first part of description
        relevantDescription = freelancer.description.substring(0, 120) + '...';
      }
    }
    
    return {
      matchingSkills,
      relevantDescription,
      hasMatchingSkills: matchingSkills.length > 0,
      hasRelevantDescription: relevantDescriptions.length > 0
    };
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    const currentQuery = query; // Store the query for later use
    
    // Add user message to chat
    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setShowResults(false);
    setFreelancers([]);
    setError('');
    
    try {
      // First fetch all freelancers
      const allFreelancers = await apiRequest<Freelancer[]>(ENDPOINTS.freelancers);
      console.log(`Fetched ${allFreelancers.length} freelancers from database`);
      
      if (allFreelancers.length === 0) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'There are no freelancers in the database yet. Please add some freelancers first.' 
        }]);
        setIsLoading(false);
        return;
      }
      
      // Try Gemini first, with fallback to direct matching
      let matchedFreelancers: Freelancer[] = [];
      
      try {
        matchedFreelancers = await processWithGemini(currentQuery, allFreelancers);
      } catch (err) {
        console.error("Error with Gemini API, using fallback:", err);
        matchedFreelancers = findMatchingFreelancers(currentQuery, allFreelancers);
      }
      
      // Update state with results
      setFreelancers(matchedFreelancers);
      
      // Generate response message
      let responseContent = '';
      if (matchedFreelancers.length > 0) {
        responseContent = `I found ${matchedFreelancers.length} freelancer(s) that match your requirements based on their skills and descriptions. You can view them below.`;
        setShowResults(true);
        
        // Store current query for highlighting matches
        setLastQuery(currentQuery);
      } else {
        responseContent = "I couldn't find any freelancers that match your requirements. Try broadening your search or describing your needs differently.";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: responseContent }]);
    } catch (error) {
      console.error('Error in AI search:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while searching. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
      setQuery('');
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <div className="relative inline-block">
      {/* AI Assistant Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 transition-all flex items-center justify-center ml-2"
        aria-label="AI Assistant"
        title="AI Freelancer Assistant"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      </button>
      
      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-10 animate-fadeIn">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">AI Freelancer Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 ${msg.role === 'user' ? 'text-right' : ''}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="mb-4">
                <div className="inline-block p-3 rounded-lg max-w-[80%] bg-white text-gray-800 border border-gray-200 rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-4 text-center">
                <div className="inline-block p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                  {error}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Freelancer Results */}
          {showResults && freelancers.length > 0 && (
            <div className="max-h-60 overflow-y-auto border-t border-gray-200 bg-white p-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2 px-2">Recommended Freelancers:</h4>
              <div className="space-y-2">
                {freelancers.map((freelancer) => {
                  // Get match information for this freelancer
                  const { matchingSkills, relevantDescription, hasMatchingSkills, hasRelevantDescription } = getMatchInfo(freelancer, lastQuery);
                  
                  return (
                    <div 
                      key={freelancer._id} 
                      className="border border-gray-200 rounded p-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => onSelectFreelancer(freelancer)}
                    >
                      <div className="font-medium text-blue-600">{freelancer.name}</div>
                      
                      <div className="text-xs text-gray-500 mb-1">
                        <span className="font-medium">Skills: </span>
                        {freelancer.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className={`mr-1 ${matchingSkills.includes(skill) ? 'bg-green-100 text-green-800 font-medium px-1 rounded' : ''}`}
                          >
                            {skill}{index < freelancer.skills.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                      
                      {hasRelevantDescription && (
                        <div className="text-xs text-gray-600 mt-1 border-l-2 border-blue-300 pl-2">
                          <span className="font-medium">Relevant experience: </span>
                          {relevantDescription}
                        </div>
                      )}
                      
                      {!hasRelevantDescription && freelancer.description && (
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Description: </span>
                          {freelancer.description.length > 100 
                            ? `${freelancer.description.substring(0, 100)}...` 
                            : freelancer.description}
                        </div>
                      )}
                      
                      <div className="text-xs text-blue-600 mt-1 text-right">
                        Click to view full details
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Input Form */}
          <form onSubmit={handleQuerySubmit} className="border-t border-gray-200 p-4">
            <div className="flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe skills you need..."
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isLoading || !query.trim()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIFreelancerBot; 