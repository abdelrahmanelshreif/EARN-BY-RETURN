const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const compression = require("compression");

  
const app = express();

// Set security HTTP headers
app.use(helmet());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from the same IP
const limiter = rateLimit({
  max: 2000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP , please try again in an hour!",
});

// Body parser , reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// DATA Sanitization against NoSQL Query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

app.use(compression())

//TEST Middleware 
app.use((req,res,next)=>{
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/v1/user',userRouter);
app.use(globalErrorHandler);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

module.exports = app;
