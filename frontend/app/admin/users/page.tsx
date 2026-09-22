import { requireAdmin } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminNav } from '@/components/layout/AdminNav';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/dates';
import { adminUpdateUserRoleAction } from '@/actions/admin';

export default async function AdminUsersPage() {
  const auth = await requireAdmin();
  const supabase = createAdminClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <AdminNav />

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">
              Users Directory
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage member roles and administrative permissions.
            </p>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-white">
                        {u.full_name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {u.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'ADMIN' ? 'gold' : 'secondary'}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(u.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <form
                          action={async () => {
                            'use server';
                            const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
                            await adminUpdateUserRoleAction(u.id, newRole);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-muted-foreground hover:text-white underline"
                          >
                            Set {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                          </button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-xs">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
