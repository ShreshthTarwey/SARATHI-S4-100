"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function StoriesPage() {
  const featuredStories = [
    {
      id: 1,
      title: "From Silence to Confidence: Aarav's Journey",
      excerpt:
        "8-year-old Aarav discovered his love for learning through Sarathi's visual games, building confidence in communication despite hearing difficulties.",
      author: "Sarathi Team",
      date: "March 15, 2024",
      readTime: "5 min read",
      category: "Success Story",
      image: "🌟",
      gradient: "from-pink-400 to-purple-500",
      bgGradient: "from-pink-50 to-purple-100",
      featured: true,
    },
    {
      id: 2,
      title: "How Technology Helps Bridge Communication Gaps",
      excerpt:
        "Exploring the role of assistive technology in creating inclusive learning environments for children with disabilities.",
      author: "Dr. Priya Sharma",
      date: "March 10, 2024",
      readTime: "8 min read",
      category: "Research",
      image: "🔬",
      gradient: "from-blue-400 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-100",
      featured: false,
    },
    {
      id: 3,
      title: "Building Confidence Through Play-Based Learning",
      excerpt: "Why games and playful interactions are crucial for developing communication skills in young learners.",
      author: "Maya Singh",
      date: "March 5, 2024",
      readTime: "6 min read",
      category: "Education",
      image: "🎮",
      gradient: "from-green-400 to-teal-500",
      bgGradient: "from-green-50 to-teal-100",
      featured: false,
    },
  ]

  const categories = [
    { name: "All Stories", gradient: "from-purple-500 to-pink-500" },
    { name: "Success Stories", gradient: "from-green-500 to-teal-500" },
    { name: "Research", gradient: "from-blue-500 to-cyan-500" },
    { name: "Education", gradient: "from-orange-500 to-red-500" },
    { name: "Parent Guides", gradient: "from-indigo-500 to-purple-500" },
    { name: "Teacher Resources", gradient: "from-pink-500 to-rose-500" },
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
          <div className="text-8xl mb-6 animate-bounce-gentle">📚</div>
          <h1 className="font-heading text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-6">
            Sarathi Stories
          </h1>
          <p className="font-body text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Inspiring stories of growth, research insights, and practical guides for creating inclusive learning
            environments.
          </p>
        </div>

        <div
          className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {categories.map((category, index) => (
            <Button
              key={category.name}
              variant={index === 0 ? "default" : "outline"}
              className={`font-heading transform hover:scale-110 transition-all duration-300 ${
                index === 0
                  ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg`
                  : `bg-transparent hover:bg-gradient-to-r hover:${category.gradient} hover:text-white border-2 border-purple-300`
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <Card
          className="mb-12 hover:shadow-2xl transition-all duration-500 animate-fade-in-up bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-2 border-purple-200 transform hover:scale-105"
          style={{ animationDelay: "0.4s" }}
        >
          <CardContent className="p-0">
            <div className="md:flex">
              <div
                className={`md:w-1/3 bg-gradient-to-br ${featuredStories[0].bgGradient} p-12 flex items-center justify-center`}
              >
                <div className="text-center">
                  <div className="text-9xl mb-4 animate-pulse-gentle">{featuredStories[0].image}</div>
                  <span
                    className={`bg-gradient-to-r ${featuredStories[0].gradient} text-white px-4 py-2 rounded-full text-sm font-heading shadow-lg`}
                  >
                    Featured Story
                  </span>
                </div>
              </div>
              <div className="md:w-2/3 p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="bg-gradient-to-r from-green-400 to-teal-500 text-white px-4 py-2 rounded-full text-sm font-heading shadow-lg">
                    {featuredStories[0].category}
                  </span>
                  <span className="font-body text-sm text-gray-600">{featuredStories[0].readTime}</span>
                </div>
                <h2 className="font-heading text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  {featuredStories[0].title}
                </h2>
                <p className="font-body text-lg text-gray-700 mb-6 leading-relaxed">{featuredStories[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${featuredStories[0].gradient} rounded-full flex items-center justify-center shadow-lg`}
                    >
                      <span className="text-lg">✍️</span>
                    </div>
                    <div>
                      <p className="font-body font-bold text-gray-800">{featuredStories[0].author}</p>
                      <p className="font-body text-sm text-gray-600">{featuredStories[0].date}</p>
                    </div>
                  </div>
                  <Button
                    className={`font-heading bg-gradient-to-r ${featuredStories[0].gradient} hover:shadow-lg text-white transform hover:scale-110 transition-all duration-300`}
                  >
                    Read Story
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {featuredStories.slice(1).map((story, index) => (
            <Card
              key={story.id}
              className={`hover:shadow-2xl transition-all duration-500 transform hover:scale-110 animate-fade-in-up bg-gradient-to-br ${story.bgGradient} border-2 border-white/50 backdrop-blur-sm`}
              style={{ animationDelay: `${0.6 + index * 0.2}s` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-heading text-white bg-gradient-to-r ${story.gradient} shadow-lg`}
                  >
                    {story.category}
                  </span>
                  <span className="font-body text-sm text-gray-600">{story.readTime}</span>
                </div>
                <div className="text-center mb-4">
                  <div className="text-7xl animate-bounce-gentle">{story.image}</div>
                </div>
                <CardTitle className="font-heading text-2xl text-gray-800">{story.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-gray-700 mb-6 leading-relaxed">{story.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body font-bold text-gray-800 text-sm">{story.author}</p>
                    <p className="font-body text-xs text-gray-600">{story.date}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`font-heading bg-transparent hover:bg-gradient-to-r hover:${story.gradient} hover:text-white border-2 border-purple-300 transform hover:scale-110 transition-all duration-300`}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card
          className="max-w-2xl mx-auto bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-2 border-purple-200 animate-fade-in-up transform hover:scale-105 transition-all duration-500"
          style={{ animationDelay: "1s" }}
        >
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-pulse-gentle">📧</div>
            <h3 className="font-heading text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Stay Updated
            </h3>
            <p className="font-body text-lg text-gray-700 mb-6 leading-relaxed">
              Get the latest stories, research insights, and updates from the Sarathi community delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 max-w-sm px-4 py-3 border-2 border-purple-200 rounded-lg font-body focus:border-purple-400 focus:outline-none transition-colors duration-300"
              />
              <Button className="font-heading bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white transform hover:scale-110 transition-all duration-300 shadow-lg">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
