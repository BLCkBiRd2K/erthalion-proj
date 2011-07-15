import cgi
import os

from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db

class Greeting(db.Model):   
    author = db.UserProperty()
    content = db.StringProperty(multiline=True)
    date = db.DateTimeProperty(auto_now_add=True)

class GHQuery(db.Model):
	query = db.StringProperty()
	type = db.StringProperty()

class GetGH(webapp.RequestHandler):
	def get(self):
		temp = db.GqlQuery("SELECT * FROM GHQuery WHERE type = :1","error")
		for q in temp:
			self.response.out.write(q.query)

class GHDB(webapp.RequestHandler):
	def get(self):
		try:
			db=open("db/devices_and_cameras.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "devices_and_cameras"
			hack.put()

		try:
			db=open("db/error.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "error"
			hack.put()

		try:
			db=open("db/interesting_directories.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "interesting_directories"
			hack.put()

		try:
			db=open("db/interesting_info.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "interesting_info"
			hack.put()

		try:
			db=open("db/login_pages.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "login_pages"
			hack.put()

		try:
			db=open("db/misc.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "mics"
			hack.put()

		try:
			db=open("db/network_or_vulnerability_data.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "network_or_vulnerability_data"
			hack.put()

		try:
			db=open("db/passwords_and_usernames.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "passwords_and_usernames"
			hack.put()

		try:
			db=open("db/sql_injection_list.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "sql_injection_list"
			hack.put()

		try:
			db=open("db/vulnerabilities.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "vulnerabilities"
			hack.put()

		try:
			db=open("db/vulnerable_systems.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "vulnerable_systems"
			hack.put()

		try:
			db=open("db/webserver_banners.txt","r")
			db = [x.strip() for x in db]
		except:
			db = []
		for q in db:
			hack = GHQuery()
			hack.query = q.decode('utf-8')
			hack.type = "webserver_banners"
			hack.put()

class Raphael(webapp.RequestHandler):
    def get(self):
        template_values = {
          }
    
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))
         

class MainPage(webapp.RequestHandler):
    def get(self):
        greetings_query = Greeting.all().order('-date')
        greetings = greetings_query.fetch(10)
    
        if users.get_current_user():
            url = users.create_logout_url(self.request.uri)
            url_linktext = 'Logout'
        else:
            url = users.create_login_url(self.request.uri)
            url_linktext = 'Login'
    
        template_values = {
          'greetings': greetings,
          'url': url,
          'url_linktext': url_linktext,
          }
    
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_values))
                        
class GuestBook(webapp.RequestHandler):
    def post(self):
        greeting = Greeting()
        
        if users.get_current_user():
            greeting.author=users.get_current_user()
        
        greeting.content=self.request.get('content')
        greeting.put();
        self.redirect('/')
        
application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/sign', GuestBook),
                                      ('/raphael', Raphael),
                                      ('/ghdb', GHDB),
                                      ('/getgh', GetGH)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
