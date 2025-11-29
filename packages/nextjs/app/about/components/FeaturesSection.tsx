export default function FeaturesSection() {
  const features = [
    {
      id: 1,
      title: "Staking",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Stake your tokens and earn consistent rewards with our secure and transparent staking mechanism.",
      icon: "ri-hand-coin-line",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      id: 2,
      title: "Event Pool",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Participate in exciting event pools and win amazing prizes while enjoying thrilling competitions.",
      icon: "ri-trophy-line",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      title: "Rewards System",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Earn multiple rewards through our comprehensive reward system designed for maximum benefits.",
      icon: "ri-gift-line",
      gradient: "from-orange-500 to-red-500",
    },
    {
      id: 4,
      title: "Community",
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Join our vibrant community and connect with thousands of active members worldwide.",
      icon: "ri-team-line",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section id="staking" className="px-6 py-20 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Key Features</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            MEMEPOT은 다양한 기능을 통해 사용자에게 최고의 경험을 제공합니다
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(feature => (
            <div
              key={feature.id}
              className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <i className={`${feature.icon} text-3xl text-white`}></i>
              </div>

              {/* Image Placeholder */}
              <div className="aspect-video bg-slate-900/50 rounded-lg mb-6 flex items-center justify-center border border-slate-700">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-2">
                    <i className="ri-image-line text-2xl text-slate-500"></i>
                  </div>
                  <p className="text-slate-600 text-sm">Image Area</p>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
