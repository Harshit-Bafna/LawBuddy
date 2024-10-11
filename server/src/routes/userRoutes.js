const express = require('express');
const router = express.Router();
const { register, login, logout, generateAccessToken } = require('../controllers/user/userAuthController');
const {updateUserName, updateUserAddress, updateUserPassword} = require('../controllers/user/userUpdateController')
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
router.route('/updateUserName').patch(verifyJWT, updateUserName);
router.route('/ ').patch(verifyJWT, updateUserAddress);
router.route('/updateUserPassword').patch(verifyJWT, updateUserPassword);

module.exports = router;