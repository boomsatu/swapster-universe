
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart, Shield, Zap } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Swaps",
      description: "Exchange tokens seamlessly with minimal slippage and competitive rates.",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Security First",
      description: "Your funds remain in your wallet until the transaction is executed.",
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Track your investments with real-time price charts and insights.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-70 animate-pulse-slow" />
            <div className="absolute bottom-32 -right-20 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl opacity-70 animate-pulse-slow delay-700" />
          </div>
          
          <div className="container relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
                The Next-Gen DEX Platform
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
                Trade Crypto with Confidence
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl animate-slide-up delay-100">
                A fast, secure, and intuitive decentralized exchange for all your trading needs. 
                Swap tokens, provide liquidity, and earn rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-200">
                <Button size="lg" asChild>
                  <Link to="/swap" className="px-8">Launch App</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a 
                    href="#features" 
                    className="px-8"
                  >
                    Learn More
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform is designed to provide the best trading experience with
                powerful features and tools.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-card p-8 rounded-xl animate-fade-in transition-transform hover:translate-y-[-5px]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-3 bg-primary/10 w-fit rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container">
            <div className="glass-card p-12 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-70" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl opacity-70" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-lg">
                  <h2 className="text-3xl font-bold mb-4">Ready to start trading?</h2>
                  <p className="text-muted-foreground mb-0">
                    Connect your wallet and start swapping tokens in just a few clicks.
                    No registration required.
                  </p>
                </div>
                <Button size="lg" asChild className="min-w-40">
                  <Link to="/swap" className="flex items-center">
                    Launch App
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
