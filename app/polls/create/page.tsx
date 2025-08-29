"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../lib/supabaseClient";

export default function CreatePollPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]); // Start with 2 options
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!question.trim()) {
      setError("Question is required.");
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      setError("All options must be filled.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("polls").insert({
      question,
      options,
      created_by: user.id,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Poll created successfully!");
      setTimeout(() => router.push("/polls"), 1500);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create a New Poll</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-2">Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your poll question"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center mb-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="flex-1 border rounded px-3 py-2"
                placeholder={`Option ${idx + 1}`}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="ml-2 text-red-500"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
          >
            Add Option
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-green-600 text-white rounded font-semibold"
        >
          {loading ? "Creating..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
}
