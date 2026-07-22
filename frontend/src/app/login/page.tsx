import Link from "next/link";
import Header from "@/src/app/components/layout/Header";
import Footer from "@/src/app/components/layout/Footer";
import Input from "@/src/app/components/ui/Input";
import Checkbox from "@/src/app/components/ui/Checkbox";
import Button from "@/src/app/components/ui/Button";
import FormField from "@/src/app/components/ui/FormField";
import GoogleIcon from "@/src/app/components/ui/icons/GoogleIcon";
import AppleIcon from "@/src/app/components/ui/icons/AppleIcon";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        variant="minimal"
        minimalRightLink={{ label: "Help Center", href: "/help" }}
      />

      <main className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-16">
        <div className="w-full max-w-md rounded-md border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your details to access your account.
          </p>

          <form className="mt-6 flex flex-col gap-4">
            <Input id="email" type="email" placeholder="Email Address" />
            <Input id="password" type="password" placeholder="Password" />

            <div className="flex items-center justify-between">
              <Checkbox id="remember" label="Remember Me" />
              <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" fullWidth>
              Login
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-gray-200" />
            <span className="text-xs font-medium uppercase text-gray-500">
              Or continue with
            </span>
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" icon={<GoogleIcon className="h-4 w-4" />}>
              Google
            </Button>
            <Button variant="secondary" icon={<AppleIcon className="h-4 w-4" />}>
              Apple
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            New here?{" "}
            <Link href="/register" className="font-medium text-primary-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <Footer variant="minimal" />
    </div>
  );
}