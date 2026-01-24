import { PricingPage } from "@/components/pricing/PricingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pricing - QuickGPT",
    description: "Choose the perfect plan for your AI needs.",
};

export default function Page() {
    return <PricingPage />;
}
