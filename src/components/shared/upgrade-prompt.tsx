import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

interface UpgradePromptProps {
  message: string;
  currentPlan?: string;
}

export function UpgradePrompt({
  message,
  currentPlan = "Starter",
}: UpgradePromptProps) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Zap className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">{message}</p>
          <p className="text-xs text-amber-700">
            You&apos;re on the {currentPlan} plan
          </p>
        </div>
        <Link href="/dashboard/settings/billing">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
            Upgrade
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
