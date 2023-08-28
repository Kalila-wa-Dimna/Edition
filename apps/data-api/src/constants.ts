import path from "path";

export const imagePath = path.join(__dirname, "..", "..", '..', "apps", "data-api", "images");

export const   filePath = (fileName: string)=> path.join(__dirname,
  "..", "..", '..', "apps", "data-api", "data",
  `${fileName}`
);
