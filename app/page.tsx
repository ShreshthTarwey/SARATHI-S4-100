"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Heart,
  Star,
  Users,
  BookOpen,
  MessageCircle,
  Trophy,
  ArrowRight,
  Play,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// 1. ADDED: Import the hook to access the global voice system
import { useVoice } from "@/context/VoiceControlContext";

export default function SarathiHomepage() {
  // 2. ADDED: The entire block for voice control logic
  const { setPageSpecificCommands } = useVoice();
  // Define the voice-controllable sections on this page. These MUST match the `id`s below.
  const homepageSections = ['home', 'features', 'experience', 'intelligence', 'community', 'join'];

  // When this page loads, it tells the global voice system which commands are available.
  useEffect(() => {
    setPageSpecificCommands(homepageSections);
    // When the page is left, it clears the commands for the next page.
    return () => {
      setPageSpecificCommands([]);
    }
  }, []); 
  // --- End of added voice logic block ---


  // --- All of your team's original code starts here and is untouched ---

  const [isLoaded, setIsLoaded] = useState(false);
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    const newSparkles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setSparkles(newSparkles);

    // Parallax scroll effect
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        parallaxRef.current.style.transform = `translateY(${rate}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: MessageCircle,
      title: "Smart Communication",
      description: "AI-powered voice & text tools for seamless interaction",
      color: "from-sky-blue to-mint-green",
      href: "/communication",
    },
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description: "Gamified educational experiences that adapt to you",
      color: "from-mint-green to-sunny-yellow",
      href: "/education",
    },
    {
      icon: Trophy,
      title: "Progress Tracking",
      description: "Visualize your learning journey with detailed analytics",
      color: "from-coral-pink to-soft-lavender",
      href: "/profile",
    },
    {
      icon: Users,
      title: "Community Stories",
      description: "Connect with inspiring learners from around the world",
      color: "from-soft-lavender to-sky-blue",
      href: "/stories",
    },
  ];

  // MODIFIED: Added 'id' property to each object for voice navigation
  const parallaxSections = [
    {
      id: "experience",
      title: "Immersive Learning Experience",
      description:
        "Step into a world where education meets innovation. Our platform combines cutting-edge technology with proven pedagogical methods to create learning experiences that are both effective and engaging.",
      image: "/Home2.png",
      reverse: false,
      stats: [
        { number: "10K+", label: "Active Learners" },
        { number: "95%", label: "Success Rate" },
        { number: "50+", label: "Learning Modules" },
      ],
    },
    {
      id: "intelligence",
      title: "Adaptive Intelligence",
      description:
        "Our AI understands how each learner thinks and adapts in real-time. Every interaction is personalized, ensuring optimal learning outcomes for students of all abilities and learning styles.",
      image: "/Home1.png",
      reverse: true,
      stats: [
        { number: "99.9%", label: "Uptime" },
        { number: "24/7", label: "Support" },
        { number: "15+", label: "Languages" },
      ],
    },
    {
      id: "community",
      title: "Global Community",
      description:
        "Join a worldwide network of learners, educators, and innovators. Share experiences, celebrate achievements, and grow together in an inclusive environment that celebrates diversity.",
      image: "/Home3.png",
      reverse: false,
      stats: [
        { number: "120+", label: "Countries" },
        { number: "500K+", label: "Connections" },
        { number: "1M+", label: "Stories Shared" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute animate-sparkle-dance"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              animationDelay: `${sparkle.delay}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-primary opacity-30" />
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div
          ref={parallaxRef}
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-coral-pink/5"
        />

        <div className="container mx-auto text-center relative z-10">
          <div
            className={`transition-all duration-1000 ${
              isLoaded ? "animate-slide-up-fade" : "opacity-0"
            }`}
          >
            <h1 className="font-heading text-8xl md:text-9xl font-bold mb-6 text-gradient animate-gradient-shift">
              SARATHI
            </h1>
            <h2 className="font-body text-2xl md:text-4xl font-semibold text-muted-foreground mb-8">
              SUPPORTIVE ASSISTIVE REACH FOR ACCESSIBLE <br />
              TEACHING & HOLISTIC INCLUSION
            </h2>

            <p className="font-body text-xl md:text-2xl text-foreground/80 max-w-4xl mx-auto mb-12 leading-relaxed">
              Where learning becomes an adventure. Experience the future of
              education with AI-powered personalization, immersive content, and
              a global community of learners.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                size="lg"
                className="font-body text-xl px-8 py-4 bg-gradient-purple text-white rounded-full shadow-lg hover-lift transform transition-all duration-300 animate-glow-pulse"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Your Journey
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-body text-xl px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-full hover-lift bg-transparent"
              >
                Explore Features
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* Floating 3D elements */}
        <div className="absolute top-20 left-10 animate-float-3d">
          <div className="w-20 h-20 bg-gradient-purple rounded-2xl opacity-20 rotate-12"></div>
        </div>
        <div
          className="absolute top-40 right-20 animate-float-3d"
          style={{ animationDelay: "1s" }}
        >
          <div className="w-16 h-16 bg-gradient-cyber rounded-full opacity-30"></div>
        </div>
        <div
          className="absolute bottom-40 left-20 animate-float-3d"
          style={{ animationDelay: "2s" }}
        >
          <Star className="w-12 h-12 text-accent opacity-40" />
        </div>
      </section>

      {/* Features Section with Glowing Cards */}
      <section id="features" className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl font-bold mb-6 text-foreground">
              Powerful Features
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the tools and capabilities that make SARATHI the ultimate
              learning companion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link key={feature.title} href={feature.href}>
                <Card
                  className={`card-glow cursor-pointer transform transition-all duration-500 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm ${
                    isLoaded ? "animate-scale-in" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <CardContent className="p-8 text-center relative">
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle shadow-lg`}
                    >
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-heading text-2xl font-bold mb-4 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="font-body text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Parallax Sections */}
      {parallaxSections.map((section, index) => (
        <section key={index} id={section.id} className="py-20 px-4 relative overflow-hidden">
          <div className="container mx-auto">
            <div
              className={`grid lg:grid-cols-2 gap-16 items-center ${
                section.reverse ? "lg:grid-flow-col-dense" : ""
              }`}
            >
              {/* Content */}
              <div
                className={`space-y-8 ${
                  section.reverse ? "lg:col-start-2" : ""
                }`}
              >
                <h2 className="font-heading text-5xl font-bold text-foreground leading-tight">
                  {section.title}
                </h2>
                <p className="font-body text-xl text-muted-foreground leading-relaxed">
                  {section.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {section.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="text-center">
                      <div className="font-heading text-3xl font-bold text-primary mb-2">
                        {stat.number}
                      </div>
                      <div className="font-body text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="font-body text-lg px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full hover-lift"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Image */}
              <div
                className={`relative ${
                  section.reverse ? "lg:col-start-1" : ""
                }`}
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl hover-lift">
                  <Image
                    src={section.image || "/placeholder.svg"}
                    alt={section.title}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Call to Action */}
      <section id="join" className="py-20 px-4 relative">
        <div className="container mx-auto text-center">
          <Card className="max-w-4xl mx-auto bg-gradient-cyber border-0 text-white relative overflow-hidden">
            <CardContent className="p-12 relative z-10">
              <h2 className="font-heading text-5xl font-bold mb-6">
                Ready to Transform Learning?
              </h2>
              <p className="font-body text-xl mb-8 opacity-90">
                Join thousands of learners who are already experiencing the
                future of education
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/education">
                  <Button
                    size="lg"
                    className="font-body text-lg px-8 py-4 bg-white text-primary hover:bg-white/90 rounded-full hover-lift"
                  >
                    <BookOpen className="w-6 h-6 mr-2" />
                    Explore Learning
                  </Button>
                </Link>
                <Link href="/stories">
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-body text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-primary rounded-full hover-lift bg-transparent"
                  >
                    <Users className="w-6 h-6 mr-2" />
                    Join Community
                  </Button>
                </Link>
              </div>
            </CardContent>

            {/* Background animation */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-bounce-gentle" />
              <div className="absolute bottom-10 right-10 w-16 h-16 bg-white rounded-full animate-wiggle" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Heart className="w-24 h-24 text-white animate-float-3d" />
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}