# S K Ismail Portfolio - Admin System Setup Guide

## 🚀 System Status

✅ **Backend Server**: Running on `http://localhost:3000`  
✅ **MongoDB Database**: Connected and operational  
✅ **Real-time Analytics**: Active visitor tracking  
✅ **Authentication System**: Fully functional with OTP  

---

## 🔗 Complete System Integration

### **1. Main Portfolio (`index.html`)**
- **Navigation Link**: "Admin Panel" → Points to `http://localhost:3000/admin/login`
- **Dashboard Link**: "Dashboard" → Opens `dashboard-functional.html` in new tab
- **Contact Form**: Connected to backend API at `/api/contact`
- **Visitor Tracking**: Automatic via middleware

### **2. Backend Server (`server.js`)**
- **Port**: 3000
- **Database**: MongoDB (localhost:27017/portfolio)
- **Session Storage**: In-memory with cookie-based sessions
- **File Uploads**: Stored in `uploads/` directory

### **3. Admin Authentication Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN LOGIN FLOW                           │
└─────────────────────────────────────────────────────────────┘

1. Admin Login Page
   └─ http://localhost:3000/admin/login
   └─ Credentials: admin / admin123
   └─ POST /api/auth/login
   └─ Session created → Redirect to admin-panel.html

2. Forgot Password
   └─ http://localhost:3000/admin/forgot-password
   └─ Enter username/email/phone
   └─ Choose method (email/phone)
   └─ POST /api/auth/forgot-password
   └─ OTP sent → Redirect to OTP verification

3. OTP Verification
   └─ http://localhost:3000/admin/otp-verification
   └─ Enter 6-digit OTP
   └─ POST /api/auth/verify-otp
   └─ Redirect to set new password

4. Set New Password
   └─ http://localhost:3000/admin/set-new-password
   └─ Enter new password
   └─ POST /api/auth/reset-password
   └─ Password updated → Redirect to login

5. Admin Panel
   └─ admin-panel.html
   └─ Check session: GET /api/auth/me
   └─ If authenticated → Load real data
   └─ If not → Show login form
```

### **4. Dashboard System**

#### **Functional Dashboard (`dashboard-functional.html`)**
- **Backend Integration**: Connects to `http://localhost:3000/api`
- **Real Analytics**: Fetches from `/api/analytics`
- **Login Required**: Before accessing features
- **Features**:
  - Real-time visitor statistics
  - Skills management
  - Projects tracking
  - Data export/import
  - Settings management

#### **Admin Panel (`admin-panel.html`)**
- **Full Admin Access**: Complete content management
- **Real-time Data**: All from MongoDB
- **Features**:
  - Analytics dashboard
  - Home/Profile image management
  - Gallery management
  - Projects CRUD operations
  - Contact messages management
  - Skills management
  - Certificates management
  - Global search
  - Account settings (username/password change)

### **5. API Endpoints**

#### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/change-username` - Change username
- `POST /api/auth/forgot-password` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password with OTP

#### **Analytics**
- `GET /api/analytics` - Get all analytics data
- `POST /api/project-view/:projectId` - Track project view
- `POST /api/resume-download` - Track resume download

#### **Content Management**
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Add skill (auth required)
- `DELETE /api/skills/:id` - Delete skill (auth required)
- `GET /api/certificates` - Get all certificates
- `POST /api/certificates` - Add certificate (auth required)
- `DELETE /api/certificates/:id` - Delete certificate (auth required)
- `GET /api/contacts` - Get all contacts (auth required)
- `PATCH /api/contacts/:id` - Update contact status (auth required)
- `GET /api/search` - Search across content

#### **Contact Form**
- `POST /api/contact` - Submit contact form with file upload

#### **File Uploads**
- `POST /api/upload/certificate` - Upload certificate (auth required)
- `POST /api/upload/project-image` - Upload project image (auth required)

#### **Health Check**
- `GET /api/health` - Server health status

### **6. File Structure**

```
S K Ismail/
├── index.html                    # Main portfolio
├── dashboard-functional.html     # Functional dashboard
├── admin-panel.html              # Full admin panel
├── admin-login.html              # Admin login page
├── forgot-password.html          # Forgot password request
├── otp-verification.html         # OTP verification page
├── set-new-password.html         # Set new password page
├── forgot-password-success.html  # Password reset success
├── test-otp.html                 # OTP testing tool
├── server.js                     # Backend server
├── package.json                  # Dependencies
├── .env                          # Environment variables
├── models/                       # MongoDB models
│   ├── User.js
│   ├── Contact.js
│   └── Analytics.js
└── uploads/                      # File uploads directory
```

### **7. Environment Variables (.env)**

```env
EMAIL_USER=skportfolio57@gmail.com
EMAIL_PASS=your-app-password-here
SESSION_SECRET=your-secret-key-change-this-in-production
MONGODB_URI=mongodb://127.0.0.1:27017/portfolio
PORT=3000
```

### **8. Database Collections**

#### **MongoDB Collections**
- `users` - Admin users
- `contacts` - Contact form submissions
- `visitors` - Visitor tracking
- `projectviews` - Project view counts
- `resumedownloads` - Resume download tracking
- `skills` - Skills data
- `certificates` - Certificates data

### **9. Default Admin Credentials**

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `skportfolio57@gmail.com`
- **Phone**: +918904851665

### **10. OTP System**

#### **How it Works**
1. User requests password reset
2. System generates 6-digit OTP
3. OTP sent via email/SMS (or shown in console if not configured)
4. User enters OTP on verification page
5. OTP verified against database
6. User can set new password
7. Password updated in database

#### **OTP Expiry**
- OTP expires after 10 minutes
- Each OTP is unique per request
- Multiple OTP requests invalidate previous ones

### **11. Testing the System**

#### **Test Admin Login**
1. Go to: `http://localhost:3000/admin/login`
2. Enter: `admin` / `admin123`
3. Click Login
4. Should redirect to admin panel

#### **Test Password Reset**
1. Go to: `http://localhost:3000/admin/forgot-password`
2. Enter: `admin` (or email/phone)
3. Select method: Email
4. Click "Send OTP"
5. Check server console for OTP (if email not configured)
6. Go to OTP verification page
7. Enter the 6-digit OTP
8. Set new password
9. Login with new password

#### **Test OTP System**
1. Go to: `http://localhost:3000/admin/test-otp`
2. Test email OTP sending
3. Test SMS OTP sending
4. Check server health

#### **Test Analytics**
1. Login to admin panel
2. Navigate to Analytics section
3. View real visitor data
4. Check recent visitors
5. View country distribution

#### **Test Contact Form**
1. Go to main portfolio
2. Fill contact form
3. Submit
4. Login to admin panel
5. Check Contacts section
6. View submitted message

### **12. Server Management**

#### **Start Server**
```bash
cd "C:\Users\shaik\Music\S K Ismail\S K Ismail"
node server.js
```

#### **Stop Server**
- Find process ID (PID) using: `netstat -ano | findstr :3000`
- Kill process: `taskkill /F /PID <PID>`

#### **Restart Server**
- Stop current server
- Start again with `node server.js`

### **13. Troubleshooting**

#### **Port Already in Use**
- Kill process on port 3000
- Or change PORT in .env file

#### **MongoDB Connection Failed**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- System will fallback to in-memory storage

#### **Email Not Sending**
- Check EMAIL_USER and EMAIL_PASS in .env
- Ensure Gmail app password is correct
- Check server console for errors
- OTP will be shown in console as fallback

#### **Session Issues**
- Clear browser cookies
- Check SESSION_SECRET in .env
- Restart server

### **14. Security Notes**

⚠️ **Production Deployment Required**:
- Change default admin password
- Update SESSION_SECRET to random string
- Configure proper email credentials
- Enable HTTPS
- Set secure cookie flags
- Use production MongoDB instance
- Implement rate limiting
- Add CORS restrictions

### **15. Feature Checklist**

✅ **Authentication**
- [x] Login with username/password
- [x] Session-based authentication
- [x] Password reset with OTP
- [x] OTP via email/SMS
- [x] Username change
- [x] Password change

✅ **Analytics**
- [x] Real-time visitor tracking
- [x] Geographic location tracking
- [x] Project view tracking
- [x] Resume download tracking
- [x] Contact form tracking
- [x] Daily/total statistics

✅ **Content Management**
- [x] Skills CRUD
- [x] Certificates CRUD
- [x] Contact messages
- [x] Project images upload
- [x] Home/profile images
- [x] Gallery management

✅ **Admin Panel**
- [x] Dashboard with real analytics
- [x] Multi-section navigation
- [x] Search functionality
- [x] Settings management
- [x] Account settings
- [x] Professional UI

✅ **Integration**
- [x] Backend API integration
- [x] MongoDB database
- [x] File upload system
- [x] Email notifications
- [x] OTP verification
- [x] Session management

---

## 📞 Support

For issues or questions:
1. Check server console for errors
2. Verify MongoDB is running
3. Check .env configuration
4. Test with test-otp.html page
5. Review browser console for frontend errors

---

**System Version**: 1.0.0  
**Last Updated**: 2026-09-30  
**Status**: ✅ Fully Operational
