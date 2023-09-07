import * as dotenv from "dotenv";
import express from "express";
import * as bodyParser from "body-parser";
import {productRouter} from "./routes/productRouter";
import cors from "cors";

const app = express();
dotenv.config();

const corsOptions ={
    origin:'*',
    credentials:true,
    optionSuccessStatus:200
}

app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use("/products", productRouter);

app.listen(process.env.PORT, () => {
    console.log("Node server started running");
});