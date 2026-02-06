# 🔧 Troubleshooting Guide

Quick solutions to common issues in Bookos.

## 🚨 Critical Issues

### App Won't Start

**Error: `Cannot find module`**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error: `VITE_FIREBASE_* is undefined`**
```bash
# Solution: Check .env file exists and has all variables
# Restart dev server after creating .env
npm run dev
```

**Port already in use**
```bash
# Solution: Kill process or use different port
npx kill-port 5173
# Or specify different port
npm run dev -- --port 3000
```

---

## 🔐 Authentication Issues

### "User not found" after login
**Cause**: User document not created in Firestore

**Solution**:
1. Check `AuthContext.jsx` creates user doc on register
2. Manually create doc in Firestore:
```javascript
{
  uid: "user_firebase_uid",
  email: "user@email.com",
  name: "User Name",
  role: "user",
  credits: 10000,
  createdAt: timestamp
}
```

### Can't access admin panel
**Cause**: User role not set to "admin"

**Solution**:
1. Firebase Console → Firestore
2. Find user in `users` collection
3. Edit `role` field: `"user"` → `"admin"` (lowercase!)
4. Logout and login again

### Email already in use
**Cause**: Firebase Auth has user but Firestore doesn't

**Solution**:
1. Firebase Console → Authentication
2. Delete duplicate user
3. Re-register through app

---

## 🛒 Cart Issues

### Cart empty after refresh (guest user)
**Cause**: Browser blocking localStorage/IndexedDB

**Solution**:
- Check browser privacy settings
- Disable tracking protection for localhost
- Try different browser
- Clear site data and retry

### Cart not syncing after login
**Cause**: `syncWithRemote()` not called

**Solution**:
1. Check `CartContext.jsx` useEffect calls sync
2. Check browser console for errors
3. Verify Firestore rules allow write to `users/{uid}/cart`

### Cart shows items I already purchased
**Cause**: `hasPurchased()` check not working

**Solution**:
1. Verify purchases collection format: `{userId}_{bookId}`
2. Check Firestore rules allow read purchases
3. Manually remove from cart, should block on checkout

---

## 💳 Payment Issues

### Payment simulator not working
**Cause**: Missing Firestore imports or wrong collection

**Solution**:
```javascript
// Verify PaymentSimulator.jsx has:
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
```

### Redirect to simulator fails
**Cause**: Route not configured

**Solution**:
Check `App.jsx` has:
```javascript
<Route path="/paiement/simulateur" element={<PaymentSimulator />} />
```

### Payment callback shows "Payment not found"
**Cause**: Payment document not created before redirect

**Solution**:
1. Check `maishapay.js` creates payment doc
2. Verify reference matches URL param
3. Check Firestore `payments` collection

### MaishaPay real integration fails
**Cause**: Invalid API credentials or wrong endpoint

**Solution**:
1. Verify `.env` has correct MaishaPay keys
2. Check API URL: `https://api.maishapay.online`
3. Test credentials with Postman/curl
4. Check MaishaPay dashboard for errors

---

## 📥 Download Issues

### "Access denied" when downloading PDF
**Cause**: Storage rules or missing purchase record

**Solution**:
1. Check purchase exists: Firestore → `purchases` → `{userId}_{bookId}`
2. Verify Storage rules deployed:
```bash
firebase deploy --only storage
```
3. Check book's `storagePath` field is correct
4. Try direct Storage URL in browser

### PDF not found in Storage
**Cause**: File not uploaded or wrong path

**Solution**:
1. Firebase Console → Storage
2. Check `books/{bookId}.pdf` exists
3. If missing, upload via admin panel
4. Verify `storagePath` in book doc matches actual path

### Download button doesn't work
**Cause**: JavaScript error or CORS

**Solution**:
1. Check browser console for errors
2. Verify Firebase SDK initialized
3. Check Storage rules allow read
4. Try incognito mode (extension conflicts)

---

## 🛡️ Admin Panel Issues

### Admin pages show 404
**Cause**: Route guards or missing imports

**Solution**:
1. Verify user role is "admin" (lowercase)
2. Check `AdminRoute` in `RouteGuards.jsx`
3. Check `App.jsx` admin routes configured
4. Clear browser cache

### Can't upload files
**Cause**: Storage rules or file size limit

**Solution**:
1. Check file size (Firebase free: 10GB total)
2. Verify Storage rules allow admin upload
3. Check upload code uses correct path
4. Try smaller file first

### Real-time updates not working
**Cause**: Missing onSnapshot or wrong query

**Solution**:
```javascript
// Verify useEffect has cleanup:
useEffect(() => {
  const unsubscribe = onSnapshot(query, (snapshot) => {
    // ...
  })
  return () => unsubscribe()
}, [])
```

### Stats showing 0 or wrong numbers
**Cause**: Aggregation logic or missing data

**Solution**:
1. Check collections have data
2. Verify queries filter correctly
3. Check timestamp fields exist
4. Use `console.log()` to debug counts

---

## 🔥 Firebase Issues

### "Permission denied" errors
**Cause**: Firestore rules or authentication

**Solution**:
1. Check rules deployed: `firebase deploy --only firestore:rules`
2. Verify user authenticated: Check `currentUser` in console
3. Test rules in Firebase Console → Rules Playground
4. Check role field exists in user doc

### "Quota exceeded"
**Cause**: Free tier limits reached

**Solution**:
- Firebase Free: 50K reads/day, 20K writes/day
- Upgrade to Blaze plan
- Optimize queries (use indexes, limit results)
- Cache data in localStorage

### Storage files won't delete
**Cause**: Storage rules or file in use

**Solution**:
1. Verify Storage rules allow admin delete
2. Check file not referenced by active purchases
3. Use Firebase Console to manually delete
4. Check JavaScript code has correct path

---

## 🌐 Deployment Issues

### Build fails
**Error**: Various build errors

**Solution**:
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### Environment variables not working in production
**Cause**: Not set in hosting platform

**Solution**:
- **Netlify**: Site settings → Environment variables
- **Vercel**: Project settings → Environment Variables
- **Firebase**: Use `firebase functions:config:set`
- All must start with `VITE_` to be exposed

### "Module not found" in production
**Cause**: Case-sensitive paths or missing files

**Solution**:
1. Check import paths match file names exactly
2. Verify all files committed to git
3. Check `.gitignore` not excluding required files
4. Use relative imports: `./Component.jsx` not `Component`

### Site loads but shows blank page
**Cause**: JavaScript errors or wrong base URL

**Solution**:
1. Check browser console
2. Verify `vite.config.js` base path correct
3. Check `index.html` loads
4. Test build locally: `npm run build && npm run preview`

---

## 🐛 Browser Debugging

### Open Developer Tools
- **Chrome/Edge**: F12 or Ctrl+Shift+I
- **Firefox**: F12 or Ctrl+Shift+I
- **Safari**: Cmd+Option+I

### Check Common Issues

**Console Tab**:
- Red errors = critical issues
- Yellow warnings = possible issues
- Look for Firebase auth errors
- Check for undefined variables

**Network Tab**:
- Failed requests (red)
- 401/403 = auth/permission issues
- 404 = wrong URL/missing resource
- 500 = server error

**Application Tab** (Chrome):
- Check localStorage has cart data
- Check IndexedDB has localforage data
- Clear storage if corrupted

---

## 📞 Getting Help

### Before Asking for Help

1. **Check browser console** for error messages
2. **Try incognito mode** (rules out extensions)
3. **Check Firebase Console logs**:
   - Firestore → Usage
   - Functions → Logs
   - Storage → Files
4. **Verify environment variables** are set
5. **Test in different browser**

### Information to Provide

When reporting issues:
- Error message (full text)
- Browser and version
- Steps to reproduce
- Browser console output
- Firebase project ID (if applicable)
- Relevant code snippet

### Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [MaishaPay Docs](https://maishapay.online/docs)
- Project Issues: [GitHub Issues](your-repo-url)

---

## 🛠️ Developer Tools

### Useful Commands

```bash
# View Firebase config
firebase projects:list

# Check Firestore rules
firebase firestore:rules

# View Functions logs
firebase functions:log

# Check build output
npm run build -- --debug

# Clear Vite cache
rm -rf .vite

# Check bundle size
npm run build
ls -lh dist/assets/*.js
```

### Firebase Console Quick Links

- **Authentication**: firebase.google.com/project/_/authentication
- **Firestore**: firebase.google.com/project/_/firestore
- **Storage**: firebase.google.com/project/_/storage
- **Functions**: firebase.google.com/project/_/functions
- **Usage**: firebase.google.com/project/_/usage

---

## ⚡ Quick Fixes

### Reset Everything
```bash
# Nuclear option: Start fresh
rm -rf node_modules dist .vite package-lock.json
npm install
npm run dev
```

### Reset Firebase Auth
1. Firebase Console → Authentication
2. Delete test users
3. Re-register

### Reset Firestore Data
1. Firebase Console → Firestore
2. Delete collections (careful!)
3. Redeploy rules
4. Re-test

### Reset Storage
1. Firebase Console → Storage
2. Delete files/folders
3. Redeploy rules
4. Re-upload test files

---

## 🎯 Prevention Tips

- **Commit often**: Small changes easier to debug
- **Test locally first**: Before deploying
- **Use console.log**: Debug data flow
- **Check docs**: Firebase rules syntax tricky
- **Version control**: Git branching for experiments
- **Backup data**: Export Firestore before big changes

---

**Still stuck?** Open an issue with full error details!
