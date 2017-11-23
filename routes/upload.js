const Image = require('../models/Image');
const images = require('./images');
const fs = require('fs');
const File = require('../models/File');
let id = 2;

exports.post = function (req, res) {
    console.log(req.files);
    if (req.body.data) {
        return res.json({
            success_: false
        });
    }
    if (!req.files) {
        console.log("333");
        return res.status(400).send('No files were uploaded.');
    }

    const sampleFile = req.files.file;
    let path = '/images/' + sampleFile.name;
    sampleFile.mv('./public' + path, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        //let f = new File(id++, path);
        let img = new Image(images.id, path, '', '', '', '');

        res.json({
            success_: true,
            error_: 0,
            text_: "Done!",
            toAdd: img});

        /*let img = new Image(images.id, path, '', '', '', '');
        images.images.push(img.toJSON());
        images.id++;

        res.json({
            success_: true,
            error_: 0,
            text_: "Done!",
            toAdd: img});*/
    });
};
