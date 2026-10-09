const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const geoip = require('geoip-lite');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Contact = require('./models/Contact');
const { Visitor, ProjectView, ResumeDownload, Skill, Certificate, Project, GallerySettings, Profile, About, Social, Theme } = require('./models/Analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render (fixes express-rate-limit warning)
app.set('trust proxy', true);

// MongoDB connection - use environment variable or fallback to local
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
mongoose.connect(mongoUri)
.then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Starting without MongoDB - using in-memory storage');
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (increased for testing)
});

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     ['application/pdf', 'application/msword', 
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'text/plain'].includes(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, and image files are allowed'));
    }
  }
});

// Middleware
app.use(limiter);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Admin routes (defined before static files to ensure they work)
app.get('/admin/login', (req, res) => {
  res.sendFile(__dirname + '/admin-login.html');
});

app.get('/admin/admin-panel', (req, res) => {
  // Check if user is authenticated
  if (req.session.user && req.session.user.role === 'admin') {
    res.sendFile(__dirname + '/admin-panel.html');
  } else {
    res.redirect('/admin/login');
  }
});

app.get('/admin/admin-panel.html', (req, res) => {
  // Check if user is authenticated
  if (req.session.user && req.session.user.role === 'admin') {
    res.sendFile(__dirname + '/admin-panel.html');
  } else {
    res.redirect('/admin/login');
  }
});

app.get('/admin/dashboard.html', (req, res) => {
  // Check if user is authenticated
  if (req.session.user && req.session.user.role === 'admin') {
    res.sendFile(__dirname + '/admin-dashboard.html');
  } else {
    res.redirect('/admin/login');
  }
});

app.get('/admin/admin-dashboard.html', (req, res) => {
  // Check if user is authenticated
  if (req.session.user && req.session.user.role === 'admin') {
    res.sendFile(__dirname + '/admin-dashboard.html');
  } else {
    res.redirect('/admin/login');
  }
});

app.get('/admin/forgot-password', (req, res) => {
  res.sendFile(__dirname + '/forgot-password.html');
});

app.get('/admin/forgot-password.html', (req, res) => {
  res.sendFile(__dirname + '/forgot-password.html');
});

app.get('/admin/otp-verification', (req, res) => {
  res.sendFile(__dirname + '/otp-verification.html');
});

app.get('/admin/otp-verification.html', (req, res) => {
  res.sendFile(__dirname + '/otp-verification.html');
});

app.get('/admin/set-new-password', (req, res) => {
  res.sendFile(__dirname + '/set-new-password.html');
});

app.get('/admin/set-new-password.html', (req, res) => {
  res.sendFile(__dirname + '/set-new-password.html');
});

app.get('/admin/forgot-password-success', (req, res) => {
  res.sendFile(__dirname + '/forgot-password-success.html');
});

app.get('/admin/forgot-password-success.html', (req, res) => {
  res.sendFile(__dirname + '/forgot-password-success.html');
});

app.get('/admin/test-otp', (req, res) => {
  res.sendFile(__dirname + '/test-otp.html');
});

app.get('/admin/test-otp.html', (req, res) => {
  res.sendFile(__dirname + '/test-otp.html');
});

app.get('/admin', (req, res) => {
  // Check if user is authenticated
  if (req.session.user && req.session.user.role === 'admin') {
    res.sendFile(__dirname + '/admin-dashboard.html');
  } else {
    res.redirect('/admin/login');
  }
});

// Visitor tracking middleware (before static files)
app.use(async (req, res, next) => {
  // Skip tracking for API calls, admin routes, and favicon
  if (req.path.startsWith('/api/') || req.path.startsWith('/admin') || req.path === '/favicon.ico') {
    return next();
  }
  
  try {
    const userAgent = req.get('User-Agent');
    
    // Filter out bots
    const botUserAgents = [
      'UptimeRobot',
      'Googlebot',
      'bot',
      'crawler',
      'spider',
      'slurp',
      'facebookexternalhit',
      'twitterbot',
      'linkedinbot',
      'Go-http-client',
      'curl',
      'wget',
      'python-requests',
      'axios',
      'node-fetch'
    ];
    
    const isBot = botUserAgents.some(bot => 
      userAgent && userAgent.toLowerCase().includes(bot.toLowerCase())
    );
    
    // Skip saving if it's a bot
    if (isBot) {
      return next();
    }
    
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    
    const visitor = new Visitor({
      ip,
      userAgent: userAgent,
      location: geo ? { country: geo.country, city: geo.city } : null,
      path: req.path
    });
    
    await visitor.save();
  } catch (error) {
    console.error('Error saving visitor:', error);
  }
  
  next();
});

// Serve static files (after admin routes and visitor tracking)
app.use(express.static('.'));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Add timeout configuration
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 10000
});

// Verify email configuration on startup
console.log('📧 Email configuration:');
console.log('   User:', process.env.EMAIL_USER);
console.log('   Pass configured:', !!process.env.EMAIL_PASS);

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration failed:', error.message);
    console.error('⚠️  EMAILS WILL NOT BE SENT!');
  } else {
    console.log('✅ Email configuration verified successfully');
  }
});

// Contact form endpoint
app.post('/api/contact', upload.single('attachment'), async (req, res) => {
  try {
    const { username, email, phone, message } = req.body;
    const attachment = req.file;

    console.log('Contact form data received:', { username, email, phone, message });
    console.log('Attachment:', attachment ? attachment.filename : 'None');

    // Validate required fields
    if (!username || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields'
      });
    }

    // Store contact in database
    const ip = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);

    const contact = new Contact({
      name: username,
      email: email,
      phone: phone,
      message: message,
      attachment: attachment ? attachment.filename : null,
      ip,
      location: geo ? { country: geo.country, city: geo.city } : null,
      userAgent: req.get('User-Agent')
    });

    await contact.save();
    console.log('New contact message saved to database:', contact._id);

    // Log contact data to console (backup in case email fails)
    console.log('\n=== NEW CONTACT MESSAGE ===');
    console.log('📧 From:', email);
    console.log('👤 Name:', username);
    console.log('📱 Phone:', phone);
    console.log('💬 Message:', message);
    console.log('============================\n');

    // Send email (optional - may fail on Render free tier due to SMTP blocking)
    console.log('Attempting to send email...');

    // Email to you
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'skportfolio57@gmail.com',
      subject: `Portfolio Contact: ${username}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        ${attachment ? `<p><strong>Attachment:</strong> ${attachment.filename}</p>` : ''}
      `,
      attachments: attachment ? [{
        filename: attachment.originalname,
        path: attachment.path
      }] : []
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
      console.log('Message ID:', info.messageId);
    } catch (emailError) {
      console.error('Email sending failed (message still saved to database):', emailError.message);
      // Don't fail the request - message is saved to database
    }

    return res.json({
      success: true,
      message: 'Message sent successfully! Thank you for contacting me.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    console.error('Error details:', error.message);
    console.error('\n=== CONTACT MESSAGE SAVED TO DATABASE ===');
    console.error('📧 From:', req.body.email);
    console.error('👤 Name:', req.body.username);
    console.error('📱 Phone:', req.body.phone);
    console.error('💬 Message:', req.body.message);
    console.error('==========================================\n');
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Health check endpoint for keep-alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Clean up bot visits from database
app.post('/api/analytics/cleanup-bots', requireAuth, async (req, res) => {
  try {
    const botUserAgents = [
      'UptimeRobot',
      'Googlebot',
      'bot',
      'crawler',
      'spider',
      'slurp',
      'facebookexternalhit',
      'twitterbot',
      'linkedinbot',
      'Go-http-client',
      'curl',
      'wget',
      'python-requests',
      'axios',
      'node-fetch'
    ];
    
    const botRegex = new RegExp(botUserAgents.join('|'), 'i');
    
    // Delete all bot visits
    const result = await Visitor.deleteMany({
      userAgent: { $regex: botRegex }
    });
    
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} bot visits from database`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up bot visits:', error);
    res.status(500).json({ error: 'Failed to clean up bot visits' });
  }
});

// Reset all visits to zero (delete all visitor records)
app.post('/api/analytics/reset-visits', requireAuth, async (req, res) => {
  try {
    // Delete all visitor records
    const result = await Visitor.deleteMany({});
    
    res.json({ 
      success: true, 
      message: `Reset analytics: Deleted ${result.deletedCount} visitor records. Count is now zero.`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error resetting visits:', error);
    res.status(500).json({ error: 'Failed to reset visits' });
  }
});

// Real Analytics Dashboard with MongoDB
app.get('/api/analytics', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter out bots (UptimeRobot, Googlebot, etc.)
    const botUserAgents = [
      'UptimeRobot',
      'Googlebot',
      'bot',
      'crawler',
      'spider',
      'slurp',
      'facebookexternalhit',
      'twitterbot',
      'linkedinbot',
      'Go-http-client',
      'curl',
      'wget',
      'python-requests',
      'axios',
      'node-fetch'
    ];
    
    const botFilter = {
      userAgent: { $not: { $regex: new RegExp(botUserAgents.join('|'), 'i') } }
    };
    
    const totalVisits = await Visitor.countDocuments(botFilter);
    const todayVisits = await Visitor.countDocuments({ 
      timestamp: { $gte: today },
      ...botFilter
    });
    const totalContacts = await Contact.countDocuments();
    const recentVisitors = await Visitor.find(botFilter).sort({ timestamp: -1 }).limit(10);
    const projectViews = await ProjectView.find();
    
    // Get top countries (excluding bots)
    const topCountries = await Visitor.aggregate([
      { $match: { 
        'location.country': { $exists: true, $ne: null },
        ...botFilter
      }},
      { $group: { _id: '$location.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { country: '$_id', count: 1, _id: 0 } }
    ]);
    
    res.json({
      totalVisits,
      todayVisits,
      totalContacts,
      projectViews: projectViews.reduce((acc, pv) => {
        acc[pv.projectId] = pv.views;
        return acc;
      }, {}),
      recentVisitors,
      topCountries
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Project view tracking with MongoDB
app.post('/api/project-view/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    let projectView = await ProjectView.findOne({ projectId });
    if (!projectView) {
      projectView = new ProjectView({ projectId, views: 1 });
    } else {
      projectView.views++;
      projectView.lastViewed = new Date();
    }
    
    await projectView.save();
    console.log(`Project ${projectId} viewed. Total views: ${projectView.views}`);
    res.json({ success: true, views: projectView.views });
  } catch (error) {
    console.error('Project view tracking error:', error);
    res.status(500).json({ error: 'Failed to track project view' });
  }
});

// Skills management API with MongoDB
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1, createdAt: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

app.post('/api/skills', requireAuth, async (req, res) => {
  try {
    const { name, description, icon, level, proficiency, tags } = req.body;
    const newSkill = new Skill({ name, description, icon, level, proficiency, tags });
    await newSkill.save();
    res.json(newSkill);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create skill' });
  }
});

app.delete('/api/skills/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Skill.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete skill' });
  }
});

// Projects management API with MongoDB

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: 1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', requireAuth, async (req, res) => {
  try {
    const { name, description, github, image, size, tags } = req.body;
    const newProject = new Project({ name, description, github, image, size, tags });
    await newProject.save();
    res.json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.delete('/api/projects/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Gallery settings API

app.get('/api/gallery-settings', async (req, res) => {
  try {
    let settings = await GallerySettings.findOne();
    if (!settings) {
      settings = new GallerySettings({ speed: 3, transition: 'fade', autoplay: true });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gallery settings' });
  }
});

app.post('/api/gallery-settings', requireAuth, async (req, res) => {
  try {
    const { speed, transition, autoplay } = req.body;
    let settings = await GallerySettings.findOne();
    if (!settings) {
      settings = new GallerySettings({ speed, transition, autoplay });
    } else {
      settings.speed = speed;
      settings.transition = transition;
      settings.autoplay = autoplay;
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save gallery settings' });
  }
});

// Profile management API
app.get('/api/profile', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile({
        name: 'S K Ismail',
        title: 'AIML Engineer | Python Developer | Full Stack Developer',
        bio: '',
        image: '',
        location: 'India',
        email: '',
        phone: ''
      });
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/profile', requireAuth, async (req, res) => {
  try {
    const { name, title, bio, image, location, email, phone } = req.body;
    let profile = await Profile.findOne();
    if (!profile) {
      profile = new Profile({ name, title, bio, image, location, email, phone });
    } else {
      profile.name = name;
      profile.title = title;
      profile.bio = bio;
      profile.image = image;
      profile.location = location;
      profile.email = email;
      profile.phone = phone;
    }
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// About section API
app.get('/api/about', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About({ welcome: '', me: '', highlights: '' });
      await about.save();
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch about' });
  }
});

app.post('/api/about', requireAuth, async (req, res) => {
  try {
    const { welcome, me, highlights } = req.body;
    let about = await About.findOne();
    if (!about) {
      about = new About({ welcome, me, highlights });
    } else {
      about.welcome = welcome;
      about.me = me;
      about.highlights = highlights;
    }
    await about.save();
    res.json(about);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save about' });
  }
});

// Social links API
app.get('/api/social', async (req, res) => {
  try {
    let social = await Social.findOne();
    if (!social) {
      social = new Social({
        linkedin: '',
        github: '',
        twitter: '',
        instagram: '',
        facebook: '',
        youtube: ''
      });
      await social.save();
    }
    res.json(social);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch social' });
  }
});

app.post('/api/social', requireAuth, async (req, res) => {
  try {
    const { linkedin, github, twitter, instagram, facebook, youtube } = req.body;
    let social = await Social.findOne();
    if (!social) {
      social = new Social({ linkedin, github, twitter, instagram, facebook, youtube });
    } else {
      social.linkedin = linkedin;
      social.github = github;
      social.twitter = twitter;
      social.instagram = instagram;
      social.facebook = facebook;
      social.youtube = youtube;
    }
    await social.save();
    res.json(social);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save social' });
  }
});

// Theme settings API
app.get('/api/theme', async (req, res) => {
  try {
    let theme = await Theme.findOne();
    if (!theme) {
      theme = new Theme({
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#0f0c29',
        font: "'Segoe UI', sans-serif",
        animations: true,
        darkMode: true
      });
      await theme.save();
    }
    res.json(theme);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

app.post('/api/theme', requireAuth, async (req, res) => {
  try {
    const { primary, secondary, background, font, animations, darkMode } = req.body;
    let theme = await Theme.findOne();
    if (!theme) {
      theme = new Theme({ primary, secondary, background, font, animations, darkMode });
    } else {
      theme.primary = primary;
      theme.secondary = secondary;
      theme.background = background;
      theme.font = font;
      theme.animations = animations;
      theme.darkMode = darkMode;
    }
    await theme.save();
    res.json(theme);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save theme' });
  }
});

// Certificate management API with MongoDB
app.get('/api/certificates', async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ order: 1, createdAt: 1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

app.post('/api/certificates', requireAuth, async (req, res) => {
  try {
    const { filename, description } = req.body;
    const newCertificate = new Certificate({ filename, description });
    await newCertificate.save();
    res.json({ success: true, certificate: newCertificate });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

app.delete('/api/certificates/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Certificate.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete certificate' });
  }
});

// Search functionality with MongoDB
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ skills: [], certificates: [] });
    
    const searchRegex = new RegExp(q, 'i');
    
    const matchingSkills = await Skill.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    });
    
    const matchingCertificates = await Certificate.find({
      $or: [
        { filename: searchRegex },
        { description: searchRegex }
      ]
    });
    
    res.json({ skills: matchingSkills, certificates: matchingCertificates });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Authentication routes with fallback
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let user = null;

    try {
      // Try MongoDB first - search by both username and email
      user = await User.findOne({
        $or: [
          { username: username },
          { email: username }
        ]
      });
      if (user && (await user.comparePassword(password))) {
        req.session.user = {
          id: user._id,
          username: user.username,
          role: user.role
        };
        return res.json({
          success: true,
          user: { username: user.username, role: user.role }
        });
      }
    } catch (dbError) {
      console.log('MongoDB login failed, trying in-memory');
    }

    // Fallback to in-memory - search by both username and email
    const bcrypt = require('bcryptjs');
    user = inMemoryUsers.find(u => u.username === username || u.email === username);
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.user = {
        id: user._id,
        username: user.username,
        role: user.role
      };
      return res.json({
        success: true,
        user: { username: user.username, role: user.role }
      });
    }

    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Change password route
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    try {
      // Try MongoDB first
      const user = await User.findById(userId);
      if (user && (await user.comparePassword(currentPassword))) {
        user.password = newPassword;
        await user.save();
        return res.json({ success: true, message: 'Password updated successfully' });
      }
    } catch (dbError) {
      console.log('MongoDB password change failed, trying in-memory');
    }
    
    // Fallback to in-memory
    const bcrypt = require('bcryptjs');
    const userIndex = inMemoryUsers.findIndex(u => u._id === userId);
    if (userIndex !== -1) {
      const user = inMemoryUsers[userIndex];
      if (await bcrypt.compare(currentPassword, user.password)) {
        user.password = await bcrypt.hash(newPassword, 12);
        return res.json({ success: true, message: 'Password updated successfully' });
      }
    }
    
    res.status(401).json({ error: 'Current password is incorrect' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
});

// Change username route
app.post('/api/auth/change-username', requireAuth, async (req, res) => {
  try {
    const { newUsername, password } = req.body;
    const userId = req.session.user.id;
    
    if (!newUsername || !password) {
      return res.status(400).json({ error: 'New username and password are required' });
    }
    
    if (newUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    try {
      // Check if username already exists in MongoDB
      const existingUser = await User.findOne({ username: newUsername, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Try MongoDB first
      const user = await User.findById(userId);
      if (user && (await user.comparePassword(password))) {
        user.username = newUsername;
        await user.save();
        req.session.user.username = newUsername;
        return res.json({ success: true, message: 'Username updated successfully' });
      }
    } catch (dbError) {
      console.log('MongoDB username change failed, trying in-memory');
    }
    
    // Fallback to in-memory
    const bcrypt = require('bcryptjs');
    
    // Check if username exists in memory
    const existingInMemory = inMemoryUsers.find(u => u.username === newUsername && u._id !== userId);
    if (existingInMemory) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    const userIndex = inMemoryUsers.findIndex(u => u._id === userId);
    if (userIndex !== -1) {
      const user = inMemoryUsers[userIndex];
      if (await bcrypt.compare(password, user.password)) {
        user.username = newUsername;
        req.session.user.username = newUsername;
        return res.json({ success: true, message: 'Username updated successfully' });
      }
    }
    
    res.status(401).json({ error: 'Password is incorrect' });
  } catch (error) {
    console.error('Username change error:', error);
    res.status(500).json({ error: 'Username change failed' });
  }
});

// File upload routes
app.post('/api/upload/certificate', requireAuth, upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const certificate = new Certificate({
      filename: req.file.filename,
      originalName: req.file.originalname,
      description: req.body.description || ''
    });
    
    await certificate.save();
    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.post('/api/upload/project-image', requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({ 
      success: true, 
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/images/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get contacts for admin
app.get('/api/contacts', requireAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Update contact status
app.patch('/api/contacts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await Contact.findByIdAndUpdate(id, { status });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Mark contact as read
app.put('/api/contacts/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndUpdate(id, { status: 'read' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark contact as read' });
  }
});

// Delete contact
app.delete('/api/contacts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Resume download tracking with MongoDB
app.post('/api/resume-download', async (req, res) => {
  try {
    const download = new ResumeDownload({
      ip: req.ip || req.connection.remoteAddress
    });
    
    await download.save();
    console.log('Resume downloaded:', download._id);
    res.json({ success: true });
  } catch (error) {
    console.error('Resume download tracking error:', error);
    res.status(500).json({ error: 'Failed to track download' });
  }
});

// In-memory fallback storage
let inMemoryUsers = [];
let inMemoryContacts = [];
let inMemoryVisitors = [];
let inMemoryProjectViews = {};
let inMemorySkills = [
  { _id: '1', name: 'AI Development', description: 'Python, Pandas, NumPy, Excel, Kaggle, Hugging Face, scikit-learn, Google Colab, Blackbox AI, ChatGPT', icon: 'fas fa-paint-brush' },
  { _id: '2', name: 'Data Science', description: 'Python, Pandas, NumPy, Excel, WEKA, Tableau, GPT Excel, Blackbox AI, ChatGPT, Gemini', icon: 'fas fa-chart-line' },
  { _id: '3', name: 'Web Development', description: 'HTML, CSS, JavaScript, PHP, MySQL, Python, AngularJS, MS Access, Blackbox AI', icon: 'fas fa-code' }
];
let inMemoryCertificates = [];

// Create default admin user
async function createDefaultAdmin() {
  try {
    // Try MongoDB first
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const defaultAdmin = new User({
        username: 'skismail57',
        email: 'skportfolio57@gmail.com',
        phone: '+918904851665',
        password: 'Ismail-Portfolio@57',
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log('Default admin user created in MongoDB: skismail57/Ismail-Portfolio@57');
    }
  } catch (error) {
    console.log('MongoDB not available, using in-memory admin');
    // Fallback to in-memory
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Ismail-Portfolio@57', 12);
    inMemoryUsers.push({
      _id: 'admin1',
      username: 'skismail57',
      email: 'skportfolio57@gmail.com',
      phone: '+918904851665',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('In-memory admin user created: skismail57/Ismail-Portfolio@57');
  }
}

// Health check endpoint
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Email
async function sendEmailOTP(email, otp, username) {
  try {
    // Always show console OTP first
    console.log(`\n=== EMAIL OTP ALERT ===`);
    console.log(`📧 Email: ${email}`);
    console.log(`👤 User: ${username}`);
    console.log(`🔢 OTP Code: ${otp}`);
    console.log(`⏰ Valid for: 10 minutes`);
    console.log(`===================\n`);

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'temp-password') {
      console.log('⚠️  NOTE: Email service not configured properly. Using console OTP above.');
      return;
    }

    console.log('📤 Attempting to send email...');
    
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Test connection first
    await transporter.verify();
    console.log('✅ Gmail connection verified');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Portfolio Admin',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a66c2;">Password Reset Request</h2>
          <p>Hello <strong>${username}</strong>,</p>
          <p>You requested a password reset for your admin account. Use the OTP below:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #0a66c2; font-size: 32px; margin: 0;">${otp}</h1>
          </div>
          <p><strong>This OTP will expire in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Portfolio Admin System</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP sent successfully to ${email}`);
    console.log(`📧 Message ID: ${result.messageId}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    console.log('📱 Using console OTP above as fallback');
    // Don't throw error, just use console fallback
  }
}

// Send OTP via SMS (placeholder - requires SMS service like Twilio)
async function sendSMSOTP(phone, otp, username) {
  // This is a placeholder. In production, integrate with SMS service like Twilio
  console.log(`\n=== SMS OTP ALERT ===`);
  console.log(`📱 Phone: ${phone}`);
  console.log(`👤 User: ${username}`);
  console.log(`🔢 OTP Code: ${otp}`);
  console.log(`⏰ Valid for: 10 minutes`);
  console.log(`===================\n`);
  console.log('⚠️  NOTE: SMS service not configured. Use the OTP code above from console.');
}

// Forgot password - initiate reset
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { identifier, method } = req.body; // identifier can be username, email, or phone
    
    if (!identifier || !method) {
      return res.status(400).json({ error: 'Identifier and method are required' });
    }
    
    let user = null;
    
    try {
      // Try MongoDB first
      user = await User.findOne({
        $or: [
          { username: identifier },
          { email: identifier },
          { phone: identifier }
        ]
      });
    } catch (dbError) {
      console.log('MongoDB search failed, trying in-memory');
      // Fallback to in-memory
      user = inMemoryUsers.find(u => 
        u.username === identifier || 
        u.email === identifier || 
        u.phone === identifier
      );
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    try {
      // Try MongoDB first
      if (user._id && typeof user._id === 'object') {
        await User.findByIdAndUpdate(user._id, {
          resetOTP: otp,
          resetOTPExpiry: otpExpiry,
          resetMethod: method
        });
      }
    } catch (dbError) {
      // Update in-memory user
      const userIndex = inMemoryUsers.findIndex(u => u._id === user._id);
      if (userIndex !== -1) {
        inMemoryUsers[userIndex].resetOTP = otp;
        inMemoryUsers[userIndex].resetOTPExpiry = otpExpiry;
        inMemoryUsers[userIndex].resetMethod = method;
      }
    }
    
    // Send OTP based on method
    try {
      if (method === 'email') {
        await sendEmailOTP(user.email, otp, user.username);
      } else if (method === 'phone') {
        await sendSMSOTP(user.phone, otp, user.username);
      }
      
      // Return JSON response with email for redirect
      res.json({ 
        success: true, 
        message: `OTP sent to your ${method}`,
        method: method,
        email: user.email,
        maskedContact: method === 'email' 
          ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
          : user.phone.replace(/(\+\d{2})(\d{4})(\d{4})/, '$1****$3')
      });
    } catch (error) {
      console.error('OTP sending failed:', error);
      // Still return success since OTP is shown in console
      res.json({ 
        success: true, 
        message: `OTP displayed in server console (${method} service not configured)`,
        method: method,
        email: user.email,
        maskedContact: method === 'email' 
          ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
          : user.phone.replace(/(\+\d{2})(\d{4})(\d{4})/, '$1****$3')
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    
    if (!identifier || !otp) {
      return res.status(400).json({ error: 'Identifier and OTP are required' });
    }
    
    let user = null;
    
    try {
      // Try MongoDB first
      user = await User.findOne({
        $or: [
          { username: identifier },
          { email: identifier },
          { phone: identifier }
        ],
        resetOTP: otp,
        resetOTPExpiry: { $gt: new Date() }
      });
      
      if (user) {
        return res.json({ success: true, message: 'OTP verified successfully' });
      }
    } catch (dbError) {
      console.log('MongoDB OTP verification failed, trying in-memory');
    }
    
    // Fallback to in-memory
    const userIndex = inMemoryUsers.findIndex(u => 
      (u.username === identifier || u.email === identifier || u.phone === identifier) &&
      u.resetOTP === otp &&
      u.resetOTPExpiry && new Date(u.resetOTPExpiry) > new Date()
    );
    
    if (userIndex !== -1) {
      return res.json({ success: true, message: 'OTP verified successfully' });
    }
    
    res.status(400).json({ error: 'Invalid or expired OTP' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// Verify OTP and reset password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    let user = null;
    
    try {
      // Try MongoDB first
      user = await User.findOne({
        $or: [
          { username: identifier },
          { email: identifier },
          { phone: identifier }
        ],
        resetOTP: otp,
        resetOTPExpiry: { $gt: new Date() }
      });
      
      if (user) {
        user.password = newPassword;
        user.resetOTP = null;
        user.resetOTPExpiry = null;
        user.resetMethod = null;
        await user.save();
        return res.json({ success: true, message: 'Password reset successfully' });
      }
    } catch (dbError) {
      console.log('MongoDB reset failed, trying in-memory');
    }
    
    // Fallback to in-memory
    const bcrypt = require('bcryptjs');
    const userIndex = inMemoryUsers.findIndex(u => 
      (u.username === identifier || u.email === identifier || u.phone === identifier) &&
      u.resetOTP === otp &&
      u.resetOTPExpiry && new Date(u.resetOTPExpiry) > new Date()
    );
    
    if (userIndex !== -1) {
      inMemoryUsers[userIndex].password = await bcrypt.hash(newPassword, 12);
      inMemoryUsers[userIndex].resetOTP = null;
      inMemoryUsers[userIndex].resetOTPExpiry = null;
      inMemoryUsers[userIndex].resetMethod = null;
      return res.json({ success: true, message: 'Password reset successfully' });
    }
    
    res.status(400).json({ error: 'Invalid or expired OTP' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await createDefaultAdmin();
});
