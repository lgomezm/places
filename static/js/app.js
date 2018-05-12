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
        var purposeParam = getDropdownValue($("#purpose"), "all");
        var typeParam = getDropdownValue($("#type"), "all");
        var locationParam = getDropdownValue($("#location"), "all");
        var roomsParam = getDropdownValue($("#rooms"), "all");
        var floorParam = getDropdownValue($("#floor"), "all");
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
        var place = {};
        var placeName = getTextValue($("#placeName"));
        if (placeName == null) {
            return;
        } else {
            place.name = placeName;
        }
        var type = getDropdownValue($("#type"), "0");
        if (type == null) {
            return;
        } else {
            place.type = type;
        }
        var placeDesc = getTextValue($("#placeDesc"));
        if (placeDesc == null) {
            return;
        } else {
            place.description = placeDesc;
        }
        var area = getTextValue($("#placeArea"));
        if (area == null) {
            return;
        } else {
            place.area = parseInt(area);
        }
        var floor = getTextValue($("#floor"));
        if (floor == null) {
            return;
        } else {
            place.floor = parseInt(floor);
        }
        var bathrooms = getTextValue($("#bathrooms"));
        if (bathrooms == null) {
            return;
        } else {
            place.bathrooms = parseInt(bathrooms);
        }
        var bedrooms = getTextValue($("#bedrooms"));
        if (bedrooms == null) {
            return;
        } else {
            place.bedrooms = parseInt(bedrooms);
        }
        var stratum = getDropdownValue($("#stratum"), "0");
        if (stratum == null) {
            return;
        } else {
            place.stratum = parseInt(stratum);
        }
        var parking = getTextValue($("#parking"));
        if (parking == null) {
            return;
        } else {
            place.parking = parseInt(parking);
        }
        place.purposes = [];
        if ($("#saleCheckbox").is(':checked')) {
            var price = getTextValue($("#salePrice"));
            if (price == null) {
                return;
            }
            place.purposes.push({
                purpose: "sale",
                price: parseInt(price)
            });
        }
        if ($("#rentCheckbox").is(':checked')) {
            var price = getTextValue($("#rentPrice"));
            if (price == null) {
                return;
            }
            place.purposes.push({
                purpose: "rent",
                price: parseInt(price)
            });
        }
        if (place.purposes.length == 0) {
            return;
        }
        $http({
            method: 'POST',
            url: '../places',
            data: place
          }).then(function successCallback(response) {
              $location.path("/admin");
          }, function errorCallback(response) {
              alert(response.data);
          });
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

function getDropdownValue(dropDown, defaultValue) {
    if (dropDown.val() === defaultValue) {
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