class Image{
    constructor(id, url, title, description, credits, year) {
        this.id = id;
        this.url = url;
        this.title = title;
        this.description = description;
        this.credits = credits;
        this.year = year;
    }

    toJSON() {
        return {
            id: this.id,
            url: this.url,
            title: this.title,
            description: this.description,
            credits: this.credits,
            year: this.year
        }
    }
}
module.exports = Image;