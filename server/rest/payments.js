import axios from 'axios';
import { payments } from 'getconfig';

import auth from './auth';
import pkg from '../../package.json';
import uuid from 'uuid';

import * as PaymentService from '../services/payments';
import { addPaidScanToUser } from '../services/user';
import { addPaymentToStats } from '../services/stats';

// const { webhookUrl } = payments;
const { version } = pkg;
const airTableKey = 'keymWk6x3qe1QpDJn';
const baseUrl = 'https://api.airtable.com/v0';

export default app => {
  app.post('/api/checkout/:productId/:coupon?', auth, async (req, res) => {
    const { user } = req;
    const { productId, coupon } = req.params;
    const token = req.body;
    try {
      await PaymentService.createPaymentForUser({
        user: user,
        productId,
        coupon,
        token
      });
      return res.send({
        status: 'success'
      });
    } catch (err) {
      console.log('payments-rest: error with payment');
      console.log(err);
      return res.send({
        status: 'failed',
        err: err.toString()
      });
    }
  });
};

// function sendToTable(data, key) {
//   // let referrer;
//   const {
//     // p_product_id,
//     p_price,
//     p_country,
//     // p_currency,
//     p_sale_gross,
//     p_tax_amount,
//     p_paddle_fee,
//     p_coupon_savings,
//     // p_earnings,
//     p_order_id,
//     p_coupon,
//     // p_used_price_override,
//     // passthrough,
//     email,
//     marketing_consent,
//     // p_quantity,
//     quantity
//   } = data;
//   // if (passthrough) {
//   //   referrer = passthrough;
//   // } else {
//   //   referrer = 'direct';
//   // }

//   addPaymentToStats({ price: parseFloat(p_price) });

//   return axios
//     .request({
//       url: `${baseUrl}/appEn83AdcZdMO1sm/Table%201`,
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${airTableKey}`,
//         'Content-type': 'application/json'
//       },
//       data: {
//         fields: {
//           Email: email,
//           'API Key': key,
//           Price: parseFloat(p_price),
//           Tax: parseFloat(p_tax_amount),
//           'Provider Fee': parseFloat(p_paddle_fee),
//           Coupon: p_coupon,
//           'Coupon Savings': parseFloat(p_coupon_savings),
//           'Marketing Consent': marketing_consent === '' ? false : true,
//           Quantity: parseFloat(quantity),
//           'Order ID': p_order_id,
//           'Sale Gross': parseFloat(p_sale_gross),
//           Country: p_country,
//           'Website Version': version
//           // Referrer: referrer
//         }
//       }
//     })
//     .then(() => console.log('payments-rest: Saved info'))
//     .catch(err => console.error('Failed to save', err.response.data));
// }
