const asyncHandler = require('../../utils/asyncHandler')
const { ApiError } = require('../../utils/ApiError')
const { ApiResponse } = require('../../utils/ApiResponse')
const User = require('../../models/user')
const { uploadOnCloudinary } = require('../../utils/cloudinary')
const { isPasswordStrong } = require('../../utils/validations')

const updateUserName = asyncHandler(async (req, res, next) => {
    const { fullName } = req.body;

    if (fullName.trim() === "") {
        throw new ApiError(400, "Name is required");
    }

    const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        { fullName },
        { runValidators: false, new: true }
    );

    res.status(200).json(
        new ApiResponse(200, { newName: updatedUser.fullName }, "User Updated Successfully")
    );
});

const updateUserAddress = asyncHandler(async (req, res) => {
    const { houseNumber, area, landmark, city, state, country, pincode } = req.body;

    if (
        [houseNumber, area, landmark, city, state, country, pincode]
            .some((fields) => fields.trim() === "")
    ) throw new ApiError(400, "All fields are required")

    const updatedUser = await User.findOneAndUpdate(
        { _id: req.user._id },
        {
            address: {
                houseNumber, area, landmark, city, state, country, pincode
            }
        },
        { runValidators: false, new: true }
    ).select("address")

    res.status(200).json(
        new ApiResponse(200, { newName: updatedUser.fullName }, "User Updated Successfully")
    )
})

const updateUserPassword = asyncHandler(async (req, res) => {
    const { email, phoneNumber, oldPassword, newPassword, confirmNewPassword } = req.body

    if (newPassword !== confirmNewPassword) throw new ApiError(400, "New password and Confirm password does not match");
    if (!isPasswordStrong(newPassword)) throw new ApiError(400, "Password too weak");

    const user = await User.findOne({
        $or: [{ email }, { phoneNumber }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    res.status(200).json(
        new ApiResponse(200, {}, "Password Updated Successfully")
    )
})

module.exports = {
    updateUserName, updateUserAddress, updateUserPassword
}