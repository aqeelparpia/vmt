const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const middleware = require('../middleware/api');
const errors = require('../middleware/errors');

router.param('resource', middleware.validateResource)
router.param('id', middleware.validateId);

router.get('/:resource', (req, res, next) => {
	const controller = controllers[req.params.resource];

  controller.get(req.query.params)
    .then(results => res.json({ results }))
	  .catch(err => errors.sendError.InternalError(null, res))
})

// router.get('/:resource/ids', (req, res, next) => {
// 	let resource = req.params.resource;
// 	let controller = controllers[resource];
// 	if (controller == null){
// 		return res.status(400).json(defaultError)
// 	}
// 	controller.get(req.query.params).then(res => {
// 		res.json({
// 			confirmation: 'success',
// 			results: results
// 		})
// 	})
// 	.catch(err => {
// 		res.status(404).json({
// 			confirmation: 'fail',
// 			errorMessage: err
// 		})
// 	})
// })

router.get('/:resource/:id', middleware.validateUser, (req, res, next) => {
  const { id, resource } = req.params.id;
	const controller = controllers[resource];

	controller.getById(id)
	  .then(result => res.json({ result }))
	  .catch(err => errors.sendError.InternalError(null, res))
})

router.post('/:resource', middleware.validateUser, (req, res, next) => {
	const controller = controllers[req.params.resource]

	controller.post(req.body)
	  .then(result => res.json({ result }))
	  .catch(err => errors.sendError.InternalError(null, res))
})

router.put('/:resource/:id/add', middleware.validateUser, (req, res, next) => {
	const { resource, id } = req.params;
	const controller = controllers[resource];

	controller.add(id, req.body)
    .then(result => res.json({ result }))
    .catch(err => errors.sendError.InternalError(null, res))
})

router.put('/:resource/:id/remove', middleware.validateUser, (req, res, next) => {
	const { resource, id } = req.params;
	const controller = controllers[resource];

  controller.remove(id, req.body)
    .then(result => res.json(result))
    .catch(err => errors.sendError.InternalError(null, res))
})

router.put('/:resource/:id', middleware.validateUser, (req, res, next) => {
	const { resource, id } = req.params;
	const controller = controllers[resource];

  controller.put(id, req.body)
    .then(result => res.json(result))
    .catch(err => errors.sendError.InternalError(null, res))
})

router.delete('/:resource/:id', middleware.validateUser, (req, res, next) => {
  let { resource, id } = req.params;
  let controller = controllers[resource];

  controller.delete(id)
    .then(result => res.json(result))
    .catch(err => errors.sendError.InternalError(null, res))
})

module.exports = router;
