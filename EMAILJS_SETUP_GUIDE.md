# 📧 EmailJS Setup Guide for FugajiSmart

## 🎯 What is EmailJS?

EmailJS allows you to send emails directly from your frontend (contact forms, newsletters) without needing a backend email server.

---

## 🚀 Quick Setup (5-10 minutes)

### Step 1: Create EmailJS Account

1. Go to **https://www.emailjs.com/**
2. Click **"Sign Up"** (it's FREE - up to 200 emails/month)
3. Sign up with Google or email
4. Verify your email

---

### Step 2: Add Email Service

1. **After login, go to:** https://dashboard.emailjs.com/admin
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for you since you use @gmail.com)
   - Or Outlook, Yahoo, etc.

#### For Gmail:
1. Select **"Gmail"**
2. Click **"Connect Account"**
3. Sign in with: `abdullatifsuleiman2002@gmail.com`
4. Grant permissions
5. **Copy the Service ID** (looks like: `service_abc123`)

📝 **Save this:** `VITE_EMAILJS_SERVICE_ID=service_abc123`

---

### Step 3: Create Email Template

1. Go to **"Email Templates"** tab
2. Click **"Create New Template"**
3. Use this template for contact/newsletter forms:

#### Template Name: `fugajismart_contact`

#### Subject:
```
New Contact from FugajiSmart - {{from_name}}
```

#### Content (Body):
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #27AE60; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; color: #333; }
        .value { color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐔 FugajiSmart Contact</h1>
        </div>
        <div class="content">
            <div class="field">
                <span class="label">Name:</span>
                <span class="value">{{from_name}}</span>
            </div>
            <div class="field">
                <span class="label">Email:</span>
                <span class="value">{{from_email}}</span>
            </div>
            <div class="field">
                <span class="label">Phone:</span>
                <span class="value">{{phone}}</span>
            </div>
            <div class="field">
                <span class="label">Message:</span>
                <p class="value">{{message}}</p>
            </div>
            <div class="field">
                <span class="label">Submitted:</span>
                <span class="value">{{submitted_at}}</span>
            </div>
        </div>
    </div>
</body>
</html>
```

#### Settings:
- **To Email:** `abdullatifsuleiman2002@gmail.com`
- **From Name:** `{{from_name}}`
- **Reply To:** `{{from_email}}`

4. Click **"Save"**
5. **Copy the Template ID** (looks like: `template_xyz789`)

📝 **Save this:** `VITE_EMAILJS_TEMPLATE_ID=template_xyz789`

---

### Step 4: Get Public Key

1. Go to **"Account"** → **"API Keys"**
2. Find **"Public Key"** (looks like: `A1b2C3d4E5f6G7h8I`)
3. **Copy it**

📝 **Save this:** `VITE_EMAILJS_PUBLIC_KEY=A1b2C3d4E5f6G7h8I`

---

## 🔧 Update Your .env.production

Once you have all three values, update:

```bash
# In .env.production
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=A1b2C3d4E5f6G7h8I
VITE_EMAILJS_TO_EMAIL=abdullatifsuleiman2002@gmail.com
```

---

## 🧪 Test Your Setup

After deploying, test by:

1. Go to your deployed app
2. Fill contact form
3. Submit
4. Check `abdullatifsuleiman2002@gmail.com` inbox
5. You should receive the email!

---

## 📊 EmailJS Free Tier Limits

✅ **200 emails/month** (FREE)
✅ 2 email services
✅ 2 email templates
✅ No credit card required

**For more:** Upgrade to $15/month for 1,000 emails

---

## 🐔 FugajiSmart-Specific Use Cases

Your EmailJS will handle:

1. **Contact Form** - Inquiries from website visitors
2. **Newsletter Signups** - Capture interested farmers
3. **Partnership Requests** - Business inquiries
4. **Support Tickets** - Customer help requests

---

## 🔒 Security Notes

✅ **Public Key is safe** - It's meant to be public (in frontend code)
✅ **Service/Template IDs** - Also safe to expose
✅ **Rate Limiting** - EmailJS automatically prevents spam
✅ **CAPTCHA** - Consider adding reCAPTCHA for production

---

## 🆘 Troubleshooting

### Issue: Emails not sending
**Solution:** 
1. Check spam folder
2. Verify Service is connected
3. Check EmailJS dashboard → "Logs"

### Issue: Gmail blocking
**Solution:**
1. Enable "Less secure app access" (if using app password)
2. Or use OAuth2 (recommended)

### Issue: Template not found
**Solution:**
1. Verify Template ID matches exactly
2. Check template is saved and published

---

## 📞 Support

- **EmailJS Docs:** https://www.emailjs.com/docs/
- **EmailJS Support:** support@emailjs.com
- **Dashboard:** https://dashboard.emailjs.com/

---

## ✅ Next Steps After Setup

1. Get your 3 EmailJS credentials
2. Update `.env.production` file
3. Commit and push changes
4. Deploy to Netlify/Vercel
5. Test contact form on live site

---

**Ready to deploy once EmailJS is configured! 🚀**
