var expect = require('chai').expect;
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

describe('search page', function() {
    it('should return 200 status', function(done) {
        request
            .get('/search?inp=asdfas')
            .expect(200, done)
    });

    it('should contain search string', function(done) {
        request
            .get('/search?inp=asdfas')
            .expect(hasSearchTerm)
            .end(done);
        function hasSearchTerm(res){
            expect(res.text.indexOf('asdfas')).not.equal(-1);
        }
    });
});