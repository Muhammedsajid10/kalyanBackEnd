// import mongoose from "mongoose";
// import "dotenv/config";

// const MONGO_URI = process.env.MONGODB_URI;
// // const MONGO_URI = "mongodb+srv://sajidalhijas:mymu@kalyanengineeringcorp.kqug1h3.mongodb.net/?retryWrites=true&w=majority&appName=kalyanengineeringcorp"
// console.log("🔗 Mongo URI:", MONGO_URI); 
// export const initialize = async () => {
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("✅ Connected to MongoDB");
//   } catch (error) {
//     console.error("❌ MongoDB connection error:", error.message);
//   }
// };








import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGODB_URI is not set. Check your environment variables.");
}
console.log("🔗 Mongo URI in dbConnection:", MONGO_URI); 


export const initialize = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  }
};
