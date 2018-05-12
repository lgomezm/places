var app = angular.module("PlacesApp", ["ngResource", "ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "views/home.htm",
        controller: "HomeController"
    })
    .when("/places", {
        templateUrl : "views/home.htm",
        controller: "HomeController"
    })
    .when('/places/create', {
        templateUrl: 'views/place-create.htm',
        controller: "CreatePlaceController"
    })
    .when('/places/:placeId', {
        templateUrl: 'views/place-detail.htm',
        controller: "PlaceDetailController"
    })
    .when('/search', {
        templateUrl: 'views/place-search.htm',
        controller: "PlaceSearchController"
    })
    .when('/login', {
        templateUrl: 'views/login.htm',
        controller: "LoginController"
    })
    .when('/admin', {
        templateUrl: 'views/admin.htm',
        controller: "AdminController"
    });
});
app.controller('HomeController', function($scope, $resource, $location) {
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
app.controller('LoginController', function($scope, $http, $location) {
    $("#password").keypress(function(event) {
        if (event.which == 13) {
            $scope.login();
        }
    });
    $scope.login = function() {
        $http({
            method: 'POST',
            url: '../login',
            data: {
                username: getTextValue($("#username")),
                password: getTextValue($("#password"))
            }
          }).then(function successCallback(response) {
              $location.path("/admin");
          }, function errorCallback(response) {
              alert(response.data);
          });
    };
});

app.controller('AdminController', function($scope, $http, $location) {
    $scope.isLoggedIn = function() {
        $http.get('../logged-in')
            .then(function successCallback(response) {}, 
                function errorCallback(response) {
                    $location.path("/login");
                });
    };
    $scope.isLoggedIn();
});

app.controller('CreatePlaceController', function($scope, $http, $location) {
    $scope.isLoggedIn = function() {
        $http.get('../logged-in')
            .then(function successCallback(response) {}, 
                function errorCallback(response) {
                    $location.path("/login");
                });
    };
    $scope.create = function() {
        
    };
    $('#saleCheckbox').change(function() {
        $("#salePrice").prop('readonly', !this.checked);
    });
    $('#rentCheckbox').change(function() {
        $("#rentPrice").prop('readonly', !this.checked);
    });
    $scope.isLoggedIn();
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