import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Auth Service API",
    description: "API documentation for the Auth Service",
  },
  host: "localhost:6001",
  basePath: "/api",
  schemes: ["http"],
}

const outputFile = "./swagger-output.json";
const endpointsFiles = ["../routes/user.routes.ts"];

swaggerAutogen()(outputFile, endpointsFiles, doc); 