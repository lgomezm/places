var myapp = new angular.module("PlacesApp", ["ngResource"]);

myapp.controller('PlacesController', function($scope, $resource) {
    var Place = $resource("../places/:id", {id: '@id'}, {});
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
    $scope.list();
});