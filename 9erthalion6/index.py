# -*- coding: utf-8 -*-
import cgi
import os

from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db

types=["devices_and_cameras","error","interesting_directories","interesting_info","login_pages","misc","network_or_vulnerability_data","passwords_and_usernames","sql_injection_list","vulnerabilities","vulnerable_systems","webserver_banners"]

class Users(db.Model):
	name = db.StringProperty()
	email = db.UserProperty()

class News(db.Model):
	name = db.StringProperty()
	text = db.TextProperty()
	date = db.DateTimeProperty()
	
class Comments(db.Model):
	user = db.StringProperty()
	text = db.TextProperty()
	date = db.DateTimeProperty()
	
class GHQuery(db.Model):
	query = db.StringProperty()
	type = db.StringProperty()

class GetType(webapp.RequestHandler):
	def get(self):
		response="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		response+="<types>\n"
		for type in types:
			response+="<type name=\""+type+"\"></type>\n"

		response+="</types>\n"
		self.response.headers['Content-type'] = 'text/xml'                     
		self.response.headers['Content-length'] = len(response)               
		self.response.out.write(response)

class GetGH(webapp.RequestHandler):
	def get(self):
		type = self.request.get("type","")
		response="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		response+="<requests name=\""+type+"\">\n"
		temp = db.GqlQuery("SELECT * FROM GHQuery WHERE type = :1",type)
		for q in temp:
			response+="<hack type=\""+type+"\">"+cgi.escape(q.query)+"</hack>\n"

		response+="</requests>"
		self.response.headers['Content-type'] = 'text/xml'                     
		self.response.headers['Content-length'] = len(response)               
		self.response.out.write(response)
		
class GHDB(webapp.RequestHandler):
	def get(self):
		for type in types:
			try:
				dbH=open("db/"+type+".txt","r")
				dbH = [x.strip() for x in dbH]
				self.response.out.write("<p>"+type+"</p>")
			except:
				dbH = []
			for q in dbH:
				hack = GHQuery()
				hack.query = q.decode('utf-8')
				hack.type = type
				hack.put()

class GHDBbyType(webapp.RequestHandler):
	def get(self):
		type = self.request.get("type","")
		try:
			dbH=open("db/"+type+".txt","r")
			dbH = [x.strip() for x in dbH]
		except:
			dbH = []
		for q in dbH:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = type
			hack.put()

class DelbyType(webapp.RequestHandler):
	def get(self):
		type = self.request.get("type","")
		requests = db.GqlQuery("SELECT * FROM GHQuery WHERE type=:1",type)
		db.delete(requests)

class Del(webapp.RequestHandler):
	def get(self):
		requests = db.GqlQuery("SELECT * FROM GHQuery")
		db.delete(requests)

class Osmosis(webapp.RequestHandler):
    def get(self):
        template_values = {
          }
    
        path = os.path.join(os.path.dirname(__file__), 'osmosis.html')
        self.response.out.write(template.render(path, template_values))

class Commentary(webapp.RequestHandler):
	def post(self):
		comment = Comments()
		comment.text = self.request.get("text")
		comment.user = self.request.get("name")
		
		comment.put()
		self.redirect("/comments")

	def get(self):
		comment_query = Comments.all().order('-date')
		comments = comment_query.fetch(10)

		template_values = {
			'comments':comments
		}
		
		path = os.path.join(os.path.dirname(__file__), 'comments.html')
		self.response.out.write(template.render(path, template_values))

class MainPage(webapp.RequestHandler):
    def get(self):
		news_query = News.all().order('-date')
		news = news_query.fetch(10)		

		template_values = {
			'news':news,
			}

		path = os.path.join(os.path.dirname(__file__), 'index.html')
		self.response.out.write(template.render(path, template_values))

class Video(webapp.RequestHandler):
	def get(self):
		template_values = {
			}

		path = os.path.join(os.path.dirname(__file__), 'video.html')
		self.response.out.write(template.render(path, template_values))


application = webapp.WSGIApplication(
									[('/', MainPage),
									('/osmosis', Osmosis),
									#('/ghdb', GHDB),
									#('/ghdbbytype', GHDBbyType),
									#('/delbytype', DelbyType),
									('/getgh', GetGH),
									#('/del', Del),
									('/gettypes', GetType),
									('/video', Video),
									('/comments',Commentary)],
									debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
