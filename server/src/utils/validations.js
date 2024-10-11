var validator = require('validator');

const isEmailValid = (email) => {
    return validator.isEmail(email);
}

const isPhoneNumberValid = (phoneNumber) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phoneNumber);
};

const isPasswordStrong = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return regex.test(password);
};

function isValidDOB(dob) {
    const dobPattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!dobPattern.test(dob)) {
        return false;
    }

    const dobDate = new Date(dob);

    const today = new Date();
    if (dobDate.toString() === "Invalid Date" || dobDate >= today) {
        return false;
    }

    return true;
}


module.exports = {
    isEmailValid, isPhoneNumberValid, isPasswordStrong, isValidDOB
}