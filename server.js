const mongoose = require('mongoose');

const dotenv = require('dotenv');

process.on('uncaughtException',err=> {
  console.log('UNCAUGHT EXCEPTION!  Shutting Down...');
  console.log(err.name,err.message);
  process.exit(1);
});

dotenv.config({path:'./config.env'});
const app = require('./app');


// eslint-disable-next-line no-unused-vars
const DB=process.env.DATABASE.replace(
  '<PASSWORD>'
  ,process.env.DATABASE_PASSWORD
  );
  

mongoose
// .connect(DB
    .connect(process.env.DATABASE_LOCAL
  ,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology: true
}).then(()=>console.log('DB Connections Successful..!')).catch(err=> console.log('ERROR'));

console.log(process.env.NODE_ENV);

// 4) START SERVER 
// const {port} = process.env;
const port = process.env.PORT || 3000;

const server = app.listen(port,()=>{
  console.log(`App Running on Port ${port}....`);
}); 

process.on('unhandledRejection',err=>{
  console.log(err.name,err.message);
  console.log('UNHANDELER REJECTION! SHUTTING DOWN...');
  server.close(()=>{
    process.exit(1);
  })
});


 