const router = require('express').Router()
const rateCtrl = require('../controllers/rateCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
const rateidentify= require('../middleware/rateidentify')


router.route('/rate')
    .get(rateCtrl.allrate)
    .post(rateCtrl.createRate)

router.route('/ratecalc').post(auth, rateidentify, rateCtrl.calculaterate)

module.exports = router    