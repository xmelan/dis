/*
  # Inventory Management Schema

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `name` (text, company name)
      - `contact_person` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `inventory_entries`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key)
      - `product_name` (text)
      - `quantity` (numeric)
      - `unit` (text)
      - `unit_price` (numeric)
      - `total_price` (numeric)
      - `entry_date` (timestamp)
      - `invoice_number` (text)
      - `notes` (text)
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    contact_person text,
    email text,
    phone text,
    address text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create inventory_entries table
CREATE TABLE IF NOT EXISTS inventory_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id uuid REFERENCES suppliers(id) NOT NULL,
    product_name text NOT NULL,
    quantity numeric NOT NULL,
    unit text NOT NULL,
    unit_price numeric NOT NULL,
    total_price numeric NOT NULL,
    entry_date timestamptz NOT NULL,
    invoice_number text,
    notes text,
    created_by uuid REFERENCES auth.users(id) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers
CREATE POLICY "Allow authenticated users to view suppliers"
    ON suppliers
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert suppliers"
    ON suppliers
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update suppliers"
    ON suppliers
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create policies for inventory_entries
CREATE POLICY "Allow authenticated users to view inventory entries"
    ON inventory_entries
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow users to insert inventory entries"
    ON inventory_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to update their own inventory entries"
    ON inventory_entries
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);