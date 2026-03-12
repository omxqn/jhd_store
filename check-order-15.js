
const { queryOne } = require('./lib/db');

async function checkOrder() {
    try {
        const order = await queryOne("SELECT id, total, discount, refunded_amount FROM orders WHERE id=?", [15]);
        console.log('Order Data:', order);
        console.log('Types:', {
            total: typeof order.total,
            discount: typeof order.discount,
            refunded_amount: typeof order.refunded_amount
        });
    } catch (err) {
        console.error(err);
    }
}

checkOrder();
