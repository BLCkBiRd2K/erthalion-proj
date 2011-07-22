import cgi
import os

from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db

types=["devices_and_cameras","error","interesting_directories","interesting_info","login_pages","misc","network_or_vulnerability_data","passwords_and_usernames","sql_injection_list","vulnerabilities","vulnerable_systems","webserver_banners"]

class Greeting(db.Model):   
    author = db.UserProperty()
    content = db.StringProperty(multiline=True)
    date = db.DateTimeProperty(auto_now_add=True)

class GHQuery(db.Model):
	query = db.StringProperty()
	type = db.StringProperty()

class GetType(webapp.RequestHandler):
	def get(self):
		self.response.out.write("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
		self.response.out.write("<types>\n")
		for type in types:
			self.response.out.write("<type name=\""+type+"\">\n")

		self.response.out.write("</types>\n")
		

class GetGH(webapp.RequestHandler):
	def get(self):
		type = self.request.get("type","")
		resp+="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
		resp+="<requests name=\""+type+"\">\n"
		temp = db.GqlQuery("SELECT * FROM GHQuery WHERE type = :1",type)
		for q in temp:
			resp+="<hack type=\"error\">"+q.query+"</hack>\n"
			
		resp+="</requests>"
		self.response.headers['Content-type'] = 'text/xml'                     
        self.response.headers['Content-length'] = "%d"%len(resp)               
        self.response.out.write(rstr)
        
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
         

class MainPage(webapp.RequestHandler):
    def get(self):
    
        template_values = {
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
                                      ('/osmosis', Osmosis),
                                      #('/ghdb', GHDB),
									  #('/ghdbbytype', GHDBbyType),
                                      #('/delbytype', DelbyType),
                                      ('/getgh', GetGH),
                                      #('/del', Del),
                                      ('/gettypes', GetType)],
                                     debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
