import { Application, urlencoded, json } from "express";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { NODE_ENV } from "../config";

export function useMiddlewares(app: Application): Application {
  app.use(helmet());
  //   app.disable("x-powered-by"); // -> helmet takes care of this

  app.use(
    fileUpload({
      createParentPath: true,
      // debug: true,
    })
  );

  app.use(cookieParser());
  app.use(
    cors({
      origin: [
        "https://h9nn1667-5173.brs.devtunnels.ms",
        "https://h9nn1667-4173.brs.devtunnels.ms",
        "http://localhost:5173",
      ],
      credentials: true,
      methods: "GET,HEAD,PATCH,POST",
    })
  );
  app.use(urlencoded({ extended: true }));
  app.use(json());

  /** Clean console logs in testing enviroment */
  if (NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  return app;
}
