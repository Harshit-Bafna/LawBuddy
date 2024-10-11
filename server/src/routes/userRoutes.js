const express = require('express');
const router = express.Router();
const { register, login, logout, generateAccessToken } = require('../controllers/userController');
const { upload } = require('../middlewares/multerMiddleware');
const verifyJWT = require('../middlewares/userAuthMiddleware');

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]),
    register
);

router.route('/login').post(login);
router.route('/logout').post(verifyJWT, logout);
router.route('/accessToken').get(generateAccessToken);

module.exports = router;