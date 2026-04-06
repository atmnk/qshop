import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const { user } = session;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className="mt-1 capitalize" variant="secondary">{user.role}</Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Account type</span>
            <span className="capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email verified</span>
            <span>{user.emailVerified ? "Yes" : "No"}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        <Button variant="outline" asChild>
          <Link href="/orders">View my orders</Link>
        </Button>
        {(user.role === "seller" || user.role === "admin") && (
          <Button variant="outline" asChild>
            <Link href="/seller">Seller dashboard</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
