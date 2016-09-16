(function () {
    'use strict';

    var url = extractUrl(location.href), popupShown = false;

    waitForElement('.ytp-button.ytp-settings-button', function () {
        var videoButtonSVG = $('<svg version="1.1" id="Layer_1" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" style="enable-background:new 0 0 1000 1000;" xml:space="preserve"><use class="ytp-svg-shadow" xlink:href="#bookmark"></use><path id="bookmark" d="M443,298c-31.1,0-56.3,25.2-56.3,56.2v394.6l112.7-112.7l112.7,112.7V354.2c0-31-25.2-56.2-56.3-56.2H443z" fill="#FF0000" /></svg>');
        var videoButton = $('<button class="ytp-button ytp-settings-button ytp-bookmark-button" aria-haspopup="true" aria-owns="ytp-main-menu-id" title="Settings"></button>');
        videoButton.append(videoButtonSVG);
        $('.ytp-button.ytp-settings-button').after(videoButton);

        videoButton.on('click', function () {
            if (popupShown) {
                closePopup();
            }
            else {
                var time = getCurrentTime();
                var videoPopup = $('<div id="videopopup" class="ytp-popup ytp-settings-menu ytp-bookmark-menu" data-layer="6" style="width: 350px; height: 35px;z-index:2147483647;display:inline!important;"><div class="ytp-panel" style="width: 350px; height: 35px;"><table><tr><td class="time"><label for="newbookmark">' + formatTime(time) + '</label></td><td class="text"><input type="text" autofocus id="newbookmark" placeholder="Bookmark label here.." /><a id="savenewbookmark"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" width="20px" height="20px" viewBox="0 0 490.434 490.433" style="enable-background:new 0 0 490.434 490.433;" xml:space="preserve"><path d="M472.003,58.36l-13.132-11.282c-21.798-18.732-54.554-16.644-73.799,4.697L165.39,295.359l-66.312-57.112   c-21.775-18.753-54.536-16.707-73.804,4.611l-11.611,12.848c-9.416,10.413-14.305,24.149-13.595,38.18   c0.717,14.023,6.973,27.188,17.402,36.6l121.553,111.311c10.524,9.883,24.628,15.037,39.044,14.272   c14.416-0.763,27.894-7.386,37.311-18.329l262.245-304.71c9.162-10.646,13.717-24.494,12.661-38.496   C489.229,80.522,482.655,67.512,472.003,58.36z" fill="#91DC5A"/></svg></a></td></tr></table></div></div>');
                $('#player-api').append(videoPopup);
                $('#newbookmark').focus();
                $('#newbookmark').on('keydown', function (e) {
                    if (e.keyCode == 13) {
                        saveBookmark(time, $('#newbookmark').val());
                        closePopup();
                        buildSeekPoints();
                    }
                    else if (e.keyCode == 27) {
                        closePopup();
                    }
                })
                var timeKeeper;
                $('#videopopup').focusout(function () {
                    timeKeeper = setTimeout(function () { closePopup(); }, 1000);
                });

                $('#savenewbookmark').on('click', function () {
                    saveBookmark(time, $('#newbookmark').val());
                    closePopup();
                    buildSeekPoints();
                });
                popupShown = true;
            }
        });

        $('.html5-main-video').on('canplaythrough', function () {
            url = extractUrl(location.href);
            buildSeekPoints();
        });

    });

    function saveBookmark(time, label) {
        chrome.runtime.sendMessage({
            event: 'SAVE',
            data: new VideoBookmark(
                null,
                time,
                label,
                url,
                1,
                getTitle(),
                Math.floor(Math.random() * (7 - 1 + 1)) + 1,
                new Date()
            )
        }, function (bookmark) {

        });
    }

    function closePopup() {
        $('#newbookmark').off('keydown');
        $('#savenewbookmark').off('click');
        $('.ytp-bookmark-menu').remove();
        popupShown = false;
    }

    function buildSeekPoints() {
        chrome.runtime.sendMessage({
            event: 'GET',
            data: url
        }, function (bookmarks) {
            $('.ytp-progress-list .bookmark').remove();
            _.each(bookmarks, function (bookmark) {
                $('.ytp-progress-list').append('<div class="bookmark" style="left:' + Math.round((bookmark._time / getDuration()) * 100) + '%"></div>');
            })
        });
    }

    function getDuration() {
        return Math.round($('.html5-main-video').get(0).duration);
    }

    function getCurrentTime() {
        return Math.round($('.html5-main-video').get(0).currentTime);
    }

    function getTitle() {
        return $(document).attr('title');
    }

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.event == 'REFRESH') {
                closePopup();
                buildSeekPoints();
            }
            else if (request.event == 'TIME') {
                sendResponse({
                    duration: getCurrentTime()
                });
            }
        }
    );

    function waitForElement(selector, callback) {
        if ($(selector).length) {
            callback();
        }
        else {
            setTimeout(function () {
                waitForElement(selector, callback);
            }, 100);
        }
    }

})();