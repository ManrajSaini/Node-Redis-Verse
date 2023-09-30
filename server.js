const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const testRouter = require("./routes/testingRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({origin: true, credentials: true}));
app.use(express.urlencoded({extended: true}));

app.use("/api-testing", testRouter);

app.get("/", (req,res) => {
    return res.json({
        "success": true,
        "error_code": 200,
        "message": "Home Page, Service is live 🎉",
        "data": null
    });
});

app.listen(process.env.PORT || 9000, () => {
    console.log("Server Running");
});