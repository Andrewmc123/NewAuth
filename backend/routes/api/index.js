const router = require('express').Router();
const usersRouter = require('./users');
const productsRouter = require('./products');
const ordersRouter = require('./orders');

router.use('/users', usersRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);

module.exports = router;