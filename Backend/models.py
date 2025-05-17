from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    email = db.Column(db.String)
    phone = db.Column(db.String, nullable=True)

    skills = db.relationship('Skill', backref='profile', cascade="all, delete-orphan")
    work_experiences = db.relationship('WorkExperience', backref='profile', cascade="all, delete-orphan")
    education = db.relationship('Education', backref='profile', cascade="all, delete-orphan")
    projects = db.relationship('Project', backref='profile', cascade="all, delete-orphan")
    links = db.relationship('Link', backref='profile', cascade="all, delete-orphan")

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    profile_id = db.Column(db.Integer, db.ForeignKey('user_profile.id'))

class WorkExperience(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    position = db.Column(db.String)
    company = db.Column(db.String)
    duration = db.Column(db.String)
    description = db.Column(db.Text)
    profile_id = db.Column(db.Integer, db.ForeignKey('user_profile.id'))

class Education(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    degree = db.Column(db.String)
    institution = db.Column(db.String)
    year = db.Column(db.String)
    profile_id = db.Column(db.Integer, db.ForeignKey('user_profile.id'))

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.Text)
    link = db.Column(db.String, nullable=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('user_profile.id'))

class Link(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String)
    profile_id = db.Column(db.Integer, db.ForeignKey('user_profile.id'))
