import mongoose from "mongoose";

/*
=====================================
         MONGODB CONNECTION           
=====================================
*/

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

export default connectDB;

//_______________________________________________________________________________________________

// import mongoose from "mongoose";

// const connectDB = async () => {
//     try {
//         const MONGO_URI = process.env.MONGO_URI;
 
//         if (!MONGO_URI) {
//             console.error("MONGO_URI not found in .env file")
//             process.exit(1);
//         }

//         const conn = await mongoose.connect(MONGO_URI);
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`MongoDB Connection Error: ${error.message}`);
//         process.exit(1);  
//     }
        
// };

// export default connectDB;

