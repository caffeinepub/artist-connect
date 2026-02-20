import { useGetAllArtists, useIsCallerAdmin, useAssignUserRole } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, ShieldAlert, Users, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Principal } from '@icp-sdk/core/principal';
import { UserRole } from '../backend';
import { toast } from 'sonner';

export default function AdminUserManagementPage() {
    const { identity } = useInternetIdentity();
    const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
    const { data: artists, isLoading: artistsLoading } = useGetAllArtists();
    const assignRole = useAssignUserRole();
    const [selectedUser, setSelectedUser] = useState<{ principal: string; action: 'admin' | 'user' } | null>(null);

    const isAuthenticated = !!identity;
    const currentUserPrincipal = identity?.getPrincipal().toString();

    const handleRoleChange = async () => {
        if (!selectedUser) return;

        try {
            const principal = Principal.fromText(selectedUser.principal);
            const role: UserRole = selectedUser.action === 'admin' ? UserRole.admin : UserRole.user;
            
            await assignRole.mutateAsync({ user: principal, role });
            toast.success(`User role updated to ${selectedUser.action}`);
            setSelectedUser(null);
        } catch (error: any) {
            console.error('Error updating role:', error);
            toast.error(error.message || 'Failed to update user role');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container py-12">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please log in to access the admin panel.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (isAdminLoading) {
        return (
            <div className="container py-12">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96 mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container py-12">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertDescription>
                        Access denied. You do not have permission to view this page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Users className="h-6 w-6 text-primary" />
                        <CardTitle className="text-3xl font-display">User Management</CardTitle>
                    </div>
                    <CardDescription>
                        Manage user roles and permissions across the platform
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {artistsLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : !artists || artists.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No registered users found</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Principal ID</TableHead>
                                        <TableHead>Bio</TableHead>
                                        <TableHead>Skills</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {artists.map((artist) => {
                                        const isCurrentUser = artist.id === currentUserPrincipal;
                                        return (
                                            <TableRow key={artist.id}>
                                                <TableCell className="font-mono text-xs">
                                                    {artist.id.slice(0, 8)}...{artist.id.slice(-6)}
                                                    {isCurrentUser && (
                                                        <Badge variant="outline" className="ml-2">You</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate">
                                                    {artist.bio || 'No bio'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {artist.skills.slice(0, 2).map((skill, idx) => (
                                                            <Badge key={idx} variant="secondary" className="text-xs">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                        {artist.skills.length > 2 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{artist.skills.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="default">Active</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isCurrentUser || assignRole.isPending}
                                                            onClick={() => setSelectedUser({ principal: artist.id, action: 'admin' })}
                                                        >
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            Make Admin
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled={isCurrentUser || assignRole.isPending}
                                                            onClick={() => setSelectedUser({ principal: artist.id, action: 'user' })}
                                                        >
                                                            Revoke Admin
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                        <AlertDialogDescription>
                            {selectedUser?.action === 'admin'
                                ? 'Are you sure you want to grant admin privileges to this user? They will have full access to all admin features.'
                                : 'Are you sure you want to revoke admin privileges from this user? They will lose access to admin features.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRoleChange} disabled={assignRole.isPending}>
                            {assignRole.isPending ? 'Updating...' : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
