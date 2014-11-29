var http = require('http');
var config = require('./config');
var url = require('url');
var fs = require('fs');
var path = require('path');

var root = path.resolve(config.public);

var getFilePath = function (url) {
    var filePath = path.resolve(path.join(root, url.pathname));

    if (filePath === root || filePath.slice(0, root.length + 1) === root + path.sep) {
        return filePath;
    }

    return null;
};

var addErrorHandlers = function (stream, req, res) {
    stream.on('error', function () {
        res.statusCode = 500;
        res.end('Internal server error');
    });

    req.on('close', function () {
        stream.destroy();
    });
};

var server = http.createServer(function(req, res) {
    var urlParsed = url.parse(req.url);
    var pathParsed = getFilePath(urlParsed);

    if (!pathParsed) {
        res.statusCode = 403;
        return res.end("No access");
    }

    if (req.method === 'GET') {

        if (!pathParsed) {
            res.statusCode = 403;
            return res.end("No access");
        }

        fs.stat(pathParsed, function (err, stat) {
            if (err || !stat.isFile()) {
                res.statusCode = 404;
                return res.end('File not found');
            }

            var fileStream = fs.createReadStream(pathParsed, {encoding: 'utf-8'});
            fileStream.pipe(res);
            addErrorHandlers(fileStream, req, res);
        });
    }

    if (req.method === 'POST') {
        req.setEncoding('utf-8');

        fs.stat(pathParsed, function (err, stat) {
            if (!err && stat.isFile()) {
                res.statusCode = 403;
                return res.end('No access to the file');
            }

            var fileStream = fs.createWriteStream(pathParsed, {encoding: 'utf-8'});
            req.pipe(fileStream);

            addErrorHandlers(fileStream, req, res);
            fileStream.on('finish', function () {
                res.end();
            });
        });
    }
});

module.exports = server;
