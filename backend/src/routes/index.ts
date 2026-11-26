import { Router } from 'express';
import { config } from '../config/index.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import customerRoutes from './customerRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import contentRoutes from './contentRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import shippingRoutes from './shippingRoutes.js';
import aboutMediaRoutes from './aboutMediaRoutes.js';
import visualMediaRoutes from './visualMediaRoutes.js';
import promotionRoutes from './promotionRoutes.js';
import { getHomepageMedia } from '../controllers/visualMediaController.js';
import { validatePromotion } from '../controllers/promotionController.js';

const apiRouter = Router();

apiRouter.use('/products', productRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/orders', orderRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.post('/checkout/validate-promo', validatePromotion);
apiRouter.use('/promotions', promotionRoutes);
apiRouter.use('/checkout', paymentRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/shipping', shippingRoutes);
apiRouter.use('/media', mediaRoutes);
apiRouter.use('/content', contentRoutes);
apiRouter.use('/about-media', aboutMediaRoutes);
apiRouter.use('/visual-media', visualMediaRoutes);
apiRouter.get('/homepage-media', getHomepageMedia);
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Zimor Luxury Backend API',
    providers: {
      database: config.useMockDb ? 'json' : 'mongodb',
      media: config.useMockMedia ? 'local' : 'cloudinary',
      payment: config.useMockPayment ? 'mock' : 'razorpay',
    },
    timestamp: new Date().toISOString(),
  });
});
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
