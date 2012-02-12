# -*- coding: utf-8 -*-
from google.appengine.api import users
from google.appengine.ext import db

class Users(db.Model):
	name = db.StringProperty()
	email = db.UserProperty()

class News(db.Model):
	name = db.StringProperty()
	text = db.TextProperty()
	date = db.DateTimeProperty()
	
class Comments(db.Model):
	user = db.TextProperty()
	text = db.TextProperty()
	date = db.DateTimeProperty()
	
class GHQuery(db.Model):
	query = db.StringProperty()
	type = db.StringProperty()
