/*
  # Initial Database Schema for GameHub

  ## Tables Created:
  1. `accounts` - Game account listings
     - `id` (uuid, primary key)  
     - `title` (text, account title)
     - `description` (text, account description)
     - `price` (numeric, account price)
     - `discount` (numeric, optional discount percentage)
     - `category` (text, mobile_legend or pubg)
     - `collector_level` (text, optional ML collector level)
     - `images` (text[], array of image URLs)
     - `is_sold` (boolean, sold status)
     - `sold_at` (timestamptz, when marked as sold)
     - `created_at` (timestamptz, creation time)
     - `updated_at` (timestamptz, last update time)

  2. `ads` - Advertisement banners
     - `id` (uuid, primary key)
     - `image_url` (text, ad image URL)
     - `title` (text, optional ad title)
     - `link` (text, optional click link)
     - `order_index` (integer, display order)
     - `is_active` (boolean, active status)
     - `created_at` (timestamptz, creation time)

  ## Security
  - Enable RLS on all tables
  - Add policies for public read access on accounts and ads
  - Add policies for authenticated admin access on admin functions
*/

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  skins integer DEFAULT 0,
  collector_level text DEFAULT NULL,
  images text[] DEFAULT '{}',
  is_sold boolean DEFAULT false,
  sold_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text DEFAULT NULL,
  link text DEFAULT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create rank_boost table
CREATE TABLE IF NOT EXISTS rank_boost (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  price text NOT NULL,
  created_at timestamptz DEFAULT now()
);



-- Enable Row Level Security
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_boost ENABLE ROW LEVEL SECURITY;


-- Policies for accounts table
CREATE POLICY "Anyone can view accounts"
  ON accounts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage accounts"
  ON accounts
  FOR ALL
  TO authenticated
  USING (true);

  -- Policies for rank_boost table
CREATE POLICY "Anyone can view rank boost options"
  ON rank_boost
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage rank boost options"
  ON rank_boost
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for ads table
CREATE POLICY "Anyone can view active ads"
  ON ads
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage ads"
  ON ads
  FOR ALL
  TO authenticated
  USING (true);

-- Policies for admin_users table
CREATE POLICY "Authenticated users can view admin users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage admin users"
  ON users
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS accounts_created_at_idx ON accounts(created_at DESC);
CREATE INDEX IF NOT EXISTS accounts_collector_level_idx ON accounts(collector_level);
CREATE INDEX IF NOT EXISTS ads_order_index_idx ON ads(order_index);
CREATE INDEX IF NOT EXISTS ads_is_active_idx ON ads(is_active);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on accounts
CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

