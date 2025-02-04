import { Application, urlencoded, json } from "express";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

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
  app.use(cors());
  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(morgan("dev"));

  return app;
}
