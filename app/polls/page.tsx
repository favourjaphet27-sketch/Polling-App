"use client";
// TODO: connect to Supabase for polls data and voting
import React, { useEffect, useState } from 'react';
import Link from "next/link";
type Poll = {
  id: string;
  question: string;
  options: string[];
  created_at: string;
  created_by: string;
};

type VoteCount = {
  [pollId: string]: number[]; // index = optionIndex, value = count
};
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export default function PollsDashboard() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [voteCounts, setVoteCounts] = useState<VoteCount>({});
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: number | null }>({});
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [voteLoading, setVoteLoading] = useState<string | null>(null); // poll id
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchPollsAndVotes() {
      setLoadingPolls(true);
  setError("");
  // Fetch polls
  const { data: pollsData, error: pollsError } = await supabase
    .from('polls')
    .select('id, question, options, created_at, created_by');
      if (pollsError) setError(pollsError.message);
      setPolls(pollsData || []);

      // Fetch vote counts for all polls
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('poll_id, option_index');
      if (votesError) setError(votesError.message);
      const counts: VoteCount = {};
      if (pollsData) {
        pollsData.forEach((poll: Poll) => {
          counts[poll.id] = Array(poll.options.length).fill(0);
        });
        if (votesData) {
          votesData.forEach((vote: { poll_id: string; option_index: number }) => {
            if (counts[vote.poll_id]) {
              counts[vote.poll_id][vote.option_index]++;
            }
          });
        }
      }
      setVoteCounts(counts);

      // Fetch user's votes
      if (user) {
        const { data: userVotesData } = await supabase
          .from('votes')
          .select('poll_id, option_index')
          .eq('user_id', user.id);
        const uv: { [pollId: string]: number | null } = {};
        if (userVotesData) {
          userVotesData.forEach((vote: { poll_id: string; option_index: number }) => {
            uv[vote.poll_id] = vote.option_index;
          });
        }
        setUserVotes(uv);
      }
      setLoadingPolls(false);
    }
    if (user) fetchPollsAndVotes();
  }, [user]);

  if (isLoading || loadingPolls) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    setLogoutLoading(true);
    await signOut();
    router.push('/auth/login');
    setLogoutLoading(false);
  };

  const isEmailVerified = user?.email_confirmed_at || user?.confirmed_at;

  const handleVote = async (pollId: string, optionIndex: number) => {
    setVoteLoading(pollId);
    setError("");
    setSuccess("");
    // Prevent double voting
    if (userVotes[pollId] !== undefined) {
      setError("You have already voted on this poll.");
      setVoteLoading(null);
      return;
    }
    // Insert vote
    const { error } = await supabase.from('votes').insert({
      poll_id: pollId,
      user_id: user.id,
      option_index: optionIndex,
    });
    setVoteLoading(null);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Vote submitted!");
      // Refresh votes
      setUserVotes((prev) => ({ ...prev, [pollId]: optionIndex }));
      setVoteCounts((prev) => {
        const updated = { ...prev };
        if (updated[pollId]) updated[pollId][optionIndex]++;
        return updated;
      });
    }
  };

  function handleEdit(id: string): void {
    // TODO: Implement edit functionality, e.g., navigate to edit page
    router.push(`/polls/edit/${id}`);
  }

  function handleDelete(id: string): void {
    throw new Error('Function not implemented.');
  }

  return (
  <div className="max-w-6xl mx-auto py-8 px-2 sm:px-4">
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Polls Dashboard</h1>
        <button
          onClick={handleLogout}
          disabled={logoutLoading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
        >
          {logoutLoading ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      {!isEmailVerified && (
        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          Please verify your email address to access all features. Check your inbox for a verification email.
        </div>
      )}

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {polls.length === 0 ? (
          <div className="col-span-3 text-center text-gray-500">No polls found.</div>
        ) : (
          polls.map((poll) => (
            <div key={poll.id} className="border rounded-lg p-4 shadow-sm flex flex-col">
              <h2 className="text-xl font-semibold mb-2">{poll.question}</h2>
              <p className="text-gray-600 mb-4">Created {new Date(poll.created_at).toLocaleDateString()}</p>
              <div className="space-y-2 mb-2 w-full">
                {poll.options.map((opt: string, idx: number) => {
                  const count = voteCounts[poll.id]?.[idx] || 0;
                  const userVoted = userVotes[poll.id] !== undefined;
                  const isUserVote = userVotes[poll.id] === idx;
                  return (
                    <button
                      key={idx}
                      className={`w-full px-2 py-2 rounded border flex flex-wrap justify-between items-center text-sm ${isUserVote ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'} disabled:bg-blue-300`}
                      onClick={() => handleVote(poll.id, idx)}
                      disabled={voteLoading === poll.id || userVoted}
                    >
                      <span className="truncate max-w-[60%]">{opt}</span>
                      <span className="ml-2 text-xs">{count} vote{count !== 1 ? 's' : ''}</span>
                      {isUserVote && <span className="ml-2 text-xs font-bold">Your Vote</span>}
                    </button>
                  );
                })}
              </div>
              {userVotes[poll.id] !== undefined && (
                <div className="text-green-600 text-sm">You voted for: {poll.options[userVotes[poll.id]!]}</div>
              )}
              {/* Edit/Delete for poll owner */}
              {poll.created_by === user.id && (
                <div className="flex flex-col sm:flex-row gap-2 mt-4 w-full">
                  <button
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full sm:w-auto"
                    onClick={() => handleEdit(poll.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto"
                    onClick={() => handleDelete(poll.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="mt-8 flex justify-end">
        <Link
          href="/polls/create"
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
        >
          <span>Create New Poll</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </Link>
      </div>
    </div>
  );
}