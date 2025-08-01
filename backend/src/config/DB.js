const mongoose=require('mongoose');
async function main(){
    await mongoose.connect(process.env.DB_CONNECT_STRING)
    
}
function getCollection(dbName, collectionName) {
  return mongoose.connection.useDb(dbName).collection(collectionName);
}


module.exports={main,getCollection}