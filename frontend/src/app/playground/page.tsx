import Button from "@/src/app/components/ui/Button";
import Badge from "@/src/app/components/ui/Badge";
import RatingStars from "@/src/app/components/ui/RatingStars";
import Input from "@/src/app/components/ui/Input";
import Textarea from "@/src/app/components/ui/Textarea";
import Select from "@/src/app/components/ui/Select";
import { Home, ArrowLeft, RefreshCw, AlertCircle, Search, Mail } from "lucide-react";

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

      <div className="flex gap-3 items-center">
        <Badge variant="primary">Best Seller</Badge>
        <Badge variant="warning">New Entry</Badge>
        <Badge variant="danger" icon={<AlertCircle className="h-3 w-3" />}>
            ERROR 500
        </Badge>
        <Badge variant="primary">Premium Hardware</Badge>
        <Badge variant="default">Default</Badge>
        <Badge variant="outline">Outline</Badge>
        </div>

        <div className="flex flex-col gap-3">
            <RatingStars rating={4.9} size="sm" showCount={false} />
            <RatingStars rating={4.9} reviewCount={124} size="md" />
            <RatingStars rating={4.6} reviewCount={67} size="lg" />
            <RatingStars rating={4.9} showValue={false} showCount={false} />
        </div>

        <div className="flex flex-col gap-4 max-w-sm">
            <Input placeholder="Email Address" type="email" icon={<Mail className="h-4 w-4" />} />
            <Input placeholder="Password" type="password" />
            <Input placeholder="Search products..." icon={<Search className="h-4 w-4" />} />
            <Input placeholder="Disabled field" disabled />
            <Input placeholder="Email Address" error="Please enter a valid email address" />
        </div>

        <div className="flex flex-col gap-4 max-w-sm">
            <Textarea placeholder="How can we help you?" />
            <Textarea placeholder="Disabled message field" disabled />
            <Textarea placeholder="Message" error="Message cannot be empty" />
        </div>

        <div className="flex flex-col gap-4 max-w-sm">
            <Select
                options={[
                { label: "General Inquiry", value: "general" },
                { label: "Order Support", value: "order" },
                { label: "Wholesale", value: "wholesale" },
                ]}
            />
            <Select
                placeholder="Select a subject"
                options={[
                { label: "General Inquiry", value: "general" },
                { label: "Order Support", value: "order" },
                ]}
            />
            <Select disabled options={[{ label: "Disabled", value: "disabled" }]} />
        </div>
    </div>
  );
}