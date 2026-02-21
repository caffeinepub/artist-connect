import React, { useState } from 'react';
import {
  useGetPlatformRevenueMetrics,
  useGetAllPaymentTransactions,
  useGetAllArtistRevenues,
  useIsCallerAdmin,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign, TrendingUp, Users, Activity } from 'lucide-react';
import { Variant_productSale_donation } from '../backend';

export default function AdminRevenueDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: metrics, isLoading: metricsLoading } = useGetPlatformRevenueMetrics();
  const { data: transactions = [], isLoading: transactionsLoading } = useGetAllPaymentTransactions();
  const { data: artistRevenues = [], isLoading: revenuesLoading } = useGetAllArtistRevenues();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access revenue analytics</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isAdminLoading || metricsLoading || transactionsLoading || revenuesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const topArtists = [...artistRevenues]
    .sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue))
    .slice(0, 10);

  const recentTransactions = [...transactions]
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 20);

  const productSales = transactions.filter((t) => t.transactionType === Variant_productSale_donation.productSale);
  const donations = transactions.filter((t) => t.transactionType === Variant_productSale_donation.donation);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Revenue Analytics</h1>
        <p className="text-muted-foreground">Track platform revenue, commissions, and artist earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(Number(metrics?.totalPlatformRevenue || 0) / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Commission earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artist Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(Number(metrics?.totalArtistPayouts || 0) / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Paid to artists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(metrics?.totalTransactions || 0)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(Number(metrics?.averageTransactionValue || 0) / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>By transaction type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Product Sales</p>
                  <p className="text-sm text-muted-foreground">{productSales.length} transactions</p>
                </div>
                <Badge variant="secondary">
                  ${(productSales.reduce((sum, t) => sum + Number(t.amount), 0) / 100).toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Donations</p>
                  <p className="text-sm text-muted-foreground">{donations.length} transactions</p>
                </div>
                <Badge variant="secondary">
                  ${(donations.reduce((sum, t) => sum + Number(t.amount), 0) / 100).toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Earning Artists</CardTitle>
            <CardDescription>By total revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topArtists.slice(0, 5).map((artist, index) => (
                <div key={artist.artistId.toString()} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{artist.artistId.toString().slice(0, 10)}...</p>
                    </div>
                  </div>
                  <Badge variant="outline">${(Number(artist.totalRevenue) / 100).toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest payment activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Artist Share</TableHead>
                <TableHead>Platform Fee</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.transactionType === Variant_productSale_donation.productSale ? 'default' : 'secondary'}>
                      {transaction.transactionType === Variant_productSale_donation.productSale ? 'Sale' : 'Donation'}
                    </Badge>
                  </TableCell>
                  <TableCell>${(Number(transaction.amount) / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-green-600">${(Number(transaction.artistShare) / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-blue-600">${(Number(transaction.platformFee) / 100).toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(Number(transaction.timestamp) / 1000000).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
