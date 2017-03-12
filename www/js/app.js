var App = angular.module("App", ["ionic"]);

App.service("carpoolsSvc", ["$http", "$rootScope", carpoolsSvc]);
App.service("userSvc", ["$http", "$rootScope", userSvc]);
App.service("DebugSvc", ["$http", "$rootScope", DebugSvc]);

App.controller("AppCtrl", ["$scope", "$rootScope", "carpoolsSvc", "userSvc", AppCtrl]);
App.controller("UserCtrl", ["$scope", "$rootScope", "carpoolsSvc", "userSvc", UserCtrl]);
App.controller("ArrangeCtrl", ["$scope", "$rootScope", "$http", ArrangeCtrl]);
App.controller("DebugCtrl", ["$scope", "$rootScope", "$http", "DebugSvc", DebugCtrl]);

function AppCtrl($scope, $rootScope, carpoolsSvc, userSvc) {
    $rootScope.$on("App.carpools", function(_, result) {
        $scope.carpools = [];
       result.carpools.forEach(function(c) {
           var roundtrip = "No";
           if (c.roundtrip == 1) {
                   roundtrip = "Yes";
           }
           $scope.carpools.push({
               capacity: c.capacity,
               date: c.date,
               destination: c.destination,
               id: c.id,
               organiser: c.organiser,
               origin: c.origin,
               state: c.state,
               tarrive: c.tarrive,
               tdepart: c.tdepart,
               roundtrip: roundtrip,
            });
        });
    });
    
    $rootScope.$on("App.user", function(_, result) {
        $scope.user = [];
        $scope.user.push({
                forename: result.forename,
                surname: result.surname,
                department: result.department
        });
    });
    
    $scope.refresh = function() {
        carpoolsSvc.loadCarpools();
        userSvc.loadUser();
    }
    
    if (window.localStorage['id']) {
        $scope.refresh();  
    }
}

function ArrangeCtrl($scope, $rootScope, $http) {
    $rootScope.capacity = null;
    $rootScope.date = null;
    $rootScope.tdepart = null;
    $rootScope.tarrive = null;
    $rootScope.origin = null;
    $rootScope.destination = null;
    $rootScope.roundtrip = null;
    $rootScope.arrangeCarpool = function() {
        var roundtrip = 0;
        if ($scope.roundtrip) {
            roundtrip = 1;
        }
        $http({
            method: 'POST',
            url: 'http://skoll.devenney.io:5000/carpools',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: {capacity: $scope.capacity, date: $scope.date, tdepart: $scope.tdepart, tarrive: $scope.tarrive, origin: $scope.origin, destination: $scope.destination, organiser: window.localStorage['id'], state: '0', roundtrip: roundtrip}
        }).success(function() {
        });
    }
}

function DebugCtrl($scope, $rootScope, $http, DebugSvc) {
    $rootScope.$on("App.proposals", function(_, result) {
        $scope.proposals = [];
       result.proposals.forEach(function(p) {
           $scope.proposals.push({
               accepted: p.accepted,
               cid: p.cid,
               cost: p.cost,
               uid: p.uid,
               separation: p.separation
            });
        });
    });
    
    $scope.acceptCarpool = function(index) {
        alert($scope.proposals[index].cost);  
        
        $http({
            method: 'POST',
            url: 'http://skoll.devenney.io:5000/proposals',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            data: {uid: window.localStorage['id'], cid: $scope.proposals[index].cid}
        }).success(function() {
        });
    }
    
     $scope.debugRefresh = function() {
        DebugSvc.loadProposals();
    }
}

function DebugSvc($http, $rootScope) {
    this.loadProposals = function() {
        $http.get("http://skoll.devenney.io:5000/proposals/" + window.localStorage['id'])
            .success(function(result) {
                $rootScope.$broadcast("App.proposals", result);
                $rootScope.$broadcast("scroll.refreshComplete");
        });
    }
}


function UserCtrl($scope, $rootScope, carpoolsSvc, userSvc) {
    $rootScope.foo = null;
    $rootScope.setId = function () {
        window.localStorage['id'] = $scope.foo;
        carpoolsSvc.loadCarpools();
        userSvc.loadUser();
    }
}

function userSvc($http, $rootScope) {
    this.loadUser = function() {
        $http.get("http://skoll.devenney.io:5000/users/" + window.localStorage['id'])
            .success(function(result) {
             $rootScope.$broadcast("App.user", result);
        });
    }
}

function carpoolsSvc($http, $rootScope) {
    this.loadCarpools = function() {
        $http.get("http://skoll.devenney.io:5000/carpools/" + window.localStorage['id'])
            .success(function(result) {
                $rootScope.$broadcast("App.carpools", result);
                $rootScope.$broadcast("scroll.refreshComplete");
        });
    }
}