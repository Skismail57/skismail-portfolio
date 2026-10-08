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

module.exports = {
  Visitor: mongoose.model('Visitor', visitorSchema),
  ProjectView: mongoose.model('ProjectView', projectViewSchema),
  ResumeDownload: mongoose.model('ResumeDownload', resumeDownloadSchema),
  Skill: mongoose.model('Skill', skillSchema),
  Certificate: mongoose.model('Certificate', certificateSchema),
  Project: mongoose.model('Project', projectSchema),
  GallerySettings: mongoose.model('GallerySettings', gallerySettingsSchema)
};
