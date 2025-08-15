export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-hop-green to-green-800 dark:from-gray-900 dark:to-black">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🍺 Bine to Shrine Fantasy League 🍺
            </h1>
            <p className="text-2xl text-hop-green dark:text-hop-gold font-semibold mb-6">
              Your hop-themed fantasy football hub
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8">
              From the bine to the shrine - track awards, standings, and more
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Awards Card */}
          <a 
            href="/awards"
            className="bg-white/10 dark:bg-gray-700/30 backdrop-blur-md rounded-lg p-8 hover:bg-white/20 dark:hover:bg-gray-600/40 transition-all transform hover:scale-105 group"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-white group-hover:text-hop-gold dark:group-hover:text-hop-gold transition-colors">
                Fantasy Awards
              </h2>
              <p className="text-white/80 dark:text-gray-300 text-lg">
                Hop-themed awards tracking the best and worst performances of the season
              </p>
              <div className="mt-6 inline-block bg-hop-gold dark:bg-hop-gold text-hop-brown px-6 py-3 rounded-lg font-semibold group-hover:bg-yellow-400 transition-colors">
                View Awards →
              </div>
            </div>
          </a>

          {/* Team Standings Card */}
          <a 
            href="/teams"
            className="bg-white/10 dark:bg-gray-700/30 backdrop-blur-md rounded-lg p-8 hover:bg-white/20 dark:hover:bg-gray-600/40 transition-all transform hover:scale-105 group"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-white group-hover:text-hop-gold dark:group-hover:text-hop-gold transition-colors">
                Team Standings
              </h2>
              <p className="text-white/80 dark:text-gray-300 text-lg">
                Teams broken down by division with rankings, records, and top awards
              </p>
              <div className="mt-6 inline-block bg-hop-gold dark:bg-hop-gold text-hop-brown px-6 py-3 rounded-lg font-semibold group-hover:bg-yellow-400 transition-colors">
                View Standings →
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 dark:text-gray-500">
            Powered by Sleeper API • Built for Yakima Chief Hops Fantasy League
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-600 mt-2">
            May your hops be fresh and your lineups be optimal 🍺
          </p>
        </div>
      </footer>
    </div>
  );
}