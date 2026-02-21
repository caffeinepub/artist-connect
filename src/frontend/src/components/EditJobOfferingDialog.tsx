import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateJobOffering } from '../hooks/useQueries';
import type { JobOffering } from '../backend';

interface EditJobOfferingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobOffering;
  onSuccess: () => void;
}

export function EditJobOfferingDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
}: EditJobOfferingDialogProps) {
  const [jobTitle, setJobTitle] = useState(job.jobTitle);
  const [description, setDescription] = useState(job.description);
  const [budget, setBudget] = useState((Number(job.budget) / 100).toString());
  const [deadline, setDeadline] = useState('');

  const updateJob = useUpdateJobOffering();

  useEffect(() => {
    if (open) {
      setJobTitle(job.jobTitle);
      setDescription(job.description);
      setBudget((Number(job.budget) / 100).toString());
      
      // Convert bigint timestamp to date string
      const deadlineDate = new Date(Number(job.deadline) / 1_000_000);
      setDeadline(deadlineDate.toISOString().split('T')[0]);
    }
  }, [open, job]);

  const handleSubmit = async () => {
    if (!jobTitle.trim()) {
      toast.error('Job title is required');
      return;
    }

    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }

    const budgetValue = parseFloat(budget);
    if (isNaN(budgetValue) || budgetValue < 0) {
      toast.error('Please enter a valid budget');
      return;
    }

    if (!deadline) {
      toast.error('Deadline is required');
      return;
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      toast.error('Deadline must be in the future');
      return;
    }

    try {
      const deadlineTime = BigInt(deadlineDate.getTime() * 1_000_000);
      
      await updateJob.mutateAsync({
        id: job.id,
        employer: job.employer,
        jobTitle: jobTitle.trim(),
        description: description.trim(),
        budget: BigInt(Math.round(budgetValue * 100)),
        deadline: deadlineTime,
      });
      
      toast.success('Job offering updated successfully!');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating job offering:', error);
      toast.error(error.message || 'Failed to update job offering');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Job Offering</DialogTitle>
          <DialogDescription>
            Update your job posting details, budget, and deadline
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Logo Design for Tech Startup"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project requirements..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD) *</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="500.00"
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateJob.isPending}>
            {updateJob.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
