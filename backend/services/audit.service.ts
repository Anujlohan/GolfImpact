import { createAdminClient } from '@/lib/supabase/admin';

export class AuditService {
  static async log(
    action: string,
    entityType: string,
    entityId?: string | null,
    actorId?: string | null,
    metadata?: Record<string, any>
  ) {
    try {
      const supabase = createAdminClient();
      await supabase.from('audit_logs').insert({
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        actor_id: actorId || null,
        metadata: metadata || {},
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }
}
