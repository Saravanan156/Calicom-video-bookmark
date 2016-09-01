(function(){
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
          if(request.event == "SAVE"){
              var bookmark = new VideoBookmark(
                  request.data._id,
                  request.data._time,
                  request.data._text,
                  request.data._url,
                  request.data._emoticon,
                  request.data._title,
                  request.data._color,
                  request.data._createdOn
              );
              bookmark.save();
              sendResponse({});
          }
          else if(request.event == "GET"){
              VideoBookmark.getAll(request.data)
              .then(function(bookmarks){
                  sendResponse(bookmarks || []);
              });
              return true;
          }
      }
    );
})();

// 'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
  chrome.pageAction.show(tabId);
});

// console.log('\'Allo \'Allo! Event Page for Page Action');

