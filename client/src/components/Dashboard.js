import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { startOfWeek, format } from 'date-fns';
import './Dashboard.css';

function Dashboard({ user }) {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [hasGoogleCalendar, setHasGoogleCalendar] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Check if user has Google Calendar connected
      const userResponse = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHasGoogleCalendar(!!userResponse.data.google_calendar_token);

      // Get selected restaurant for this week
      const restaurantResponse = await axios.get(
        `/api/restaurants/selected/${currentWeekStart}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedRestaurant(restaurantResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/google-calendar/auth-url', {
        headers: { Authorization: `Bearer ${token}` },
      });

      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="dashboard">
        <h1>Welcome back, {user.name}! 👋</h1>

        {!hasGoogleCalendar && (
          <div className="card alert-warning">
            <h3>⚠️ Connect Your Google Calendar</h3>
            <p>To participate in weekly lunch coordination, please connect your Google Calendar.</p>
            <button onClick={connectGoogleCalendar} className="btn-primary">
              Connect Google Calendar
            </button>
          </div>
        )}

        <div className="dashboard-grid">
          <div className="card">
            <h2>📍 Your Office</h2>
            <p>{user.office_address}</p>
          </div>

          <div className="card">
            <h2>🗓️ This Week</h2>
            <p>Week of {format(new Date(currentWeekStart), 'MMM d, yyyy')}</p>
            {selectedRestaurant ? (
              <div className="selected-info">
                <h3>✅ Lunch is set!</h3>
                <p><strong>{selectedRestaurant.restaurant_name}</strong></p>
                <p>📅 {format(new Date(selectedRestaurant.final_date), 'EEEE, MMM d')}</p>
                <p>🕐 {selectedRestaurant.final_time}</p>
              </div>
            ) : (
              <p>No restaurant selected yet. Check the voting page!</p>
            )}
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/preferences" className="action-card">
              <span className="action-icon">🍴</span>
              <h3>Set Preferences</h3>
              <p>Choose your cuisine and budget for this week</p>
            </Link>
            <Link to="/suggestions" className="action-card">
              <span className="action-icon">🗳️</span>
              <h3>Vote</h3>
              <p>Vote on restaurant suggestions</p>
            </Link>
          </div>
        </div>

        {selectedRestaurant && (
          <div className="card">
            <h2>📍 This Week's Restaurant Details</h2>
            <div className="restaurant-details">
              <p><strong>Name:</strong> {selectedRestaurant.restaurant_name}</p>
              <p><strong>Address:</strong> {selectedRestaurant.address}</p>
              <p><strong>Phone:</strong> {selectedRestaurant.phone_number}</p>
              <p><strong>Rating:</strong> ⭐ {selectedRestaurant.google_rating || selectedRestaurant.yelp_rating}/5</p>
              <p><strong>Price:</strong> {'$'.repeat(selectedRestaurant.price_level || 2)}</p>
              <p><strong>Duration:</strong> {selectedRestaurant.lunch_duration}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
