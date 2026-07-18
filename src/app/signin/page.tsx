import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { SignInForm } from "@/components/portal/SignInForm";

export const metadata: Metadata = {
  title: "Client Sign In",
  description: "Sign in to your Armed Capital client workspace.",
  alternates: { canonical: "/signin" },
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <section className="mx-auto max-w-lg px-5 pt-20 pb-24 sm:pt-24">
      <SectionHeading
        kicker="// client workspace"
        title="Sign in"
        subtitle="Your live model — inventory, purchase orders and lead times, on your own data."
      />
      <div className="mt-8">
        <SignInForm />
      </div>
    </section>
  );
}
