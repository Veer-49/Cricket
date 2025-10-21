# Pitch Pioneers - Complete Cricket Management System

A comprehensive web application for cricket enthusiasts to book grounds, coaches, umpires, practice nets, create teams, and manage live scoring with detailed statistics tracking.

## 🏏 Features

### User Management
- **Authentication System**: Secure signup/login with profile creation
- **User Profiles**: Detailed statistics tracking including runs, wickets, strike rates, centuries, etc.
- **Profile Customization**: Edit personal information and view career statistics

### Booking System
- **Ground Booking**: Browse and book cricket grounds with detailed information, images, and facilities
- **Coach Booking**: Find and book professional cricket coaches with specializations
- **Umpire Booking**: Book certified umpires for matches with experience levels and certifications
- **Practice Nets**: Reserve practice nets with different pitch types and facilities

### Team Management
- **Create Teams**: Build teams with unique IDs for different match formats (T20, ODI, Test, Custom)
- **WhatsApp Invites**: Send automatic WhatsApp invites to unregistered players
- **Player Verification**: Check if players are already registered before sending invites
- **Join Teams**: Use team IDs to join existing teams
- **Public/Private Teams**: Control team visibility and accessibility
- **Player Management**: Manage team rosters and player roles

### Live Scoring System
- **Real-time Scoring**: Complete ball-by-ball scoring with runs, wickets, and extras
- **Match Formats**: Support for T20, ODI, Test, and custom format matches
- **Live Commentary**: Auto-generated commentary for each ball
- **Statistics Tracking**: Individual player and team statistics
- **Match Export**: Export scorecards and match summaries

### Advanced Features
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Animations**: Smooth transitions and hover effects throughout the application
- **Search & Filters**: Advanced filtering options for all booking systems
- **Real-time Updates**: Live match updates and notifications
- **Data Persistence**: Local storage for user data and match history

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cricket-platform
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Set up environment variables (optional for WhatsApp integration):
```bash
cp .env.example .env.local
# Edit .env.local with your WhatsApp API credentials
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### WhatsApp Integration Setup

For WhatsApp invite functionality, see [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md) for detailed configuration instructions.

**Quick Setup:**
- Copy `.env.example` to `.env.local`
- Add your WhatsApp Business API or Twilio credentials
- The system works in development mode without real API calls

### Build for Production

```bash
npm run build
npm start
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Headless UI, Lucide React icons
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Charts**: Recharts (for statistics visualization)
- **PDF Export**: jsPDF, html2canvas
- **Date Handling**: date-fns

## 📱 User Journey

### New User Experience
1. **Landing Page**: Choose between Sign Up or Login
2. **Registration**: Enter name, email, phone, and password
3. **Profile Creation**: Automatic profile setup with initial statistics
4. **Dashboard**: Access to all platform features

### Core Functionalities

#### Booking Flow
1. **Browse Options**: View available grounds/coaches/umpires/nets
2. **Filter & Search**: Use advanced filters to find perfect matches
3. **View Details**: See comprehensive information, images, and facilities
4. **Book Resource**: Select date, time, and duration
5. **Confirmation**: Receive booking confirmation with details

#### Team Management Flow
1. **Create Team**: Set team name, format, and visibility
2. **Add Players**: Enter player names and phone numbers
3. **Player Verification**: System checks if players are already registered
4. **WhatsApp Invites**: Automatic invites sent to unregistered players
5. **Get Unique ID**: Receive shareable team ID
6. **Manage Roster**: Edit player roles and batting orders
7. **Track Performance**: View team statistics and match history

#### Live Scoring Flow
1. **Create Match**: Set up teams, venue, and match details
2. **Toss & Setup**: Configure toss results and batting order
3. **Live Scoring**: Ball-by-ball scoring with runs, wickets, extras
4. **Commentary**: Real-time commentary generation
5. **Match Completion**: Final scorecards and statistics updates

## 🎯 Key Features Explained

### Enhanced Team Creation with WhatsApp Integration
- **Unique Team IDs**: Each team gets a unique 10-digit ID for easy sharing
- **Player Verification**: Automatically checks if players are already registered
- **WhatsApp Invites**: Sends personalized invites to unregistered players
- **Signup Links**: Includes direct signup links with team context
- **Public/Private Teams**: Teams can be discoverable or invitation-only
- **Team Statistics**: Performance tracking across all matches

### Comprehensive Scoring
- Ball-by-ball scoring with detailed statistics
- Support for all cricket formats and custom overs
- Automatic calculation of strike rates, economy rates
- Real-time commentary generation
- Match export functionality

### Statistics Tracking
- Individual player statistics across all matches
- Team performance tracking
- Career milestones (centuries, half-centuries, hat-tricks)
- Bowling statistics (wickets, economy rate, overs bowled)
- Batting statistics (runs, strike rate, boundaries)

### Advanced Booking System
- Real-time availability checking
- Detailed resource information with images
- Facility-based filtering
- Price comparison and booking management
- Booking history and status tracking

## 🎨 Design Features

- **Modern UI**: Clean, professional design with cricket-themed colors
- **Responsive Layout**: Optimized for all device sizes
- **Smooth Animations**: Framer Motion powered transitions
- **Interactive Elements**: Hover effects and micro-interactions
- **Accessibility**: WCAG compliant design patterns

## 📊 Data Management

- **Local Storage**: User data, teams, and match history
- **Real-time Updates**: Live scoring and statistics
- **Data Export**: CSV and PDF export capabilities
- **Backup System**: Automatic data persistence

## 🔧 Customization

The platform is highly customizable with:
- Configurable match formats
- Custom team creation options
- Flexible booking time slots
- Adjustable pricing structures
- Personalized user profiles

## 🚀 Future Enhancements

- **Backend Integration**: API integration for data persistence
- **Payment Gateway**: Online payment for bookings
- **Tournament Management**: Multi-team tournament organization
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Detailed performance analytics
- **Social Features**: Player networking and team challenges

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support and queries, please contact the development team or create an issue in the repository.

---

**Built with ❤️ for cricket enthusiasts worldwide** 🏏
