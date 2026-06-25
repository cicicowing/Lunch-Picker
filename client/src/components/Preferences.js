import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { startOfWeek, format } from 'date-fns';
import './Preferences.css';

function Preferences() {
  const [formData, setFormData] = useState({
    cuisineType: '',
    priceLevel: 2,
    lunchDuration: 'standard',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [existingPrefs, setExistingPrefs] = useState(null);

  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  useEffect(() => {
    fetchExistingPreferences();
  }, []);

  const fetchExistingPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/preferences/${currentWeekStart}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setExistingPrefs(response.data);
        setFormData({
          cuisineType: response.data.cuisine_type || '',
          priceLevel: response.data.price_level || 2,
          lunchDuration: response.data.lunch_duration || 'standard',
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'priceLevel' ? parseInt(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/preferences',
        {
          weekStartDate: currentWeekStart,
          ...formData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('✅ Preferences saved successfully!');
    } catch (error) {
      setMessage('❌ Failed to save preferences');
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="preferences">
        <h1>🍴 Set Your Weekly Preferences</h1>
        <p className="subtitle">Week of {format(new Date(currentWeekStart), 'MMM d, yyyy')}</p>

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>What type of food are you craving?</label>
              <select
                name="cuisineType"
                value={formData.cuisineType}
                onChange={handleChange}
                required
              >
                <option value="">Select cuisine...</option>
                <option value="sushi">Sushi / Japanese</option>
                <option value="mexican">Mexican</option>
                <option value="italian">Italian</option>
                <option value="chinese">Chinese</option>
                <option value="thai">Thai</option>
                <option value="indian">Indian</option>
                <option value="korean">Korean</option>
                <option value="vietnamese">Vietnamese</option>
                <option value="american">American</option>
                <option value="burgers">Burgers</option>
                <option value="pizza">Pizza</option>
                <option value="sandwiches">Sandwiches</option>
                <option value="salad">Salad</option>
                <option value="mediterranean">Mediterranean</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price Range</label>
              <div className="price-selector">
                {[1, 2, 3, 4].map((level) => (
                  <label key={level} className="price-option">
                    <input
                      type="radio"
                      name="priceLevel"
                      value={level}
                      checked={formData.priceLevel === level}
                      onChange={handleChange}
                    />
                    <span className="price-label">
                      {'$'.repeat(level)}
                      {level === 1 && ' (Budget)'}
                      {level === 2 && ' (Moderate)'}
                      {level === 3 && ' (Upscale)'}
                      {level === 4 && ' (Fancy)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Lunch Duration</label>
              <div className="duration-selector">
                <label className="duration-option">
                  <input
                    type="radio"
                    name="lunchDuration"
                    value="quick"
                    checked={formData.lunchDuration === 'quick'}
                    onChange={handleChange}
                  />
                  <span className="duration-label">
                    ⚡ Quick (30 min)
                  </span>
                </label>
                <label className="duration-option">
                  <input
                    type="radio"
                    name="lunchDuration"
                    value="standard"
                    checked={formData.lunchDuration === 'standard'}
                    onChange={handleChange}
                  />
                  <span className="duration-label">
                    🕐 Standard (1 hour)
                  </span>
                </label>
                <label className="duration-option">
                  <input
                    type="radio"
                    name="lunchDuration"
                    value="extended"
                    checked={formData.lunchDuration === 'extended'}
                    onChange={handleChange}
                  />
                  <span className="duration-label">
                    🍷 Extended (1.5 hours)
                  </span>
                </label>
              </div>
            </div>

            {message && (
              <div className={message.includes('✅') ? 'success' : 'error'}>
                {message}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : existingPrefs ? 'Update Preferences' : 'Save Preferences'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Preferences;
