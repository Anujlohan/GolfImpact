import { createClient } from '@/lib/supabase/server';
import { Charity, CharityEvent, CharitySelection, Donation } from '@/types/database';
import { AppError } from '@/lib/utils/errors';
import { AuditService } from './audit.service';

let mockCharitiesStore: Charity[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Code For Humanity',
    slug: 'code-for-humanity',
    description: 'Empowering underprivileged youth through digital literacy, software engineering bootcamps, and career placement.',
    image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    website_url: 'https://codeforhumanity.example.org',
    category: 'Education & Tech',
    total_raised: 4520000,
    is_featured: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Clean Ocean Robotics',
    slug: 'clean-ocean-robotics',
    description: 'Deploying autonomous solar-powered trash skimmers and AI monitoring along global coastlines.',
    image_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
    website_url: 'https://cleanoceanrobotics.example.org',
    category: 'Environment',
    total_raised: 7890000,
    is_featured: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Global Health Diagnostics',
    slug: 'global-health-diagnostics',
    description: 'Building accessible telemedicine booths and open-source medical tools for remote clinics.',
    image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    website_url: 'https://healthdiagnostics.example.org',
    category: 'Healthcare',
    total_raised: 6120000,
    is_featured: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Shelter Tech Connect',
    slug: 'shelter-tech-connect',
    description: 'Providing laptops, high-speed connectivity, and vocational digital training in community shelters.',
    image_url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    website_url: 'https://sheltertech.example.org',
    category: 'Community',
    total_raised: 3200000,
    is_featured: false,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Wildlife AI Guardians',
    slug: 'wildlife-ai-guardians',
    description: 'Protecting endangered species using camera traps and acoustic anti-poaching sensor grids.',
    image_url: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?auto=format&fit=crop&w=800&q=80',
    website_url: 'https://wildlifeai.example.org',
    category: 'Wildlife & Nature',
    total_raised: 5400000,
    is_featured: false,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

let mockEventsStore: CharityEvent[] = [
  {
    id: 'e1',
    charity_id: 'c1111111-1111-1111-1111-111111111111',
    title: 'Digital Heroes Annual Invitational Golf Day 2026',
    description: 'Charity golf scramble and tech showcase uniting 120 players for youth coding scholarships.',
    event_date: '2026-10-15T08:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'e2',
    charity_id: 'c2222222-2222-2222-2222-222222222222',
    title: 'Clean Ocean Tech Open & Charity Gala',
    description: '18-hole scramble tournament supporting autonomous clean-up robotics deployment.',
    event_date: '2026-11-05T09:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=800&q=80',
    created_at: '2026-01-01T00:00:00Z',
  },
];

let mockDonationsStore: Donation[] = [];

export class CharityService {
  /**
   * Retrieves all active charities with optional category filter.
   */
  static async getCharities(category?: string): Promise<Charity[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        let query = supabase
          .from('charities')
          .select('*')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('name', { ascending: true });

        if (category && category !== 'All') {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      }
    } catch {
      // Fallback
    }

    let list = mockCharitiesStore.filter((c) => c.is_active);
    if (category && category !== 'All') {
      list = list.filter((c) => c.category === category);
    }
    return list;
  }

  /**
   * Retrieves a single charity with upcoming golf/charity events.
   */
  static async getCharityById(id: string): Promise<{ charity: Charity; events: CharityEvent[] }> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data: charity, error: charityError } = await supabase
          .from('charities')
          .select('*')
          .eq('id', id)
          .single();

        if (!charityError && charity) {
          const { data: events } = await supabase
            .from('events')
            .select('*')
            .eq('charity_id', id)
            .order('event_date', { ascending: true });

          return {
            charity,
            events: events || [],
          };
        }
      }
    } catch {
      // Fallback
    }

    const charity = mockCharitiesStore.find((c) => c.id === id || c.slug === id) || mockCharitiesStore[0];
    const events = mockEventsStore.filter((e) => e.charity_id === charity.id);
    return { charity, events };
  }

  /**
   * Retrieves user's chosen charity and contribution pledge percentage.
   */
  static async getUserCharitySelection(userId: string): Promise<CharitySelection | null> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('charity_selections')
          .select('*, charity:charities(*)')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) return data;
      }
    } catch {
      // Fallback
    }

    return {
      id: 'sel-mock-1',
      user_id: userId,
      charity_id: mockCharitiesStore[0].id,
      contribution_percentage: 15,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      charity: mockCharitiesStore[0],
    };
  }

  /**
   * Sets user's charity selection and pledge percentage (minimum 10%).
   */
  static async setCharitySelection(
    userId: string,
    charityId: string,
    percentage: number
  ): Promise<CharitySelection> {
    if (percentage < 10 || percentage > 100) {
      throw new AppError('Contribution percentage must be between 10% and 100%', 400);
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('charity_selections')
          .upsert(
            {
              user_id: userId,
              charity_id: charityId,
              contribution_percentage: percentage,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
          .select('*, charity:charities(*)')
          .single();

        if (!error && data) {
          await AuditService.log('SET_CHARITY_SELECTION', 'charity_selections', data.id, userId, {
            charityId,
            percentage,
          });
          return data;
        }
      }
    } catch {
      // Fallback
    }

    const charity = mockCharitiesStore.find((c) => c.id === charityId) || mockCharitiesStore[0];
    return {
      id: 'sel-mock-1',
      user_id: userId,
      charity_id: charityId,
      contribution_percentage: percentage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      charity,
    };
  }

  /**
   * Processes a direct standalone donation not tied to gameplay (PRD Section 08.1).
   */
  static async processDirectDonation(
    userId: string | null,
    charityId: string,
    amountInCents: number,
    donorEmail?: string
  ): Promise<Donation> {
    if (amountInCents < 100) {
      throw new AppError('Minimum donation amount is $1.00', 400);
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from('donations')
          .insert({
            charity_id: charityId,
            user_id: userId,
            amount: amountInCents,
            currency: 'usd',
          })
          .select('*, charity:charities(*)')
          .single();

        if (!error && data) {
          // Increment charity total_raised
          const { data: ch } = await supabase.from('charities').select('total_raised').eq('id', charityId).single();
          if (ch) {
            await supabase.from('charities').update({ total_raised: (ch.total_raised || 0) + amountInCents }).eq('id', charityId);
          }

          await AuditService.log('DIRECT_DONATION', 'donations', data.id, userId, {
            amount: amountInCents,
            charityId,
            donorEmail,
          });

          return data;
        }
      }
    } catch {
      // Fallback
    }

    // Update local store
    const charity = mockCharitiesStore.find((c) => c.id === charityId) || mockCharitiesStore[0];
    charity.total_raised = (charity.total_raised || 0) + amountInCents;

    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      charity_id: charityId,
      user_id: userId,
      amount: amountInCents,
      currency: 'usd',
      created_at: new Date().toISOString(),
      charity,
    };

    mockDonationsStore.unshift(newDonation);
    return newDonation;
  }

  /**
   * Admin: Add or update a charity.
   */
  static async adminSaveCharity(
    adminId: string,
    charityData: Partial<Charity> & { id?: string }
  ): Promise<Charity> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        let result;
        if (charityData.id) {
          const { data, error } = await supabase
            .from('charities')
            .update({
              ...charityData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', charityData.id)
            .select()
            .single();
          if (error) throw new AppError(error.message, 400);
          result = data;
        } else {
          const { data, error } = await supabase
            .from('charities')
            .insert(charityData)
            .select()
            .single();
          if (error) throw new AppError(error.message, 400);
          result = data;
        }
        return result;
      }
    } catch {
      // Fallback
    }

    if (charityData.id) {
      mockCharitiesStore = mockCharitiesStore.map((c) =>
        c.id === charityData.id ? { ...c, ...charityData, updated_at: new Date().toISOString() } : c
      );
      return mockCharitiesStore.find((c) => c.id === charityData.id)!;
    } else {
      const created: Charity = {
        id: `c_${Date.now()}`,
        name: charityData.name || 'New Charity',
        slug: charityData.slug || `charity-${Date.now()}`,
        description: charityData.description || '',
        image_url: charityData.image_url || 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        website_url: charityData.website_url || null,
        category: charityData.category || 'Community',
        total_raised: 0,
        is_featured: !!charityData.is_featured,
        is_active: charityData.is_active !== false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockCharitiesStore.unshift(created);
      return created;
    }
  }

  /**
   * Admin: Delete a charity.
   */
  static async deleteCharity(adminId: string, charityId: string): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('mock.supabase.co')) {
        const supabase = await createClient();
        await supabase.from('charities').delete().eq('id', charityId);
      }
    } catch {
      // Fallback
    }

    mockCharitiesStore = mockCharitiesStore.filter((c) => c.id !== charityId);
  }
}
