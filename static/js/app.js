var app = angular.module("PlacesApp", ["ngResource", "ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "views/home.htm"
    })
    .when('/search', {
        templateUrl: 'views/place-search.htm'
    })
    .when("/places", {
        templateUrl : "views/home.htm"
    })
    .when('/places/:placeId', {
        templateUrl: 'views/place-detail.htm'
    })
    .when('/login', {
        templateUrl: "views/login.htm",
        controller: "LoginController"
    })
    .when('/admin', {
        templateUrl : "views/place-list.htm",
        controller: "ListPlacesController"
    })
    .when("/admin/places", {
        templateUrl : "views/place-list.htm",
        controller: "ListPlacesController"
    })
    .when("/admin/owners", {
        templateUrl : "views/owner-list.htm",
        controller: "ListOwnersController"
    })
    .when("/admin/owners/create", {
        templateUrl : "views/owner-create.htm",
        controller: "CreateOwnerController"
    })
    .when("/admin/owners/show/:ownerId", {
        templateUrl : "views/owner-show.htm",
        controller: "ShowOwnerController"
    })
    .when("/admin/owners/update/:ownerId", {
        templateUrl : "views/owner-create.htm",
        controller: "UpdateOwnerController"
    })
    .when('/admin/owners/:ownerId/places/create', {
        templateUrl: 'views/place-create.htm',
        controller: "CreatePlaceController"
    })
    .when('/admin/owners/:ownerId/places/show/:placeId', {
        templateUrl: 'views/place-show.htm',
        controller: "ShowPlaceController"
    })
    .when('/admin/owners/:ownerId/places/update/:placeId', {
        templateUrl: 'views/place-create.htm',
        controller: "UpdatePlaceController"
    });
});
app.controller('HomeController', function($scope, $http, $location) {
    $scope.list = function(){
        $scope.hasError = false;
        $http({
            method: 'GET',
            url: '../places',
            params: {
                populatePhotos: true,
                status: "available",
                limit: 15,
                start: 0
            }
          }).then(function successCallback(response) {
              setPlacesToScope($scope, response.data.places);
          }, function errorCallback(response) {
              console.log(response.data);
              $scope.hasError = true;
          });
    };
    $scope.showPlace = function(id) {
        $location.path("/places/" + id);
    };
    $scope.goToSearch = function() {
        $location.path("/search");
    };
    $scope.list();
});
app.controller('PlaceDetailController', function($scope, $resource, $location) {
    var Place = $resource("../places/:id", {id: '@id'}, {});
    $scope.show = function(theId){
        Place.get({id: theId}, function(data){
            var place = data;
            if (!place.photos || place.photos.length == 0) {
                place.photos = [
                    { url: "house.jpg" }
                ];
            }
            $scope.place = place;
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
    var pageSize = 15;
    search = function() {
        $scope.hasError = false;
        $http({
            method: 'GET',
            url: '../places',
            params: $scope.filters
          }).then(function successCallback(response) {
              $scope.totalPages = Math.ceil(response.data.total / pageSize);
              $scope.currPage = parseInt($scope.filters["start"] / pageSize, 10) + 1;
              $scope.totalPlaces = response.data.total;
              setPlacesToScope($scope, response.data.places);
          }, function errorCallback(response) {
              console.log(response.data);
              $scope.hasError = true;
          });
    };
    $scope.prevPage = function() {
        prevPage($scope, search, pageSize);
    };
    $scope.nextPage = function() {
        nextPage($scope, search, $scope.totalPlaces, pageSize);
    };
    $scope.newSearch = function() {
        $scope.filters = {
            purpose: getDropdownValue($("#purpose"), "all"),
            type: getDropdownValue($("#type"), "all"),
            location: getDropdownValue($("#location"), "all"),
            rooms: getDropdownValue($("#rooms"), "all"),
            floor: getDropdownValue($("#floor"), "all"),
            minArea: getTextValue($("#minArea")),
            maxArea: getTextValue($("#maxArea")),
            minPrice: getTextValue($("#minPrice")),
            maxPrice: getTextValue($("#maxPrice")),
            status: "available",
            populatePhotos: true,
            limit: pageSize,
            start: 0
        };
        search();
    };
    $scope.showPlace = function(id) {
        $location.path("/places/" + id);
    };
});
app.controller('LoginController', function($scope, $rootScope, $http, $location) {
    $("#password").keypress(function(event) {
        if (event.which == 13) {
            $scope.login();
        }
    });
    $scope.login = function() {
        $scope.errorLogin = false;
        $rootScope.successLogout = false;
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
              console.log(response.data);
              $scope.errorLogin = true;
          });
    };
});

app.controller('CreatePlaceController', function($scope, $rootScope, $http, $location) {
    $scope.actionBtn = "Crear";
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
    $scope.process = function() {
        processPlace($http, $location, $scope, $rootScope, $scope.ownerId);
    };
    $('#saleCheckbox').change(function() {
        $("#salePrice").prop('readonly', !this.checked);
    });
    $('#rentCheckbox').change(function() {
        $("#rentPrice").prop('readonly', !this.checked);
    });
    $scope.logout = function() {
        logout($http, $location, $rootScope);
    };
});
app.controller('ShowPlaceController', function($scope, $rootScope, $http, $resource, $location) {
    var Place = $resource("../places/:id", {id: '@id'}, {});
    isLoggedIn($http,
        function(response) {
            $scope.ownerId = getOwnerId($location);
            $scope.placeId = getCurrentObjectId($location);
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
    $scope.goToEdit = function() {
        $location.path("/admin/owners/" + $scope.ownerId + "/places/update/" + $scope.placeId);
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
                console.log(response.data);
                $scope.hasError = true;
            });
    };
    $scope.logout = function() {
        logout($http, $location, $rootScope);
    };
});
app.controller('UpdatePlaceController', function($scope, $rootScope, $http, $location, $resource) {
    $scope.actionBtn = "Actualizar";
    var Place = $resource("../places/:id", {id: '@id'}, {});
    isLoggedIn($http, 
        function(response) {
            $scope.ownerId = getOwnerId($location);
            $scope.placeId = getCurrentObjectId($location);
            $scope.load();
        },
        function(response) {
            $location.path("/login");
        });
    if ($scope.ownerId == -1) {
        $location.path("/admin");
    }
    $scope.load = function() {
        Place.get({id: $scope.placeId}, function(data) {
            place = data;
            $("#placeName").val(place.name);
            $("#type").val(place.type);
            $("#status").val(place.status);
            $("#placeDesc").val(place.description);
            $("#location").val(place.location);
            $("#address").val(place.address);
            $("#placeArea").val(place.area);
            $("#floor").val(place.floor);
            $("#bathrooms").val(place.bathrooms);
            $("#bedrooms").val(place.bedrooms);
            $("#stratum").val(place.stratum);
            $("#parking").val(place.parking);
            if (place.purposes) {
                place.purposes.forEach(function(purpose) {
                    if (purpose.purpose === "rent") {
                        $("#rentCheckbox").prop('checked', true);
                        $("#rentPrice").val(purpose.price);
                        $("#rentPrice").prop('readonly', false);
                    } else if (purpose.purpose === "sale") {
                        $("#saleCheckbox").prop('checked', true);
                        $("#salePrice").val(purpose.price);
                        $("#salePrice").prop('readonly', false);
                    }
                });
            }
        });
    };
    $scope.process = function() {
        processPlace($http, $location, $scope, $rootScope, $scope.ownerId, $scope.placeId);
    };
    $('#saleCheckbox').change(function() {
        $("#salePrice").prop('readonly', !this.checked);
    });
    $('#rentCheckbox').change(function() {
        $("#rentPrice").prop('readonly', !this.checked);
    });
    $scope.logout = function() {
        logout($http, $location, $rootScope);
    };
});
app.controller('CreateOwnerController', function($scope, $rootScope, $http, $location) {
    $scope.actionBtn = "Crear";
    isLoggedIn($http,
        function(response) {}, 
        function(response) {
            $location.path("/login");
        });
    $scope.process = function() {
        processOwner($http, $location, $scope, $rootScope);
    };
    $scope.logout = function() {
        logout($http, $location, $rootScope);
    };
});
app.controller('ShowOwnerController', function($scope, $rootScope, $http, $resource, $location) {
    var Owner = $resource("../owners/:id", {id: '@id'}, {});
    isLoggedIn($http,
        function(response) {
            $scope.ownerId = getCurrentObjectId($location);
            $scope.load();
        }, 
        function(response) {
            $location.path("/login");
        });
    $scope.goToEdit = function() {
        $location.path("/admin/owners/update/" + $scope.ownerId);
    };
    $scope.goToNewPlace = function() {
        $location.path("/admin/owners/" + $scope.ownerId + "/places/create");
    };
    $scope.load = function() {
        Owner.get({id: $scope.ownerId}, function(data) {
            $scope.owner = data;
        });
    };
    $scope.logout = function() {
        logout($http, $location, $rootScope);
    };
});
app.controller('UpdateOwnerController', function($scope, $rootScope, $http, $location, $resource) {
    $scope.actionBtn = "Actualizar";
    var Owner = $resource("../owners/:id", {id: '@id'}, {});
    isLoggedIn($http,
        function(response) {
            $scope.ownerId = getCurrentObjectId($location);
            $scope.load();
        }, 
        function(response) {
            $location.path("/login");
        });
    $scope.load = function() {
        Owner.get({id: $scope.ownerId}, function(data) {
            owner = data;
            $("#dni_type").val(owner.dni_type);
            $("#dni").val(owner.dni);
            $("#firstname").val(owner.firstname);
            $("#lastname").val(owner.lastname);
            $("#email").val(owner.email);
            $("#phone").val(owner.phone);
            $("#bank").val(owner.bank);
            $("#account_type").val(owner.account_type);
            $("#account").val(owner.account);
        });
    };
    $scope.process = function() {
        processOwner($http, $location, $scope, $rootScope, $scope.ownerId);
    };
    $scope.logout = function() {
        logout($http, $location, $rootScope);
    };
});
app.controller('ListPlacesController', function($scope, $rootScope, $http, $location) {
    var pageSize = 5;
    isLoggedIn($http,
        function(response) {
            $scope.newSearch();
        }, 
        function(response) {
            $location.path("/login");
        });
    search = function() {
        $scope.hasError = false;
        $http({
            method: 'GET',
            url: '../places',
            params: $scope.filters
          }).then(function successCallback(response) {
              $scope.places = response.data.places;
              $scope.currPage = parseInt($scope.filters["start"] / pageSize, 10) + 1;
              $scope.totalPages = Math.ceil(response.data.total / pageSize);
              $scope.totalPlaces = response.data.total;
          }, function errorCallback(response) {
              console.log(response.data);
              $scope.hasError = true;
          });
    };
    $scope.goToShow = function(ownerId, placeId) {
        $location.path("/admin/owners/" + ownerId + "/places/show/" + placeId);
    };
    $scope.goToEdit = function(ownerId, placeId) {
        $location.path("/admin/owners/" + ownerId + "/places/update/" + placeId);
    };
    $scope.prevPage = function() {
        prevPage($scope, search, pageSize);
    };
    $scope.nextPage = function() {
        nextPage($scope, search, $scope.totalPlaces, pageSize);
    }
    $scope.newSearch = function() {
        $scope.filters = {
            purpose: getDropdownValue($("#purpose"), "all"),
            type: getDropdownValue($("#type"), "all"),
            location: getDropdownValue($("#location"), "all"),
            limit: pageSize,
            start: 0
        };
        search();
    };
    $scope.logout = function() {
        logout($http, $location, $rootScope);
    };
});
app.controller('ListOwnersController', function($scope, $rootScope,$http, $location) {
    var pageSize = 1;
    isLoggedIn($http,
        function(response) {
            $scope.newSearch();
        }, 
        function(response) {
            $location.path("/login");
        });
    search = function() {
        $scope.hasError = false;
        $http({
            method: 'GET',
            url: '../owners',
            params: $scope.filters
          }).then(function successCallback(response) {
              $scope.owners = response.data.owners;
              $scope.currPage = parseInt($scope.filters["start"] / pageSize, 10) + 1;
              $scope.totalPages = Math.ceil(response.data.total / pageSize);
              $scope.totalOwners = response.data.total;
          }, function errorCallback(response) {
              console.log(response.data);
              $scope.hasError = true;
          });
    };
    $scope.logout = function() {
        logout($http, $location, $rootScope);
    };
    $scope.goToShow = function(ownerId) {
        $location.path("/admin/owners/show/" + ownerId);
    };
    $scope.goToEdit = function(ownerId) {
        $location.path("/admin/owners/update/" + ownerId);
    };
    $scope.prevPage = function() {
        prevPage($scope, search, pageSize);
    };
    $scope.nextPage = function() {
        nextPage($scope, search, $scope.totalOwners, pageSize);
    };
    $scope.newSearch = function() {
        $scope.filters = {
            dni_type: getDropdownValue($("#dni_type"), "all"),
            dni: getTextValue($("#dni")),
            firstname: getTextValue($("#firstname")),
            lastname: getTextValue($("#lastname")),
            email: getTextValue($("#email")),
            limit: pageSize,
            start: 0
        };
        search();
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
app.filter('dniTypeFormat', function() {
    return function(x) {
        if (x === "CC") {
            return "Cédula de Ciudadanía";
        } else if (x === "CE") {
            return "Cédula de Extranjería";
        } else if (x === "TI") {
            return "Tarjeta de identidad";
        } else if (x === "PP") {
            return "Pasaporte";
        } else if (x === "IDC") {
            return "Identificador Único de Cliente";
        } else if (x === "CEL") {
            return "Número Móvil";
        } else if (x === "DE") {
            return "Documento de Identificación Extranjero";
        } else if (x === "RC") {
            return "Registro Civil";
        } else {
            return "-";
        }
    };
});
app.filter('placeStatusFormat', function() {
    return function(x) {
        if (x === "available") {
            return "Disponible";
        } else if (x === "occupied") {
            return "Ocupado";
        } else if (x === "sold") {
            return "Vendido";
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
    var re = /\/admin\/owners\/(\d+)\/places\/(show|create|update)/;
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
}

function logout(http, location, rootScope) {
    http({
        method: 'POST',
        url: '../logout'
    }).then(function successCallback(response) {
        rootScope.successLogout = true;
        location.path("/login");
    }, function errorCallback(response) {
        console.log(response.data);
        location.path("/login");
    });
}

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

function processOwner(http, location, scope, rootScope, ownerId) {
    var owner = {};
    if (!readValueToObject(owner, "firstname", "firstname", "text")) {
        return;
    }
    if (!readValueToObject(owner, "lastname", "lastname", "text")) {
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
    var config;
    if (ownerId != null) {
        owner['ID'] = parseInt(ownerId);
        config = {
            method: 'PUT',
            url: '../owners/' + ownerId,
            data: owner
        };
    } else {
        config = {
            method: 'POST',
            url: '../owners',
            data: owner
        };
    }
    http(config).then(function successCallback(response) {
        if (ownerId != null) {
            rootScope.successfulMessage = "Propietario actualizado exitosamente";
        } else {
            rootScope.successfulMessage = "Propietario creado exitosamente";
        }
        location.path("/admin/owners/show/" + response.data.ID);
    }, function errorCallback(response) {
        console.log(response.data);
        scope.errorMessage = "No se pudo completar la operación";
    });
}

function processPlace(http, location, scope, rootScope, ownerId, placeId) {
    var place = { owner_id: parseInt(ownerId) };
    if (!readValueToObject(place, "name", "placeName", "text")) {
        return;
    }
    if (!readValueToObject(place, "type", "type", "dropdown")) {
        return;
    }
    if (!readValueToObject(place, "status", "status", "dropdown")) {
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
    var config;
    if (placeId != null) {
        place['ID'] = parseInt(placeId);
        config = {
            method: 'PUT',
            url: '../places/' + placeId,
            data: place
        };
    } else {
        config = {
            method: 'POST',
            url: '../places',
            data: place
        };
    }
    http(config).then(function successCallback(response) {
        if (placeId != null) {
            rootScope.successfulMessage = "Inmueble actualizado exitosamente";
        } else {
            rootScope.successfulMessage = "Inmueble creado exitosamente";
        }
        location.path("/admin/owners/" + ownerId + "/places/show/" + response.data.ID);
    }, function errorCallback(response) {
        console.log(response.data);
        scope.errorMessage = "No se pudo completar la operación";
    });
}

function prevPage(scope, search, pageSize) {
    if (scope.filters["start"] > 0) {
        scope.filters["start"] = scope.filters["start"] - pageSize;
        search();
    }
}

function nextPage(scope, search, totalElements, pageSize) {
    if (scope.filters["start"] + pageSize < totalElements) {
        scope.filters["start"] = scope.filters["start"] + pageSize;
        search();
    }
}
