class File {
    constructor(id, url) {
        this.id = id;
        this.url = url;
        this.type = url.substring(url.lastIndexOf(".") + 1, url.length);
    }

    toJSON() {
        return {
            id: this.id,
            url: this.url,
            type: this.type
        }
    }
}
module.exports = File;