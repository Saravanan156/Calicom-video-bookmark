'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var db = new Dexie('dbVideoBookmark');

db.version(1).stores({
    bookmarks: 'id,url'
});

var VideoBookmark = function () {
    function VideoBookmark(id, time, text, url, emoticon, title, color, createdOn) {
        _classCallCheck(this, VideoBookmark);

        this._id = id;
        this._time = time;
        this._text = text;
        this._url = url;
        this._emoticon = emoticon;
        this._title = title;
        this._color = color;
        this._createdOn = createdOn;
    }

    _createClass(VideoBookmark, [{
        key: 'save',
        value: function save() {
            if (this._id) {
                db.bookmarks.update(this._id, {
                    time: this._time,
                    text: this._text,
                    url: this._url,
                    emoticon: this._emoticon,
                    title: this._title,
                    color: this._color
                });
            } else {
                this._id = newGuid();
                db.bookmarks.add({
                    id: this._id,
                    time: this._time,
                    text: this._text,
                    url: this._url,
                    emoticon: this._emoticon,
                    title: this._title,
                    color: this._color,
                    createdOn: new Date()
                });
            }
        }
    }, {
        key: 'id',
        get: function get() {
            return this._id;
        }
    }, {
        key: 'time',
        get: function get() {
            return this._time;
        },
        set: function set(time) {
            this._time = time;
        }
    }, {
        key: 'text',
        get: function get() {
            return this._text;
        },
        set: function set(text) {
            this._text = text;
        }
    }, {
        key: 'emoticon',
        get: function get() {
            return this._emoticon;
        },
        set: function set(emoticon) {
            this._emoticon = emoticon;
        }
    }, {
        key: 'url',
        get: function get() {
            return this._url;
        },
        set: function set(url) {
            this._url = url;
        }
    }, {
        key: 'title',
        get: function get() {
            return this._title;
        },
        set: function set(title) {
            this._title = title;
        }
    }, {
        key: 'color',
        get: function get() {
            return this._color;
        },
        set: function set(color) {
            this._color = color;
        }
    }, {
        key: 'createdOn',
        get: function get() {
            return this._createdOn;
        },
        set: function set(createdOn) {
            this._createdOn;
        }
    }], [{
        key: 'getAll',
        value: function getAll(url) {
            return new Promise(function (resolve, reject) {
                if (!url) {
                    db.bookmarks.toArray(function (bookmarks) {
                        resolve(_.map(bookmarks, function (bookmark) {
                            return new VideoBookmark(bookmark.id, bookmark.time, bookmark.text, bookmark.url, bookmark.emoticon, bookmark.title, bookmark.color, bookmark.createdOn);
                        }));
                    });
                } else {
                    db.bookmarks.where('url').equalsIgnoreCase(url).toArray(function (bookmarks) {
                        resolve(_.map(bookmarks, function (bookmark) {
                            return new VideoBookmark(bookmark.id, bookmark.time, bookmark.text, bookmark.url, bookmark.emoticon, bookmark.title, bookmark.color, bookmark.createdOn);
                        }));
                    });
                }
            });
        }
    }, {
        key: 'get',
        value: function get(id) {
            return new Promise(function (resolve, reject) {
                db.bookmarks.where('id').equalsIgnoreCase(id).toArray(function (bookmarks) {
                    var bookmark = bookmarks[0];
                    resolve(new VideoBookmark(bookmark.id, bookmark.time, bookmark.text, bookmark.url, bookmark.emoticon, bookmark.title, bookmark.color, bookmark.createdOn));
                });
            });
        }
    }, {
        key: 'del',
        value: function del(id) {
            db.bookmarks.delete(id);
        }
    }]);

    return VideoBookmark;
}();