const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "Documentation for the E-commerce API"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server"
      }
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            role: { type: "string" }
          }
        },
        UserCreate: {
          type: "object",
          required: ["name", "email", "passwordHash"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            passwordHash: { type: "string" },
            phone: { type: "string" },
            role: { type: "string" }
          }
        },
        UserRegister: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string" },
            password: { type: "string" },
            phone: { type: "string" }
          }
        },
        UserLogin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string" },
            password: { type: "string" }
          }
        },
        CartAddItems: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["productId", "quantity"],
                properties: {
                  productId: { type: "integer" },
                  quantity: { type: "integer" }
                }
              }
            }
          }
        },
        OrderCreate: {
          type: "object",
          required: ["userId", "items"],
          properties: {
            userId: { type: "integer" },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["productId", "quantity", "unitPrice"],
                properties: {
                  productId: { type: "integer" },
                  quantity: { type: "integer" },
                  unitPrice: { type: "number", format: "float" }
                }
              }
            },
            paymentMethod: { type: "string" }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
