const chai = require('chai')
const request = require('supertest')
const sinon = require('sinon')
const should = chai.should()

const app = require('../app')
const routes = require('../routes/index')
const db = require('../models')
const helpers = require('../_helpers');

describe('# A17: 使用者權限管理', function () {

  context('# [顯示使用者清單]', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true);
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1, isAdmin: true });

      await db.User.create({ name: 'User1' })
    })

    it(" GET /admin/users ", (done) => {
      request(app)
        .get('/admin/users')
        .end(function (err, res) {
          res.text.should.include('User1')
          done()
        });
    });

    after(async () => {
      this.ensureAuthenticated.restore();
      this.getUser.restore();
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true });
      await db.User.destroy({ where: {}, truncate: true, force: true, })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true });
    })

  })

  context('# [修改使用者權限]', () => {
    before(async () => {
      this.ensureAuthenticated = sinon.stub(
        helpers, 'ensureAuthenticated'
      ).returns(true);
      this.getUser = sinon.stub(
        helpers, 'getUser'
      ).returns({ id: 1, isAdmin: true });

      await db.User.create({ name: 'User1', isAdmin: false })
    })

    it(" PUT /admin/users/:id/toggleAdmin ", (done) => {
      db.User.findByPk(1).then(user => {
        user.isAdmin.should.equal(false);
        request(app)
          .put('/admin/users/1/toggleAdmin')
          .type("form")
          .end(function (err, res) {
            db.User.findByPk(1).then(user => {
              user.name.should.equal('User1');
              user.isAdmin.should.equal(true);
              return done();
            })
          });
      })
    });

    after(async () => {
      this.ensureAuthenticated.restore();
      this.getUser.restore();
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true });
      await db.User.destroy({ where: {}, truncate: true, force: true, })
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true });
    })

  })
})