'use strict';

/**
 * @ngdoc function
 * @name openshiftConsole.controller:ImagesController
 * @description
 * # ProjectController
 * Controller of the openshiftConsole
 */
angular.module('openshiftConsole')
  .controller('ImagesController', function ($scope, DataService, $filter, LabelFilter) {
    $scope.images = {};
    $scope.unfilteredImages = {};
    $scope.builds = {};
    $scope.labelSuggestions = {};
    $scope.alerts = $scope.alerts || {};    
    $scope.emptyMessage = "Loading...";
    var watches = [];

    var imagesCallback = function(images) {
      $scope.$apply(function() {
        $scope.unfilteredImages = images.by("metadata.name");
        LabelFilter.addLabelSuggestionsFromResources($scope.unfilteredImages, $scope.labelSuggestions);
        LabelFilter.setLabelSuggestions($scope.labelSuggestions);
        $scope.images = LabelFilter.getLabelSelector().select($scope.unfilteredImages);
        $scope.emptyMessage = "No images to show";
        updateFilterWarning();
      });

      console.log("images (subscribe)", $scope.images);
    };
    watches.push(DataService.watch("images", $scope, imagesCallback));    

    // Also load builds so we can link out to builds associated with images
    var buildsCallback = function(builds) {
      $scope.$apply(function() {
        $scope.builds = builds.by("metadata.name");
      });

      console.log("builds (subscribe)", $scope.builds);
    };
    watches.push(DataService.watch("builds", $scope, buildsCallback));     

    var updateFilterWarning = function() {
      if (!LabelFilter.getLabelSelector().isEmpty() && $.isEmptyObject($scope.images) && !$.isEmptyObject($scope.unfilteredImages)) {
        $scope.alerts["images"] = {
          type: "warning",
          details: "The active filters are hiding all images."
        };
      }
      else {
        delete $scope.alerts["images"];
      }       
    };

    LabelFilter.onActiveFiltersChanged(function(labelSelector) {
      // trigger a digest loop
      $scope.$apply(function() {
        $scope.images = labelSelector.select($scope.unfilteredImages);
        updateFilterWarning();
      });
    });  

    $scope.$on('$destroy', function(){
      DataService.unwatchAll(watches);
    });        
  });