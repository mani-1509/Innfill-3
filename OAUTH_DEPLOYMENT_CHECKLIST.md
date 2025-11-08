# OAuth Production Deployment Checklist

## 🎯 Quick Setup Steps

### 1. Set Environment Variable in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Add this variable:
```
NEXT_PUBLIC_SITE_URL=https://your-actual-domain.vercel.app
```

**Example:**
- If your Vercel URL is `innfill-3.vercel.app`, use: `https://innfill-3.vercel.app`
- If you have a custom domain like `innfill.com`, use: `https://innfill.com`

### 2. Update Supabase Settings

1. Go to: https://supabase.com/dashboard/project/nopfpkdmaeqfybhyoyxj/auth/url-configuration
2. Update **Site URL**: `https://your-actual-domain.vercel.app`
3. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-actual-domain.vercel.app/auth/callback
   ```
4. Click **Save**

### 3. Update Google OAuth (if using)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   ```
   https://nopfpkdmaeqfybhyoyxj.supabase.co/auth/v1/callback
   ```
4. Click **Save**

### 4. Update GitHub OAuth (if using)

1. Go to: https://github.com/settings/developers
2. Click your OAuth App
3. Update **Authorization callback URL**:
   ```
   https://nopfpkdmaeqfybhyoyxj.supabase.co/auth/v1/callback
   ```
4. Click **Update application**

### 5. Redeploy

In Vercel:
1. Go to **Deployments** tab
2. Click **Redeploy** on your latest deployment
3. Wait for deployment to complete

---

## ✅ Testing

### Test OAuth Login (Google):
1. Go to `https://your-domain.vercel.app/login`
2. Click **Continue with Google**
3. Sign in with Google
4. Should redirect to `/onboarding` (new user) or `/events` (existing user)

### Test OAuth Signup (GitHub):
1. Go to `https://your-domain.vercel.app/register`
2. Click **Continue with GitHub**
3. Authorize the app
4. Should redirect to `/onboarding` to select role and username
5. Complete onboarding
6. Should redirect to `/events`

### Test Password Reset:
1. Go to `https://your-domain.vercel.app/forgot-password`
2. Enter email and submit
3. Check email for reset link
4. Click link - should go to `https://your-domain.vercel.app/reset-password`
5. Set new password

---

## 🐛 Common Issues

### "Redirect URI mismatch"
**Fix:** Make sure the callback URL in Google/GitHub exactly matches Supabase's auth callback URL

### OAuth redirects to localhost
**Fix:** 
1. Check `NEXT_PUBLIC_SITE_URL` is set in Vercel
2. Redeploy after setting it
3. Clear browser cache

### "Invalid redirect URL"
**Fix:** 
1. Add your production URL to Supabase Redirect URLs
2. Make sure there's no trailing slash

---

## 📝 What's Already Working

✅ **Development (localhost)**
- OAuth redirects to `http://localhost:3000/auth/callback`
- All auth functions use localhost automatically

✅ **Production (Vercel)**  
- OAuth redirects to `https://your-domain.vercel.app/auth/callback`
- All auth functions use production URL automatically

✅ **Code automatically detects environment**
- No code changes needed between dev and prod!
- Just set the environment variable correctly

---

## 🎉 You're Done!

Once you complete steps 1-5 above:
- Development will work with localhost
- Production will work with your Vercel domain
- Both will work simultaneously
- No conflicts!

**Need the full guide?** → See `PRODUCTION_SETUP.md`
