const express = require("express");
const router = express.Router();
const controller = require("../controllers/invoice.controller");

router.post("/:cartId", controller.generateInvoice);
router.get("/download/:fileName", controller.downloadInvoice);


module.exports = router;
