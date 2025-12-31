# SkinHub Nepal - Full-Stack eCommerce Platform

A complete skincare eCommerce platform built for Nepal with mobile-first design, admin panel, and local payment gateway integration.

## 🚀 Features

### Customer Features
- ✅ User authentication (Signup, Login, Forgot Password)
- ✅ Home page with dynamic hero banners
- ✅ Featured products and best sellers
- ✅ Product discovery with filters (brand, skin type, price, rating)
- ✅ Product details with image carousel
- ✅ Shopping cart with persistent storage
- ✅ Checkout with multiple payment options
- ✅ Order tracking and history
- ✅ Profile management with address management
- ✅ Mobile-first UI with bottom navigation

### Admin Features
- ✅ Dashboard with sales analytics
- ✅ Product management (CRUD with Cloudinary image upload)
- ✅ Order management with status updates
- ✅ Banner management for homepage
- ✅ Customer management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Image Hosting**: Cloudinary (Free Tier)
- **Payments**: eSewa, Khalti, Fonepay, COD
- **State Management**: Zustand
- **Hosting**: Vercel (recommended)

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd skinhub-nepal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Fill in your environment variables in `.env.local`:
   - Firebase configuration
   - Cloudinary credentials

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your Firebase config to `.env.local`

### Cloudinary Setup
1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Create an upload preset (unsigned recommended for client-side uploads)
4. Add credentials to `.env.local`

### Firestore Security Rules
Set up security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products are readable by all, writable by admins only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders: users can read their own, admins can read all
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Banners: readable by all, writable by admins
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reviews: readable by all, users can create their own
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
    }
  }
}
```

## 📁 Project Structure

```
/app
  /(customer)          # Customer-facing pages
    /home
    /products
    /cart
    /checkout
    /orders
    /profile
  /admin              # Admin panel
    /products
    /orders
    /banners
  /auth               # Authentication pages
/components           # Reusable components
  /ui                 # UI components
  /layout             # Layout components
  /home               # Home page components
  /products           # Product components
/lib                  # Utilities and configurations
  /firebase           # Firebase config
  /cloudinary         # Cloudinary config
  /store              # State management
  /types              # TypeScript types
  /utils              # Helper functions
```

## 🎨 UI/UX Features

- Mobile-first responsive design
- Bottom navigation for mobile
- Sticky cart button
- Fast loading with image optimization
- Clean skincare aesthetic
- Smooth animations and transitions

## 💳 Payment Integration

The platform supports:
- **Cash on Delivery (COD)** - Fully implemented
- **eSewa** - Placeholder for integration
- **Khalti** - Placeholder for integration
- **Fonepay** - Placeholder for integration

To integrate payment gateways, update the checkout flow in `/app/(customer)/checkout/page.tsx`.

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

The app will automatically build and deploy on every push to main.

## 📝 Notes

- Images are stored in Cloudinary (free tier)
- Cart is persisted in localStorage
- Admin access is controlled via Firestore user role
- All prices are in Nepalese Rupees (Rs.)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

