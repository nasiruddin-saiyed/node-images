/*
 * uploadServer.js
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 ZhangYuanwei <zhangyuanwei1988@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sub license, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice (including the
 * next paragraph) shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
 * IN NO EVENT SHALL INTEL AND/OR ITS SUPPLIERS BE LIABLE FOR
 * ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    bodyParser = require('body-parser'),
    images = require('../index');


var app = express();

const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/upload/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.indexOf("image") > -1) {
        cb(null, true);
    } else {
        // rejects storing a file
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 24
    },
    fileFilter: fileFilter
});


// config express server packages
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser({
//     uploadDir: __dirname + '/upload'
// }));

app.use(express.static(__dirname + '/upload'));

app.get('/', function (req, res) {
    res.send('<form method="post" enctype="multipart/form-data" action="/upload"><input type="file" name="photo" /><input type="submit" /></form>');
});

app.post('/upload',upload.single("photo"),function (req, res) {
    var tmp_path = req.file.path,
        out_path = tmp_path + '.jpg',
        photo;

    photo = images(tmp_path);
    photo.size(800)
        .draw(images('./logo.png'), 800 - 421, photo.height()/2)
        .save(out_path, {
            quality: 80
        });

    fs.unlink(tmp_path, function (err) {
        if (err) throw err;
        res.send('<a href="/" title="upload"><img src="/' + path.basename(out_path) + '" /></a>');
    });
});

app.listen(3000, function () {
    console.log("Server Listning on port :: 3000");
    console.log("process.versions.modules :: ",process.versions.modules);
    

});
