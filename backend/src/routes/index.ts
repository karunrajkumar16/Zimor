import { Router } from 'express';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import customerRoutes from './customerRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import contentRoutes from './contentRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';

const apiRouter = Router();

apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/checkout', paymentRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/media', mediaRoutes);
apiRouter.use('/content', contentRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
