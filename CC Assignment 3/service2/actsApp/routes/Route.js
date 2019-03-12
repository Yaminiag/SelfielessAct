module.exports = function(app) {
  var webapp = require('../controllers/Controller');

  // Routes

  app.route('/api/v1/categories')
  	.get(webapp.list_category)
  	.post(webapp.create_category)
  	.put(webapp.error)
  	.patch(webapp.error)
  	.head(webapp.error)
  app.route('/api/v1/categories/:categoryName')
  	.all(webapp.delete_category)

  app.route('/api/v1/acts')
  	.get(webapp.error)
  	.post(webapp.upload_act)
  	.put(webapp.error)
  	.patch(webapp.error)
  	.head(webapp.error)
  app.route('/api/v1/acts/upvote')
  	.all(webapp.upvote_act)
  app.route('/api/v1/acts/:aid')
  	.all(webapp.delete_act)

  app.route('/api/v1/categories/:name/acts/size')
  	.all(webapp.category_actcount)

  
  app.route('/api/v1/categories/:catName/acts')
  	.all(webapp.list_acts)
 }
