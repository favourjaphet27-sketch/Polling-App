"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabaseClient";
type Poll = {
  id: string;
  question: string;
  options: string[];
  created_at: string;
};

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [createdPolls, setCreatedPolls] = useState<Poll[]>([]);
  const [votedPolls, setVotedPolls] = useState<(Poll & { userVote: number | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) return;
      setLoading(true);
      // Fetch polls created by user
      const { data: polls } = await supabase
        .from("polls")
        .select("id, question, options, created_at")
        .eq("created_by", user.id);
      setCreatedPolls((polls || []) as Poll[]);
      // Fetch votes by user
      const { data: votes } = await supabase
        .from("votes")
        .select("poll_id, option_index")
        .eq("user_id", user.id);
      // Get poll details for voted polls
      const pollIds = votes ? (votes as { poll_id: string }[]).map((v) => v.poll_id) : [];
      let votedPollsData: (Poll & { userVote: number | null })[] = [];
      if (pollIds.length > 0) {
        const { data: votedPollsRaw } = await supabase
          .from("polls")
          .select("id, question, options, created_at")
          .in("id", pollIds);
        votedPollsData = (votedPollsRaw || []).map((poll: Poll) => {
          const vote = (votes as { poll_id: string; option_index: number }[]).find((v) => v.poll_id === poll.id);
          return { ...poll, userVote: vote ? vote.option_index : null };
        });
      }
      setVotedPolls(votedPollsData);
      setLoading(false);
    }
    if (user) fetchProfileData();
  }, [user]);

  if (isLoading || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center py-10">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-2 sm:px-4">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Polls You Created</h2>
        {createdPolls.length === 0 ? (
          <div className="text-gray-500">You haven't created any polls yet.</div>
        ) : (
          <ul className="space-y-2">
            {createdPolls.map((poll) => (
              <li key={poll.id} className="border rounded p-3">
                <div className="font-semibold">{poll.question}</div>
                <div className="text-xs text-gray-500">Created {new Date(poll.created_at).toLocaleDateString()}</div>
                <div className="text-sm mt-1">Options: {poll.options.join(", ")}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Polls You Voted In</h2>
        {votedPolls.length === 0 ? (
          <div className="text-gray-500">You haven't voted in any polls yet.</div>
        ) : (
          <ul className="space-y-2">
            {votedPolls.map((poll) => (
              <li key={poll.id} className="border rounded p-3">
                <div className="font-semibold">{poll.question}</div>
                <div className="text-xs text-gray-500">Created {new Date(poll.created_at).toLocaleDateString()}</div>
                <div className="text-sm mt-1">
                  Your Vote: <span className="font-bold">{poll.userVote !== null ? poll.options[poll.userVote] : "N/A"}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
