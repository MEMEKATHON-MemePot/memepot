export default function VaultsStats() {
  const stats = [
    {
      label: "Total Value Locked",
      value: "$45,234,567",
      icon: "ri-safe-2-line",
      color: "from-[#AD47FF] to-[#8B2FE6]",
    },
    {
      label: "Total Stakers",
      value: "12,456",
      icon: "ri-group-line",
      color: "from-[#AD47FF] to-[#E8C9FF]",
    },
    {
      label: "Average APY",
      value: "24.5%",
      icon: "ri-line-chart-line",
      color: "from-green-400 to-emerald-500",
    },
    {
      label: "Total Rewards",
      value: "$2,345,678",
      icon: "ri-gift-line",
      color: "from-orange-400 to-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-[#AD47FF]/50 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
              <i className={`${stat.icon} text-white text-xl`}></i>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
          <p className="text-white text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
