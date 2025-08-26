# StudyNotion Frontend Microservice

A modern, TypeScript-based frontend microservice for the StudyNotion EdTech platform, built with the latest web development practices and designed to connect seamlessly with backend microservices.

## 🚀 Tech Stack

- **Framework**: Vite + React 18 + TypeScript
- **State Management**: Redux Toolkit + React Query
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom StudyNotion color palette
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Modern, accessible components with Framer Motion animations
- **Development**: Hot Module Replacement (HMR) with TypeScript intellisense

## 🏗️ Architecture

### Modern Frontend Architecture
- **TypeScript**: Full type safety across the application
- **Component-based**: Modular, reusable components
- **State Management**: Redux Toolkit for global state, React Query for server state
- **Service Layer**: Axios-based API layer with interceptors
- **Path Mapping**: Clean imports with @ aliases

### Microservices Integration
- **API Gateway**: Single entry point for all backend services
- **Service Discovery**: Dynamic service endpoint discovery
- **Health Monitoring**: Built-in health checks for all services
- **Error Handling**: Comprehensive error handling with user feedback

## 🎨 Design System

### StudyNotion Color Palette
- **Rich Black**: Primary background colors (900, 800, 700, etc.)
- **Yellow**: Primary accent color for CTAs and highlights
- **Blue**: Secondary colors for links and info
- **Caribbean Green**: Success states and positive actions
- **Pink**: Error states and warnings

### Component Library
- **Common Components**: Navbar, Footer, Spinner, Modals
- **Form Components**: Input fields, buttons, validation
- **Dashboard Components**: Sidebar, profile, course management
- **Authentication**: Login, signup, password recovery

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Common/          # Shared components (Navbar, Footer, etc.)
│   └── core/            # Feature-specific components
├── pages/               # Route-level components
├── services/            # API layer and operations
├── store/               # Redux store and slices
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── hooks/               # Custom React hooks
├── data/                # Static data and configurations
└── assets/              # Images, icons, and media
```

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd frontend-microservice
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your API gateway URL.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 Microservices Integration

### Backend Services
The frontend connects to the following microservices through the API Gateway:

- **Auth Service** (Port 3001): User authentication and authorization
- **Course Service** (Port 3003): Course management and content
- **Payment Service** (Port 3004): Payment processing
- **Profile Service** (Port 3002): User profile management
- **Rating Service** (Port 3005): Course ratings and reviews
- **Notification Service** (Port 3006): Notifications and messaging
- **Media Service** (Port 3007): File uploads and media handling

### API Gateway Configuration
- **Base URL**: `http://localhost:3000`
- **Proxy Configuration**: Automatic request routing to appropriate services
- **Authentication**: JWT token-based authentication
- **Error Handling**: Centralized error handling with user-friendly messages

## 🔐 Authentication Flow

1. **Signup**: User registration with OTP verification
2. **Login**: JWT token-based authentication
3. **Password Recovery**: Email-based password reset
4. **Protected Routes**: Automatic redirection for unauthorized access
5. **Token Management**: Automatic token refresh and storage

## 📱 Features

### Student Features
- Course browsing and enrollment
- Video lectures and progress tracking
- Shopping cart and payment processing
- Profile management and settings
- Course reviews and ratings

### Instructor Features
- Course creation and management
- Student analytics and dashboard
- Content upload and organization
- Revenue tracking and analytics

### Common Features
- Responsive design for all devices
- Dark theme with StudyNotion branding
- Real-time notifications
- Search and filtering capabilities
- Accessibility compliance

## 🎯 Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Dynamic imports for better performance
- **Image Optimization**: Optimized image loading and caching
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: Intelligent caching strategies for API calls

## 🧪 Development Best Practices

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks for quality assurance
- **Component Testing**: Unit tests for critical components
- **Error Boundaries**: Graceful error handling

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_BASE_URL`: API Gateway base URL
- `VITE_APP_NAME`: Application name
- `VITE_NODE_ENV`: Environment (development/production)

### Tailwind Configuration
Custom color palette and utilities configured for StudyNotion branding.

### Vite Configuration
- Path aliases for clean imports
- Proxy configuration for API calls
- Build optimizations for production

## 🤝 Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript for all new components
3. Implement proper error handling
4. Add appropriate loading states
5. Ensure responsive design
6. Write meaningful commit messages

## 📄 License

This project is part of the StudyNotion EdTech platform.

---

Built with ❤️ using modern web technologies for the best developer and user experience.
