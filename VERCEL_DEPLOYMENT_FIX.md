# 🚀 Vercel Deployment Fix Guide

**Issue:** CORS blocking + Google OAuth errors on production  
**Date:** December 24, 2025

---

## 🔴 Problem Summary

Your production deployment has **two critical issues**:

1. **CORS Policy Blocking** - Backend not sending `Access-Control-Allow-Origin` header
2. **Google OAuth 401 Error** - OAuth client not found/misconfigured

---

## ✅ Solution 1: Fix Backend CORS on Vercel

### Step 1: Add Environment Variables to Backend

Go to your **backend Vercel project**:
- Project: `backend-9e1d1i6y8-abdul-latif-abass-suleimans-projects`
- Settings → Environment Variables

**Add these variables:**

```bash
# Required for CORS
FRONTEND_ORIGIN=https://fugaji-smart.vercel.app

# Required for Django
DEBUG=False
SECRET_KEY=your-production-secret-key-here
ALLOWED_HOSTS=backend-9e1d1i6y8-abdul-latif-abass-suleimans-projects.vercel.app,.vercel.app

# Database (if using PostgreSQL)
DATABASE_URL=your-postgres-connection-string

# Optional but recommended
CORS_ALLOW_CREDENTIALS=True
```

### Step 2: Verify Backend Settings

Your `backend/config/settings.py` already has the correct code:

```python
# Lines 176-189 in settings.py
frontend_origin = os.getenv('FRONTEND_ORIGIN', '').strip()
extra_cors = [frontend_origin] if frontend_origin else []

CORS_ALLOWED_ORIGINS = default_cors + extra_cors
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = default_cors + extra_cors
```

✅ **This is correct!** You just need to set the environment variable.

### Step 3: Redeploy Backend

After adding environment variables:
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Wait for deployment to complete

### Step 4: Test CORS

Run this command to verify CORS is working:

```bash
curl -I -X OPTIONS \
  -H "Origin: https://fugaji-smart.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://backend-9e1d1i6y8-abdul-latif-abass-suleimans-projects.vercel.app/api/v1/auth/login/
```

**Expected response:**
```
HTTP/2 200
access-control-allow-origin: https://fugaji-smart.vercel.app
access-control-allow-credentials: true
access-control-allow-methods: DELETE, GET, OPTIONS, PATCH, POST, PUT
access-control-allow-headers: accept, authorization, content-type, user-agent, x-csrftoken, x-requested-with
```

---

## ✅ Solution 2: Fix Google OAuth

### Step 1: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Click **Edit**

### Step 2: Add Authorized Origins

Under **Authorized JavaScript origins**, add:
```
https://fugaji-smart.vercel.app
```

### Step 3: Add Authorized Redirect URIs

Under **Authorized redirect URIs**, add:
```
https://fugaji-smart.vercel.app
https://fugaji-smart.vercel.app/login
https://fugaji-smart.vercel.app/signup
```

### Step 4: Update Frontend Environment Variables

Go to your **frontend Vercel project**:
- Project: `fugaji-smart`
- Settings → Environment Variables

**Add/Update:**
```bash
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_URL=https://backend-9e1d1i6y8-abdul-latif-abass-suleimans-projects.vercel.app
```

### Step 5: Redeploy Frontend

1. Go to Deployments tab
2. Click "Redeploy" on latest deployment

---

## 🧪 Testing After Fixes

### Test 1: CORS Headers
```bash
# Should return 200 with CORS headers
curl -I https://backend-9e1d1i6y8-abdul-latif-abass-suleimans-projects.vercel.app/api/v1/auth/csrf/ \
  -H "Origin: https://fugaji-smart.vercel.app"
```

### Test 2: Login Flow
1. Go to https://fugaji-smart.vercel.app/login
2. Open browser DevTools (F12) → Console
3. Try logging in
4. Should NOT see CORS errors

### Test 3: Google OAuth
1. Click "Sign in with Google"
2. Should redirect to Google login
3. Should NOT see "OAuth client was not found" error

---

## 📋 Quick Checklist

**Backend (Vercel):**
- [ ] Add `FRONTEND_ORIGIN=https://fugaji-smart.vercel.app`
- [ ] Add `ALLOWED_HOSTS` with your Vercel domain
- [ ] Add `SECRET_KEY` (production secret)
- [ ] Set `DEBUG=False`
- [ ] Redeploy backend

**Google Cloud Console:**
- [ ] Add `https://fugaji-smart.vercel.app` to Authorized JavaScript origins
- [ ] Add redirect URIs
- [ ] Copy Client ID

**Frontend (Vercel):**
- [ ] Add `VITE_GOOGLE_CLIENT_ID`
- [ ] Add `VITE_API_URL`
- [ ] Redeploy frontend

**Testing:**
- [ ] Test CORS with curl
- [ ] Test login in browser
- [ ] Test Google OAuth

---

## 🔧 Alternative: Use Wildcard CORS (Not Recommended for Production)

If you need a quick temporary fix for testing:

```python
# In backend/config/settings.py (TEMPORARY ONLY)
CORS_ALLOW_ALL_ORIGINS = True  # ⚠️ INSECURE - Remove after testing
```

**⚠️ WARNING:** This allows ANY website to access your API. Only use for debugging!

---

## 📞 Still Having Issues?

### Check Backend Logs
```bash
vercel logs backend-9e1d1i6y8-abdul-latif-abass-suleimans-projects
```

### Check Frontend Logs
```bash
vercel logs fugaji-smart
```

### Common Issues

**Issue:** "No 'Access-Control-Allow-Origin' header"
- **Fix:** Ensure `FRONTEND_ORIGIN` is set and backend is redeployed

**Issue:** "OAuth client was not found"
- **Fix:** Verify Client ID in Google Console matches environment variable

**Issue:** "CSRF verification failed"
- **Fix:** Ensure `CSRF_TRUSTED_ORIGINS` includes frontend URL

---

## ✅ Expected Result

After applying all fixes:
- ✅ Login works without CORS errors
- ✅ Google OAuth redirects properly
- ✅ API calls succeed from frontend
- ✅ No console errors

---

**Generated:** December 24, 2025  
**Status:** Ready to deploy
