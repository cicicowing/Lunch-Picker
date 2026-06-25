-- Database schema for lunch picker app

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  office_address TEXT NOT NULL,
  office_lat DECIMAL(10, 8),
  office_lng DECIMAL(11, 8),
  google_calendar_token TEXT,
  google_refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weekly_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  cuisine_type VARCHAR(100),
  price_level INTEGER CHECK (price_level BETWEEN 1 AND 4), -- 1: $, 2: $$, 3: $$$, 4: $$$$
  lunch_duration VARCHAR(20) CHECK (lunch_duration IN ('quick', 'standard', 'extended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start_date)
);

CREATE TABLE availability_slots (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 1 AND 5), -- 1=Mon, 5=Fri
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE restaurant_suggestions (
  id SERIAL PRIMARY KEY,
  week_start_date DATE NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  cuisine_type VARCHAR(100),
  price_level INTEGER,
  google_rating DECIMAL(2, 1),
  google_place_id VARCHAR(255),
  yelp_rating DECIMAL(2, 1),
  yelp_id VARCHAR(255),
  phone_number VARCHAR(50),
  suggested_date DATE,
  suggested_time TIME,
  lunch_duration VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE walking_times (
  id SERIAL PRIMARY KEY,
  suggestion_id INTEGER REFERENCES restaurant_suggestions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  walking_time_minutes INTEGER NOT NULL,
  distance_meters INTEGER NOT NULL
);

CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  suggestion_id INTEGER REFERENCES restaurant_suggestions(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start_date)
);

CREATE TABLE selected_restaurants (
  id SERIAL PRIMARY KEY,
  suggestion_id INTEGER REFERENCES restaurant_suggestions(id),
  week_start_date DATE NOT NULL UNIQUE,
  final_date DATE NOT NULL,
  final_time TIME NOT NULL,
  selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_weekly_prefs_user_week ON weekly_preferences(user_id, week_start_date);
CREATE INDEX idx_availability_user_week ON availability_slots(user_id, week_start_date);
CREATE INDEX idx_suggestions_week ON restaurant_suggestions(week_start_date);
CREATE INDEX idx_votes_week ON votes(week_start_date);
