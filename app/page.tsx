"use client"

import React, { useState } from 'react';
import { 
  BookOpen, Mic, MessageCircle, Brain, Trophy, Globe, 
  ArrowRight, Check, Star, Users, Zap, Target, Clock,
  Calculator, Palette, 
} from 'lucide-react';
import Link from 'next/link';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Reading",
      description: "Read diverse topics with instant word definitions and translations",
      color: "from-blue-500 to-cyan-500",
      path: "/aiTopic"
    },
    {
      icon: Mic,
      title: "Pronunciation Practice",
      description: "AI-powered speech recognition with real-time feedback and phonetics",
      color: "from-green-500 to-emerald-500",
      path: "/custom-sentences"
    },
    {
      icon: MessageCircle,
      title: "AI Conversations",
      description: "Generate custom dialogues on any topic with multiple participants",
      color: "from-purple-500 to-pink-500",
      path: "/aiPartner"
    },
    {
      icon: Brain,
      title: "Vocabulary Builder",
      description: "Smart word tracking and spaced repetition for lasting retention",
      color: "from-orange-500 to-red-500",
      path: "/vocabulary"
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics and achievements",
      color: "from-yellow-500 to-amber-500",
      path: "/dashboard"
    },
    {
      icon: Globe,
      title: "Multi-Subject Learning",
      description: "Expand beyond language - explore math, science, and more",
      color: "from-indigo-500 to-violet-500",
      path: "/dashboard"
    }
  ];

  const additionalServices = [
    {
      category: "Core Language Skills",
      icon: BookOpen,
      color: "blue",
      items: [
        "Grammar lessons with interactive exercises",
        "Writing practice with AI feedback",
        "Listening comprehension with podcasts/videos",
        "Cultural context and idioms learning",
        "Business/Academic English modules"
      ]
    },
    {
      category: "STEM Education",
      icon: Calculator,
      color: "green",
      items: [
        "Math problem solving with step-by-step explanations",
        "Physics concepts with visual simulations",
        "Chemistry experiments and equations",
        "Biology topics with interactive diagrams",
        "Computer Science & coding tutorials"
      ]
    },
    {
      category: "Creative & Arts",
      icon: Palette,
      color: "purple",
      items: [
        "Creative writing workshops",
        "Music theory and composition",
        "Art history and techniques",
        "Photography fundamentals",
        "Design principles"
      ]
    },
    {
      category: "Professional Skills",
      icon: Target,
      color: "orange",
      items: [
        "Interview preparation",
        "Public speaking training",
        "Resume/CV writing assistance",
        "Negotiation skills",
        "Email and business communication"
      ]
    }
  ];

  const stats = [
    { label: "Active Learners", value: "10,000+", icon: Users },
    { label: "Learning Hours", value: "50,000+", icon: Clock },
    { label: "Topics Available", value: "500+", icon: BookOpen },
    { label: "Success Rate", value: "94%", icon: Trophy }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "IELTS Student",
      content: "The pronunciation practice with AI feedback helped me improve my speaking score from 6.5 to 8.0!",
      rating: 5
    },
    {
      name: "Marco Rodriguez",
      role: "Business Professional",
      content: "Custom conversations feature is amazing. I can practice real-world scenarios before my meetings.",
      rating: 5
    },
    {
      name: "Aisha Patel",
      role: "University Student",
      content: "The multi-subject approach is perfect. I'm learning English while studying for my exams.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "5 pronunciation practices/day",
        "10 AI conversations/month",
        "Basic reading topics",
        "Progress tracking",
        "Community access"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$9.99",
      description: "For serious learners",
      features: [
        "Unlimited pronunciation practice",
        "Unlimited AI conversations",
        "All premium topics",
        "Advanced analytics",
        "Priority support",
        "Offline access",
        "Certificate of completion"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Team",
      price: "$29.99",
      description: "For schools & organizations",
      features: [
        "Everything in Pro",
        "Up to 10 team members",
        "Admin dashboard",
        "Custom content creation",
        "API access",
        "Dedicated support",
        "White-label option"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
     
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-8">
            <Zap size={16} />
            <span>AI-Powered Learning Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Master English &
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Beyond with AI
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Learn English through interactive reading, AI-powered pronunciation practice, and custom conversations. 
            Expand your skills with math, science, and more - all in one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/25">
                Start Learning Free
                <ArrowRight size={20} />
              </button>
            </Link>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-lg transition-all border border-slate-700">
              Watch Demo
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Learn
            </h2>
            <p className="text-xl text-slate-400">
              Comprehensive tools powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={index} href={feature.path}>
                  <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all group cursor-pointer">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                    <div className="flex items-center gap-2 text-sm text-purple-400 mt-4 group-hover:gap-3 transition-all">
                      <span>Explore</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Expand Your Knowledge
            </h2>
            <p className="text-xl text-slate-400">
              Go beyond language learning with comprehensive educational content
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index}
                  className="p-8 bg-slate-800/50 border border-slate-700 rounded-xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 bg-${service.color}-500/20 border border-${service.color}-500/30 rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${service.color}-400`} />
                    </div>
                    <h3 className="text-2xl font-semibold">{service.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {service.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Learners Worldwide
            </h2>
            <p className="text-xl text-slate-400">
              See what our users have to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6">&quot;{testimonial.content}&quot;</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-slate-400">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400">
              Choose the plan that fits your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`p-8 rounded-xl ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-purple-500' 
                    : 'bg-slate-800/50 border border-slate-700'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-2">
                    {plan.price}
                    <span className="text-lg text-slate-400">/month</span>
                  </div>
                  <p className="text-slate-400">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register">
                  <button className={`w-full py-3 rounded-lg font-medium transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-purple-500/30 rounded-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of learners improving their skills every day
            </p>
            <Link href="/auth/register">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium text-lg inline-flex items-center gap-2 transition-all shadow-lg shadow-purple-500/25">
                Get Started for Free
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold">LearnHub</span>
              </div>
              <p className="text-slate-400 text-sm">
                Empowering learners worldwide with AI-powered education
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><a href="#" className="hover:text-white">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center text-slate-400 text-sm">
            © 2024 LearnHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;