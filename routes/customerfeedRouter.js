const router = require('express').Router()
const customerfeedCtrl = require('../controllers/customerfeedCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')


router.route('/customerfeed')
    .post(auth, customerfeedCtrl.createCustomerfeed)





module.exports = router