
var Bench = require('../lib/child-bench')
var should = require('chai').should()

var sync = __dirname + '/support/sync-file.js'
var async = __dirname + '/support/async-file.js'
var before = __dirname + '/support/before.js'
var run = __dirname + '/support/run.js'

describe('file bench', function () {
  describe('.do()', function () {
    it('should return a promise for result data', function (done) {
      var bench = new Bench('sync', sync)
      bench.do(10).then(function(res){
        bench.close()
        res.should.be.a('object')
        res.should.have.keys([
          'name',
          'total',
          'iterations'
        ])
        res.name.should.equal('sync')
        res.total.should.be.a('number')
        res.iterations.should.equal(10)
      }).node(done)
    })

    it('should be able to call it more than once', function (done) {
      var bench = new Bench('sync', sync)
      bench.do(10).then(function(a){
        return bench.do(5).then(function(b){
          bench.close()
          b.should.be.a('object')
          a.should.not.equal(b)
        })
      }).node(done)
    })

    it('should handle async benchmarks', function (done) {
      var bench = new Bench('async', async)
      bench.do(10).then(function(res){
        bench.close()
        res.should.be.a('object')
        res.total.should.be.a('number')
          .and.be.within(80e6, 200e6)
      }).node(done)
    })

    it('should report errors', function(done){
      var file = __dirname + '/support/child-error.js'
      var bench = new Bench('error', file)
      bench.do(10).read(null, function(err){
        bench.close()
        err.should.be.an.instanceOf(Error)
        err.should.have.property('message', 'wat')
        done()
      })
    })

    it('should report async errors', function(done){
      var file = __dirname + '/support/child-error-async.js'
      var bench = new Bench('error', file)
      bench.do(10).read(null, function(err){
        bench.close()
        err.should.be.an.instanceOf(Error)
        err.should.have.property('message', 'wat')
        done()
      })
    })
  })

  describe('.close()', function () {
    it('should terminate its child process', function () {
      var bench = new Bench('async', async)
      bench.close()
      bench.child.connected.should.be.false
      bench.child.killed.should.be.true
    })
  })

  describe('before(fn)', function () {
    it('should call `fn` before each run', function (done) {
      var bench = new Bench('before', before)
      bench.do(10).then(function(res){
        bench.close()
        res.should.be.a('object')
      }).node(done)
    })

    it('async', function(done){
      var file = __dirname + '/support/before-async.js'
      var bench = new Bench('before', before)
      bench.do(10).then(function(res){
        bench.close()
        res.should.be.a('object')
      }).node(done)
    })
  })

  describe('run(fn)', function () {
    it('should take precedence over the exported function', function (done) {
      var bench = new Bench('run', run)
      bench.do(10).then(function(res){
        bench.close()
        res.should.be.a('object')
      }).node(done)
    })
  })
})
