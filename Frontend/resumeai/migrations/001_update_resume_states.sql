-- Drop and recreate resume_states table with updated structure
DROP TABLE IF EXISTS resume_states CASCADE;

CREATE TABLE resume_states (
  id serial primary key,
  job_id integer not null references job_descriptions(id) on delete cascade,
  profile_id text not null references user_profiles(clerk_user_id) on delete cascade,
  personal jsonb not null default '{}'::jsonb,    -- Stores personal info state
  skills jsonb not null default '[]'::jsonb,      -- Array of {id, name}
  experiences jsonb not null default '[]'::jsonb, -- Array of {id, position, company, duration, description}
  projects jsonb not null default '[]'::jsonb,    -- Array of {id, name, description, link}
  education jsonb not null default '[]'::jsonb,   -- Array of {id, degree, institution, year}
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp,
  unique(job_id, profile_id)
);

-- Create an index to speed up lookups
CREATE INDEX resume_states_job_profile_idx ON resume_states(job_id, profile_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = current_timestamp;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS update_resume_states_updated_at ON resume_states;
CREATE TRIGGER update_resume_states_updated_at
    BEFORE UPDATE ON resume_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 