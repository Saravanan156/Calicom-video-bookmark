var db = new Dexie('dbVideoBookmark');

db.version(1).stores({
    bookmarks: "id,url"
});

class VideoBookmark {

    constructor(id, time, text, url, emoticon, title, color, createdOn){
        this._id = id;
        this._time = time;
        this._text = text;
        this._url = url;
        this._emoticon = emoticon;
        this._title = title;
        this._color = color;
        this._createdOn = createdOn;
    }

    get id(){
        return this._id;
    }
    get time(){
        return this._time;
    }
    set time(time){
        this._time = time;
    }
    get text(){
        return this._text;
    }
    set text(text){
        this._text = text;
    }
    get emoticon(){
        return this._emoticon;
    }
    set emoticon(emoticon){
        this._emoticon = emoticon;
    }
    get url(){
        return this._url;
    }
    set url(url){
        this._url = url;
    }
    get title(){
        return this._title;
    }
    set title(title){
        this._title = title;
    }
    get color(){
        return this._color;
    }
    set color(color){
        this._color = color;
    }
    get createdOn(){
        return this._createdOn;
    }
    set createdOn(createdOn){
        this._createdOn
    }

    static getAll(url){
        return new Promise(function(resolve, reject){
            if(!url){
                db.bookmarks.toArray(function(bookmarks){
                    resolve(_.map(bookmarks, function(bookmark){ return new VideoBookmark(bookmark.id, bookmark.time, bookmark.text, bookmark.url, bookmark.emoticon, bookmark.title, bookmark.color, bookmark.createdOn);  }));
                });
            }
            else{
                db.bookmarks.where('url').equalsIgnoreCase(url).toArray(function(bookmarks){
                    resolve(_.map(bookmarks, function(bookmark){ return new VideoBookmark(bookmark.id, bookmark.time, bookmark.text, bookmark.url, bookmark.emoticon, bookmark.title, bookmark.color, bookmark.createdOn);  }));
                });
            }
        });
    }

    static get(id){
        return new Promise(function(resolve, reject){
            db.bookmarks.where('id').equalsIgnoreCase(id).toArray(function(bookmarks){
                var bookmark = bookmarks[0];
                resolve(new VideoBookmark(bookmark.id, bookmark.time, bookmark.text, bookmark.url, bookmark.emoticon, bookmark.title, bookmark.color, bookmark.createdOn));
            });
        });
    }

    static del(id){
        db.bookmarks.delete(id);
    }

    save(){
        if(this._id){
            db.bookmarks.update(this._id, {
                time: this._time,
                text: this._text,
                url: this._url,
                emoticon: this._emoticon,
                title: this._title,
                color: this._color
            });
        }
        else{
            this. _id = newGuid();
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

}