# Amazing Kuku - Poultry Management System

🐔 A comprehensive frontend-only poultry management system with AI-powered disease detection

## 🚀 Features

- **Farmer Management**: Complete farmer profile and farm management
- **Batch Tracking**: Monitor poultry batches with detailed analytics
- **Disease Prediction**: AI-powered disease detection using computer vision
- **Device Management**: IoT device integration for environmental monitoring
- **Multi-language Support**: English and Swahili languages
- **Admin Dashboard**: Complete administrative control panel
- **Real-time Alerts**: Health and environmental alerts system
- **Inventory Management**: Track farm supplies and equipment
- **Subscription Management**: Flexible subscription plans

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build optimization
- **React Router** for navigation
- **LocalStorage** for data persistence (frontend-only)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/BINABASS091/amazing-kuku.git
cd amazing-kuku
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Test Credentials

### Admin Account
- **Email:** `admin@amazingkuku.com`
- **Password:** `admin123`

### Farmer Account
- **Email:** `farmer@example.com`
- **Password:** `farmer123`

## 📱 Usage

### Accessing the Application
- **Frontend**: http://localhost:5173

### User Roles
- **Admin**: Complete system management
- **Farmer**: Farm and batch management with disease prediction

### Key Features
1. **Dashboard**: View comprehensive statistics and recent activities
2. **Farm Management**: Register and manage multiple farms
3. **Batch Tracking**: Monitor poultry batches with detailed analytics
4. **Disease Prediction**: Upload images for AI-powered disease detection
5. **Inventory Management**: Track farm supplies and equipment
6. **Subscription Plans**: Manage your subscription and upgrade plans

## 🏗️ Project Structure

```
amazing-kuku/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/       # React contexts (Auth, Subscription, Language)
│   ├── pages/          # Page components (Admin & Farmer sections)
│   ├── services/       # Data services (mockData, dataService)
│   └── translations/   # Multi-language support
├── public/             # Static assets
└── dist/              # Build output
```

## 🔧 Configuration

### Environment Variables
No environment variables required! The application works completely offline using localStorage.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The `dist` folder will contain the production-ready files.

### Deploy to Netlify/Vercel
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Configure redirects for SPA routing (already included in `netlify.toml` and `vercel.json`)

## 💾 Data Storage

All data is stored in browser **localStorage**:
- User authentication sessions
- Farm data
- Batch information
- Inventory items
- Subscriptions
- All other application data

**Note:** Data persists across page refreshes but is browser-specific.

## 🎯 Features Overview

### Admin Section
- User and farmer management
- System-wide statistics
- Subscription management
- Alerts and recommendations
- Device management
- Breed configurations

### Farmer Section
- Personal dashboard
- Farm registration and management
- Batch tracking
- Disease prediction
- Inventory management
- Activity tracking
- Subscription management
- Knowledge base

## 🧪 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the migration guides in the project root

## 🎯 Architecture

This is a **frontend-only** application:
- ✅ No backend required
- ✅ No database needed
- ✅ No API calls
- ✅ Works completely offline
- ✅ Data stored in localStorage
- ✅ Perfect for demos and prototypes

## 🔄 Future Enhancements

To connect to a real backend:
1. Replace `dataService` methods with API calls
2. Update `AuthContext` to use backend authentication
3. Keep the same component structure

The architecture is designed to make this transition easy!

---

**Made with ❤️ for the poultry farming community**
# fugajiSmart
