const app = angular.module('Trello', ['ngAnimate', 'ngRoute', 'ngSanitize']);

app.config(['$routeProvider', '$locationProvider', '$provide', '$httpProvider', '$qProvider', 'CONSTANTS', 'EVENTS', function ($routeProvider, $locationProvider, $provide, $httpProvider, $qProvider, CONSTANTS, EVENTS) {

    // disable error on unhandled rejections
    //$qProvider.errorOnUnhandledRejections(false);

    $routeProvider.when('/', {
        templateUrl: 'scripts/pages/home/home.html',
        controller: 'homeController',
        controllerAs: 'hc'
    }).when('/board/:boardId', {
        templateUrl: 'scripts/pages/board/board.html',
        controller: 'boardController',
        controllerAs: 'bc'
    }).when('/404', {
        templateUrl: 'scripts/pages/404/404.html'
    }).otherwise({
        redirectTo: '/404'
    });

    $locationProvider.html5Mode(false).hashPrefix('');

    // $provide.decorator('$locale', function ($delegate) {
    //   var value = $delegate.DATETIME_FORMATS;
    //
    //   value.SHORTDAY = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    //
    //   return $delegate;
    // });

    $httpProvider.interceptors.push(function ($q, eventBusService, EVENTS) {
        return {
            'request': function (config) {
                // eventBusService.publish(EVENTS.loaderShow);
                return config;
            },
            'response': function (response) {
                // eventBusService.publish(EVENTS.loaderHide);
                return response;
            },
            'responseError': function (rejection) {
                // eventBusService.publish(EVENTS.loaderHide);
                return $q.reject(rejection);
            }
        };
    });

    $httpProvider.defaults.transformResponse.push(function (data) {
        return data;
    });
}]);
'use strict';

app.controller('rootController', ['$scope', '$rootScope', '$q', '$location', 'eventBusService', 'CONSTANTS', 'EVENTS', function ($scope, $rootScope, $q, $location, eventBusService, CONSTANTS, EVENTS) {

    $scope.init = function () {};

    $scope.init();
}]);
app.service('dashboardService', ['$http', 'CONSTANTS', function ($http, CONSTANTS) {
  return {
    getDashboards: function () {
      return $http.get(CONSTANTS.API_URL + 'dashboards');
    },

    getDashboardbyId: function (id) {
      return $http.get(CONSTANTS.API_URL + 'dashboards/' + id);
    },

    createDashboard: function (data) {
      return $http.post(CONSTANTS.API_URL + 'dashboards', data);
    },

    deleteDashboard: function (id) {
      return $http.delete(CONSTANTS.API_URL + 'dashboards/' + id);
    }
  };
}]);
app.service('listService', ['$http', 'CONSTANTS', function ($http, CONSTANTS) {
  return {
    getLists: function (boardId) {
      return $http.get(CONSTANTS.API_URL + 'dashboards/' + boardId + '/lists');
    },

    createList: function (data) {
      return $http.post(CONSTANTS.API_URL + 'dashboards/' + id + '/lists', data);
    },

    deleteList: function (boardId, listId) {
      return $http.delete(CONSTANTS.API_URL + 'dashboards/' + boardId + '/lists/' + listId);
    }
  };
}]);
var constants = {
    API_URL: 'https://trello-api-by-angie.herokuapp.com/',
    PATH: ''
};

app.constant('CONSTANTS', constants);
'use strict';

var events = {

    // route
    routeChangeStart: '$routeChangeStart',

    // loaded
    loaderShow: 'loader.show',
    loaderHide: 'loader.hide'
};

app.constant('EVENTS', events);
'use strict';

app.factory('utils', [function () {
    return {
        findByField: function (array, value, field) {
            field = field || 'Id';
            if (array) {
                return array.filter(function (item) {
                    return item[field] === value;
                })[0];
            } else {
                return null;
            }
        },
        findAllByField: function (array, field, value) {
            field = field || 'Id';
            if (array) {
                return array.filter(function (item) {
                    return item[field] === value;
                });
            } else {
                return null;
            }
        },
        makeFlat: function (object) {
            var newObject = {};
            if (!object) return {};

            Object.keys(object).map(function (key) {
                if (!angular.isObject(object[key]) || angular.isDate(object[key])) {
                    newObject[key] = object[key];
                } else {
                    newObject[key + "Id"] = object[key].Id;
                }
            });
            return newObject;
        }
    };
}]);
app.controller('cardController', function () {});
app.directive('card', function () {
  return {
    scope: {
      content: '='
    },
    restrict: 'E',
    templateUrl: 'scripts/components/card/card.html',
    controller: 'cardController',
    controllerAs: 'cc'
  };
});
app.controller('listController', function () {});
app.directive('list', function () {
  return {
    scope: {
      cards: '=',
      title: '=',
      addCard: '=',
      key: '@'
    },
    restrict: 'E',
    templateUrl: 'scripts/components/list/list.html',
    controller: 'listController',
    controllerAs: 'lc'
  };
});
app.controller('boardController', boardController);

boardController.$inject = ['$scope', '$routeParams', 'dashboardService', 'listService'];

function boardController($scope, $routeParams, dashboardService, listService) {
  const boardId = $routeParams.boardId;

  dashboardService.getDashboardbyId(boardId).then(function (response) {
    $scope.board = response.data;
  }, function (response) {
    $scope.boards = response.statusText;
  });

  $scope.lists = [{
    title: 'Need to do',
    items: [{ content: 'Learn Angular6' }]
  }, {
    title: 'Ready',
    items: [{ content: 'JavaScript' }]
  }, {
    title: 'In process',
    items: [{ content: 'Investigate AngularJS' }]
  }];

  this.addCard = function (index) {
    $scope.lists[index].items.push({ content: '' });
  };
};
app.controller('homeController', homeController);

homeController.$inject = ['$scope', 'dashboardService'];

function homeController($scope, dashboardService) {
  $scope.boards = [];

  $scope.getDashboards = function () {
    dashboardService.getDashboards().then(function (response) {
      $scope.boards = response.data;
    }, function (response) {
      $scope.boards = response.statusText;
    });
  };

  this.addBoard = function () {
    var data = { name: 'Dashboard ' + ($scope.boards.length + 1) };
    dashboardService.createDashboard(data).then(function () {
      $scope.getDashboards();
    });
  };

  this.deleteDashboard = function (id) {
    dashboardService.deleteDashboard(id).then(function () {
      $scope.getDashboards();
    });
  };

  $scope.init = function () {
    $scope.getDashboards();
  };

  $scope.init();
};
'use strict';

app.factory('eventBusService', function ($rootScope) {

    var msgBus = {};

    msgBus.publish = function (msg, data) {
        data = data || {};
        $rootScope.$broadcast(msg, data);
    };

    msgBus.subscribe = function (msg, scope, func) {
        return scope.$on(msg, func); // return for destroying listener
    };

    return msgBus;
});
'use strict';

app.directive("contenteditable", function () {
    return {
        restrict: "A",
        require: "ngModel",
        link: function (scope, element, attrs, ngModel) {

            function read() {
                ngModel.$setViewValue(element.html());
            }

            ngModel.$render = function () {
                element.html(ngModel.$viewValue || "");
            };

            element.bind("blur keyup change", function () {
                scope.$apply(read);
            });
        }
    };
});
"use strict";

app.filter('currencyNumberFilter', ['$locale', function ($locale) {

    return function (amount, divider) {
        if (angular.isUndefined(divider)) {
            divider = ' ';
        }

        if (amount === null) {
            return amount;
        }

        if (amount) {
            var parts = amount.toFixed(2).toString().split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, divider);

            return parts.join('.');
        } else {
            return '0.00';
        }
    };
}]);
'use strict';

/**
 * Example of use:
 * <input type="email" name="email2" ng-model="emailReg2" custom-validator="emailMatch" data-validate-function="checkEmailMatch(value)">
 * <span ng-show="registerForm.email2.$error.emailMatch">Emails have to match!</span>
 *
 * In controller:
 * $scope.checkEmailMatch=function(value) {
 *    return value===$scope.emailReg;
 * }
 */

app.directive('customValidator', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            validateFunction: '&'
        },
        link: function (scope, elm, attr, ngModelCtrl) {
            ngModelCtrl.$parsers.push(function (value) {
                var result = scope.validateFunction({ 'value': value });
                if (result || result === false) {
                    if (result.then) {
                        result.then(function (data) {
                            // For promise type result object
                            ngModelCtrl.$setValidity(attr.customValidator, data);
                        }, function (error) {
                            ngModelCtrl.$setValidity(attr.customValidator, false);
                        });
                    } else {
                        ngModelCtrl.$setValidity(attr.customValidator, result);
                        return result ? value : undefined; // For boolean result return based on boolean value
                    }
                }
                return value;
            });
        }
    };
}]);
'use strict';

app.directive('noDirty', function () {
	return {
		require: 'ngModel',
		link: function (scope, element, attrs, ngModelCtrl) {
			// override the $setDirty method on ngModelController
			ngModelCtrl.$setDirty = angular.noop;
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsInJvb3RDb250cm9sbGVyLmpzIiwic2VydmljZXMvZGFzaGJvYXJkU2VydmljZS5qcyIsInNlcnZpY2VzL2xpc3RTZXJ2aWNlLmpzIiwic2hhcmVkL2NvbnN0YW50cy5qcyIsInNoYXJlZC9ldmVudHMuanMiLCJzaGFyZWQvdXRpbHMuanMiLCJjb21wb25lbnRzL2NhcmQvY2FyZENvbnRyb2xsZXIuanMiLCJjb21wb25lbnRzL2NhcmQvY2FyZERpcmVjdGl2ZS5qcyIsImNvbXBvbmVudHMvbGlzdC9saXN0Q29udHJvbGxlci5qcyIsImNvbXBvbmVudHMvbGlzdC9saXN0RGlyZWN0aXZlLmpzIiwicGFnZXMvYm9hcmQvYm9hcmRDb250cm9sbGVyLmpzIiwicGFnZXMvaG9tZS9ob21lQ29udHJvbGxlci5qcyIsInNoYXJlZC9ldmVudEJ1cy9ldmVudEJ1c1NlcnZpY2UuanMiLCJzaGFyZWQvZGlyZWN0aXZlcy9jb250ZW50ZWRpdGFibGUuanMiLCJzaGFyZWQvZmlsdGVycy9jdXJyZW5jeU51bWJlckZpbHRlci5qcyIsInNoYXJlZC92YWxpZGF0aW9uL2N1c3RvbVZhbGlkYXRvckRpcmVjdGl2ZS5qcyIsInNoYXJlZC92YWxpZGF0aW9uL25vRGlydHkuanMiXSwibmFtZXMiOlsiYXBwIiwiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRyb3V0ZVByb3ZpZGVyIiwiJGxvY2F0aW9uUHJvdmlkZXIiLCIkcHJvdmlkZSIsIiRodHRwUHJvdmlkZXIiLCIkcVByb3ZpZGVyIiwiQ09OU1RBTlRTIiwiRVZFTlRTIiwid2hlbiIsInRlbXBsYXRlVXJsIiwiY29udHJvbGxlciIsImNvbnRyb2xsZXJBcyIsIm90aGVyd2lzZSIsInJlZGlyZWN0VG8iLCJodG1sNU1vZGUiLCJoYXNoUHJlZml4IiwiaW50ZXJjZXB0b3JzIiwicHVzaCIsIiRxIiwiZXZlbnRCdXNTZXJ2aWNlIiwicmVzcG9uc2UiLCJyZWplY3Rpb24iLCJyZWplY3QiLCJkZWZhdWx0cyIsInRyYW5zZm9ybVJlc3BvbnNlIiwiZGF0YSIsIiRzY29wZSIsIiRyb290U2NvcGUiLCIkbG9jYXRpb24iLCJpbml0Iiwic2VydmljZSIsIiRodHRwIiwiZ2V0RGFzaGJvYXJkcyIsImdldCIsIkFQSV9VUkwiLCJnZXREYXNoYm9hcmRieUlkIiwiaWQiLCJjcmVhdGVEYXNoYm9hcmQiLCJwb3N0IiwiZGVsZXRlRGFzaGJvYXJkIiwiZGVsZXRlIiwiZ2V0TGlzdHMiLCJib2FyZElkIiwiY3JlYXRlTGlzdCIsImRlbGV0ZUxpc3QiLCJsaXN0SWQiLCJjb25zdGFudHMiLCJQQVRIIiwiY29uc3RhbnQiLCJldmVudHMiLCJyb3V0ZUNoYW5nZVN0YXJ0IiwibG9hZGVyU2hvdyIsImxvYWRlckhpZGUiLCJmYWN0b3J5IiwiZmluZEJ5RmllbGQiLCJhcnJheSIsInZhbHVlIiwiZmllbGQiLCJmaWx0ZXIiLCJpdGVtIiwiZmluZEFsbEJ5RmllbGQiLCJtYWtlRmxhdCIsIm9iamVjdCIsIm5ld09iamVjdCIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJrZXkiLCJpc09iamVjdCIsImlzRGF0ZSIsIklkIiwiZGlyZWN0aXZlIiwic2NvcGUiLCJjb250ZW50IiwicmVzdHJpY3QiLCJjYXJkcyIsInRpdGxlIiwiYWRkQ2FyZCIsImJvYXJkQ29udHJvbGxlciIsIiRpbmplY3QiLCIkcm91dGVQYXJhbXMiLCJkYXNoYm9hcmRTZXJ2aWNlIiwibGlzdFNlcnZpY2UiLCJ0aGVuIiwiYm9hcmQiLCJib2FyZHMiLCJzdGF0dXNUZXh0IiwibGlzdHMiLCJpdGVtcyIsImluZGV4IiwiaG9tZUNvbnRyb2xsZXIiLCJhZGRCb2FyZCIsIm5hbWUiLCJsZW5ndGgiLCJtc2dCdXMiLCJwdWJsaXNoIiwibXNnIiwiJGJyb2FkY2FzdCIsInN1YnNjcmliZSIsImZ1bmMiLCIkb24iLCJyZXF1aXJlIiwibGluayIsImVsZW1lbnQiLCJhdHRycyIsIm5nTW9kZWwiLCJyZWFkIiwiJHNldFZpZXdWYWx1ZSIsImh0bWwiLCIkcmVuZGVyIiwiJHZpZXdWYWx1ZSIsImJpbmQiLCIkYXBwbHkiLCIkbG9jYWxlIiwiYW1vdW50IiwiZGl2aWRlciIsImlzVW5kZWZpbmVkIiwicGFydHMiLCJ0b0ZpeGVkIiwidG9TdHJpbmciLCJzcGxpdCIsInJlcGxhY2UiLCJqb2luIiwidmFsaWRhdGVGdW5jdGlvbiIsImVsbSIsImF0dHIiLCJuZ01vZGVsQ3RybCIsIiRwYXJzZXJzIiwicmVzdWx0IiwiJHNldFZhbGlkaXR5IiwiY3VzdG9tVmFsaWRhdG9yIiwiZXJyb3IiLCJ1bmRlZmluZWQiLCIkc2V0RGlydHkiLCJub29wIl0sIm1hcHBpbmdzIjoiQUFBQSxNQUFNQSxNQUFNQyxRQUFRQyxNQUFSLENBQWUsUUFBZixFQUF5QixDQUFDLFdBQUQsRUFBYyxTQUFkLEVBQXlCLFlBQXpCLENBQXpCLENBQVo7O0FBRUFGLElBQUlHLE1BQUosQ0FBVyxDQUNQLGdCQURPLEVBQ1csbUJBRFgsRUFDZ0MsVUFEaEMsRUFDNEMsZUFENUMsRUFDNkQsWUFEN0QsRUFDMkUsV0FEM0UsRUFDd0YsUUFEeEYsRUFFUCxVQUFVQyxjQUFWLEVBQTBCQyxpQkFBMUIsRUFBNkNDLFFBQTdDLEVBQXVEQyxhQUF2RCxFQUFzRUMsVUFBdEUsRUFBa0ZDLFNBQWxGLEVBQTZGQyxNQUE3RixFQUFxRzs7QUFFakc7QUFDQTs7QUFFQU4sbUJBQ0tPLElBREwsQ0FDVSxHQURWLEVBQ2U7QUFDUEMscUJBQWEsOEJBRE47QUFFUEMsb0JBQVksZ0JBRkw7QUFHUEMsc0JBQWM7QUFIUCxLQURmLEVBTUtILElBTkwsQ0FNVSxpQkFOVixFQU02QjtBQUNyQkMscUJBQWEsZ0NBRFE7QUFFckJDLG9CQUFZLGlCQUZTO0FBR3JCQyxzQkFBYztBQUhPLEtBTjdCLEVBV0tILElBWEwsQ0FXVSxNQVhWLEVBV2tCO0FBQ1ZDLHFCQUFhO0FBREgsS0FYbEIsRUFjS0csU0FkTCxDQWNlO0FBQ1BDLG9CQUFZO0FBREwsS0FkZjs7QUFrQkFYLHNCQUFrQlksU0FBbEIsQ0FBNEIsS0FBNUIsRUFBbUNDLFVBQW5DLENBQThD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SyxlQUE5QixFQUErQ0YsTUFBL0M7QUFDQSwrQkFBT0EsU0FBU3hFLEtBQVQsR0FBaUI0RSxTQUF4QixDQUZDLENBRWtDO0FBQ3RDO0FBQ0o7QUFDRCx1QkFBTzVFLEtBQVA7QUFDSCxhQWhCRDtBQWlCSDtBQXhCRSxLQUFQO0FBMEJILENBM0JnQyxDQUFqQztBQ2JBOztBQUVBM0QsSUFBSTBFLFNBQUosQ0FBYyxTQUFkLEVBQXlCLFlBQVk7QUFDcEMsUUFBTztBQUNOOEIsV0FBUyxTQURIO0FBRU5DLFFBQU0sVUFBVTlCLEtBQVYsRUFBaUIrQixPQUFqQixFQUEwQkMsS0FBMUIsRUFBaUNzQixXQUFqQyxFQUE4QztBQUNuRDtBQUNBQSxlQUFZTyxTQUFaLEdBQXdCdkksUUFBUXdJLElBQWhDO0FBQ0E7QUFMSyxFQUFQO0FBT0EsQ0FSRCIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgYXBwID0gYW5ndWxhci5tb2R1bGUoJ1RyZWxsbycsIFsnbmdBbmltYXRlJywgJ25nUm91dGUnLCAnbmdTYW5pdGl6ZSddKTtcclxuXHJcbmFwcC5jb25maWcoW1xyXG4gICAgJyRyb3V0ZVByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJywgJyRwcm92aWRlJywgJyRodHRwUHJvdmlkZXInLCAnJHFQcm92aWRlcicsICdDT05TVEFOVFMnLCAnRVZFTlRTJyxcclxuICAgIGZ1bmN0aW9uICgkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRwcm92aWRlLCAkaHR0cFByb3ZpZGVyLCAkcVByb3ZpZGVyLCBDT05TVEFOVFMsIEVWRU5UUykge1xyXG5cclxuICAgICAgICAvLyBkaXNhYmxlIGVycm9yIG9uIHVuaGFuZGxlZCByZWplY3Rpb25zXHJcbiAgICAgICAgLy8kcVByb3ZpZGVyLmVycm9yT25VbmhhbmRsZWRSZWplY3Rpb25zKGZhbHNlKTtcclxuXHJcbiAgICAgICAgJHJvdXRlUHJvdmlkZXJcclxuICAgICAgICAgICAgLndoZW4oJy8nLCB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3NjcmlwdHMvcGFnZXMvaG9tZS9ob21lLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2hvbWVDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2hjJ1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAud2hlbignL2JvYXJkLzpib2FyZElkJywge1xyXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdzY3JpcHRzL3BhZ2VzL2JvYXJkL2JvYXJkLmh0bWwnLFxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2JvYXJkQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdiYydcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLndoZW4oJy80MDQnLCB7XHJcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3NjcmlwdHMvcGFnZXMvNDA0LzQwNC5odG1sJ1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAub3RoZXJ3aXNlKHtcclxuICAgICAgICAgICAgICAgIHJlZGlyZWN0VG86ICcvNDA0J1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKGZhbHNlKS5oYXNoUHJlZml4KCcnKTtcclxuXHJcbiAgICAgICAgLy8gJHByb3ZpZGUuZGVjb3JhdG9yKCckbG9jYWxlJywgZnVuY3Rpb24gKCRkZWxlZ2F0ZSkge1xyXG4gICAgICAgIC8vICAgdmFyIHZhbHVlID0gJGRlbGVnYXRlLkRBVEVUSU1FX0ZPUk1BVFM7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgIHZhbHVlLlNIT1JUREFZID0gW1wiU3VcIiwgXCJNb1wiLCBcIlR1XCIsIFwiV2VcIiwgXCJUaFwiLCBcIkZyXCIsIFwiU2FcIl07XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyAgIHJldHVybiAkZGVsZWdhdGU7XHJcbiAgICAgICAgLy8gfSk7XHJcblxyXG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goZnVuY3Rpb24gKCRxLCBldmVudEJ1c1NlcnZpY2UsIEVWRU5UUykge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgJ3JlcXVlc3QnOiBmdW5jdGlvbiAoY29uZmlnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlbnRCdXNTZXJ2aWNlLnB1Ymxpc2goRVZFTlRTLmxvYWRlclNob3cpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb25maWc7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgJ3Jlc3BvbnNlJzogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlbnRCdXNTZXJ2aWNlLnB1Ymxpc2goRVZFTlRTLmxvYWRlckhpZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAncmVzcG9uc2VFcnJvcic6IGZ1bmN0aW9uIChyZWplY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBldmVudEJ1c1NlcnZpY2UucHVibGlzaChFVkVOVFMubG9hZGVySGlkZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZWplY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLnRyYW5zZm9ybVJlc3BvbnNlLnB1c2goZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbl0pO1xyXG4iLCIndXNlIHN0cmljdCc7XG5cbmFwcC5jb250cm9sbGVyKCdyb290Q29udHJvbGxlcicsIFsnJHNjb3BlJywgJyRyb290U2NvcGUnLCAnJHEnLCAnJGxvY2F0aW9uJywgJ2V2ZW50QnVzU2VydmljZScsICdDT05TVEFOVFMnLCAnRVZFTlRTJyxcbiAgICBmdW5jdGlvbiAoJHNjb3BlLCAkcm9vdFNjb3BlLCAkcSwgJGxvY2F0aW9uLCBldmVudEJ1c1NlcnZpY2UsIENPTlNUQU5UUywgRVZFTlRTKSB7XG5cbiAgICAgICAgJHNjb3BlLmluaXQgPSBmdW5jdGlvbiAoKSB7fTtcblxuICAgICAgICAkc2NvcGUuaW5pdCgpO1xuXG4gICAgfVxuXSk7XG4iLCJhcHAuc2VydmljZSgnZGFzaGJvYXJkU2VydmljZScsIFsnJGh0dHAnLCAnQ09OU1RBTlRTJywgZnVuY3Rpb24oJGh0dHAsIENPTlNUQU5UUykge1xyXG4gIHJldHVybiB7XHJcbiAgICBnZXREYXNoYm9hcmRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuICRodHRwLmdldChDT05TVEFOVFMuQVBJX1VSTCArICdkYXNoYm9hcmRzJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldERhc2hib2FyZGJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoQ09OU1RBTlRTLkFQSV9VUkwgKyAnZGFzaGJvYXJkcy8nICsgaWQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjcmVhdGVEYXNoYm9hcmQ6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgcmV0dXJuICRodHRwLnBvc3QoQ09OU1RBTlRTLkFQSV9VUkwgKyAnZGFzaGJvYXJkcycsIGRhdGEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBkZWxldGVEYXNoYm9hcmQ6IGZ1bmN0aW9uKGlkKSB7XHJcbiAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoQ09OU1RBTlRTLkFQSV9VUkwgKyAnZGFzaGJvYXJkcy8nICsgaWQpO1xyXG4gICAgfVxyXG4gIH1cclxufV0pO1xyXG4iLCJhcHAuc2VydmljZSgnbGlzdFNlcnZpY2UnLCBbJyRodHRwJywgJ0NPTlNUQU5UUycsIGZ1bmN0aW9uKCRodHRwLCBDT05TVEFOVFMpIHtcclxuICByZXR1cm4ge1xyXG4gICAgZ2V0TGlzdHM6IGZ1bmN0aW9uKGJvYXJkSWQpIHtcclxuICAgICAgcmV0dXJuICRodHRwLmdldChDT05TVEFOVFMuQVBJX1VSTCArICdkYXNoYm9hcmRzLycgKyBib2FyZElkICsgJy9saXN0cycpO1xyXG4gICAgfSxcclxuXHJcbiAgICBjcmVhdGVMaXN0OiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KENPTlNUQU5UUy5BUElfVVJMICsgJ2Rhc2hib2FyZHMvJyArIGlkICsgJy9saXN0cycsIGRhdGEpO1xyXG4gICAgfSxcclxuXHJcbiAgICBkZWxldGVMaXN0OiBmdW5jdGlvbihib2FyZElkLCBsaXN0SWQpIHtcclxuICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZShDT05TVEFOVFMuQVBJX1VSTCArICdkYXNoYm9hcmRzLycgKyBib2FyZElkICsgJy9saXN0cy8nICsgbGlzdElkKTtcclxuICAgIH1cclxuICB9XHJcbn1dKTtcclxuIiwidmFyIGNvbnN0YW50cyA9IHtcbiAgICBBUElfVVJMOiAnaHR0cHM6Ly90cmVsbG8tYXBpLWJ5LWFuZ2llLmhlcm9rdWFwcC5jb20vJyxcbiAgICBQQVRIOiAnJyxcbn07XG5cbmFwcC5jb25zdGFudCgnQ09OU1RBTlRTJywgY29uc3RhbnRzKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGV2ZW50cyA9IHtcblxuICAgIC8vIHJvdXRlXG4gICAgcm91dGVDaGFuZ2VTdGFydDogJyRyb3V0ZUNoYW5nZVN0YXJ0JyxcblxuICAgIC8vIGxvYWRlZFxuICAgIGxvYWRlclNob3c6ICdsb2FkZXIuc2hvdycsXG4gICAgbG9hZGVySGlkZTogJ2xvYWRlci5oaWRlJ1xufTtcblxuYXBwLmNvbnN0YW50KCdFVkVOVFMnLCBldmVudHMpOyIsIid1c2Ugc3RyaWN0JztcblxuYXBwLmZhY3RvcnkoJ3V0aWxzJywgW2Z1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGZpbmRCeUZpZWxkOiBmdW5jdGlvbiAoYXJyYXksIHZhbHVlLCBmaWVsZCkge1xuICAgICAgICAgICAgZmllbGQgPSBmaWVsZCB8fCAnSWQnO1xuICAgICAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtW2ZpZWxkXSA9PT0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfSlbMF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXHQgICAgZmluZEFsbEJ5RmllbGQ6IGZ1bmN0aW9uIChhcnJheSwgZmllbGQsIHZhbHVlKSB7XG4gICAgICAgICAgICBmaWVsZCA9IGZpZWxkIHx8ICdJZCc7XG4gICAgICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1bZmllbGRdID09PSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1ha2VGbGF0OiBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgICAgICAgICB2YXIgbmV3T2JqZWN0ID0ge307XG5cdCAgICAgICAgaWYgKCFvYmplY3QpIHJldHVybiB7fTtcblxuICAgICAgICAgICAgT2JqZWN0LmtleXMob2JqZWN0KS5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhbmd1bGFyLmlzT2JqZWN0KG9iamVjdFtrZXldKSB8fCBhbmd1bGFyLmlzRGF0ZShvYmplY3Rba2V5XSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3T2JqZWN0W2tleV0gPSBvYmplY3Rba2V5XTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBuZXdPYmplY3Rba2V5ICsgXCJJZFwiXSA9IG9iamVjdFtrZXldLklkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIG5ld09iamVjdDtcbiAgICAgICAgfVxuICAgIH07XG59XSk7XG4iLCJhcHAuY29udHJvbGxlcignY2FyZENvbnRyb2xsZXInLCBmdW5jdGlvbigpIHtcclxuICBcclxufSk7XHJcbiIsImFwcC5kaXJlY3RpdmUoJ2NhcmQnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgc2NvcGU6IHtcclxuICAgICAgY29udGVudDogJz0nXHJcbiAgICB9LFxyXG4gICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnc2NyaXB0cy9jb21wb25lbnRzL2NhcmQvY2FyZC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdjYXJkQ29udHJvbGxlcicsXHJcbiAgICBjb250cm9sbGVyQXM6ICdjYydcclxuICB9XHJcbn0pO1xyXG4iLCJhcHAuY29udHJvbGxlcignbGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbigpIHtcclxuXHJcbn0pO1xyXG4iLCJhcHAuZGlyZWN0aXZlKCdsaXN0JywgZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGNhcmRzOiAnPScsXHJcbiAgICAgIHRpdGxlOiAnPScsXHJcbiAgICAgIGFkZENhcmQ6ICc9JyxcclxuICAgICAga2V5OiAnQCdcclxuICAgIH0sXHJcbiAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdzY3JpcHRzL2NvbXBvbmVudHMvbGlzdC9saXN0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ2xpc3RDb250cm9sbGVyJyxcclxuICAgIGNvbnRyb2xsZXJBczogJ2xjJ1xyXG4gIH1cclxufSk7XHJcbiIsImFwcC5jb250cm9sbGVyKCdib2FyZENvbnRyb2xsZXInLCBib2FyZENvbnRyb2xsZXIpO1xyXG5cclxuYm9hcmRDb250cm9sbGVyLiRpbmplY3QgPSBbJyRzY29wZScsICckcm91dGVQYXJhbXMnLCAnZGFzaGJvYXJkU2VydmljZScsICdsaXN0U2VydmljZSddO1xyXG5cclxuZnVuY3Rpb24gYm9hcmRDb250cm9sbGVyKCRzY29wZSwgJHJvdXRlUGFyYW1zLCBkYXNoYm9hcmRTZXJ2aWNlLCBsaXN0U2VydmljZSkge1xyXG4gIGNvbnN0IGJvYXJkSWQgPSAkcm91dGVQYXJhbXMuYm9hcmRJZDtcclxuXHJcbiAgZGFzaGJvYXJkU2VydmljZS5nZXREYXNoYm9hcmRieUlkKGJvYXJkSWQpLnRoZW4oXHJcbiAgICBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAkc2NvcGUuYm9hcmQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgfSxcclxuICAgIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICRzY29wZS5ib2FyZHMgPSByZXNwb25zZS5zdGF0dXNUZXh0O1xyXG4gICAgfVxyXG4gICk7XHJcblxyXG4gICRzY29wZS5saXN0cyA9IFt7XHJcbiAgICB0aXRsZTogJ05lZWQgdG8gZG8nLFxyXG4gICAgaXRlbXM6IFt7IGNvbnRlbnQ6ICdMZWFybiBBbmd1bGFyNicgfV1cclxuICB9LCB7XHJcbiAgICB0aXRsZTogJ1JlYWR5JyxcclxuICAgIGl0ZW1zOiBbeyBjb250ZW50OiAnSmF2YVNjcmlwdCcgfV1cclxuICB9LCB7XHJcbiAgICB0aXRsZTogJ0luIHByb2Nlc3MnLFxyXG4gICAgaXRlbXM6IFt7IGNvbnRlbnQ6ICdJbnZlc3RpZ2F0ZSBBbmd1bGFySlMnIH1dXHJcbiAgfV07XHJcblxyXG4gIHRoaXMuYWRkQ2FyZCA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAkc2NvcGUubGlzdHNbaW5kZXhdLml0ZW1zLnB1c2goeyBjb250ZW50OiAnJyB9KTtcclxuICB9O1xyXG5cclxufTtcclxuIiwiYXBwLmNvbnRyb2xsZXIoJ2hvbWVDb250cm9sbGVyJywgaG9tZUNvbnRyb2xsZXIpO1xyXG5cclxuaG9tZUNvbnRyb2xsZXIuJGluamVjdCA9IFsnJHNjb3BlJywgJ2Rhc2hib2FyZFNlcnZpY2UnXTtcclxuXHJcbmZ1bmN0aW9uIGhvbWVDb250cm9sbGVyKCRzY29wZSwgZGFzaGJvYXJkU2VydmljZSkge1xyXG4gICRzY29wZS5ib2FyZHMgPSBbXTtcclxuXHJcbiAgJHNjb3BlLmdldERhc2hib2FyZHMgPSBmdW5jdGlvbigpIHtcclxuICAgIGRhc2hib2FyZFNlcnZpY2UuZ2V0RGFzaGJvYXJkcygpLnRoZW4oXHJcbiAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgJHNjb3BlLmJvYXJkcyA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgIH0sXHJcbiAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgJHNjb3BlLmJvYXJkcyA9IHJlc3BvbnNlLnN0YXR1c1RleHQ7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfTtcclxuXHJcbiAgdGhpcy5hZGRCb2FyZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGRhdGEgPSB7IG5hbWU6ICdEYXNoYm9hcmQgJyArICgkc2NvcGUuYm9hcmRzLmxlbmd0aCArIDEpIH07XHJcbiAgICBkYXNoYm9hcmRTZXJ2aWNlXHJcbiAgICAgIC5jcmVhdGVEYXNoYm9hcmQoZGF0YSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmdldERhc2hib2FyZHMoKTtcclxuICAgICAgfSk7XHJcblxyXG4gIH07XHJcblxyXG4gIHRoaXMuZGVsZXRlRGFzaGJvYXJkID0gZnVuY3Rpb24oaWQpIHtcclxuICAgIGRhc2hib2FyZFNlcnZpY2VcclxuICAgICAgLmRlbGV0ZURhc2hib2FyZChpZClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmdldERhc2hib2FyZHMoKTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmluaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5nZXREYXNoYm9hcmRzKCk7ICAgIFxyXG4gIH07XHJcblxyXG4gICRzY29wZS5pbml0KCk7XHJcblxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XG5cbmFwcC5mYWN0b3J5KCdldmVudEJ1c1NlcnZpY2UnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xuXG4gICB2YXIgbXNnQnVzID0ge307XG5cbiAgIG1zZ0J1cy5wdWJsaXNoID0gZnVuY3Rpb24obXNnLCBkYXRhKSB7XG4gICAgICAgZGF0YSA9IGRhdGEgfHwge307XG4gICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KG1zZywgZGF0YSk7XG4gICB9O1xuXG4gICBtc2dCdXMuc3Vic2NyaWJlID0gZnVuY3Rpb24obXNnLCBzY29wZSwgZnVuYykge1xuICAgICAgIHJldHVybiBzY29wZS4kb24obXNnLCBmdW5jKTsgLy8gcmV0dXJuIGZvciBkZXN0cm95aW5nIGxpc3RlbmVyXG4gICB9O1xuXG4gICByZXR1cm4gbXNnQnVzO1xuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYXBwLmRpcmVjdGl2ZShcImNvbnRlbnRlZGl0YWJsZVwiLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogXCJBXCIsXG4gICAgICAgIHJlcXVpcmU6IFwibmdNb2RlbFwiLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcblxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZCgpIHtcbiAgICAgICAgICAgICAgICBuZ01vZGVsLiRzZXRWaWV3VmFsdWUoZWxlbWVudC5odG1sKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZ01vZGVsLiRyZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lmh0bWwobmdNb2RlbC4kdmlld1ZhbHVlIHx8IFwiXCIpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZWxlbWVudC5iaW5kKFwiYmx1ciBrZXl1cCBjaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KHJlYWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmFwcC5maWx0ZXIoJ2N1cnJlbmN5TnVtYmVyRmlsdGVyJywgWyckbG9jYWxlJywgZnVuY3Rpb24gKCRsb2NhbGUpIHtcblxuICAgIHJldHVybiBmdW5jdGlvbihhbW91bnQsIGRpdmlkZXIpIHtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQoZGl2aWRlcikpIHtcbiAgICAgICAgICAgIGRpdmlkZXIgPSAnICc7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYW1vdW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gYW1vdW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFtb3VudCkge1xuICAgICAgICAgICAgdmFyIHBhcnRzID0gYW1vdW50LnRvRml4ZWQoMikudG9TdHJpbmcoKS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgcGFydHNbMF0gPSBwYXJ0c1swXS5yZXBsYWNlKC9cXEIoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCBkaXZpZGVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oJy4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAnMC4wMCc7XG4gICAgICAgIH1cbiAgICB9O1xuXG59XSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogRXhhbXBsZSBvZiB1c2U6XG4gKiA8aW5wdXQgdHlwZT1cImVtYWlsXCIgbmFtZT1cImVtYWlsMlwiIG5nLW1vZGVsPVwiZW1haWxSZWcyXCIgY3VzdG9tLXZhbGlkYXRvcj1cImVtYWlsTWF0Y2hcIiBkYXRhLXZhbGlkYXRlLWZ1bmN0aW9uPVwiY2hlY2tFbWFpbE1hdGNoKHZhbHVlKVwiPlxuICogPHNwYW4gbmctc2hvdz1cInJlZ2lzdGVyRm9ybS5lbWFpbDIuJGVycm9yLmVtYWlsTWF0Y2hcIj5FbWFpbHMgaGF2ZSB0byBtYXRjaCE8L3NwYW4+XG4gKlxuICogSW4gY29udHJvbGxlcjpcbiAqICRzY29wZS5jaGVja0VtYWlsTWF0Y2g9ZnVuY3Rpb24odmFsdWUpIHtcbiAqICAgIHJldHVybiB2YWx1ZT09PSRzY29wZS5lbWFpbFJlZztcbiAqIH1cbiAqL1xuXG5hcHAuZGlyZWN0aXZlKCdjdXN0b21WYWxpZGF0b3InLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHZhbGlkYXRlRnVuY3Rpb246ICcmJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsbSwgYXR0ciwgbmdNb2RlbEN0cmwpIHtcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRwYXJzZXJzLnB1c2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHNjb3BlLnZhbGlkYXRlRnVuY3Rpb24oeyAndmFsdWUnOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0IHx8IHJlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC50aGVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbiAoZGF0YSkgeyAvLyBGb3IgcHJvbWlzZSB0eXBlIHJlc3VsdCBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0VmFsaWRpdHkoYXR0ci5jdXN0b21WYWxpZGF0b3IsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZhbGlkaXR5KGF0dHIuY3VzdG9tVmFsaWRhdG9yLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWYWxpZGl0eShhdHRyLmN1c3RvbVZhbGlkYXRvciwgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQgPyB2YWx1ZSA6IHVuZGVmaW5lZDsgLy8gRm9yIGJvb2xlYW4gcmVzdWx0IHJldHVybiBiYXNlZCBvbiBib29sZWFuIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufV0pOyIsIid1c2Ugc3RyaWN0JztcblxuYXBwLmRpcmVjdGl2ZSgnbm9EaXJ0eScsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHtcblx0XHRyZXF1aXJlOiAnbmdNb2RlbCcsXG5cdFx0bGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbEN0cmwpIHtcblx0XHRcdC8vIG92ZXJyaWRlIHRoZSAkc2V0RGlydHkgbWV0aG9kIG9uIG5nTW9kZWxDb250cm9sbGVyXG5cdFx0XHRuZ01vZGVsQ3RybC4kc2V0RGlydHkgPSBhbmd1bGFyLm5vb3A7XG5cdFx0fVxuXHR9XG59KTsiXX0=
