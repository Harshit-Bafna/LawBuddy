const User = require('../models/user');
const { ApiError } = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler')
const jwt = require('jsonwebtoken')

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!token) {
            throw new ApiError(401, "Unauthorized access")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-role -password -verificationStatus -refreshToken");
    
        if(!user) {
            throw new ApiError(401, "Invalod Access Token");
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})

module.exports = verifyJWT;