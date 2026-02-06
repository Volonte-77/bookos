# 📋 Bookos Setup Checklist

Use this checklist to ensure proper setup and deployment of your Bookos application.

## ✅ Initial Setup

### 1. Repository Setup
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env` file with Firebase credentials
- [ ] Add `.env` to `.gitignore`

### 2. Firebase Console Configuration

#### Authentication
- [ ] Enable Firebase Authentication
- [ ] Enable Email/Password sign-in method
- [ ] Optional: Enable email verification

#### Firestore Database
- [ ] Create Firestore database (start in production mode)
- [ ] Deploy `firestore.rules`:
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] Verify rules in Firebase Console
- [ ] Test read/write permissions

#### Cloud Storage
- [ ] Enable Firebase Storage
- [ ] Deploy `storage.rules`:
  ```bash
  firebase deploy --only storage
  ```
- [ ] Create folders structure:
  - `books/` (for PDFs)
  - `covers/` (for book covers)

### 3. Environment Variables

Check `.env` file has all required variables:
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`
- [ ] `VITE_MAISHAPAY_API_KEY` (optional for dev)
- [ ] `VITE_MAISHAPAY_SECRET_KEY` (optional for dev)
- [ ] `VITE_MAISHAPAY_BASE_URL`
- [ ] `VITE_APP_URL`

## 🧪 Local Testing

### 1. Start Development Server
- [ ] Run `npm run dev`
- [ ] Verify app loads at `http://localhost:5173`
- [ ] Check browser console for errors

### 2. Test Authentication Flow
- [ ] Register new user
- [ ] Verify user document created in Firestore with:
  - [ ] `uid` matches Firebase Auth
  - [ ] `credits` = 10000
  - [ ] `role` = "user"
- [ ] Logout
- [ ] Login with same credentials
- [ ] Check authentication persistence (refresh page)

### 3. Test Cart Functionality
- [ ] Add books to cart as guest
- [ ] Verify cart persists in localforage (refresh page)
- [ ] Login → Cart should sync to Firestore
- [ ] Check `users/{uid}/cart` collection in Firestore
- [ ] Remove item from cart
- [ ] Logout → Cart should remain in localforage

### 4. Test Purchase Flow (Development Mode)
- [ ] Add books to cart
- [ ] Go to checkout (should require login)
- [ ] Click "Payer" → Redirects to simulator
- [ ] Click "Simuler paiement réussi"
- [ ] Verify payment document created in `payments` collection
- [ ] Verify callback page shows success
- [ ] Check `purchases` collection has records
- [ ] Verify user credits deducted
- [ ] Try to purchase same book again (should be blocked)

### 5. Test Downloads Page
- [ ] After purchase, navigate to `/bibliotheque`
- [ ] Purchased books should appear
- [ ] Click download button
- [ ] Verify Storage grants access (PDF should download)
- [ ] Test with another user (should not have access)

### 6. Test Admin Panel
- [ ] Update your user's `role` to "admin" in Firestore
- [ ] Navigate to `/admin`
- [ ] Should see admin dashboard

#### Admin Books
- [ ] Create new book
- [ ] Upload cover image → Check `covers/` in Storage
- [ ] Upload PDF → Check `books/` in Storage
- [ ] Edit book details
- [ ] Toggle active/inactive status
- [ ] Delete book (verify Storage files deleted)

#### Admin Users
- [ ] View all users
- [ ] Edit user credits
- [ ] Change user role
- [ ] Lock/unlock user account
- [ ] Verify purchase counts display correctly

#### Admin Payments
- [ ] View all payments
- [ ] Check revenue statistics
- [ ] Filter by status (pending/completed/failed)
- [ ] View payment details in modal
- [ ] Check purchases table displays

## 🚀 Production Deployment

### 1. Pre-Deployment
- [ ] Update `.env` with production values:
  - [ ] `VITE_APP_URL` = your production domain
- [ ] Remove or comment development simulator code
- [ ] Enable production MaishaPay API calls
- [ ] Test build locally: `npm run build`
- [ ] Check `dist/` folder generated

### 2. Firebase Setup
- [ ] Upgrade to Firebase Blaze plan (required for Cloud Functions)
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Storage rules: `firebase deploy --only storage`
- [ ] Verify rules deployed correctly in console

### 3. Cloud Functions (Production Payment)
- [ ] Follow [CLOUD_FUNCTION_SETUP.md](CLOUD_FUNCTION_SETUP.md)
- [ ] Initialize functions: `firebase init functions`
- [ ] Create webhook function
- [ ] Set environment variables:
  ```bash
  firebase functions:config:set maishapay.secret="your_secret"
  ```
- [ ] Deploy: `firebase deploy --only functions`
- [ ] Note webhook URL for MaishaPay config

### 4. MaishaPay Configuration
- [ ] Login to MaishaPay dashboard
- [ ] Navigate to Webhooks settings
- [ ] Add webhook URL from Cloud Functions
- [ ] Select events: `payment.success`, `payment.failed`
- [ ] Test webhook with MaishaPay test mode

### 5. Hosting Deployment

#### Option A: Firebase Hosting
- [ ] Initialize: `firebase init hosting`
- [ ] Set public directory: `dist`
- [ ] Configure as single-page app: Yes
- [ ] Deploy: `firebase deploy --only hosting`
- [ ] Verify at your Firebase hosting URL

#### Option B: Netlify/Vercel
- [ ] Connect repository
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Add custom domain (optional)

### 6. Post-Deployment Testing
- [ ] Register new user in production
- [ ] Test full purchase flow with real payment
- [ ] Verify webhook received in Cloud Functions logs
- [ ] Check purchase records created
- [ ] Test PDF download
- [ ] Test admin panel functionality

## 🔒 Security Checklist

### Firestore Rules
- [ ] Admin functions require `role == "admin"`
- [ ] Users can only access own data
- [ ] Purchase records immutable after creation
- [ ] Duplicate purchase prevention works
- [ ] Payment status only modifiable by admin

### Storage Rules
- [ ] PDF access requires matching purchase
- [ ] Covers publicly readable
- [ ] Only admins can upload files
- [ ] File paths validated

### Application
- [ ] `.env` file in `.gitignore`
- [ ] No API keys in client code
- [ ] Protected routes enforce authentication
- [ ] Admin routes check role
- [ ] Payment validation server-side only

## 📊 Monitoring Setup

### Firebase Console
- [ ] Enable Analytics (optional)
- [ ] Set up Alerts:
  - [ ] Auth failures
  - [ ] Function errors
  - [ ] Storage quota
- [ ] Review security rules
- [ ] Check usage quotas

### Error Tracking
- [ ] Optional: Install Sentry or similar
- [ ] Monitor browser console errors
- [ ] Track failed payments

### Performance
- [ ] Test page load times
- [ ] Check bundle size: `npm run build` output
- [ ] Optimize images if needed
- [ ] Enable compression in hosting

## 🎓 User Onboarding

### Create Admin Account
1. [ ] Register first user
2. [ ] Go to Firestore → `users` collection
3. [ ] Find user document
4. [ ] Edit `role` field: `"user"` → `"admin"`
5. [ ] Refresh app → Admin menu should appear

### Add Initial Books
1. [ ] Login as admin
2. [ ] Go to `/admin/livres`
3. [ ] Click "Ajouter un livre"
4. [ ] Fill details + upload cover + PDF
5. [ ] Set active = true
6. [ ] Test purchase flow

### Create Test User
1. [ ] Register new user
2. [ ] Give them credits manually (Firestore or admin panel)
3. [ ] Test complete purchase flow
4. [ ] Verify downloads work

## 🐛 Common Issues & Fixes

### Cart not persisting
- [ ] Check browser allows localStorage/IndexedDB
- [ ] Verify localforage installed: `npm list localforage`
- [ ] Check browser console for errors

### PDF download fails
- [ ] Verify Storage rules deployed
- [ ] Check purchase record exists
- [ ] Verify `storagePath` field in book document
- [ ] Test Storage URL in browser directly

### Admin panel 403 error
- [ ] Verify user `role` is "admin" (not "Admin")
- [ ] Check Firestore rules `isAdmin()` function
- [ ] Clear browser cache
- [ ] Re-login

### Payment webhook not working
- [ ] Check Cloud Functions logs
- [ ] Verify webhook URL correct in MaishaPay
- [ ] Test signature verification
- [ ] Check secret key matches

### Build fails
- [ ] Run `npm install` again
- [ ] Check Node version (18+ required)
- [ ] Clear `node_modules` and reinstall
- [ ] Check for TypeScript errors if using TS

## 📈 Post-Launch

### Week 1
- [ ] Monitor error logs daily
- [ ] Track payment success rate
- [ ] Gather user feedback
- [ ] Fix critical bugs

### Month 1
- [ ] Review analytics
- [ ] Optimize slow queries
- [ ] Add missing features from user feedback
- [ ] Plan next features

### Ongoing
- [ ] Keep dependencies updated
- [ ] Monitor Firebase quotas
- [ ] Backup Firestore data regularly
- [ ] Review security rules quarterly

## 🎉 Launch Checklist

Final checks before going live:
- [ ] All tests passing
- [ ] Production environment variables set
- [ ] Firebase rules deployed
- [ ] Cloud Functions deployed
- [ ] MaishaPay webhook configured
- [ ] Admin account created
- [ ] Test books added
- [ ] Full purchase flow tested
- [ ] Documentation updated
- [ ] Support email configured
- [ ] Privacy policy page (if required)
- [ ] Terms of service page (if required)

---

✅ **Ready to launch!** Remember to monitor closely in the first few days.

For issues, check:
- Browser console
- Firebase Console logs
- Cloud Functions logs
- Network tab (failed requests)
