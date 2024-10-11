class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.ststusCode = statusCode
        this.errors = errors
        this.data = null
        this.message = message
        this.success = false
    }
}

module.exports = { ApiError }