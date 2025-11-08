# Production Setup Guide

## 🚀 Deploying to Production

### 1. Environment Variables (Vercel/Production)

Add these environment variables in your hosting platform (Vercel Dashboard → Settings → Environment Variables):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://nopfpkdmaeqfybhyoyxj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vcGZwa2RtYWVxZnliaHlveXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzE0NzEsImV4cCI6MjA3ODAwNzQ3MX0.c5kvFs434m8Et8Y8r61NjVjBqwEeNisYIJhZsedLcX8

# Site Configuration - UPDATE THIS WITH YOUR PRODUCTION DOMAIN
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
# OR
NEXT_PUBLIC_SITE_URL=https://innfill.com

# Payment Gateway
RAZORPAY_KEY_ID=your-production-razorpay-key
RAZORPAY_KEY_SECRET=your-production-razorpay-secret

# Platform Fee
PLATFORM_FEE_PERCENTAGE=15
```

⚠️ **IMPORTANT**: Replace `https://your-domain.vercel.app` with your actual production URL!

---

## 🔐 OAuth Configuration (Google & GitHub)

### Step 1: Update OAuth Redirect URIs in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `nopfpkdmaeqfybhyoyxj`
3. Navigate to **Authentication** → **URL Configuration**
4. Add these URLs to **Redirect URLs**:

```
http://localhost:3000/auth/callback
https://your-domain.vercel.app/auth/callback
```

5. Update **Site URL** to: `https://your-domain.vercel.app`

### Step 2: Update Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:

```
https://nopfpkdmaeqfybhyoyxj.supabase.co/auth/v1/callback
```

6. Save changes

### Step 3: Update GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Select **OAuth Apps** → Your app
3. Update **Authorization callback URL** to:

```
https://nopfpkdmaeqfybhyoyxj.supabase.co/auth/v1/callback
```

4. Save changes

---

## ✅ Testing OAuth in Production

### Test Flow:
1. Deploy your app with production environment variables
2. Visit: `https://your-domain.vercel.app/login`
3. Click "Continue with Google" or "Continue with GitHub"
4. Should redirect to OAuth provider
5. After authentication, should redirect to `/onboarding` (new users) or `/events` (existing users)

### Expected Redirect Chain:
```
Your App (Login) 
  → OAuth Provider (Google/GitHub) 
  → Supabase Auth 
  → Your App (/auth/callback) 
  → /onboarding or /events
```

---

## 🛠️ Troubleshooting

### Issue: OAuth redirects to localhost in production

**Solution:**
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly in Vercel environment variables
- Redeploy after changing environment variables
- Clear browser cache and try again

### Issue: "Redirect URI mismatch" error

**Solution:**
- Double-check OAuth redirect URIs in Google/GitHub match Supabase callback URL
- Ensure Supabase Redirect URLs include your production domain
- Wait 5-10 minutes for changes to propagate

### Issue: Profile not created after OAuth signup

**Solution:**
- Check Supabase logs for errors
- Verify database permissions (RLS policies)
- Ensure `profiles` table allows INSERT for authenticated users

---

## 📋 Deployment Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Update Supabase Redirect URLs
- [ ] Update Google OAuth redirect URI
- [ ] Update GitHub OAuth callback URL
- [ ] Test OAuth login flow in production
- [ ] Test OAuth signup flow in production
- [ ] Test onboarding flow for new OAuth users
- [ ] Verify email/password authentication still works
- [ ] Test profile creation and editing
- [ ] Check all protected routes redirect correctly

---

## 🔄 Supporting Both Localhost and Production

The app is already configured to work with both:

### Development (localhost:3000)
- Uses `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- OAuth redirects to `http://localhost:3000/auth/callback`

### Production (your-domain.vercel.app)
- Uses `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`
- OAuth redirects to `https://your-domain.vercel.app/auth/callback`

The code automatically detects the environment and uses the correct URL! ✅

---

## 🚨 Security Notes

1. **Never commit** `.env.local` to git (already in `.gitignore`)
2. **Keep separate** development and production OAuth credentials
3. **Rotate keys** regularly for security
4. **Use HTTPS** for all production URLs
5. **Enable Supabase** email verification in production (optional)

---

## 📞 Need Help?

If OAuth is not working:
1. Check Vercel deployment logs
2. Check Supabase Auth logs (Dashboard → Authentication → Logs)
3. Verify all redirect URLs match exactly (including https://)
4. Test with incognito/private browser window
