-- Digital Heroes Initial Database Migration
-- PostgreSQL Schema with Constraints, RLS, and Triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enum Types
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE subscription_interval AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
CREATE TYPE draw_type AS ENUM ('RANDOM', 'ALGORITHMIC');
CREATE TYPE draw_status AS ENUM ('DRAFT', 'SIMULATED', 'PUBLISHED', 'COMPLETED');
CREATE TYPE prize_tier AS ENUM ('5_MATCH', '4_MATCH', '3_MATCH');
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE payout_status AS ENUM ('PENDING', 'PAID', 'FAILED');

-- 2. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Subscription Plans Table
CREATE TABLE subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    interval subscription_interval NOT NULL,
    price INTEGER NOT NULL, -- price in cents (e.g. 1000 = $10.00)
    currency TEXT NOT NULL DEFAULT 'usd',
    active BOOLEAN NOT NULL DEFAULT true,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Charities Table
CREATE TABLE charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    website_url TEXT,
    category TEXT DEFAULT 'Community',
    total_raised INTEGER NOT NULL DEFAULT 0, -- in cents
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Charity Events Table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Charity Selections Table (Min 10% constraint)
CREATE TABLE charity_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
    contribution_percentage INTEGER NOT NULL CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Scores Table (1-45 range, Unique per user+date, Rolling 5 Enforcement)
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    score_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_score_date UNIQUE (user_id, score_date)
);

-- Function & Trigger to enforce rolling maximum 5 scores per user
CREATE OR REPLACE FUNCTION enforce_five_scores_trigger()
RETURNS TRIGGER AS $$
DECLARE
    score_count INTEGER;
    oldest_score_id UUID;
BEGIN
    SELECT COUNT(*) INTO score_count FROM scores WHERE user_id = NEW.user_id;
    
    IF score_count > 5 THEN
        -- Find and delete the oldest score by score_date, then created_at
        SELECT id INTO oldest_score_id
        FROM scores
        WHERE user_id = NEW.user_id
        ORDER BY score_date ASC, created_at ASC
        LIMIT 1;
        
        DELETE FROM scores WHERE id = oldest_score_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_five_scores
AFTER INSERT ON scores
FOR EACH ROW
EXECUTE FUNCTION enforce_five_scores_trigger();

-- 9. Draws Table
CREATE TABLE draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_month INTEGER NOT NULL CHECK (draw_month >= 1 AND draw_month <= 12),
    draw_year INTEGER NOT NULL CHECK (draw_year >= 2024),
    draw_type draw_type NOT NULL DEFAULT 'RANDOM',
    status draw_status NOT NULL DEFAULT 'DRAFT',
    draw_numbers INTEGER[] DEFAULT '{}',
    simulation_result JSONB DEFAULT '{}'::jsonb,
    total_pool_amount INTEGER NOT NULL DEFAULT 0, -- in cents
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Draw Participants Table (Stores Score Snapshot for auditability)
CREATE TABLE draw_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    score_snapshot INTEGER[] NOT NULL,
    eligible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_draw_participant UNIQUE (draw_id, user_id)
);

-- 11. Draw Results Table
CREATE TABLE draw_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE UNIQUE,
    winning_numbers INTEGER[] NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    algorithm_version TEXT NOT NULL DEFAULT 'v1.0'
);

-- 12. Prize Pools Table (40% for 5-match, 35% for 4-match, 25% for 3-match)
CREATE TABLE prize_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    tier prize_tier NOT NULL,
    percentage INTEGER NOT NULL,
    amount INTEGER NOT NULL DEFAULT 0, -- in cents
    rollover_amount INTEGER NOT NULL DEFAULT 0, -- in cents
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_draw_tier UNIQUE (draw_id, tier)
);

-- 13. Winners Table
CREATE TABLE winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tier prize_tier NOT NULL,
    matched_count INTEGER NOT NULL CHECK (matched_count IN (3, 4, 5)),
    prize_amount INTEGER NOT NULL, -- in cents
    verification_status verification_status NOT NULL DEFAULT 'PENDING',
    payout_status payout_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Winner Proofs Table
CREATE TABLE winner_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    winner_id UUID NOT NULL REFERENCES winners(id) ON DELETE CASCADE UNIQUE,
    file_url TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES profiles(id),
    rejection_reason TEXT
);

-- 15. Payouts Table
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    winner_id UUID NOT NULL REFERENCES winners(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    status payout_status NOT NULL DEFAULT 'PENDING',
    payment_reference TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Donations Table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    draw_id UUID REFERENCES draws(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- in cents
    currency TEXT NOT NULL DEFAULT 'usd',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Row Level Security (RLS) Setup
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is Admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscription Plans Policies (Public read, admin write)
CREATE POLICY "Subscription plans viewable by everyone" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admins manage subscription plans" ON subscription_plans FOR ALL USING (is_admin());

-- Subscriptions Policies (User read own, admin manage all)
CREATE POLICY "Users view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admins manage subscriptions" ON subscriptions FOR ALL USING (is_admin());

-- Charities & Events Policies (Public read, admin write)
CREATE POLICY "Charities viewable by everyone" ON charities FOR SELECT USING (true);
CREATE POLICY "Admins manage charities" ON charities FOR ALL USING (is_admin());
CREATE POLICY "Events viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON events FOR ALL USING (is_admin());

-- Charity Selections Policies
CREATE POLICY "Users view and manage own charity selection" ON charity_selections FOR ALL USING (auth.uid() = user_id OR is_admin());

-- Scores Policies
CREATE POLICY "Users manage own scores" ON scores FOR ALL USING (auth.uid() = user_id OR is_admin());

-- Draws Policies (Public view published, admin manage all)
CREATE POLICY "Public view published draws" ON draws FOR SELECT USING (status IN ('PUBLISHED', 'COMPLETED') OR is_admin());
CREATE POLICY "Admins manage draws" ON draws FOR ALL USING (is_admin());

-- Draw Participants Policies
CREATE POLICY "Users view own draw participation" ON draw_participants FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admins manage draw participants" ON draw_participants FOR ALL USING (is_admin());

-- Draw Results Policies
CREATE POLICY "Public view draw results" ON draw_results FOR SELECT USING (true);
CREATE POLICY "Admins manage draw results" ON draw_results FOR ALL USING (is_admin());

-- Prize Pools Policies
CREATE POLICY "Public view prize pools" ON prize_pools FOR SELECT USING (true);
CREATE POLICY "Admins manage prize pools" ON prize_pools FOR ALL USING (is_admin());

-- Winners Policies
CREATE POLICY "Users view own winning records or published winners" ON winners FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admins manage winners" ON winners FOR ALL USING (is_admin());

-- Winner Proofs Policies
CREATE POLICY "Winners view and upload own proofs" ON winner_proofs FOR ALL USING (
    EXISTS (SELECT 1 FROM winners WHERE winners.id = winner_proofs.winner_id AND winners.user_id = auth.uid()) OR is_admin()
);

-- Payouts Policies
CREATE POLICY "Users view own payouts" ON payouts FOR SELECT USING (
    EXISTS (SELECT 1 FROM winners WHERE winners.id = payouts.winner_id AND winners.user_id = auth.uid()) OR is_admin()
);
CREATE POLICY "Admins manage payouts" ON payouts FOR ALL USING (is_admin());

-- Donations & Audit Logs
CREATE POLICY "Donations viewable by public" ON donations FOR SELECT USING (true);
CREATE POLICY "Admins manage donations" ON donations FOR ALL USING (is_admin());
CREATE POLICY "Admins view audit logs" ON audit_logs FOR ALL USING (is_admin());

-- 19. Auto create profile trigger on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Digital Hero'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'USER'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
