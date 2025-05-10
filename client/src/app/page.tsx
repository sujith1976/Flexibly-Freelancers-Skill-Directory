"use client";

import { useState } from 'react';
import AddFreelancerForm from '@/components/AddFreelancerForm';
import SearchFreelancers from '@/components/SearchFreelancers';
import ServerStatus from '@/components/ServerStatus';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'add' | 'find'>('add');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Freelancer Skills Directory</h1>
        
        {/* Server Status Indicator */}
        <div className="max-w-2xl mx-auto">
          <ServerStatus />
        </div>
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                activeTab === 'add'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Add Freelancer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('find')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
                activeTab === 'find'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Find Freelancers
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="max-w-2xl mx-auto">
          {activeTab === 'add' ? <AddFreelancerForm /> : <SearchFreelancers />}
        </div>
      </div>
    </main>
  );
} 