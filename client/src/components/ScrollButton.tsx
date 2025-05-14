import React, { useState, useEffect } from 'react';

const ScrollButton: React.FC = () => {
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  
  useEffect(() => {
    const checkScrollPosition = () => {
      // Show the scroll up button when user has scrolled down a bit
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollUp(scrollTop > 300);
      
      // Check if user is at the bottom of the page
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight, 
        document.body.offsetHeight, 
        document.documentElement.clientHeight, 
        document.documentElement.scrollHeight, 
        document.documentElement.offsetHeight
      );
      
      const scrolledToBottom = scrollTop + windowHeight >= documentHeight - 100;
      setIsAtBottom(scrolledToBottom);
    };
    
    window.addEventListener('scroll', checkScrollPosition);
    
    // Initial check
    checkScrollPosition();
    
    return () => window.removeEventListener('scroll', checkScrollPosition);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-2 z-50">
      {showScrollUp && (
        <button
          onClick={scrollToTop}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-300"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
      
      {!isAtBottom && (
        <button
          onClick={scrollToBottom}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-300"
          aria-label="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ScrollButton; 