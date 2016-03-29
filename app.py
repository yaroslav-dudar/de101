# -*- coding: utf-8 -*-

from flask import Flask, jsonify, render_template, url_for
from pymongo import MongoClient

from bson import json_util
import json
import os

import pycountry
import facebook

from grabber import Grabber


app = Flask(__name__)

client = MongoClient('localhost', 27017)
db = client.DE101 # connect to DE101 


@app.route("/api/fb/<page_id>", methods=['GET'])
def fb_page_get(page_id):
    fb_page = db.fb_page.find_one({"page_id": int(page_id)})

    if not fb_page:
        return jsonify(**{"error": {"message": "Page not exist."}})

    funs_by_region = {}
    for iso_3166_alpha2, count in fb_page['funs_by_region']['value'].iteritems():
        funs_by_region[int(pycountry.countries.get(alpha2=iso_3166_alpha2).numeric)] = count
    
    fb_page['funs_by_region']['value'] = funs_by_region
    fb_page_json = json.dumps(fb_page, default=json_util.default)

    return jsonify(**{"data": json.loads(fb_page_json)})


@app.route("/api/fb/<page_id>", methods=['POST'])
def fb_page_post(page_id):
    app_id = '481658928680227'
    app_secret = '77cde26a4e23cd4742f7dd0fd302029d'
    grabber = Grabber(app_id, app_secret, page_id)

    try:
        funs_by_region = grabber.get_page_fans_by_country()
        posts = grabber.get_last_10_posts()
    except facebook.GraphAPIError:
        return jsonify(**{"status": "fail"})

    fb_page_data = {
        "page_id": page_id,
        "posts": posts,
        "funs_by_region": funs_by_region
    }

    db.fb_page.update({"page_id": page_id}, fb_page_data, upsert=True)
    return jsonify(**{"status": "ok"})


@app.route("/api/gdp/", methods=['GET'])
def gdp_get():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    gdp = open(os.path.join(BASE_DIR, 'static/assets/gdp', 'gdp_data.json'))

    countries = json.load(gdp)['countries']
    counties_id = {}

    for key, value in countries.iteritems():
        counties_id[int(pycountry.countries.get(alpha2=key).numeric)] = value

    return jsonify(**{'countries': counties_id})


@app.route("/")
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)
