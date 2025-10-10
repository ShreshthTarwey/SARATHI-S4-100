"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function MissionPage() {
  const teamMembers = [
    {
      name: "Dr. Priya Sharma",
      role: "Accessibility Expert",
      avatar: "👩‍⚕️",
      description: "Specializes in inclusive design for children with disabilities",
      gradient: "from-pink-400 to-purple-500",
    },
    {
      name: "Raj Patel",
      role: "Educational Technologist",
      avatar: "👨‍💻",
      description: "Creates engaging learning experiences through technology",
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      name: "Maya Singh",
      role: "Child Psychologist",
      avatar: "👩‍🎓",
      description: "Ensures our approach supports healthy development",
      gradient: "from-green-400 to-teal-500",
    },
  ]

  const values = [
    {
      title: "Accessibility First",
      description: "Every feature is designed with accessibility in mind from the ground up",
      icon: "♿",
      gradient: "from-blue-400 to-indigo-500",
      bgGradient: "from-blue-50 to-indigo-100",
    },
    {
      title: "Joyful Learning",
      description: "Learning should be fun, engaging, and celebrate every small victory",
      icon: "🎉",
      gradient: "from-yellow-400 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-100",
    },
    {
      title: "Inclusive Community",
      description: "Building bridges between all learners, regardless of their abilities",
      icon: "🤝",
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-100",
    },
    {
      title: "Technology as Companion",
      description: "Our technology feels warm, supportive, and genuinely helpful",
      icon: "🤖",
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-50 to-pink-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-300 to-purple-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-300 to-cyan-400 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-green-300 to-teal-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full opacity-15 animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-14 h-14 bg-gradient-to-r from-indigo-300 to-blue-400 rounded-full opacity-15 animate-float-slow"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="text-8xl mb-6 animate-bounce-gentle">🌟</div>
          <h1 className="font-heading text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-6">
            Our Mission
          </h1>
          <p className="font-body text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
            To bridge the communication and learning gap for people with disabilities through accessible, voice-enabled,
            and playful technology.
          </p>
        </div>

        <Card
          className="mb-16 hover:shadow-2xl transition-all duration-500 animate-fade-in-up bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-2 border-purple-200 transform hover:scale-105"
          style={{ animationDelay: "0.2s" }}
        >
          <CardContent className="p-12 text-center">
            <div className="text-8xl mb-6 animate-pulse-gentle">🤝</div>
            <h2 className="font-heading text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Technology as a Companion
            </h2>
            <p className="font-body text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
              We believe technology should feel like a warm, empathetic helper - not cold software. Sarathi (सारथी)
              means "guide" or "companion" in Sanskrit, reflecting our commitment to being a trusted partner in every
              learner's journey. We're not just building tools; we're creating digital companions that understand,
              encourage, and celebrate with every user.
            </p>
          </CardContent>
        </Card>

        <div className="mb-16">
          <h2
            className="font-heading text-5xl font-bold text-center bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-12 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={value.title}
                className={`hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-fade-in-up bg-gradient-to-br ${value.bgGradient} border-2 border-white/50 backdrop-blur-sm`}
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gradient-to-r ${value.gradient} shadow-lg transform hover:rotate-12 transition-transform duration-300`}
                  >
                    <span className="text-4xl">{value.icon}</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                  <p className="font-body text-sm text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card
          className="mb-16 hover:shadow-2xl transition-all duration-500 animate-fade-in-up bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 border-2 border-blue-200 transform hover:scale-105"
          style={{ animationDelay: "0.8s" }}
        >
          <CardHeader>
            <div className="text-6xl text-center mb-4 animate-bounce-gentle">📈</div>
            <CardTitle className="font-heading text-4xl text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Our Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-6xl font-heading font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                  500+
                </div>
                <p className="font-body text-gray-700 text-lg">Children Learning</p>
              </div>
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-6xl font-heading font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                  50+
                </div>
                <p className="font-body text-gray-700 text-lg">Schools Partner</p>
              </div>
              <div className="transform hover:scale-110 transition-transform duration-300">
                <div className="text-6xl font-heading font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent mb-2">
                  95%
                </div>
                <p className="font-body text-gray-700 text-lg">Improvement Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-16">
          <h2
            className="font-heading text-5xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-12 animate-fade-in-up"
            style={{ animationDelay: "1s" }}
          >
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={member.name}
                className={`hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-fade-in-up bg-gradient-to-br ${member.gradient} bg-opacity-10 border-2 border-white/50 backdrop-blur-sm`}
                style={{ animationDelay: `${1.2 + index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-8xl mb-4 animate-bounce-gentle">{member.avatar}</div>
                  <h3 className="font-heading text-2xl font-bold text-gray-800 mb-2">{member.name}</h3>
                  <p
                    className={`font-body text-lg font-bold bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent mb-3`}
                  >
                    {member.role}
                  </p>
                  <p className="font-body text-sm text-gray-600 leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center animate-fade-in-up" style={{ animationDelay: "1.4s" }}>
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-2 border-purple-200 transform hover:scale-105 transition-all duration-500">
            <CardContent className="p-8">
              <div className="text-6xl mb-4 animate-pulse-gentle">🚀</div>
              <h3 className="font-heading text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Join Our Mission
              </h3>
              <p className="font-body text-lg text-gray-700 mb-6 leading-relaxed">
                Whether you're a parent, educator, or someone who believes in inclusive technology, there are many ways
                to support our mission of making learning accessible for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="font-heading bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transform hover:scale-110 transition-all duration-300 shadow-lg">
                  Get Involved
                </Button>
                <Button
                  variant="outline"
                  className="font-heading border-2 border-purple-400 text-purple-600 hover:bg-purple-500 hover:text-white bg-transparent transform hover:scale-110 transition-all duration-300"
                >
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
