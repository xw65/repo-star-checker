//references
//https://developer.github.com/v3/activity/starring
//https://developer.github.com/v3/#http-verbs

var config = {
  apiKey: "AIzaSyCGRzE7appRUtxfOq8tM_wP4vfJrZGkgOQ",
  authDomain: "repostar-6a542.firebaseapp.com",
  databaseURL: "https://repostar-6a542.firebaseio.com",
  storageBucket: "repostar-6a542.appspot.com",
  messagingSenderId: "478402567163"
};
firebase.initializeApp(config);

var app = angular.module('myApp', []);

app.controller('MainCtrl', function ($scope, $http) {

  //todo: property file, auth & star, star all, repo detail

  // Read repo list data from Firebase
  var baseRef = firebase.database().ref('repo');
  baseRef.once('value').then(function (snapshot) {
    if (snapshot) {
      var userDataMap = snapshot.val();
      var repoList = [];
      for (var userName in userDataMap) {
        var userRepoList = userDataMap[userName];
        for (var i = 0; i < userRepoList.length; i++) {
          repoList.push(userName + "/" + userRepoList[i]);
        }
      }

      $scope.repos = repoList;

      $scope.repos.sort();

      $scope.urlPrefix = "https://github.com/";

      $scope.starredMap = {};

      //extract user list
      $scope.userList = [];
      angular.forEach($scope.repos, function (repo, index) {
        var user = repo.split("/")[0];
        if ($scope.userList.indexOf(user) >= 0) {
          return;
        }
        $scope.userList.push(user);
      });

      $('#progress-bar').fadeOut('fast', function () {
        $('#repo-list').fadeIn();
      });

      //get all user image
      $scope.imageMap = {};
      angular.forEach($scope.userList, function (user, index) {

        var url = "https://api.github.com/users/" + user;
        $http({
          method: "GET",
          url: url
        }).then(function mySucces(response) {
          var image = response.data.avatar_url;

          angular.forEach($scope.repos, function (repo, index2) {
            var repo_user = repo.split("/")[0];
            if (repo_user === user) {
              $scope.imageMap[repo] = image;
            }
          });
        }, function myError(response) {

        });

      });

      $scope.go = function (ev) {
        if (!!ev && ev.keyCode !== 13) {
          return;
        }
        if (!$scope.username) {
          $scope.starredMap = {};
          return;
        }

        var url = "https://api.github.com/users/" + $scope.username + "/starred?per_page=999";

        $http({
          method: "GET",
          url: url
        }).then(function mySucces(response) {
          $scope.starredMap = $scope.transformStarredList(response.data);
        }, function myError(response) {
          $scope.starredMap = {};
          $scope.errMsg = response.statusText;
          alert("Error : " + $scope.errMsg);
        });
      };


      $scope.transformStarredList = function (starredList) {
        var outputMap = {};
        if (!starredList) {
          return outputMap;
        }
        angular.forEach(starredList, function (repo, index) {
          outputMap[repo.full_name] = true;
        });
        return outputMap;
      }
    }
  });
});
