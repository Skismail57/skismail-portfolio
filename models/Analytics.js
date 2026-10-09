const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: String,
  userAgent: String,
  location: {
    country: String,
    city: String
  },
  path: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const projectViewSchema = new mongoose.Schema({
  projectId: String,
  views: {
    type: Number,
    default: 0
  },
  lastViewed: {
    type: Date,
    default: Date.now
  }
});

const resumeDownloadSchema = new mongoose.Schema({
  ip: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'fas fa-code'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  proficiency: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  tags: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const certificateSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: String,
  description: String,
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  github: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium'
  },
  tags: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const gallerySettingsSchema = new mongoose.Schema({
  speed: {
    type: Number,
    default: 3,
    min: 1,
    max: 10
  },
  transition: {
    type: String,
    enum: ['fade', 'slide', 'zoom'],
    default: 'fade'
  },
  autoplay: {
    type: Boolean,
    default: true
  }
});

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'S K Ismail'
  },
  title: {
    type: String,
    default: 'AIML Engineer | Python Developer | Full Stack Developer'
  },
  bio: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'India'
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  }
});

const aboutSchema = new mongoose.Schema({
  welcome: {
    type: String,
    default: ''
  },
  me: {
    type: String,
    default: ''
  },
  highlights: {
    type: String,
    default: ''
  }
});

const socialSchema = new mongoose.Schema({
  linkedin: {
    type: String,
    default: ''
  },
  github: {
    type: String,
    default: ''
  },
  twitter: {
    type: String,
    default: ''
  },
  instagram: {
    type: String,
    default: ''
  },
  facebook: {
    type: String,
    default: ''
  },
  youtube: {
    type: String,
    default: ''
  }
});

const themeSchema = new mongoose.Schema({
  primary: {
    type: String,
    default: '#667eea'
  },
  secondary: {
    type: String,
    default: '#764ba2'
  },
  background: {
    type: String,
    default: '#0f0c29'
  },
  font: {
    type: String,
    default: "'Segoe UI', sans-serif"
  },
  animations: {
    type: Boolean,
    default: true
  },
  darkMode: {
    type: Boolean,
    default: true
  }
});

const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  description: {
    type: String,
    default: ''
  },
  skills: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const downloadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['resume', 'portfolio', 'cv', 'other'],
    default: 'other'
  },
  url: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const emailTemplateSchema = new mongoose.Schema({
  otpSubject: {
    type: String,
    default: 'Password Reset OTP'
  },
  otpBody: {
    type: String,
    default: 'Your OTP is {{otp}}'
  },
  contactSubject: {
    type: String,
    default: 'New Contact Message'
  },
  contactBody: {
    type: String,
    default: 'New message from {{name}}: {{message}}'
  }
});

const maintenanceSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['on', 'off'],
    default: 'off'
  },
  message: {
    type: String,
    default: ''
  }
});

module.exports = {
  Visitor: mongoose.model('Visitor', visitorSchema),
  ProjectView: mongoose.model('ProjectView', projectViewSchema),
  ResumeDownload: mongoose.model('ResumeDownload', resumeDownloadSchema),
  Skill: mongoose.model('Skill', skillSchema),
  Certificate: mongoose.model('Certificate', certificateSchema),
  Project: mongoose.model('Project', projectSchema),
  GallerySettings: mongoose.model('GallerySettings', gallerySettingsSchema),
  Profile: mongoose.model('Profile', profileSchema),
  About: mongoose.model('About', aboutSchema),
  Social: mongoose.model('Social', socialSchema),
  Theme: mongoose.model('Theme', themeSchema),
  Experience: mongoose.model('Experience', experienceSchema),
  Download: mongoose.model('Download', downloadSchema),
  EmailTemplate: mongoose.model('EmailTemplate', emailTemplateSchema),
  Maintenance: mongoose.model('Maintenance', maintenanceSchema)
};
