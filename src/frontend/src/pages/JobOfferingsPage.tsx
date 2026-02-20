import { useGetAllJobOfferings, useCreateJobOffering } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';
import { Briefcase, Calendar, DollarSign, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export default function JobOfferingsPage() {
    const { data: jobs, isLoading } = useGetAllJobOfferings();
    const { identity } = useInternetIdentity();
    const createJob = useCreateJobOffering();
    const [open, setOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleCreate = async () => {
        if (!identity || !title.trim() || !description.trim() || !budget || !deadline) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const deadlineTime = BigInt(new Date(deadline).getTime() * 1_000_000);
            await createJob.mutateAsync({
                id: `job-${Date.now()}`,
                employer: identity.getPrincipal(),
                jobTitle: title.trim(),
                description: description.trim(),
                budget: BigInt(Math.round(parseFloat(budget) * 100)),
                deadline: deadlineTime
            });
            toast.success('Job posted successfully!');
            setOpen(false);
            setTitle('');
            setDescription('');
            setBudget('');
            setDeadline('');
        } catch (error) {
            toast.error('Failed to post job');
            console.error(error);
        }
    };

    return (
        <div className="container py-12">
            <div className="flex justify-between items-start mb-12">
                <div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Job Opportunities</h1>
                    <p className="text-xl text-muted-foreground">
                        Find creative projects and connect with clients
                    </p>
                </div>
                {identity && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg">
                                <Plus className="mr-2 h-5 w-5" />
                                Post a Job
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="font-display text-2xl">Post a Job Offering</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Job Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g., Logo Design for Tech Startup"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the project requirements..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="budget">Budget (USD) *</Label>
                                        <Input
                                            id="budget"
                                            type="number"
                                            placeholder="500"
                                            value={budget}
                                            onChange={(e) => setBudget(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deadline">Deadline *</Label>
                                        <Input
                                            id="deadline"
                                            type="date"
                                            value={deadline}
                                            onChange={(e) => setDeadline(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleCreate} disabled={createJob.isPending} className="w-full">
                                    {createJob.isPending ? 'Posting...' : 'Post Job'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : jobs && jobs.length > 0 ? (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <Card
                            key={job.id}
                            className="hover:shadow-artistic transition-all hover:border-primary/50"
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle className="font-display text-2xl mb-2">{job.jobTitle}</CardTitle>
                                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                ${Number(job.budget) / 100}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(Number(job.deadline) / 1_000_000).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">Open</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">{job.description}</p>
                                <Button asChild>
                                    <Link to="/jobs/$id" params={{ id: job.id }}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-display text-2xl font-semibold mb-2">No Jobs Posted Yet</h3>
                    <p className="text-muted-foreground">Be the first to post a job opportunity!</p>
                </Card>
            )}
        </div>
    );
}
