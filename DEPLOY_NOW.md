# Deploy skismail-portfolio to Live URL

## 🚀 Your GitHub Repository
https://github.com/Skismail57/skismail-portfolio

---

## Step 1: Set Up MongoDB Atlas (Required)

### 1.1 Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up for free account
4. Verify your email

### 1.2 Create Free Cluster
1. Click "Build a Database"
2. Choose "Free" (M0 Sandbox)
3. Name cluster: `portfolio-cluster`
4. Select region (choose Asia if possible for faster access)
5. Click "Create"
6. Wait 2-3 minutes for cluster to create

### 1.3 Create Database User
1. In MongoDB Atlas, go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: `portfolio-admin`
5. Password: Create strong password (SAVE IT! Example: Portfolio@2024Secure)
6. Click "Create User"

### 1.4 Allow All IPs
1. In MongoDB Atlas, go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. In MongoDB Atlas, go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js
5. Version: 4.3 or later
6. Copy the connection string
7. It looks like: `mongodb+srv://portfolio-admin:password@cluster.mongodb.net/portfolio`
8. Replace `<password>` with your actual password
9. Replace `<dbname>` with `portfolio`
10. SAVE THIS STRING

---

## Step 2: Deploy to Render.com

### 2.1 Create Render Account
1. Go to: https://render.com
2. Click "Sign Up"
3. Choose "Sign up with GitHub"
4. Authorize Render to access your GitHub

### 2.2 Deploy Your Repository
1. In Render, click "New" → "Web Service"
2. You'll see your repository: `Skismail57/skismail-portfolio`
3. Click "Connect" next to it
4. Fill in these settings:

   **Root Directory**: (leave empty)
   
   **Build Command**: `npm install`
   
   **Start Command**: `node server.js`

### 2.3 Add Environment Variables
1. Scroll down to "Advanced" → "Add Environment Variable"
2. Add these variables one by one:

   ```
   EMAIL_USER = skportfolio57@gmail.com
   EMAIL_PASS = udztkvesusirquys
   SESSION_SECRET = portfolio-secret-key-2024-skismail
   MONGODB_URI = (paste your MongoDB connection string from Step 1.5)
   PORT = 3000
   ```

3. For MONGODB_URI, paste the string you got from MongoDB Atlas:
   ```
   mongodb+srv://portfolio-admin:YOUR_PASSWORD@portfolio-cluster.mongodb.net/portfolio
   ```

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait 2-5 minutes for deployment
3. Your live URL will be: `https://skismail-portfolio.onrender.com`

---

## Step 3: Verify Deployment

### 3.1 Check Backend Health
- Visit: `https://skismail-portfolio.onrender.com/api/health`
- Should return: `{"status":"ok","message":"Server is running"}`

### 3.2 Test Portfolio
- Visit: `https://skismail-portfolio.onrender.com`
- Verify all sections load correctly

### 3.3 Test Contact Form
- Fill and submit contact form
- Check if email arrives at skportfolio57@gmail.com

### 3.4 Test Admin Panel
- Visit: `https://skismail-portfolio.onrender.com/admin/login`
- Login: `admin` / `admin123`
- Verify all sections work

---

## Step 4: Update Local Code (Optional)

After deployment, you may want to update local code to use the live URL instead of localhost.

### Update these files:

### contact-handler.js
Change:
```javascript
const response = await fetch('http://localhost:3000/api/contact', {
```
To:
```javascript
const response = await fetch('https://skismail-portfolio.onrender.com/api/contact', {
```

### dashboard-functional.html
Change:
```javascript
const API_BASE = 'http://localhost:3000/api';
```
To:
```javascript
const API_BASE = 'https://skismail-portfolio.onrender.com/api';
```

### admin-panel.html
Change:
```javascript
const API_BASE = 'http://localhost:3000/api';
```
To:
```javascript
const API_BASE = 'https://skismail-portfolio.onrender.com/api';
```

### index.html
Change:
```html
<li><a href="http://localhost:3000/admin/login" target="_blank">Admin Panel</a></li>
```
To:
```html
<li><a href="https://skismail-portfolio.onrender.com/admin/login" target="_blank">Admin Panel</a></li>
```

---

## Step 5: Push Updates to GitHub

When you make changes:

```bash
cd "C:\Users\shaik\Music\S K Ismail\S K Ismail"
git add .
git commit -m "Update portfolio"
git push
```

Render will automatically redeploy your app.

---

## Your Live URLs

After deployment:

- **Portfolio**: https://skismail-portfolio.onrender.com
- **Admin Panel**: https://skismail-portfolio.onrender.com/admin/login
- **Health Check**: https://skismail-portfolio.onrender.com/api/health
- **Forgot Password**: https://skismail-portfolio.onrender.com/admin/forgot-password

---

## Troubleshooting

### Deployment Fails
- Check Render logs (Logs tab in dashboard)
- Verify MONGODB_URI is correct
- Ensure MongoDB Atlas cluster is created

### Database Connection Failed
- Verify IP whitelist (0.0.0.0/0) in MongoDB Atlas
- Check database user credentials
- Ensure connection string is correct

### Email Not Sending
- Verify EMAIL_PASS is correct (no spaces)
- Check Gmail app password
- Check Render logs for email errors

---

## Cost: $0/month

- Render.com: Free
- MongoDB Atlas: Free (512MB)
- SSL/HTTPS: Free
- Custom domain: Paid (optional)

---

## Summary

1. ✅ Set up MongoDB Atlas (5 minutes)
2. ✅ Deploy to Render.com from your GitHub repo (5 minutes)
3. ✅ Add environment variables (2 minutes)
4. ✅ Deploy complete - portfolio is live!

**Total time: ~12 minutes**

**Your portfolio will be accessible at: https://skismail-portfolio.onrender.com**

---

**Start with Step 1 (MongoDB Atlas) - create your free cloud database!**
