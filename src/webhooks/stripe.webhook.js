const { Order } = require("../models");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
module.exports = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    await Order.update({ paymentStatus: 'paid', status: 'processing' }, { where: { id: orderId } });
  }

  res.status(200).json({ received: true });
};