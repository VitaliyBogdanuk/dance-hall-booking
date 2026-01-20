"use client";

import { useState, useEffect } from "react";
import {
  PageHeader,
  Card,
  CardContent,
  Button,
  EmptyState,
  useToast,
  ToastContainer,
  Skeleton,
  ProgressBar,
  Badge,
} from "@/components/ui";

interface Subscription {
  plan: string;
  credits: number;
  totalCredits: number;
  expiresAt?: string;
}

interface Plan {
  id: string;
  name: string;
  credits: number;
  price: number;
  period: string;
  features: string[];
}

// Mock data - replace with actual API call
const mockPlans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    credits: 4,
    price: 29,
    period: "month",
    features: ["4 classes per month", "Access to all halls", "Email support"],
  },
  {
    id: "premium",
    name: "Premium",
    credits: 8,
    price: 49,
    period: "month",
    features: ["8 classes per month", "Priority booking", "Access to all halls", "Email & phone support"],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    credits: -1, // -1 means unlimited
    price: 79,
    period: "month",
    features: ["Unlimited classes", "Priority booking", "Access to all halls", "24/7 support", "Free cancellation"],
  },
];

export default function SubscriptionPage() {
  const { toasts, showToast, removeToast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // const loadSubscription = async () => {
    //   try {
    //     const data = await apiGet<Subscription>("/api/subscription");
    //     setSubscription(data);
    //   } catch (err) {
    //     const error = err as FetchError;
    //     showToast(error.message || "Failed to load subscription", "error");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // loadSubscription();

    // Mock data for now
    setTimeout(() => {
      setSubscription({
        plan: "premium",
        credits: 5,
        totalCredits: 8,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setLoading(false);
    }, 500);
  }, [showToast]);

  const formatDate = (iso?: string) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPlanName = (planId: string) => {
    return mockPlans.find((p) => p.id === planId)?.name || planId;
  };

  const remainingPercentage = subscription
    ? subscription.credits === -1
      ? 100
      : (subscription.credits / subscription.totalCredits) * 100
    : 0;

  return (
    <div className="w-full space-y-4">
      <PageHeader title="Subscription" description="Manage your subscription and credits" />

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <Skeleton variant="rectangular" height={200} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={300} />
            ))}
          </div>
        </div>
      )}

      {/* Current Subscription */}
      {!loading && subscription && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    Current Plan: {getPlanName(subscription.plan)}
                  </h3>
                  {subscription.expiresAt && (
                    <p className="text-sm text-text-secondary">
                      Renews on {formatDate(subscription.expiresAt)}
                    </p>
                  )}
                </div>
                <Badge variant="success" size="md">
                  Active
                </Badge>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">Remaining Credits</span>
                  <span className="text-lg font-bold text-text-primary">
                    {subscription.credits === -1 ? "Unlimited" : `${subscription.credits} / ${subscription.totalCredits}`}
                  </span>
                </div>
                {subscription.credits !== -1 && (
                  <ProgressBar
                    value={remainingPercentage}
                    variant="success"
                    size="lg"
                    showLabel={false}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {!loading && (
        <div>
          <h2 className="text-lg font-semibold text-text-primary mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockPlans.map((plan) => {
              const isCurrentPlan = subscription?.plan === plan.id;
              return (
                <Card
                  key={plan.id}
                  className={`hover:shadow-soft-lg ${
                    isCurrentPlan ? "ring-2 ring-accent" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold text-text-primary">{plan.name}</h4>
                        {isCurrentPlan && (
                          <Badge variant="success" size="sm">
                            Current
                          </Badge>
                        )}
                      </div>

                      <div>
                        <p className="text-3xl font-bold text-text-primary">
                          ${plan.price}
                          <span className="text-base font-normal text-text-secondary">/{plan.period}</span>
                        </p>
                        <p className="text-sm text-text-secondary mt-1">
                          {plan.credits === -1 ? "Unlimited classes" : `${plan.credits} classes per month`}
                        </p>
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                            <svg
                              className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={isCurrentPlan ? "secondary" : "primary"}
                        className="w-full"
                        disabled={isCurrentPlan}
                      >
                        {isCurrentPlan ? "Current Plan" : "Select Plan"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* No Subscription State */}
      {!loading && !subscription && (
        <EmptyState
          title="No active subscription"
          description="Choose a plan to start booking classes"
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          }
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
