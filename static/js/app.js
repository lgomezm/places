var app = angular.module("PlacesApp", ["ngResource", "ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "places.html",
        controller: "PlacesController"
    })
    .when("/places", {
        templateUrl : "places.html",
        controller: "PlacesController"
    })
    .when('/places/:placeId', {
        templateUrl: 'place-detail.html',
        controller: "PlaceDetailController"
    });
});
app.controller('PlacesController', function($scope, $rootScope, $resource, $location) {
    var Place = $resource("../places", {}, {});
    $scope.list = function(){
        Place.query(function(data){
            $scope.places = [];
            subPlaces = [];
            for (i = 0; i < data.length; i++) {
                subPlaces.push(data[i]);
                if (subPlaces.length == 3) {
                    $scope.places.push(subPlaces);
                    subPlaces = [];
                }
            }
            if (subPlaces.length > 0) {
                $scope.places.push(subPlaces);
            }
        }, function(error){
            alert(error.data);
        });
    };
    $scope.showPlace = function(id) {
        $rootScope.placeId = id;
        $location.path("/places/" + id);
    };
    $scope.list();
});
app.controller('PlaceDetailController', function($scope, $rootScope, $resource, $location) {
    var Place = $resource("../places/:id", {id: '@id'}, {});
    $scope.show = function(theId){
        Place.get({id: theId}, function(data){
            $scope.place = data;
        });
    };
    $scope.prevPhoto = function() {
        $("#placeCarousel").carousel('prev');
    };
    $scope.nextPhoto = function() {
        $("#placeCarousel").carousel('next');
    };
    $("#placeCarousel").carousel();
    var path = $location.path();
    var id = path.substring(path.lastIndexOf('/') + 1);
    $scope.show(id);
});