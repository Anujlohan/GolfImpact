-- Digital Heroes Supabase Storage Buckets and Policies

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('winner-proofs', 'winner-proofs', false),
    ('avatars', 'avatars', true),
    ('charity-media', 'charity-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Winner Proofs Policies (Authenticated upload, admin & winner read)
CREATE POLICY "Users can upload their own winner proof"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'winner-proofs' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own winner proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'winner-proofs' AND 
    ((storage.foldername(name))[1] = auth.uid()::text OR is_admin())
);

-- 3. Public Avatars Policies
CREATE POLICY "Avatars are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);
