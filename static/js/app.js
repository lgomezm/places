var app = angular.module("PlacesApp", ["ngResource", "ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "views/home.htm"
    })
    .when("/places", {
        templateUrl : "views/home.htm"
    })
    .when('/owners/:ownerId/places/create', {
        templateUrl: 'views/place-create.htm'
    })
    .when('/owners/:ownerId/places/show/:placeId', {
        templateUrl: 'views/place-show.htm'
    })
    .when('/places/:placeId', {
        templateUrl: 'views/place-detail.htm'
    })
    .when("/owners/create", {
        templateUrl : "views/owner-create.htm"
    })
    .when("/owners/show/:ownerId", {
        templateUrl : "views/owner-show.htm"
    })
    .when('/search', {
        templateUrl: 'views/place-search.htm'
    })
    .when('/login', {
        templateUrl: 'views/login.htm'
    })
    .when('/admin', {
        templateUrl: 'views/admin.htm'
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
    $scope.show(getCurrentObjectId($location));
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
    isLoggedIn($http, 
        function(response) {},
        function(response) {
            $location.path("/login");
        });
});

app.controller('CreatePlaceController', function($scope, $http, $location, $controller) {
    isLoggedIn($http, 
        function(response) {
            $scope.ownerId = getOwnerId($location);
        },
        function(response) {
            $location.path("/login");
        });
    if ($scope.ownerId == -1) {
        $location.path("/admin");
    }
    $scope.create = function() {
        var place = { owner_id: parseInt($scope.ownerId) };
        if (!readValueToObject(place, "name", "placeName", "text")) {
            return;
        }
        if (!readValueToObject(place, "type", "type", "dropdown")) {
            return;
        }
        if (!readValueToObject(place, "description", "placeDesc", "text")) {
            return;
        }
        if (!readValueToObject(place, "area", "placeArea", "text", parseInt)) {
            return;
        }
        if (!readValueToObject(place, "floor", "floor", "text", parseInt)) {
            return;
        }
        if (!readValueToObject(place, "bathrooms", "bathrooms", "text", parseInt)) {
            return;
        }
        if (!readValueToObject(place, "bedrooms", "bedrooms", "text", parseInt)) {
            return;
        }
        if (!readValueToObject(place, "stratum", "stratum", "dropdown", parseInt)) {
            return;
        }
        if (!readValueToObject(place, "parking", "parking", "text", parseInt)) {
            return;
        }
        if (!readValueToObject(place, "address", "address", "text")) {
            return;
        }
        if (!readValueToObject(place, "location", "location", "dropdown")) {
            return;
        }
        place.purposes = [];
        if ($("#saleCheckbox").is(':checked')) {
            if (!addPurposeToPlace(place, "sale", "salePrice")) {
                return;
            }
        }
        if ($("#rentCheckbox").is(':checked')) {
            if (!addPurposeToPlace(place, "rent", "rentPrice")) {
                return;
            }
        }
        if (place.purposes.length == 0) {
            return;
        }
        $http({
            method: 'POST',
            url: '../places',
            data: place
          }).then(function successCallback(response) {
              $location.path("/owners/" + $scope.ownerId + "/places/show/" + response.data.ID);
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
});
app.controller('ShowPlaceController', function($scope, $http, $resource, $location) {
    $scope.placeId = getCurrentObjectId($location);
    var Place = $resource("../places/:id", {id: '@id'}, {});
    isLoggedIn($http,
        function(response) {
            $scope.load();
        }, 
        function(response) {
            $location.path("/login");
        });
    $scope.load = function() {
        Place.get({id: $scope.placeId}, function(data) {
            $scope.place = data;
            setPhotosToScope($scope, data.photos);
        });
    };
    $('#photoFile').on('change', function() {
        var file = this.files[0];
        /*if (file.size > 1024) {
            alert('max upload size is 1k');
            return;
        }*/
        $scope.uploadPhoto(file);
        // Also see .name, .type
    });
    $scope.uploadPhoto = function(file) {
        var fd = new FormData();
        fd.append("file", file, file.name);
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("load", function uploadComplete(evt) {
            alert(evt.target.responseText);
            $scope.load();
        }, false);
        xhr.addEventListener("error", function uploadFailed(evt) {
            alert("There was an error attempting to upload the file.");
        }, false);
        xhr.open("POST", "../places/" + $scope.placeId + "/photos");
        xhr.send(fd);
    };
    $scope.deletePhoto = function(photoId) {
        $http.delete("../places/" + $scope.placeId + "/photos/" + photoId)
            .then(function successCallback(response) {
                $scope.load($scope.placeId);
            }, 
            function errorCallback(response) {
                alert(response.data);
            });
    };
});
app.controller('CreateOwnerController', function($scope, $http, $location) {
    isLoggedIn($http,
        function(response) {}, 
        function(response) {
            $location.path("/login");
        });
    $scope.create = function() {
        var owner = {};
        if (!readValueToObject(owner, "first_name", "firstname", "text")) {
            return;
        }
        if (!readValueToObject(owner, "last_name", "lastname", "text")) {
            return;
        }
        if (!readValueToObject(owner, "dni", "dni", "text")) {
            return;
        }
        if (!readValueToObject(owner, "dni_type", "dni_type", "dropdown")) {
            return;
        }
        if (!readValueToObject(owner, "email", "email", "text")) {
            return;
        }
        if (!readValueToObject(owner, "phone", "phone", "text")) {
            return;
        }
        if (!readValueToObject(owner, "bank", "bank", "dropdown")) {
            return;
        }
        if (!readValueToObject(owner, "account_type", "account_type", "dropdown")) {
            return;
        }
        if (!readValueToObject(owner, "account", "account", "text")) {
            return;
        }
        $http({
            method: 'POST',
            url: '../owners',
            data: owner
          }).then(function successCallback(response) {
              $location.path("/owners/show/" + response.data.ID);
          }, function errorCallback(response) {
              alert(response.data);
          });
    };
});
app.controller('ShowOwnerController', function($scope, $http, $resource, $location) {
    var Owner = $resource("../owners/:id", {id: '@id'}, {});
    isLoggedIn($http,
        function(response) {
            $scope.ownerID = getCurrentObjectId($location);
            $scope.load();
        }, 
        function(response) {
            $location.path("/login");
        });
    $scope.load = function() {
        Owner.get({id: $scope.ownerID}, function(data) {
            $scope.owner = data;
        });
    };
});

app.filter('accountTypeFormat', function() {
    return function(x) {
        if (x === "savings") {
            return "Ahorros";
        } else if (x === "checking") {
            return "Corriente";
        } else {
            return "-";
        }
    };
});
app.filter('placeTypeFormat', function() {
    return function(x) {
        if (x === "apt-studio") {
            return "Aparta-estudio";
        } else if (x === "aptartment") {
            return "Apartamento";
        } else if (x === "house") {
            return "Casa";
        } else if (x === "farm") {
            return "Finca";
        } else if (x === "warehouse") {
            return "Bodega";
        } else if (x === "allotment") {
            return "Lote";
        } else if (x === "office") {
            return "Oficina";
        } else {
            return "-";
        }
    };
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

function setPhotosToScope(scope, photos) {
    scope.photos = [];
    subPhotos = [];
    for (i = 0; i < photos.length; i++) {
        subPhotos.push(photos[i]);
        if (subPhotos.length == 3) {
            scope.photos.push(subPhotos);
            subPhotos = [];
        }
    }
    if (subPhotos.length > 0) {
        scope.photos.push(subPhotos);
    }
}

function readValueToObject(place, field, inputId, inputType) {
    return readValueToObject(place, field, inputId, inputType, null);
}

function readValueToObject(place, field, inputId, inputType, transform) {
    var value;
    if (inputType === "text") {
        value = getTextValue($("#" + inputId));
    } else if (inputType === "dropdown") {
        value = getDropdownValue($("#" + inputId), "0");
    } else {
        return false;
    }
    if (value == null) {
        return false;
    }
    if (transform == null) {
        place[field] = value;
    } else {
        place[field] = transform(value);
    }
    return true;
}

function getCurrentObjectId(location) {
    var path = location.path();
    return path.substring(path.lastIndexOf('/') + 1);
}

function getOwnerId(location) {
    var re = /\/owners\/(\d+)\/places\/create/;
    var myArray = re.exec(location.path());
    if (null == myArray || myArray.length < 2) {
        return -1;
    } else {
        return myArray[1];
    }
}

function isLoggedIn(http, successCallback, errorCallback) {
    http.get('../logged-in')
        .then(successCallback, errorCallback);
};

function addPurposeToPlace(place, purpose, priceField) {
    var price = getTextValue($("#" + priceField));
    if (price == null) {
        return false;
    }
    place.purposes.push({
        purpose: purpose,
        price: parseInt(price)
    });
    return true;
}