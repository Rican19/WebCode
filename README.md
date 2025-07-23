# 🏥 HealthRadar - Disease Management System

A comprehensive disease surveillance and management system for tracking and predicting disease outbreaks across municipalities in Cebu, Philippines.

![HealthRadar Dashboard](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Firebase](https://img.shields.io/badge/Firebase-10-orange)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Disease Data Format](#disease-data-format)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

HealthRadar is a modern web application designed for health workers and administrators to monitor, manage, and predict disease outbreaks in three key municipalities:

- **Mandaue City**
- **Consolacion (Lacion)**
- **Lilo-an**

The system provides real-time disease tracking, predictive analytics, and interactive visualizations to support public health decision-making.

## ✨ Features

### 🔐 Authentication & Security
- Secure user authentication with Firebase Auth
- Role-based access control for health workers
- Session management with automatic logout

### 📊 Disease Management
- CSV file upload for disease case data
- Support for 11 tracked diseases:
  - Tuberculosis
  - Measles
  - Malaria
  - Leptospirosis
  - HIV/AIDS
  - Dengue
  - Cholera
  - Syndrome (AMSES)
  - Encephalitis
  - Acute Meningitis
  - COVID-19

### 📈 Data Visualization
- **Interactive Dashboard** with real-time statistics
- **Municipality Charts** showing disease distribution
- **Predictive Analytics** with color-coded trend lines
- **Geographic Heatmap** with Leaflet integration

### 🎨 Professional UI/UX
- Clean, modern design with consistent theming
- Responsive layout for all devices
- Professional color scheme (#143D60, #A0C878, #EB5B00)
- Smooth animations and transitions

## 🛠 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **HeroUI** - Modern component library

### Data Visualization
- **Chart.js** with **react-chartjs-2** - Interactive charts
- **Leaflet** - Interactive maps and heatmaps

### Backend & Database
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Papa Parse** - CSV file processing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Firebase project setup

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/healthradar.git
   cd healthradar
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Set up Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // User-specific collections - only the user can access their own data
       match /healthradarDB/users/healthworker/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }

       // Centralized collection - all authenticated users can read and write
       // This allows global data sharing across all municipalities
       match /healthradarDB/centralizedData/allCases/{document} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## 📁 Project Structure

```
healthradar/
├── app/
│   ├── components/           # Reusable UI components
│   │   ├── debug-data.tsx   # Data debugging component
│   │   ├── lacion-chart.tsx # Consolacion municipality chart
│   │   ├── liloan-chart.tsx # Lilo-an municipality chart
│   │   ├── mandaue-chart.tsx# Mandaue municipality chart
│   │   ├── news-box.tsx     # Health news component
│   │   ├── prediction-chart.tsx # Predictive analytics chart
│   │   ├── providers.tsx    # Context providers
│   │   └── side-navbar.tsx  # Navigation sidebar
│   ├── contexts/            # React contexts
│   │   └── DiseaseDataContext.tsx # Disease data management
│   ├── sections/            # Main application sections
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── diseaseManagement/ # Disease data management
│   │   ├── heatmap/         # Geographic visualization
│   │   └── layout.tsx       # Sections layout
│   ├── login/               # Authentication pages
│   ├── signup/              # User registration
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── public/                  # Static assets
├── firebase.ts              # Firebase configuration
├── middleware.tsx           # Next.js middleware
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 📊 Disease Data Format

### CSV Upload Format

The system accepts CSV files with the following format:

```csv
DiseaseName	CaseCount	Municipality
Dengue	22	Lilo-an
Covid	18	Lilo-an
Tuberculosis	15	Lilo-an
Malaria	12	Mandaue
Leptospirosis	8	Consolacion
```

### Supported Diseases

| Disease | Color Code | Description |
|---------|------------|-------------|
| Tuberculosis | `#8B5CF6` (Purple) | Respiratory infection |
| Measles | `#EF4444` (Red) | Viral infection |
| Malaria | `#F59E0B` (Amber) | Mosquito-borne disease |
| Leptospirosis | `#10B981` (Emerald) | Bacterial infection |
| HIV/AIDS | `#EC4899` (Pink) | Immunodeficiency virus |
| Dengue | `#3B82F6` (Blue) | Mosquito-borne fever |
| Cholera | `#06B6D4` (Cyan) | Waterborne disease |
| Syndrome (AMSES) | `#84CC16` (Lime) | Acute medical syndrome |
| Encephalitis | `#F97316` (Orange) | Brain inflammation |
| Acute Meningitis | `#6366F1` (Indigo) | Brain membrane infection |
| COVID-19 | `#DC2626` (Red-600) | Coronavirus disease |

### Municipalities

- **Mandaue** - Urban center with highest case volumes
- **Consolacion** - Medium-sized municipality
- **Lilo-an** - Smaller municipality

## 📖 Usage Guide

### 1. Authentication
1. Navigate to the login page
2. Enter your health worker credentials
3. Access the dashboard upon successful login

### 2. Disease Data Management
1. Go to **Disease Management** section
2. Click **"Upload CSV"** button
3. Select your CSV file with disease data
4. Review uploaded data in the table
5. Use **"Delete All Data"** to clear existing records

### 3. Dashboard Overview
- View real-time statistics
- Monitor disease distribution by municipality
- Check predictive analytics trends
- Access health news updates

### 4. Predictive Analytics
- Automatically generates predictions based on uploaded data
- Color-coded lines for each disease
- 12-month forecast with seasonal patterns
- Interactive tooltips with detailed information

### 5. Geographic Heatmap
- Interactive map showing disease distribution
- Color-coded municipalities by case severity
- Click on regions for detailed information
- Statistics cards with real-time data

## 🔧 API Documentation

### Firebase Collections Structure

```
healthradarDB/
└── users/
    └── healthworker/
        └── {userId}/
            └── UploadedCases/
                ├── {documentId}
                │   ├── DiseaseName: string
                │   ├── CaseCount: string
                │   └── Municipality: string
                └── ...
```

### Key Functions

#### Disease Data Context
```typescript
// Get processed disease data
const { processedData, loading, refreshData } = useDiseaseData();

// Refresh data after upload
await refreshData();
```

#### CSV Upload
```typescript
// Handle file upload
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  // Papa Parse processes CSV
  // Data uploaded to Firebase
  // Context refreshed automatically
};
```

## 🎨 Design System

### Color Palette
- **Primary**: `#143D60` (Dark Blue)
- **Secondary**: `#A0C878` (Light Green)
- **Accent**: `#EB5B00` (Orange)
- **Background**: `#DDEB9D` (Light Green)

### Typography
- **Headers**: Bold, professional fonts
- **Body**: Clean, readable text
- **Labels**: Uppercase, tracked spacing

### Components
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Charts**: Professional styling with legends
- **Forms**: Clean inputs with validation states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Bis-glish comments for local context
- Maintain consistent styling with Tailwind CSS
- Test all features before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the excellent framework
- **Firebase** for backend services
- **Chart.js** for data visualization
- **Leaflet** for mapping capabilities
- **HeroUI** for component library

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**HealthRadar** - Empowering public health through technology 🏥💚
