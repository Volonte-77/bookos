# 📚 Bookos - Digital Books Marketplace

A modern, secure digital books e-commerce platform built with React, Firebase, and MaishaPay payment integration.

## ✨ Features

### 🛒 E-Commerce
- **Book Catalog**: Browse books by category with search and filters
- **Shopping Cart**: Persistent cart with localforage (syncs after login)
- **Secure Payments**: MaishaPay integration with hosted checkout
- **Purchase Validation**: Prevents duplicate book purchases
- **Digital Downloads**: Secure PDF access with Firebase Storage

### 🔐 Authentication & Security
- **Email/Password Auth**: Firebase Authentication
- **Role-Based Access**: User and Admin roles
- **Protected Routes**: Route guards for auth and admin pages
- **Firestore Security Rules**: Granular access control
- **Storage Rules**: PDF access restricted by purchase ownership

### 👤 User Features
- **Personal Library**: Access purchased books anytime
- **Purchase History**: Track all transactions
- **Credit System**: Virtual wallet for purchases
- **Profile Management**: Update account details

### 🛡️ Admin Panel
- **Dashboard**: Live statistics and revenue tracking
- **Book Management**: CRUD operations with cover/PDF uploads
- **User Management**: Credits, roles, and account status
- **Payment Monitoring**: Real-time payment and purchase tracking
- **Real-time Updates**: Firestore onSnapshot subscriptions

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Payment**: MaishaPay API
- **Routing**: React Router v6
- **State**: Context API
- **Storage**: localforage (cart persistence)
- **Styling**: Tailwind CSS (custom design system)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project
- MaishaPay account (optional for development)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/bookos.git
cd bookos
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

Create `.env` file in project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# MaishaPay Configuration
VITE_MAISHAPAY_API_KEY=your_maishapay_api_key
VITE_MAISHAPAY_SECRET_KEY=your_maishapay_secret_key
VITE_MAISHAPAY_BASE_URL=https://api.maishapay.online
VITE_APP_URL=http://localhost:5173
```

### 4. Firebase Setup

#### a) Enable Authentication
1. Go to Firebase Console → Authentication
2. Enable "Email/Password" sign-in method

#### b) Create Firestore Database
1. Go to Firestore Database → Create database
2. Start in **production mode** (we'll deploy rules next)

#### c) Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

Or manually copy `firestore.rules` content to Firebase Console.

#### d) Enable Cloud Storage
1. Go to Storage → Get started
2. Deploy storage rules:
```bash
firebase deploy --only storage
```

Or manually copy `storage.rules` content to Firebase Console.

#### e) Create Admin User
1. Register a user through the app
2. Go to Firestore → `users` collection
3. Find your user document
4. Update `role` field from `"user"` to `"admin"`

### 5. Development Server

```bash
npm run dev
```

Access at `http://localhost:5173`

## 🔒 Security Rules

### Firestore Rules (`firestore.rules`)

Key features:
- **Admin Check**: `isAdmin()` helper validates role
- **Purchase Validation**: Prevents duplicate purchases
- **Immutable Records**: Purchases cannot be modified after creation
- **Owner Access**: Users can only access their own data

### Storage Rules (`storage.rules`)

Key features:
- **PDF Protection**: Only users with matching purchase can download
- **Public Covers**: Book covers accessible to everyone
- **Admin Upload**: Only admins can upload files

## 💳 Payment Integration

### Development Mode (Default)

The app includes a **Payment Simulator** for testing:

1. Add books to cart
2. Proceed to checkout
3. Click "Payer" → Redirects to `/paiement/simulateur`
4. Choose "Simuler paiement réussi" or "Simuler paiement échoué"
5. Automatically updates Firestore and redirects to callback

### Production Mode (MaishaPay)

To enable real MaishaPay:

1. **Get Credentials**:
   - Sign up at MaishaPay
   - Get API Key and Secret Key
   - Update `.env` with real credentials

2. **Update Service** (`src/services/maishapay.js`):
   - Uncomment production API calls
   - Comment out development simulation code

3. **Create Webhook Cloud Function**:
   ```javascript
   // functions/index.js
   exports.maishapayWebhook = functions.https.onRequest(async (req, res) => {
     // Verify signature
     const signature = verifyMaishapaySignature(req.body, secretKey)
     if (!signature) return res.status(401).send('Invalid signature')

     // Update payment
     await admin.firestore().collection('payments')
       .doc(req.body.reference)
       .update({
         status: 'completed',
         verified: true,
         updatedAt: admin.firestore.FieldValue.serverTimestamp()
       })

     res.status(200).send('OK')
   })
   ```

4. **Deploy Functions**:
   ```bash
   firebase deploy --only functions
   ```

5. **Configure Webhook** in MaishaPay dashboard:
   - URL: `https://your-region-your-project.cloudfunctions.net/maishapayWebhook`
   - Events: `payment.success`, `payment.failed`

## 📁 Project Structure

```
bookos/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── RouteGuards.jsx
│   ├── context/          # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── hooks/            # Custom React hooks
│   │   └── useCart.js
│   ├── layout/           # Layout components
│   │   ├── Layout.jsx
│   │   └── AdminLayout.jsx
│   ├── lib/              # External services
│   │   └── firebase.js
│   ├── pages/            # Page components
│   │   ├── BookList.jsx
│   │   ├── BookDetail.jsx
│   │   ├── Checkout.jsx
│   │   ├── Downloads.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── PaymentCallback.jsx
│   │   ├── PaymentSimulator.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminBooks.jsx
│   │       ├── AdminUsers.jsx
│   │       └── AdminPayments.jsx
│   ├── services/         # API services
│   │   └── maishapay.js
│   ├── App.jsx
│   └── main.jsx
├── public/               # Static assets
├── firestore.rules       # Firestore security rules
├── storage.rules         # Storage security rules
├── .env                  # Environment variables (git-ignored)
└── package.json
```

## 🔑 Collections Schema

### `users`
```javascript
{
  uid: string,           // Firebase Auth UID
  email: string,
  name: string,
  role: 'user' | 'admin',
  credits: number,       // Default: 10000
  disabled: boolean,     // Lock account
  createdAt: timestamp
}
```

### `books`
```javascript
{
  title: string,
  author: string,
  description: string,
  price: number,
  category: string,
  coverUrl: string,      // Storage path: covers/{bookId}
  storagePath: string,   // Storage path: books/{bookId}.pdf
  active: boolean,
  sales: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `purchases`
```javascript
{
  id: '{userId}_{bookId}',  // Composite key prevents duplicates
  userId: string,
  bookId: string,
  title: string,
  downloadUrl: string,       // Generated on-demand from storagePath
  paymentRef: string,
  createdAt: timestamp
}
```

### `payments`
```javascript
{
  userId: string,
  userEmail: string,
  userName: string,
  amount: number,
  currency: string,
  reference: string,         // Unique payment ID
  status: 'pending' | 'completed' | 'failed',
  verified: boolean,         // Set by webhook
  method: 'maishapay',
  items: array,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🎨 Design System

Custom design tokens in `index.css`:

- **Colors**: Ink (grays), Brand (primary), Status colors
- **Typography**: Display, Title, Body scales
- **Spacing**: Consistent rem-based system
- **Effects**: Shadows, glows, gradients

## 🚢 Deployment

### Netlify / Vercel

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**: Add all `VITE_*` variables

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize hosting
firebase init hosting

# Deploy
npm run build
firebase deploy --only hosting
```

### Environment Variables (Production)

Update `.env` with production URLs:
```env
VITE_APP_URL=https://yourdomain.com
```

## 🧪 Testing

### Development Testing Checklist

- [ ] Register new user (credits should be 10000)
- [ ] Add books to cart as guest (should persist in localforage)
- [ ] Login (cart should sync from localforage to Firestore)
- [ ] Attempt to purchase same book twice (should be blocked)
- [ ] Complete payment simulation
- [ ] Access Downloads page (purchased books should appear)
- [ ] Download PDF (Storage should grant access)
- [ ] Login as admin (change role in Firestore)
- [ ] Upload book with cover and PDF
- [ ] Manage users (update credits/roles)
- [ ] View payment statistics

## 🐛 Troubleshooting

### Cart not persisting
- Check browser localStorage/IndexedDB
- Verify localforage is installed: `npm list localforage`

### PDF download fails
- Check Storage rules are deployed
- Verify purchase record exists in Firestore
- Check storagePath field in book document

### Admin panel not accessible
- Verify user's `role` field is `"admin"` in Firestore
- Check browser console for auth errors

### Payment simulation not working
- Verify Firestore rules allow payment document creation
- Check browser console for errors
- Ensure payment reference is unique

## 📝 TODOs

### High Priority
- [ ] Deploy Firebase rules to production
- [ ] Test with real MaishaPay credentials
- [ ] Implement webhook Cloud Function
- [ ] Add email verification requirement
- [ ] Password reset flow

### Medium Priority
- [ ] Search and filter improvements
- [ ] Book preview before purchase
- [ ] User reviews/ratings
- [ ] Export payments to CSV
- [ ] Bulk admin operations

### Nice to Have
- [ ] Analytics dashboard with charts
- [ ] Coupon/discount system
- [ ] Multiple payment methods
- [ ] Multi-language support
- [ ] Dark mode

## 📄 License

MIT License - feel free to use for commercial or personal projects

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@bookos.com

---

Built with ❤️ using React + Firebase + MaishaPay
