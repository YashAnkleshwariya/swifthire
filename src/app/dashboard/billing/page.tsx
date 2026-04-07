"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  credits: number;
  email: string;
  name: string | null;
}

const plans = [
  {
    id: "FREE",
    name: "Free",
    price: 0,
    credits: 100,
    features: [
      "100 credits (10 job matches)",
      "Basic candidate ranking",
      "LinkedIn profile search",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: 29,
    credits: 300,
    features: [
      "300 credits/month (30 job matches)",
      "Priority processing",
      "CSV export",
      "Advanced filtering",
    ],
    popular: true,
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: 99,
    credits: 1000,
    features: [
      "1,000 credits/month (100 job matches)",
      "API access",
      "Custom integrations",
      "Dedicated support",
    ],
  },
];

export default function BillingPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUser(data.data);
      })
      .catch(console.error);
  }, []);

  async function handlePurchase(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Credits added",
          description: data.message ?? "Your credits have been updated.",
        });
        const userRes = await fetch("/api/user");
        const userData = await userRes.json();
        if (userData.success) setUser(userData.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Purchase failed",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background bg-dot-grid p-5 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Billing & Credits
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your subscription and credits
          </p>
        </div>

        {/* Current Balance Card — styled like a stat card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 mb-10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] text-white overflow-hidden relative glow-card scan-container">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <p className="text-blue-100 font-medium text-sm mb-1">Current Balance</p>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-6xl font-bold font-data tabular-nums">{user?.credits ?? "..."}</span>
              <span className="text-blue-100 text-lg">credits</span>
            </div>
            <p className="text-blue-100 text-sm flex items-center gap-1.5">
              <span>⚡</span>
              ~{user ? Math.floor(user.credits / 10) : "..."} job matches available · 10 credits per match
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <h2 className="text-xl font-bold text-foreground mb-5">Choose a Plan</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={
                plan.popular
                  ? "border-2 border-blue-500/40 shadow-xl shadow-blue-500/10 relative bg-blue-500/[0.06] glow-card"
                  : "border border-subtle shadow-xl bg-surface-1 relative card-hover"
              }
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 shadow-lg">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-4xl font-bold font-data text-foreground tabular-nums">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground ml-1">/month</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <svg
                        className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={
                    plan.popular
                      ? "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      : "w-full"
                  }
                  variant={plan.popular ? "default" : "outline"}
                  disabled={loading !== null}
                  onClick={() => handlePurchase(plan.id)}
                >
                  {loading === plan.id
                    ? "Processing..."
                    : plan.price === 0
                      ? "Current Plan"
                      : "Upgrade →"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Buy Additional Credits */}
        <h2 className="text-xl font-bold text-foreground mb-5">One-Time Credits</h2>
        <Card className="border border-subtle shadow-xl bg-surface-1">
          <CardHeader>
            <CardTitle>Buy Additional Credits</CardTitle>
            <CardDescription>
              Need more credits? Purchase a one-time pack without changing your plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-500/20">
              <div>
                <p className="font-semibold text-foreground">100 Credits Pack</p>
                <p className="text-sm text-muted-foreground">
                  10 additional job matches · never expires
                </p>
              </div>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                disabled={loading !== null}
                onClick={() => handlePurchase("CREDITS_100")}
              >
                {loading === "CREDITS_100" ? "Processing..." : "Buy for $9"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
