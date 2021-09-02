const chai = require('chai')
const request = require('supertest')
const sinon = require('sinon')
const should = chai.should()

const app = require('../app')
const routes = require('../routes/index')
const db = require('../models')
const helpers = require('../_helpers');

describe('# A19: 建立 User Profile', function() {
    
  context('# [瀏覽 Profile]', () => {
    before(async() => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true);
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({id: 1, Followings: []});

      await db.User.create({name: 'User1'})
    })

    it(" GET /users/:id ", (done) => {
        request(app)
          .get('/users/1')
          .end(function(err, res) {
            res.text.should.include('User1')
            done()
        });
    });

    after(async () => {
      this.ensureAuthenticated.restore();
      this.getUser.restore();

      await db.Comment.destroy({where: {},truncate: true})
      await db.Restaurant.destroy({where: {},truncate: true})
      await db.sequelize.truncate()
    })
  })

  context('# [瀏覽編輯 Profile 頁面]', () => {
    before(async() => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true);
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({id: 1});

      await db.User.create({name: 'User1'})
    })

    it(" GET /users/:id/edit ", (done) => {
        db.User.findByPk(1).then(user => {
          user.isAdmin.should.equal(false);
          request(app)
            .get('/users/1/edit')
            .end(function(err, res) {
              res.text.should.include('form')
              db.User.findByPk(1).then(user => {
                user.name.should.equal('User1');
                return done();
              })
          });
        })
    });

    after(async () => {
      this.ensureAuthenticated.restore();
      this.getUser.restore();
      await db.Comment.destroy({where: {},truncate: true})
      await db.Restaurant.destroy({where: {},truncate: true})
      await db.sequelize.truncate()
    })

  })

  context('# [編輯 Profile]', () => {
    before(async() => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true);
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({id: 1});

      await db.User.create({name: 'User1'})
    })

    it(" PUT /users/:id ", (done) => {
      request(app)
        .put('/users/1')
        .type("form")
        .send({name: 'User1User1'})
        .end(function(err, res) {
          db.User.findByPk(1).then(user => {
            user.name.should.equal('User1User1');
            return done();
          })
      });
    });

    after(async () => {
      this.ensureAuthenticated.restore();
      this.getUser.restore();
      await db.Comment.destroy({where: {},truncate: true})
      await db.Restaurant.destroy({where: {},truncate: true})
      await db.sequelize.truncate()
    })

  })

})