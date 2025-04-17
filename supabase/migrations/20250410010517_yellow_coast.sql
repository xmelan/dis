/*
  # Add Products and Orders Management

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `current_stock` (numeric)
      - `unit` (text)
      - `stock_threshold` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `status` (text)
      - `total_amount` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (numeric)
      - `unit_price` (numeric)
      - `total_price` (numeric)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    current_stock numeric NOT NULL DEFAULT 0,
    unit text NOT NULL,
    stock_threshold numeric NOT NULL DEFAULT 10,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid REFERENCES clients(id),
    status text NOT NULL DEFAULT 'pending',
    total_amount numeric NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id),
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    total_price numeric NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Allow authenticated users to view products"
    ON products
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert products"
    ON products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update products"
    ON products
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create policies for orders
CREATE POLICY "Allow authenticated users to view orders"
    ON orders
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert orders"
    ON orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update orders"
    ON orders
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create policies for order_items
CREATE POLICY "Allow authenticated users to view order_items"
    ON order_items
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert order_items"
    ON order_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update order_items"
    ON order_items
    FOR UPDATE
    TO authenticated
    USING (true);

-- Create function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stock on inventory entry
CREATE TRIGGER update_stock_on_inventory_entry
    AFTER INSERT ON inventory_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();