const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema(
    {
        avatar: {
            type: String,
            required: true
        },
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: [String],
            enum: ['super_admin', 'admin', 'editor', 'lawyer', 'user', 'creator'],
            default: 'user'
        },
        phoneNumber: {
            type: Number,
            required: true,
            unique: true,
            index: true
        },
        address: {
            houseNumber: {
                type: Number,
                required: true
            },
            area: {
                type: String,
                required: true
            },
            landmark: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            country: {
                type: String,
                default: 'India',
                required: true
            },
            pincode: {
                type: Number,
                required: true
            }
        },
        verificationStatus: {
            type: Boolean,
            default: false
        },
        likedVideos: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Video",
            default: null
        },
        refreshToken: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function () {
    return await jwt.sign(
        {
            _id: this._id,
            fullName: this.fullName,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function () {
    return await jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model('User', userSchema);
module.exports = User;
