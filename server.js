// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import ip from "ip";
// import path from "path";
// import dotenv from 'dotenv'
// import { initialize } from "./config/dbConnection.js";
// import { errorHandling } from "./middlewares/error.middleware.js";
// import authRouter from "./routes/authRoute.js";
// import categoryRouter from "./routes/categoryRoute.js";
// import franchiseRouter from "./routes/franchiseRoute.js";
// import productRouter from "./routes/productRoute.js";
// import subProductRouter from "./routes/subProductRoute.js";
// import stockRouter from "./routes/stockRoute.js";
// import dashboardRouter from "./routes/dashboardDataRoute.js";

// dotenv.config();
// const NODE_ENV = "production";
// const app = express();

// app.use(express.json());

// await initialize();

// // app.use(cors({ origin: true, credentials: true }));


//   const allowedOrigins = [
//     "https://kalyanengineeringcorp.com/", // replace with actual frontend URL
//   ];

//   app.use(
//     cors({
//       origin: function (origin, callback) {
//         // allow requests with no origin (like mobile apps or curl)
//         if (!origin) return callback(null, true);
//         if (allowedOrigins.includes(origin)) {
//           return callback(null, true);
//         } else {
//           return callback(new Error("Not allowed by CORS"));
//         }
//       },
//       credentials: true,
//     })
//   );




// // app.use(express.json({ limit: "50mb" }));
// // app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use("/uploads/products", express.static(path.join("uploads/products")));

// // app.get("/", (req, res) => {
// //   res.send({ message: "Hello World" });
// // });

// app.use(
//   authRouter,
//   categoryRouter,
//   franchiseRouter,
//   productRouter,
//   subProductRouter,
//   stockRouter,
//   dashboardRouter
// );

// app.use(errorHandling);

// if (NODE_ENV == "production") {
//   // app.use(express.static(__dirname + "/frontend/dist"));
//   app.use(express.static("/var/www/seclob/kalyan/admin/frontend/dist"));

//   app.get("*", (req, res) => {
//     // res.sendFile(__dirname + "/frontend/dist/index.html");
//     res.sendFile("/var/www/seclob/kalyan/admin/frontend/dist/index.html");
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.status(201).json("Running");
//   });
// }



// if (NODE_ENV === "production") {
//   app.get("/", (req, res) => {
//     res.send("Backend Running...");
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.status(200).json("Backend Running in Dev Mode");
//   });
// }


// const port = 8080 || 5000;
// app.listen(port, () => {
//   console.log(`App listening on the port ${ip.address()}:${port}`);
// });
































import express from "express";
import cors from "cors";
import "dotenv/config";
import ip from "ip";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initialize } from "./config/dbConnection.js";
import { errorHandling } from "./middlewares/error.middleware.js";
import authRouter from "./routes/authRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import franchiseRouter from "./routes/franchiseRoute.js";
import productRouter from "./routes/productRoute.js";
import subProductRouter from "./routes/subProductRoute.js";
import stockRouter from "./routes/stockRoute.js";
import dashboardRouter from "./routes/dashboardDataRoute.js";

dotenv.config();
const NODE_ENV = process.env.NODE_ENV || "production";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize DB
await initialize();

// ✅ Body parser
app.use(express.json());

// ✅ CORS Setup
const allowedOrigins = [
  "https://kalyanengineeringcorp.com",
  // "http://localhost:3000" // uncomment if testing locally
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Preflight (OPTIONS) support
app.options("*", cors());

// ✅ Static files (uploads)
app.use("/uploads/products", express.static(path.join(__dirname, "uploads/products")));

// ✅ Routes
app.use(
  authRouter,
  categoryRouter,
  franchiseRouter,
  productRouter,
  subProductRouter,
  stockRouter,
  dashboardRouter
);

// ✅ Global error handler
app.use(errorHandling);

// ✅ Serve frontend if in production
if (NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "frontend", "dist"); // adjust path if needed

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json("Backend Running in Dev Mode");
  });
}

// ✅ Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`✅ App listening at http://${ip.address()}:${port}`);
});
