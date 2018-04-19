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
    })
    .when('/search', {
        templateUrl: 'place-search.html',
        controller: "PlaceSearchController"
    });
});
app.controller('PlacesController', function($scope, $resource, $location) {
    var Place = $resource("../places", {}, {});
    $scope.list = function(){
        Place.query(function(data){
            setPlacesToScope($scope, data);
        }, function(error){
            alert(error.data);
        });
    };
    $scope.showPlace = function(id) {
        $location.path("/places/" + id);
    };
    $scope.goToSearch = function() {
        $location.path("/places/" + id);f
    }
    $scope.list();
});
app.controller('PlaceDetailController', function($scope, $resource, $location) {
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
app.controller('PlaceSearchController', function($scope, $http, $location) {
    $scope.search = function() {
        var purposeParam = getDropdownValue($("#purpose"));
        var typeParam = getDropdownValue($("#type"));
        var locationParam = getDropdownValue($("#location"));
        var roomsParam = getDropdownValue($("#rooms"));
        var floorParam = getDropdownValue($("#floor"));
        var minAreaParam = getTextValue($("#minArea"));
        var maxAreaParam = getTextValue($("#maxArea"));
        var minPriceParam = getTextValue($("#minPrice"));
        var maxPriceParam = getTextValue($("#maxPrice"));
        $http({
            method: 'GET',
            url: '../places',
            params: {
                purpose: purposeParam,
                type: typeParam,
                location: locationParam,
                rooms: roomsParam,
                floor: floorParam,
                minArea: minAreaParam,
                maxArea: maxAreaParam,
                minPrice: minPriceParam,
                maxPrice: maxPriceParam
            }
          }).then(function successCallback(response) {
              setPlacesToScope($scope, response.data);
          }, function errorCallback(response) {
              alert(error.data);
          });
    };
    $scope.showPlace = function(id) {
        $location.path("/places/" + id);
    };
});

function getTextValue(textInput) {
    if (!textInput.val().trim()) {
        return null;
    }
    return textInput.val();
}

function getDropdownValue(dropDown) {
    if (dropDown.val() === "all") {
        return null;
    }
    return dropDown.val();
}

function setPlacesToScope(scope, data) {
    scope.places = [];
    subPlaces = [];
    for (i = 0; i < data.length; i++) {
        subPlaces.push(data[i]);
        if (subPlaces.length == 3) {
            scope.places.push(subPlaces);
            subPlaces = [];
        }
    }
    if (subPlaces.length > 0) {
        scope.places.push(subPlaces);
    }
}