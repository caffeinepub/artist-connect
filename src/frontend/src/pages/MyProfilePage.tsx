import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetArtistById, useGetArtistRevenue, useGetPaymentTransactionHistory } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Mail, DollarSign, TrendingUp } from 'lucide-react';

export default function MyProfilePage() {
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() || '';
  
  const { data: artist, isLoading: artistLoading } = useGetArtistById(principalId);
  const { data: revenue, isLoading: revenueLoading } = useGetArtistRevenue(principalId);
  const { data: transactions = [], isLoading: transactionsLoading } = useGetPaymentTransactionHistory(principalId);

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (artistLoading || revenueLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Please create an artist profile to continue</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const donations = transactions.filter(
    (t) => t.transactionType === 'donation'
  );
  const sales = transactions.filter(
    (t) => t.transactionType === 'productSale'
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenue ? (Number(revenue.totalRevenue) / 100).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From sales and donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenue ? (Number(revenue.pendingRevenue) / 100).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenue ? (Number(revenue.paidRevenue) / 100).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total received</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{artist.bio}</p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {artist.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{artist.contactInfo}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donations Received</CardTitle>
            <CardDescription>Recent donations from supporters</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : donations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No donations received yet</p>
            ) : (
              <div className="space-y-4">
                {donations.slice(0, 5).map((donation) => (
                  <div key={donation.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Donation</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(donation.timestamp) / 1000000).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">${(Number(donation.amount) / 100).toFixed(2)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {transactions.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All your sales and donations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product ID</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Your Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(Number(transaction.timestamp) / 1000000).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.transactionType === 'donation'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {transaction.transactionType === 'donation'
                          ? 'Donation'
                          : 'Sale'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{transaction.productId}</TableCell>
                    <TableCell className="text-right">${(Number(transaction.amount) / 100).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${(Number(transaction.artistShare) / 100).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
