angular.module("app", ["d3-chart"])
    .controller("Dashboard", function($scope, $http) {
        $scope.get_page = function(page_id) {
            return $http.get("/api/fb/" + page_id)
                .then(function(response) {
                    $scope.fb_page = response.data.data;
                });
        }

        $scope.get_gdp = function() {
            return $http.get("/api/gdp/")
                .then(function(response) {
                    $scope.gdp = response.data;
                });
        }

        $scope.get_country_likes_class = function(likes, max_likes) {
            var interval = Math.floor(likes / (max_likes / 5.0));
            if(interval > 4) return 4;
            return interval;
        }

        $scope.get_country_gdp_class = function(gdp, max_likes) {
            var gdp_class;
            switch(true) {
                case gdp < 10:
                    gdp_class = 0;break;
                case gdp < 25:
                    gdp_class = 1;break;
                case gdp < 50:
                    gdp_class = 2;break;
                case gdp < 100:
                    gdp_class = 3;break;
                case gdp < 200:
                    gdp_class = 4;break;
                case gdp < 500:
                    gdp_class = 5;break;
                case gdp < 2500:
                    gdp_class = 6;break;
                case true:
                    gdp_class = 7;break;
            }
            return gdp_class;
        }

        $scope.get_max_value_by_region = function(region) {
            /*
                Input - {'region_id': value,...}
            */
            var max = -1;
            for (var key in region) {
                if(region[key] > max) {
                    max = region[key];
                }
            }
            return max;
        }

        $scope.max_likes_by_class = function(id, max_likes) {
            /*
                Input: id = [0,1,2,3,4]
            */
            return parseInt(max_likes / (5 - id));
        }
    })
    .directive('currentTime', function(dateFilter) {
        return function(scope, element, attrs) {
            function updateTime(){
                var dt = dateFilter(new Date(), 'yyyy-MM-dd HH:mm:ss');
                element.text(dt);
            }
            
            function updateLater() {
                setTimeout(function() {
                    updateTime(); // update DOM
                    updateLater(); // schedule another update
                }, 1000);
            }
            
            updateLater();

        }
    })
