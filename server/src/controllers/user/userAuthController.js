const asyncHandler = require('../../utils/asyncHandler')
const { ApiError } = require('../../utils/ApiError')
const { ApiResponse } = require('../../utils/ApiResponse')
const User = require('../../models/user')
const cookie = require('cookie-parser')
const { uploadOnCloudinary } = require('../../utils/cloudinary')
const jwt = require('jsonwebtoken')
const { isEmailValid, isPhoneNumberValid, isPasswordStrong, isValidDOB } = require('../../utils/validations')

const generateAccessOrRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        if (error instanceof ApiError) {
            return next(error);
        }

        next(new ApiError(500, "Something went wrong while login"));
    }
}

const options = {
    httpOnly: true,
    secure: true
}

const register = asyncHandler(async (req, res) => {
    const {
        avatar,
        fullName,
        email,
        password,
        dateOfBirth,
        phoneNumber,
        houseNumber, area, landmark, city, state, country, pincode,
        verificationStatus = false
    } = req.body;

    if (
        [
            avatar, fullName, email, password, dateOfBirth, phoneNumber, houseNumber, area, landmark, city, state, country, pincode
        ].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    if (!isEmailValid(email)) {
        throw new ApiError(400, "Invalid Email Address");
    }
    if (!isPhoneNumberValid(phoneNumber)) {
        throw new ApiError(400, "Invalid Phone Number");
    } 
    if (!isPasswordStrong(password)) {
        throw new ApiError(400, "Password too weak");
    } 
    if (!verificationStatus) {
        throw new ApiError(400, "Please validate your email, phone number, and Aadhar Number");
    } 
    if (!isValidDOB(dateOfBirth)) {
        throw new ApiError(400, "Please enter a valid date of birth");
    }

    const isUser = await User.findOne({
        $or: [{ email }, { phoneNumber }]
    });

    if (isUser) {
        throw new ApiError(409, "User with this email or phone number already exists.");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatarPath = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarPath) {
        throw new ApiError(400, "Error uploading avatar. Please try again.");
    }

    const newUser = await User.create({
        avatar: avatarPath.url,
        fullName,
        email,
        password,
        dateOfBirth,
        phoneNumber,
        address: {
            houseNumber, area, landmark, city, state, country, pincode
        },
        verificationStatus
    });

    const createdUser = await User.findById(newUser._id).select(
        "-password -role -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user.");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
})

const login = asyncHandler(async (req, res) => {
    const { email, phoneNumber, password } = req.body;
    if (!email && !phoneNumber) {
        throw new ApiError(400, "Email or Phone Number is Required");
    }

    const user = await User.findOne({
        $or: [{ email }, { phoneNumber }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessOrRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-role -password -verificationStatus -refreshToken");
    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
                "User LoggedIn Successfully"
            )
        );
})

const logout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User has been successfully logded out"))
})

const generateAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    const decodeRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodeRefreshToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (user?.refreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessOrRefreshToken(user._id);

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                },
                "Token generated successfully"
            )
        );
})

module.exports = {
    register,
    login,
    logout,
    generateAccessToken
}
