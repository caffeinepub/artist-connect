import { useParams, Link } from '@tanstack/react-router';
import { useGetAllJobOfferings } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, User } from 'lucide-react';

export default function JobOfferingDetailPage() {
    const { id } = useParams({ from: '/jobs/$id' });
    const { data: jobs, isLoading } = useGetAllJobOfferings();
    const job = jobs?.find((j) => j.id === id);

    if (isLoading) {
        return (
            <div className="container py-12">
                <div className="max-w-3xl mx-auto">Loading...</div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="container py-12">
                <Card className="p-12 text-center max-w-2xl mx-auto">
                    <h2 className="font-display text-3xl font-bold mb-4">Job Not Found</h2>
                    <p className="text-muted-foreground mb-6">This job posting doesn't exist or has been removed.</p>
                    <Button asChild>
                        <Link to="/jobs">Browse Jobs</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <div className="max-w-3xl mx-auto">
                <Button asChild variant="ghost" className="mb-6">
                    <Link to="/jobs">← Back to Jobs</Link>
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start mb-4">
                            <Badge variant="secondary">Open Position</Badge>
                        </div>
                        <CardTitle className="font-display text-3xl md:text-4xl">{job.jobTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <span className="font-semibold">${Number(job.budget) / 100} USD</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span>Deadline: {new Date(Number(job.deadline) / 1_000_000).toLocaleDateString()}</span>
                            </span>
                        </div>

                        <div>
                            <h3 className="font-display text-xl font-semibold mb-3">Job Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                        </div>

                        <div className="pt-6 border-t">
                            <Button size="lg" className="w-full md:w-auto">
                                Apply for This Job
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
