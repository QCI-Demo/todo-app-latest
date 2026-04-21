"use strict";

const swaggerParser = require("@apidevtools/swagger-parser");
const { swaggerSpec } = require("../dist/swagger/swaggerSpec");

swaggerParser
  .validate(swaggerSpec)
  .then(() => {
    console.log("OpenAPI spec is valid");
  })
  .catch((err) => {
    console.error("OpenAPI validation failed:", err);
    process.exit(1);
  });
