-- ============================================================
-- GuppyStore — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name               TEXT NOT NULL,
  email              TEXT UNIQUE NOT NULL,
  phone              TEXT DEFAULT '',
  password           TEXT,
  google_id          TEXT UNIQUE,
  avatar             TEXT DEFAULT '',
  role               TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_email_verified  BOOLEAN DEFAULT false,
  is_phone_verified  BOOLEAN DEFAULT false,
  address            JSONB DEFAULT '{}',
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  breed        TEXT NOT NULL,
  breed_slug   TEXT NOT NULL,
  description  TEXT DEFAULT '',
  price        NUMERIC(10,2) NOT NULL,
  stock        INTEGER DEFAULT 0,
  images       TEXT[] DEFAULT '{}',
  gender       TEXT DEFAULT 'unsexed',
  age          TEXT DEFAULT '',
  size         TEXT DEFAULT '',
  color        TEXT DEFAULT '',
  is_featured  BOOLEAN DEFAULT false,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_breed_slug ON products(breed_slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active  ON products(is_active);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  items            JSONB NOT NULL DEFAULT '[]',
  shipping_address JSONB DEFAULT '{}',
  payment_method   TEXT DEFAULT 'cod',
  payment_status   TEXT DEFAULT 'pending',
  order_status     TEXT DEFAULT 'placed',
  subtotal         NUMERIC(10,2) DEFAULT 0,
  shipping_charge  NUMERIC(10,2) DEFAULT 0,
  total            NUMERIC(10,2) DEFAULT 0,
  notes            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT DEFAULT '',
  subtitle   TEXT DEFAULT '',
  image      TEXT DEFAULT '',
  gradient   TEXT DEFAULT '',
  link       TEXT DEFAULT '/',
  "order"    INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories (Shop by Breed section on homepage)
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  tagline    TEXT DEFAULT '',
  gradient   TEXT DEFAULT '',
  emoji      TEXT DEFAULT '',
  image      TEXT DEFAULT '',
  "order"    INTEGER DEFAULT 0,
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS so the service role key can access all tables freely
ALTER TABLE users       DISABLE ROW LEVEL SECURITY;
ALTER TABLE products    DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders      DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners     DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories  DISABLE ROW LEVEL SECURITY;
