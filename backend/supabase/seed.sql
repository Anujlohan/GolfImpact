-- Digital Heroes Seed Data

-- 1. Subscription Plans
INSERT INTO subscription_plans (id, name, interval, price, currency, active, stripe_price_id)
VALUES 
    ('plan_monthly', 'Monthly Hero Membership', 'MONTHLY', 1500, 'usd', true, 'price_monthly_mock'),
    ('plan_yearly', 'Annual Hero Patron (Save 20%)', 'YEARLY', 14400, 'usd', true, 'price_yearly_mock')
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;

-- 2. Charities
INSERT INTO charities (id, name, slug, description, image_url, website_url, category, total_raised, is_featured, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Code For Humanity', 'code-for-humanity', 'Empowering underprivileged youth through digital literacy, software engineering bootcamps, and career placement.', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80', 'https://codeforhumanity.example.org', 'Education & Tech', 4520000, true, true),
    ('c2222222-2222-2222-2222-222222222222', 'Clean Ocean Robotics', 'clean-ocean-robotics', 'Deploying autonomous solar-powered trash skimmers and AI monitoring along global coastlines.', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80', 'https://cleanoceanrobotics.example.org', 'Environment', 7890000, true, true),
    ('c3333333-3333-3333-3333-333333333333', 'Global Health Diagnostics', 'global-health-diagnostics', 'Building accessible telemedicine booths and open-source medical AI tools for remote clinics.', 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80', 'https://healthdiagnostics.example.org', 'Healthcare', 6120000, true, true),
    ('c4444444-4444-4444-4444-444444444444', 'Shelter Tech Connect', 'shelter-tech-connect', 'Providing laptops, high-speed connectivity, and vocational digital training in community shelters.', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80', 'https://sheltertech.example.org', 'Community', 3200000, false, true),
    ('c5555555-5555-5555-5555-555555555555', 'Wildlife AI Guardians', 'wildlife-ai-guardians', 'Protecting endangered species using camera traps and acoustic AI anti-poaching sensor grids.', 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80', 'https://wildlifeai.example.org', 'Wildlife & Nature', 5400000, false, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Charity Events
INSERT INTO events (id, charity_id, title, description, event_date, image_url)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Annual Youth Hackathon 2026', '500+ high school students building civic tech apps over 48 hours with mentor support.', NOW() + INTERVAL '14 days', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'),
    ('e2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Pacific Coastal Clean Expedition', 'Launching 10 new autonomous drone vessels to clear coastal plastic traps.', NOW() + INTERVAL '28 days', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'),
    ('e3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'Rural Health Summit & Teleclinic Rollout', 'Deploying 25 AI-assisted remote diagnostic pods in community health centers.', NOW() + INTERVAL '45 days', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;
