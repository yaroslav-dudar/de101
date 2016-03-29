import pymongo

from grabber import Grabber

from pymongo import MongoClient
client = MongoClient('localhost', 27017) # connect to mongoDb server

db = client.DE101 # connect to db_name: DE101

natgeo_page_id = 23497828950 # https://www.facebook.com/natgeo
app_id = '481658928680227'
app_secret = '77cde26a4e23cd4742f7dd0fd302029d'

grabber = Grabber(app_id, app_secret, natgeo_page_id)

funs_by_region = grabber.get_page_fans_by_country()
posts = grabber.get_last_10_posts()

fb_page_data = {
    "page_id": natgeo_page_id,
    "posts": posts,
    "funs_by_region": funs_by_region
}

db.fb_page.update({"page_id": natgeo_page_id}, fb_page_data, upsert=True)
