var should = require('chai').should();
var request = require('supertest')(require('../app.js'));

describe('index page', function() {
    it('should return 200 status', function(done) {
        request
            .get('/')
            .expect(200, done);
    });
});

describe('favicon', function() {
    it('should be served statically', function(done) {
        request
            .get('/favicon.ico')
            .expect(200, done);
    });
});