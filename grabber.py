import facebook

class Grabber(object):
    def __init__(self, app_id, app_secret, page_id):
        self.page_id = page_id

        self.access_token = 'CAACEdEose0cBAE6lQ2yRZClqFboixASt6f9iYZCpQ9MZCu4b2BZAIa9HcVaB1z5wyM3qMg6shkXlHB8vCsLUURt3yKUK4T8m5REVHKXTCZAboDZCoNPzHPB4ISHE4IZAFghNbFv299GSZCZCuZAOZBtRNyDQJkpvOTblHp0M8susl2JomFzmIquR4Fw0fq2wlsKE73MArJwPHl7Yd7Q0Nt7nHLH'
        self.graph = facebook.GraphAPI(access_token=self.access_token)

        self.page_fans_country_query = '/%s/insights/page_fans_country/lifetime/' % self.page_id

    def get_page_fans_by_country(self):
        data = self.graph.get_object(self.page_fans_country_query)
        if data['data']:
            return data['data'][0]['values'][0]

    def get_app_access_token(self, app_id, app_secret):
        return facebook.GraphAPI().get_app_access_token(app_id, app_secret)

    def get_last_10_posts(self):
        fields = {
            'fields': 'feed.limit(10){likes.summary(true).limit(0),created_time,comments.limit(0).summary(true),shares}'
        }
        feed = self.graph.get_object('/%s' % self.page_id, **fields)

        # remove pagination etc
        posts = []
        for post in feed['feed']['data']:
            posts.append({
                'likes': post['likes']['summary']['total_count'],
                'post_id': post['id'],
                'time': post['created_time'],
                'shares': self.get_post_shares(post),
                'comments': post['comments']['summary']['total_count']
            })

        return posts

    def get_post_shares(self, post):
        """
            Fetch shares from post if exist else return 0
        """
        if 'shares' in post:
            return post['shares']['count']
        return 0

if __name__ == '__main__':
    natgeo_page_id = '23497828950' # https://www.facebook.com/natgeo

    app_id = '481658928680227'
    app_secret = '77cde26a4e23cd4742f7dd0fd302029d'

    grabber = Grabber(app_id, app_secret, natgeo_page_id)
    print grabber.get_page_fans_by_country()
    print grabber.get_last_10_posts()
