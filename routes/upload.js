var Image = require('../models/Image');
var images = require('./images');
var fs = require('fs');

exports.post = function (req, res) {
    console.log(req.files);
    /*console.log("body");
    console.log(req.body.data);
    var fr = new FileReader();
    fr.readAsDataURL(req.body.data.dataURL);
    console.log("1");
    fr.onload(function (err) {
        if (err) console.log("2");
        console.log("3");
        fs.writeFile("/images/111", fr.result);
        console.log("Success");
    });*/
    if (req.body.data) {
        return res.json({
            success_: false
        });
    }
    if (!req.files) {
        console.log("333");
        return res.status(400).send('No files were uploaded.');
    }

    var sampleFile = req.files.file;
    var path = '/images/' + sampleFile.name;
    sampleFile.mv('./public' + path, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        var img = new Image(images.id, path, '', '', '', '');
        images.images.push(img.toJSON());
        images.id++;

        res.json({
            success_: true,
            error_: 0,
            text_: "Done!",
            toAdd: img});
    });
};
