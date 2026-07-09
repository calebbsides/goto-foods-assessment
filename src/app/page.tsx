import { Clock, ShoppingCart, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isFirebaseConfigured } from "@/lib/config";
import { findHostOpenOrder } from "@/lib/orders/find-host-open-order";
import { SetupNotice } from "@/components/setup-notice";
import { SiteHeader } from "@/components/site-header";
import { StartOrderButton } from "@/components/start-order-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const configured = isFirebaseConfigured();
  const user = configured ? await getCurrentUser() : null;
  const openOrderId = user ? await findHostOpenOrder(user.uid) : null;

  return (
    <>
      <SiteHeader user={user} />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-accent)_0%,transparent_70%)] opacity-70" />
          <div className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
            <div className="space-y-7">
              <Badge variant="secondary" className="w-fit">
                <span className="text-primary">New</span> group ordering for collectors
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Build a Pokémon card order,{" "}
                <span className="text-primary">together</span>.
              </h1>
              <p className="max-w-lg text-lg text-muted-foreground">
                Start a cart, invite up to two friends by email, and everyone adds cards
                in real time. As the host you set the timer and check out for the group.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {configured ? (
                  <StartOrderButton
                    signedIn={user !== null}
                    existingOrderId={openOrderId}
                  />
                ) : null}
              </div>
            </div>

            <div className="lg:pl-6">
              {!configured ? (
                <SetupNotice />
              ) : (
                <div className="grid gap-4">
                  <FeatureCard
                    icon={<Users className="size-5" />}
                    step="01"
                    title="Invite the crew"
                    body="Add up to two friends by email. They join with a link, no account required."
                  />
                  <FeatureCard
                    icon={<ShoppingCart className="size-5" />}
                    step="02"
                    title="Fill your cart"
                    body="Browse the featured catalog and add cards to your own cart, live for everyone."
                  />
                  <FeatureCard
                    icon={<Clock className="size-5" />}
                    step="03"
                    title="Host checks out"
                    body="Set a countdown to lock carts, review the per-person breakdown, and check out."
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container-page flex h-16 items-center text-sm text-muted-foreground">
          Built with real market prices from the Pokémon TCG API.
        </div>
      </footer>
    </>
  );
}

function FeatureCard({
  icon,
  step,
  title,
  body,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  body: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{step}</span>
            <h3 className="font-semibold">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{body}</p>
        </div>
      </CardContent>
    </Card>
  );
}
