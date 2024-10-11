const asyncHandler = require('../../utils/asyncHandler')
const { ApiError } = require('../../utils/ApiError')
const { ApiResponse } = require('../../utils/ApiResponse')
const User = require('../../models/user')
const AadharData = require('../../../AadharData.json')

const emailVerification = asyncHandler(async (req, res) => {
    const { email } = req.body
})

const phoneNumberVerification = asyncHandler(async (req, res) => {
    const { phoneNumber } = req.body
})

const AadharVerification = asyncHandler((req, res) => {
    const {fullName, email, phoneNumber, dateOfBirth, AadharNumber} = req.body;
    const userAadharData = AadharData.filter((number) => number.aadharNumber === AadharNumber)
    if ((userAadharData[0].name === fullName) && (userAadharData[0].dob === dateOfBirth)
        && (userAadharData[0].email === email) && (userAadharData[0].phone === phoneNumber)) {
        return true
    }
    else {
        return false
    }
})

module.exports = {
    emailVerification, phoneNumberVerification, AadharVerification
}