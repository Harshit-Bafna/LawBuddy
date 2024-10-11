const connectToDatabase = require("./db/connection");
const { app } = require('./app')

connectToDatabase().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on Port Number ${process.env.PORT}`)
    })
}).catch((err) => {
    console.error("Database Connection Error", error);
})