import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Shield, LayoutDashboard, Percent, ArrowRight } from 'lucide-react';

export default function ArtistOnboardingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const benefits = [
    {
      icon: Globe,
      title: 'Global Exposure',
      description: 'Reach audiences worldwide and showcase your work to a global marketplace',
    },
    {
      icon: Shield,
      title: 'Secure Payment Processing',
      description: 'Industry-leading payment security with Stripe Connect integration',
    },
    {
      icon: LayoutDashboard,
      title: 'Easy Item Management',
      description: 'Intuitive dashboard to manage your products, music, and gigs effortlessly',
    },
    {
      icon: Percent,
      title: '90% Revenue Share',
      description: 'Keep 90% of every sale - one of the best rates in the industry',
    },
  ];

  const handleGetStarted = () => {
    if (identity) {
      navigate({ to: '/my-profile' });
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <div className="min-h-screen">
      <div
        className="relative h-[400px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: 'url(/assets/generated/hero-banner.dim_1920x600.png)' }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Why Join ArtistConnect</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Empower your creative journey with the tools and support you need to succeed
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{benefit.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of artists already earning on our platform
              </p>
              <Button size="lg" variant="secondary" onClick={handleGetStarted}>
                {identity ? 'Create Artist Profile' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-semibold mb-2">Create Your Profile</h4>
                <p className="text-muted-foreground">Set up your artist profile and showcase your portfolio</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-semibold mb-2">List Your Work</h4>
                <p className="text-muted-foreground">Upload products, music, or create gig offerings</p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-semibold mb-2">Start Earning</h4>
                <p className="text-muted-foreground">Receive payments directly with 90% revenue share</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
