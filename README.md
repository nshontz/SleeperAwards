# Bine to Shrine Fantasy League Awards

A Next.js application that tracks and displays hop-themed fantasy football awards for the Yakima Chief Hops fantasy league using the Sleeper API.

** This project is an experiment to create an app exclusively via AI. **

## Features

- 🏆 **13 Hop-Themed Awards** - From "The Cascade Shield" to "The Hop Bomb Award"
- 📊 **Real-time Leaderboards** - Live data from Sleeper API
- 🎨 **Hop Industry Theming** - Custom colors and terminology
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Performance** - Built with Next.js 15 and TypeScript

## Award Categories

- **The Cascade Shield** - Fewest points against
- **The Bitter End Award** - Most points against
- **The Noble Hop Award** - Most predictable (closest to projections)
- **The Pilsner Prize** - Most consistent (lowest standard deviation)
- **The Citra Wildcard** - Most boom or bust player
- **The IPA Rollercoaster** - Most boom or bust team
- **The Alpha Acid Champion** - Best single game score
- **The Mosaic Masterpiece** - Best game above projections
- **The Hop Bomb Award** - Biggest blowout victory
- **The Dry Hop Disaster** - Bench outscored starters
- **The Perfect Brew** - Starters beat bench by most
- **The Centennial Curse** - Highest scoring loss
- **The Wilted Bine Award** - Most injuries in a week

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bine-to-shrine-awards
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Update the league ID in `src/app/page.tsx`:
```typescript
const LEAGUE_ID = 'your-sleeper-league-id';
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### League ID
Update the `LEAGUE_ID` constant in `src/app/page.tsx` with your Sleeper league ID.

### Awards Customization
Modify the awards in `src/lib/awards-calculator.ts` to add new categories or change calculations.

### Styling
Customize hop-themed colors in `tailwind.config.ts`:
- `hop-green`: #4A7C59
- `hop-gold`: #F4C430  
- `hop-brown`: #8B4513

## API Integration

The app uses the Sleeper API to fetch:
- League information
- Team rosters and settings
- Weekly matchup data
- User/team names

## Deployment

Deploy easily with Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: Sleeper Fantasy API
- **Deployment**: Vercel (recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for personal/league use. Respect Sleeper's API terms of service.
Built with 🍺 for the hop heads at Yakima Chief Hops!
