# SARATHI Authentication System

## Overview
This document describes the authentication system implemented for the SARATHI application, including login/signup functionality, route protection, and MongoDB integration.

## Features Implemented

### 1. Authentication Pages
- **Login Page** (`/auth/login`): User login with email and password
- **Signup Page** (`/auth/signup`): User registration with name, email, and password
- Both pages match the existing SARATHI design with vibrant colors and animations

### 2. Route Protection
- **Protected Routes**: Education, Communication, and Profile sections require authentication
- **Automatic Redirect**: Unauthenticated users are redirected to login page
- **Persistent Sessions**: Users remain logged in until they manually logout

### 3. User Context & State Management
- **AuthContext**: Global authentication state management
- **User Data**: Name, email, and authentication status
- **Automatic Token Validation**: Checks authentication on app startup

### 4. Backend API
- **MongoDB Integration**: User data stored in MongoDB
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **API Endpoints**:
  - `POST /api/auth/login` - User login
  - `POST /api/auth/signup` - User registration
  - `GET /api/auth/me` - Get current user data

### 5. Navigation Updates
- **Dynamic Navigation**: Shows user name when logged in
- **Login/Logout Buttons**: Context-aware navigation
- **Mobile Support**: Responsive design for all screen sizes

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sarathi

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
```

### 2. Install Dependencies
```bash
npm install
```

### 3. MongoDB Setup
- Install MongoDB locally or use MongoDB Atlas
- Update the `MONGODB_URI` in your `.env.local` file
- The database will be created automatically when the first user signs up

### 4. Run the Application
```bash
npm run dev
```

## File Structure

```
SARATHI/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   └── signup/page.tsx         # Signup page
│   ├── api/auth/
│   │   ├── login/route.ts          # Login API endpoint
│   │   ├── signup/route.ts         # Signup API endpoint
│   │   └── me/route.ts             # User data API endpoint
│   ├── education/page.tsx          # Protected education page
│   ├── communication/page.tsx      # Protected communication page
│   ├── profile/page.tsx            # Protected profile page
│   └── layout.tsx                  # Updated with AuthProvider
├── components/
│   ├── ProtectedRoute.tsx          # Route protection component
│   ├── navigation.jsx              # Updated navigation with auth
│   └── learner-profile.jsx         # Updated with dynamic user name
├── context/
│   └── AuthContext.tsx             # Authentication context
├── lib/
│   └── mongodb.ts                  # MongoDB connection
├── models/
│   └── User.ts                     # User model
└── package.json                    # Updated dependencies
```

## Usage Flow

### 1. New User Registration
1. User visits the website
2. Clicks on Education, Communication, or Profile
3. Gets redirected to login page
4. Clicks "Sign up here" to go to signup page
5. Fills out registration form
6. Gets redirected to home page with welcome message

### 2. Existing User Login
1. User visits the website
2. Clicks on Education, Communication, or Profile
3. Gets redirected to login page
4. Enters email and password
5. Gets redirected to home page

### 3. Authenticated User Experience
1. User sees their name in the navigation
2. Can access all protected sections
3. Profile page shows their actual name
4. Can logout from navigation

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Tokens**: Secure authentication tokens with 7-day expiration
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Proper error messages for failed authentication
- **Token Storage**: Secure token storage in localStorage

## Production Deployment

### 1. Environment Variables
- Set secure `JWT_SECRET` (use a random string generator)
- Update `MONGODB_URI` to your production MongoDB instance
- Set `NEXTAUTH_URL` to your production domain

### 2. MongoDB Atlas (Recommended)
- Create a MongoDB Atlas cluster
- Get connection string
- Update `MONGODB_URI` in environment variables

### 3. Vercel Deployment
- Connect your GitHub repository to Vercel
- Add environment variables in Vercel dashboard
- Deploy automatically on push to main branch

## Customization

### Adding New Protected Routes
1. Wrap the page component with `ProtectedRoute`
2. Import the component: `import ProtectedRoute from "@/components/ProtectedRoute"`
3. Wrap your page content: `<ProtectedRoute>{/* your content */}</ProtectedRoute>`

### Modifying User Data
1. Update the `User` model in `models/User.ts`
2. Update the `IUser` interface in the same file
3. Update the API endpoints to handle new fields
4. Update the `AuthContext` interface if needed

### Styling Changes
- All authentication pages use the existing SARATHI design system
- Colors, fonts, and animations match the main application
- Responsive design works on all devices

## Troubleshooting

### Common Issues
1. **MongoDB Connection Error**: Check your `MONGODB_URI` and ensure MongoDB is running
2. **JWT Secret Error**: Make sure `JWT_SECRET` is set in environment variables
3. **Build Errors**: Run `npm install` to ensure all dependencies are installed
4. **Authentication Not Working**: Check browser console for API errors

### Development Tips
- Use browser dev tools to inspect network requests
- Check the console for any JavaScript errors
- Verify environment variables are loaded correctly
- Test with different browsers and devices

## Support

For issues or questions about the authentication system, please check:
1. This documentation
2. Browser console for errors
3. Network tab for API request/response details
4. MongoDB logs for database issues
