const AppError = require("../utils/appError");

const handleCastErrorDB = err=>{
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message,400);
};

const handleJWTError = ()=> new AppError('Invalid token. please log in again !',401);

const handleJWTExpiredError = () => new AppError('Your token has expired please log in again !!',401);

const handleDuplicateFieldsDB = err=>{
  const value =err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  console.log(value);
  const message =`Duplicate Field Value: ${value} please Use another value`
  return new AppError(message,400); 
}
const sendErrorForDev = (err,res)=>{
  res.status(err.statusCode).json({
    status: err.status,
    error:err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd=(err,res)=>{
  //Operational errors that we trust 
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  //Programming Error or any other Unknown Error we want to hide details from client
  else{
    //1) Log Error
    console.log('Error: ',err);
    //2) Send generic message 
    res.status(500).json({
      status:'error',
      // message: err.message
      message: 'Something Went Wrong!'
    });
  }
};

module.exports=(err,req,res,next)=>{
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development'){
    sendErrorForDev(err,res);
  }
  else if (process.env.NODE_ENV==='production'){
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = err;
    if(error.name==='CastError') error =  handleCastErrorDB(error);
    if(error.code=== 11000) error = handleDuplicateFieldsDB(error);

    if(error.name==='JsonWebTokenError') error= handleJWTError(error);
    if(error.name==='TokenExpiredError') error= handleJWTExpiredError(error);
    sendErrorProd(error,res);
  }
};

