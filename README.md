# 📚 Bookos - Digital Books Marketplace

Modern, secure e-commerce platform for digital books with Firebase & MaishaPay integration.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Environment Setup
Create `.env` file:
```env
# Firebase (get from Firebase Console)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# MaishaPay (optional for development)
VITE_MAISHAPAY_API_KEY=your_maishapay_api_key
VITE_MAISHAPAY_SECRET_KEY=your_maishapay_secret_key
VITE_MAISHAPAY_BASE_URL=https://api.maishapay.online
VITE_APP_URL=http://localhost:5173
```

### Run Development Server
```bash
npm run dev
```

Access at `http://localhost:5173`

## ✨ Key Features

- 🔐 **Firebase Authentication** - Email/password auth with role-based access
- 🛒 **Smart Cart** - Persistent cart with localforage, syncs after login
- 💳 **MaishaPay Integration** - Secure payment processing with hosted checkout
- 📥 **Digital Downloads** - Secure PDF access with Firebase Storage rules
- 🛡️ **Admin Panel** - Full CRUD for books, users, and payment management
- 🔄 **Real-time Updates** - Live data with Firestore subscriptions
- 🚫 **Anti-Fraud** - Prevents duplicate purchases, validates ownership

## 📖 Documentation

- **[Full Deployment Guide](DEPLOYMENT.md)** - Complete setup instructions
- **[Cloud Function Setup](CLOUD_FUNCTION_SETUP.md)** - MaishaPay webhook configuration
- **[Firestore Rules](firestore.rules)** - Security rules documentation
- **[Storage Rules](storage.rules)** - File access control

## 🏗️ Architecture

```
React + Vite → Firebase Auth → Firestore + Storage
     ↓
  Cart Context (localforage)
     ↓
  MaishaPay Checkout → Webhook → Cloud Function
     ↓
  Purchase Records → Secure Downloads
```

## 🎯 Core Flows

### Purchase Flow
1. Guest adds books to cart → Saved in localforage
2. User registers/login → Cart syncs to Firestore
3. Checkout validates: no duplicates, auth required
4. MaishaPay payment → Webhook verifies → Creates purchases
5. User accesses downloads with Storage rules validation

### Admin Flow
1. Login with admin role
2. Upload books (cover + PDF) → Firebase Storage
3. Manage users (credits, roles, lock accounts)
4. Monitor payments and revenue in real-time

## 🔒 Security

- ✅ Firestore Rules: Role-based access, anti-duplicate purchases
- ✅ Storage Rules: PDF access restricted by purchase ownership
- ✅ Payment Validation: Server-side webhook verification
- ✅ Protected Routes: Auth and admin guards
- ✅ Environment Variables: Sensitive keys not exposed

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Payment**: MaishaPay API + Cloud Functions
- **State**: Context API (Auth, Cart)
- **Storage**: localforage (cart persistence)
- **Styling**: Tailwind CSS (custom design system)

## 📦 Collections Schema

**users**: uid, email, name, role, credits, disabled  
**books**: title, author, price, coverUrl, storagePath, active  
**purchases**: {userId}_{bookId}, title, downloadUrl, paymentRef  
**payments**: reference, amount, status, verified, items

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed schema.

## 🧪 Testing (Development Mode)

The app includes a **Payment Simulator** for testing without real credentials:

1. Add books to cart
2. Checkout → Redirects to simulator
3. Click "Simuler paiement réussi"
4. Automatic Firestore update + callback redirect

## 🚢 Deployment

### Quick Deploy (Netlify/Vercel)
1. Build: `npm run build`
2. Output: `dist/`
3. Environment: Add all `VITE_*` variables

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide.

## 📋 TODOs

**High Priority:**
- [ ] Deploy Firestore & Storage rules
- [ ] Create admin user in Firestore
- [ ] Test payment flow
- [ ] Deploy Cloud Function for webhooks

**Medium Priority:**
- [ ] Email verification
- [ ] Password reset
- [ ] Search & filters
- [ ] Export payments CSV

**Nice to Have:**
- [ ] Analytics dashboard
- [ ] Coupon system
- [ ] Book previews
- [ ] Reviews/ratings

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit: `git commit -m 'Add feature'`
4. Push: `git push origin feature/name`
5. Open Pull Request

## 📄 License

MIT License

## 📧 Support

Issues or questions? Open an issue on GitHub.

---

Built with ❤️ by the Bookos team
