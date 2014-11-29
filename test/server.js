var request = require('supertest');
var server = require('../server');
var fs = require('fs');
var config = require('../config');
var path = require('path');

describe("server", function() {
    var fileName = '/data' + Date.now() + '.html';
    var string = 'Some info';
    var url = 'http://127.0.0.1:4040';

    after(function () {
      fs.unlinkSync(path.join(config.public, fileName));
    });

    describe("POST /file", function () {

        it("should allow to write data to a file", function(done) {
            request(url)
                .post(fileName)
                .send(string)
                .expect(200, done);
        });

        it("shouldn't allow to write to the existing file", function (done) {
            request(url)
                .post(fileName)
                .send(string)
                .expect(403)
                .expect('No access to the file')
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

    describe("GET /file", function () {

        it("should allow to read file", function (done) {
            request(url)
                .get(fileName)
                .expect(200)
                .expect(string, done);
        });


        it("should return a 404 status if file doesn't exist", function (done) {
            request(url)
                .get('/data_no_file.html')
                .expect(404)
                .expect('File not found')
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });

        it ("shouldn\'t allow to read file from different folder", function (done) {
            request(url)
                .get('/../package.json')
                .expect(403)
                .expect('No access')
                .end(function (err) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
        });
    });

});
