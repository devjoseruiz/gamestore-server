"use strict";
const secret = strapi.config.get("payment.secretAccessKey");
const stripe = require("stripe")(secret);

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    const { token, products, idUser, shippingAddress } = ctx.request.body;
    const createOrder = [];
    let totalPayment = 0;

    products.forEach((item) => {
      let itemPrice = item.price;

      if (item.discount) {
        itemPrice -= ((item.price * item.discount) / 100).toFixed(2);
      }

      totalPayment += itemPrice;
    });

    const charge = await stripe.charge.create({
      amount: totalPayment * 100,
      currency: "usd",
      source: token.id,
      description: `User ID: ${idUser}`,
    });

    for await (const item of products) {
      const data = {
        game: item.id,
        user: idUser,
        payment: totalPayment,
        id_payment: charge.id,
        shipping_address: shippingAddress,
      };

      const validData = await createStrapi.entityValidator.validateEntity(
        strapi.models.order,
        data
      );

      const entry = await strapi.query("order").create(validData);
      createOrder.push(entry);
    }

    return createOrder;
  },
};
