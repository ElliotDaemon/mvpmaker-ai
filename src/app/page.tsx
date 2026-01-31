"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Code2,
  Layers,
  Upload,
  ArrowRight,
  Play,
  Cpu,
  Globe,
  Rocket,
  Check,
} from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Textarea } from "@/components/ui/input";
import Link from "next/link";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate complete MVPs in minutes, not weeks. Our AI understands your vision instantly.",
  },
  {
    icon: Code2,
    title: "Production Ready",
    description: "Clean, scalable code with best practices. Deploy directly to Vercel or Netlify.",
  },
  {
    icon: Layers,
    title: "Full Stack",
    description: "Frontend, backend, database - everything you need in one seamless package.",
  },
  {
    icon: Globe,
    title: "Live Preview",
    description: "Watch your app come to life in real-time as the AI generates code.",
  },
];

const tiers = [
  {
    name: "Explorer",
    price: "Free",
    description: "Perfect for trying out ideas",
    features: ["3 MVPs per month", "Basic templates", "Community support", "Groq AI (fastest)"],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Builder",
    price: "$19",
    period: "/mo",
    description: "For serious builders",
    features: [
      "Unlimited MVPs",
      "All templates",
      "Priority queue",
      "Multiple AI models",
      "GitHub integration",
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "Maximum quality & speed",
    features: [
      "Everything in Builder",
      "Claude Sonnet (best quality)",
      "Custom domains",
      "Team collaboration",
      "API access",
    ],
    cta: "Go Pro",
    popular: false,
  },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen overflow-y-auto">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-zinc-300">Powered by Claude, Groq & more</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Build MVPs at
            <br />
            <span className="gradient-text">Lightning Speed</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto"
          >
            Describe your idea, upload references, and watch as AI builds your
            complete, launch-ready application in real-time.
          </motion.p>

          {/* Main Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className={`glass rounded-2xl p-2 transition-all duration-300 ${
                isHovered ? "glow" : ""
              }`}
            >
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your MVP idea... e.g., 'A task management app with real-time collaboration, Kanban boards, and Slack integration'"
                  className="min-h-[120px] bg-transparent border-0 focus:ring-0 text-lg"
                  rows={4}
                />
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                    <span className="text-xs text-zinc-500">
                      Drop files, images, or code as reference
                    </span>
                  </div>
                  <Link href="/build">
                    <Button variant="glow" size="lg" disabled={!prompt.trim()}>
                      <Play className="w-4 h-4" />
                      Generate MVP
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-8 mt-12 text-sm text-zinc-500"
          >
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span>10,000+ MVPs built</span>
            </div>
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span>Average build: 3 minutes</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to ship fast
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              From idea to deployed product in minutes. No configuration, no
              boilerplate, just results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <GlassCard key={feature.title} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-zinc-400">
              Start free, upgrade when you need more power
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <GlassCard
                key={tier.name}
                hover={false}
                glow={tier.popular}
                className={tier.popular ? "border-violet-500/30 relative" : ""}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-500 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-1">{tier.name}</h3>
                  <p className="text-sm text-zinc-500">{tier.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-zinc-500">{tier.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-violet-400" />
                      <span className="text-zinc-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.popular ? "glow" : "outline"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <GlassCard hover={false} glow className="py-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to build your MVP?
            </h2>
            <p className="text-zinc-400 mb-8">
              Join thousands of founders shipping faster with AI
            </p>
            <Link href="/build">
              <Button variant="glow" size="lg">
                <Sparkles className="w-5 h-5" />
                Start Building for Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-zinc-500">
              2025 MVPMAKER.AI. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
