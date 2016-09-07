(function() {
'use strict';

var ypattern = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

angular.module('app', ['ngMaterial', 'ngAnimate', '720kb.socialshare', 'ngMessages'])
.config(Config)
.controller('BookMarksController', BookMarksController)
.controller('PopupController', PopupController)
.controller('ShareController', ShareController)
.directive('bookMarkItem', BookMarkItemDirective)
.directive('onEnter', OnEnterDirective)
.filter('search', SearchFilter);

Config.$inject = ['$mdThemingProvider', '$compileProvider'];
function Config($mdThemingProvider, $compileProvider){
    $mdThemingProvider.theme('altTheme')
          .primaryPalette('yellow')
          .dark();
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
}

ShareController.$inject = ['$location', '$timeout'];
function ShareController($location, $timeout){

    var vm = this;

    var id = $location.search().id;

    VideoBookmark.get(id).then(function(bookmark){
        $timeout(function(){
            vm.title = bookmark.title;
            vm.text = bookmark.text;
            vm.url = bookmark.url.replace("https://www.youtube.com/watch?v=", "https://youtu.be/") + "?t=" + bookmark.time + "s";
        }, 0);
    });

    vm.openMailTo = function(){
        var emailUrl = 'mailto:?subject=' + vm.text + '&body=' + vm.url;
        chrome.tabs.create({ url: emailUrl }, function(tab) {
            
        });
    } 

}

OnEnterDirective.$inject = ['$parse'];
function OnEnterDirective($parse) {
    // Usage:
    //
    // Creates:
    //
    var directive = {
        compile: compile,
        restrict: 'A'
    };
    return directive;
    
    function compile(element, attrs) {
        var fn = $parse(attrs["onEnter"], null, true);
        return function(scope, element){
            element.bind("keydown keypress", function(event){
                var key = event.which || event.keyCode || 0;
                if(key === 13){
                    scope.$evalAsync(function (){
                        fn(scope, { });
                    });
                    event.preventDefault();
                }
            })
        }
    }
}

function SearchFilter(){
    return function(bookmarks, searchTerm){
        if(searchTerm && searchTerm.trim()){
            return _.filter(bookmarks, function(bookmark){
                return (bookmark.text.toLowerCase().indexOf(searchTerm.trim().toLowerCase()) >= 0) || (bookmark.title.toLowerCase().indexOf(searchTerm.trim().toLowerCase()) >= 0); 
            });
        }
        else{
            return bookmarks; 
        }
    }
}

BookMarksController.$inject = ['$timeout'];
function BookMarksController($timeout){
    var vm = this;
    vm.bookmarks = [];
    VideoBookmark.getAll().then(function(bookmarks){
        bookmarks = _.sortBy(bookmarks, function(bookmark){
            return bookmark.createdOn;
        }).reverse();
        _.each(bookmarks, function(bookmark){
            $timeout(function(){
                vm.bookmarks.push(bookmark);
            }, 0);
        })
    });
    vm.goto = function(bookmark){
        var targetUrl = bookmark.url + "?t=" + bookmark.time + "s";
        chrome.tabs.update(vm.tabId, {url: targetUrl.replace("https://www.youtube.com/watch?v=", "https://youtu.be/")});
    }
    vm.share = function(bookmark){
        chrome.tabs.create({'url': chrome.extension.getURL('share.html#?id=' + bookmark.id)}, function(tab) {
            // Tab opened.
        });
    }
    vm.formatTime = formatTime;
    vm.randomNumber = function(){
        return Math.round(Math.random() * (8 - 1) + 1);
    }
    vm.thumbURL = function(bookmark){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = bookmark.url.match(regExp);
        var id = (match&&match[7].length==11)? match[7] : false;
        return "http://img.youtube.com/vi/" + id + "/mqdefault.jpg"
    }
    vm.formattedURL = function(bookmark){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = bookmark.url.match(regExp);
        var id = (match&&match[7].length==11)? match[7] : false;
        return "youtu.be/" + id + "?t=" + bookmark.time + "s";
    }
    vm.openMenu = function($mdOpenMenu, ev) {
      $mdOpenMenu(ev);
    };
    vm.deleteBookmark = function(bookmark){
        var index = _.findIndex(vm.bookmarks, function(item){
            return item.id == bookmark.id;
        });
        vm.bookmarks.splice(index, 1);
        VideoBookmark.del(bookmark.id);
    };
}

PopupController.$inject = ['$timeout'];
function PopupController($timeout){
    var vm = this;
    
    vm.bookmarks = [];
    vm.isYoutube = false;
    vm.newtime = "00:00:30";
    vm.newtext = "";
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        vm.tabId = tabs[0].id;
        chrome.tabs.sendMessage(vm.tabId, {
            event: "TIME",
            data: {}
        }, function (response) {
            vm.newtime = formatTime(response.duration);
        });
        var url = extractUrl(tabs[0].url);
        if(url.match(ypattern)){
            $timeout(function(){
                vm.isYoutube = true;
            }, 0);
        }
        VideoBookmark.getAll(url).then(function(bookmarks){
            bookmarks = _.sortBy(bookmarks, function(bookmark){
                return bookmark.time;
            });
            _.each(bookmarks, function(bookmark){
                $timeout(function(){
                    vm.bookmarks.push(bookmark);
                }, 0);
            })
        });
    });
    vm.gotoBookmarks = function(){
        chrome.tabs.create({'url': chrome.extension.getURL('bookmarks.html')}, function(tab) {
            // Tab opened.
        });
    }
    vm.goto = function(bookmark){
        var targetUrl = bookmark.url + "?t=" + bookmark.time + "s";
        chrome.tabs.update(vm.tabId, {url: targetUrl.replace("https://www.youtube.com/watch?v=", "https://youtu.be/")});
    }
    vm.share = function(bookmark){
        chrome.tabs.create({'url': chrome.extension.getURL('share.html#?id=' + bookmark.id)}, function(tab) {
            // Tab opened.
        });
    }
    vm.deleteBookmark = function(bookmark){
        var index = _.findIndex(vm.bookmarks, function(item){
            return item.id == bookmark.id;
        });
        vm.bookmarks.splice(index, 1);
        VideoBookmark.del(bookmark.id);
        chrome.tabs.sendMessage(vm.tabId, {
            event: "REFRESH",
            data: {}
        }, function (response) {

        });
    };
    
    vm.save = function(){
        chrome.tabs.get(vm.tabId, function (tab) {
            var time = convertTime(vm.newtime);
            var text = vm.newtext;
            var url = extractUrl(tab.url);
            var bookmark = new VideoBookmark(null, time, text, url, 1, tab.title, Math.round(Math.random() * (8 - 1) + 1));
            bookmark.save();
            $timeout(function(){
                vm.bookmarks.length = 0;
                VideoBookmark.getAll(url).then(function(bookmarks){
                    bookmarks = _.sortBy(bookmarks, function(bookmark){
                        return bookmark.time;
                    });
                    $timeout(function(){
                        _.each(bookmarks, function(bookmark){
                            vm.bookmarks.push(bookmark);
                        })
                    }, 0);
                });
                vm.newtext = "";
                chrome.tabs.sendMessage(vm.tabId, {
                    event: "REFRESH",
                    data: {}
                }, function (response) {

                });
                $("#newtext").focus();
            }, 0);
        });
    }
    vm.formatTime = formatTime;
    function convertTime(str){
        var parts = str.split(':');
        var seconds = 0;
        for(var i = (parts.length - 1), j = 0; i >= 0; i--, j++){
            seconds += (parts[i] * Math.pow(60, j));
        }
        return seconds;
    }
}

BookMarkItemDirective.$inject = [];
function BookMarkItemDirective(){

    var directive = {
        bindToController: true,
        controller: BookMarkItemController,
        controllerAs: 'vm',
        link: link,
        restrict: 'EA',
        scope: {
        }
    };
    return directive;
    
    function link(scope, element, attrs) {

    }

}

BookMarkItemController.$inject = [];
function BookMarkItemController(){

}

})();