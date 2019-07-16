module.exports = function(app) {
  var webapp = require('../controller/Controller');

  // Routes
  app.route('/api/v1/users/')
  	.get(webapp.list_users)
    .post(webapp.create_user)
    .delete(webapp.error)
    .put(webapp.error)
  	.patch(webapp.error)
  	.head(webapp.error)
  app.route('/api/v1/users/:username')
  	.all(webapp.delete_user)
  app.route('/api/v1/_count')
    .all(webapp.httpreq)
}
