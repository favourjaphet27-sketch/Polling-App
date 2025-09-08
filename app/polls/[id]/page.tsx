"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';

// Mock data for initial development
const mockPoll = {
  id: '1',
  question: 'What is your favorite programming language?',
  options: ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go'],
  created_at: new Date().toISOString(),
  created_by: 'user-123',
};

// Poll type definition
type Poll = {
  id: string;
  question: string;
  options: string[];
  created_at: string;
  created_by: string;
};

export default function PollDetail() {
  // Get poll ID from route parameters
  const params = useParams();
  const pollId = params.id as string;
  const router = useRouter();
  
  // Auth context for user information
  const { user, isLoading: authLoading } = useAuth();
  
  // State management
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCounts, setVoteCounts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch poll data and check if user has voted
  useEffect(() => {
    async function fetchPollData() {
      setIsLoading(true);
      setError(null);
      
      try {
        // For development, use mock data
        // In production, uncomment the following code to fetch from Supabase
        
        /*
        const { data, error } = await supabase
          .from('polls')
          .select('*')
          .eq('id', pollId)
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Poll not found');
        
        setPoll(data);
        */
        
        // Using mock data for now
        setPoll({...mockPoll, id: pollId});
        
        // Initialize vote counts (all zeros for mock data)
        setVoteCounts(Array(mockPoll.options.length).fill(0));
        
        // Check if user has already voted on this poll
        if (user) {
          /*
          const { data: voteData, error: voteError } = await supabase
            .from('votes')
            .select('option_index')
            .eq('poll_id', pollId)
            .eq('user_id', user.id)
            .single();
            
          if (voteData) {
            setHasVoted(true);
            setSelectedOption(voteData.option_index);
          }
          */
          
          // Mock: User hasn't voted yet
          setHasVoted(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!authLoading) {
      fetchPollData();
    }
  }, [pollId, user, authLoading]);

  // Handle option selection
  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  // Handle vote submission
  const handleSubmitVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedOption === null) {
      setError('Please select an option');
      return;
    }
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // For development, simulate successful vote
      // In production, uncomment the following code to submit to Supabase
      
      /*
      const { error } = await supabase.from('votes').insert({
        poll_id: pollId,
        user_id: user.id,
        option_index: selectedOption,
      });
      
      if (error) throw error;
      */
      
      // Update local state to reflect the vote
      setHasVoted(true);
      setSuccess('Your vote has been recorded!');
      
      // Update vote counts (simulate for mock data)
      setVoteCounts(prev => {
        const newCounts = [...prev];
        newCounts[selectedOption] += 1;
        return newCounts;
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading poll...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !poll) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-lg">{error || 'Poll not found'}</p>
          <Link href="/polls" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Back to Polls
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Back button */}
      <Link href="/polls" className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Polls
      </Link>
      
      {/* Poll question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{poll.question}</h1>
        <p className="text-gray-500 text-sm">
          Created on {new Date(poll.created_at).toLocaleDateString()}
        </p>
      </div>
      
      {/* Error and success messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{success}</p>
        </div>
      )}
      
      {/* Voting form or results */}
      {!hasVoted ? (
        <form onSubmit={handleSubmitVote} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
          
          <div className="space-y-3 mb-6">
            {poll.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`option-${index}`}
                  name="poll-option"
                  value={index}
                  checked={selectedOption === index}
                  onChange={() => handleOptionSelect(index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`option-${index}`} className="ml-2 block text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || selectedOption === null}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Poll Results</h2>
          
          <div className="space-y-4">
            {poll.options.map((option, index) => {
              const count = voteCounts[index] || 0;
              const total = voteCounts.reduce((sum, current) => sum + current, 0) || 1;
              const percentage = Math.round((count / total) * 100);
              
              return (
                <div key={index} className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700">{option}</span>
                    <span className="text-gray-500">
                      {count} vote{count !== 1 ? 's' : ''} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${selectedOption === index ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-green-600 font-medium">
              Thank you for voting! Your vote has been recorded.
            </p>
            {selectedOption !== null && (
              <p className="text-gray-600 mt-2">
                You voted for: <span className="font-medium">{poll.options[selectedOption]}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}