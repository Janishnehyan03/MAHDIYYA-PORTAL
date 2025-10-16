const express = require("express");
const app = express();
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");

dotenv.config();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.enable("trust proxy");

// view engine setup
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
//data sanitization against NoSql attacks
app.use(mongoSanitize());
//data sanitization against xss
app.use(xss()); //prevent from inserting HTML or others to DB
app.use(compression()); //works on texts
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
// app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static("uploads"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/student", require("./routes/student"));
app.use("/api/study-centre", require("./routes/study-centre"));
app.use("/api/teacher", require("./routes/teacher"));
app.use("/api/duty", require("./routes/duty"));
app.use("/api/notification", require("./routes/notification"));
app.use("/api/subject", require("./routes/subject"));
app.use("/api/class", require("./routes/class"));
app.use("/api/exam", require("./routes/exam"));
app.use("/api/downloads", require("./routes/downloads"));
app.use("/api/uploads", require("./routes/uploads"));
app.use("/api/messages", require("./routes/message"));
app.use("/api/hall-ticket", require("./routes/hallTicket"));
app.use("/api/result", require("./routes/result"));
app.use("/api/cce", require("./routes/cceRoute"));
app.use("/api/trash", require("./routes/trash"));
app.use("/api/configurations", require("./routes/configurationRoute"));
app.use("/api/academic-year", require("./routes/academicYearRoute"));
app.use('/api/admission', require('./routes/admissionRoute'));
app.use('/api/previous-exam', require('./routes/previousExamRoute'));


process.env.PWD = process.cwd();
app.use(express.static(path.join(process.env.PWD, "public")));
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("*", function (req, res) {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

module.exports = app;
