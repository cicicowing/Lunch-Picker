import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { startOfWeek, format } from 'date-fns';
import './Suggestions.css';

function Suggestions({ user }) {
  const [suggestions, setSuggestions] = useState([]);
  const [votes, setVotes] = useState([]);
  const [myVote, setMyVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [suggestionsRes, votesRes, myVoteRes] = await Promise.all([
        axios.get(`/api/restaurants/suggestions/${currentWeekStart}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/voting/${currentWeekStart}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`/api/voting/${currentWeekStart}/my-vote`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSuggestions(suggestionsRes.data);
      setVotes(votesRes.data);
      setMyVote(myVoteRes.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (suggestionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/voting',
        {
          suggestionId,
          weekStartDate: currentWeekStart,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('✅ Vote submitted!');
      fetchData(); // Refresh data
    } catch (error) {
      setMessage('❌ Failed to submit vote');
      console.error('Error submitting vote:', error);
    }
  };

  const getVoteCount = (suggestionId) => {
    const voteData = votes.find((v) => v.suggestion_id === suggestionId);
    return voteData ? parseInt(voteData.vote_count) : 0;
  };

  const getMyWalkingTime = (walkingTimes) => {
    if (!walkingTimes) return null;
    const myTime = walkingTimes.find((wt) => wt.userId === user.id);
    return myTime ? myTime.walkingTimeMinutes : null;
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (suggestions.length === 0) {
    return (
      <div className="container">
        <div className="card">
          <h2>No suggestions yet</h2>
          <p>Restaurant suggestions will be generated every Monday morning.</p>
          <p>Make sure you've set your preferences for this week!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="suggestions">
        <h1>🗳️ Vote for This Week's Restaurant</h1>
        <p className="subtitle">Week of {format(new Date(currentWeekStart), 'MMM d, yyyy')}</p>

        {message && (
          <div className={`card ${message.includes('✅') ? 'success-msg' : 'error-msg'}`}>
            {message}
          </div>
        )}

        {myVote && (
          <div className="card voted-card">
            <p>✅ You've voted! You can change your vote anytime before the week starts.</p>
          </div>
        )}

        <div className="suggestions-grid">
          {suggestions.map((suggestion) => {
            const voteCount = getVoteCount(suggestion.id);
            const myWalkingTime = getMyWalkingTime(suggestion.walking_times);
            const hasVoted = myVote?.suggestion_id === suggestion.id;

            return (
              <div key={suggestion.id} className={`card suggestion-card ${hasVoted ? 'voted' : ''}`}>
                <div className="suggestion-header">
                  <h2>{suggestion.restaurant_name}</h2>
                  <div className="vote-badge">{voteCount} {voteCount === 1 ? 'vote' : 'votes'}</div>
                </div>

                <div className="suggestion-details">
                  <p>📍 {suggestion.address}</p>
                  <p>📞 {suggestion.phone_number}</p>
                  <p>⭐ {suggestion.google_rating || suggestion.yelp_rating}/5</p>
                  <p>💰 {'$'.repeat(suggestion.price_level || 2)}</p>
                  <p>🍽️ {suggestion.cuisine_type}</p>
                  <p>🕐 {suggestion.lunch_duration} lunch</p>
                  {myWalkingTime && (
                    <p className="walking-time">🚶 {myWalkingTime} min walk from your office</p>
                  )}
                </div>

                <div className="walking-times">
                  <h4>Walking times for group:</h4>
                  <ul>
                    {suggestion.walking_times?.map((wt, idx) => (
                      <li key={idx}>
                        {wt.userName}: {wt.walkingTimeMinutes} min
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleVote(suggestion.id)}
                  className={hasVoted ? 'btn-success' : 'btn-primary'}
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  {hasVoted ? '✓ You voted for this' : 'Vote for this restaurant'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Suggestions;
