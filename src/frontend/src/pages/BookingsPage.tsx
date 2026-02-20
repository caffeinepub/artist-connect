import { useGetAllBookings } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

export default function BookingsPage() {
    const { data: bookings, isLoading } = useGetAllBookings();

    return (
        <div className="container py-12">
            <div className="mb-8 text-center">
                <img
                    src="/assets/generated/booking-icon.dim_200x200.png"
                    alt="Booking calendar"
                    className="h-24 w-24 mx-auto mb-6"
                />
            </div>

            <div className="mb-12">
                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">My Bookings</h1>
                <p className="text-xl text-muted-foreground">Manage your scheduled services and appointments</p>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-16 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <Card key={booking.id} className="hover:shadow-artistic transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="font-display">{booking.serviceType}</CardTitle>
                                    <Badge>Confirmed</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(Number(booking.date) / 1_000_000).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{booking.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User className="h-4 w-4" />
                                        <span>{Number(booking.duration)} minutes</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-semibold mb-2">No Bookings Yet</h3>
                    <p className="text-muted-foreground">Your scheduled services will appear here</p>
                </Card>
            )}
        </div>
    );
}
