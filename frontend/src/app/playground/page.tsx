import Button from "@/src/app/components/ui/Button";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";

export default function PlaygroundPage() {
  return (
    <div className="p-10 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex gap-4">
        <Button variant="primary" icon={<Home className="h-4 w-4" />}>
          Return Home
        </Button>
        <Button variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
          Go Back
        </Button>
        <Button variant="outline">Contact Support</Button>
        <Button variant="primary" icon={<RefreshCw className="h-4 w-4" />}>
          Retry
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>

      <div className="flex gap-4">
        <Button disabled>Disabled</Button>
        <Button isLoading>Loading</Button>
      </div>

      <div className="w-64">
        <Button fullWidth>Login</Button>
      </div>
    </div>
  );
}