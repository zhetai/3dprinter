import { describe, it, expect } from 'vitest';
import app from './index';

interface Route {
  path: string;
  method: string;
}

describe('API Routes', () => {
  describe('Task Endpoints', () => {
    it('should have /api/tasks route defined', () => {
      const routes = app.routes as Route[];
      const taskRoutes = routes.filter((r) => r.path === '/api/tasks');
      expect(taskRoutes.length).toBeGreaterThan(0);
    });

    it('should have POST /api/tasks route defined', () => {
      const routes = app.routes as Route[];
      const postTaskRoutes = routes.filter(
        (r) => r.path === '/api/tasks' && r.method === 'POST'
      );
      expect(postTaskRoutes.length).toBeGreaterThan(0);
    });
  });

  describe('Auth Endpoints', () => {
    it('should have /api/auth/enterprise route defined', () => {
      const routes = app.routes as Route[];
      const authRoutes = routes.filter((r) => r.path === '/api/auth/enterprise');
      expect(authRoutes.length).toBeGreaterThan(0);
    });

    it('should have /api/admin/auth/review route defined', () => {
      const routes = app.routes as Route[];
      const reviewRoutes = routes.filter((r) => r.path === '/api/admin/auth/review');
      expect(reviewRoutes.length).toBeGreaterThan(0);
    });
  });

  describe('Billing Endpoints', () => {
    it('should have /api/users/:user_id/balance route defined', () => {
      const routes = app.routes as Route[];
      const balanceRoutes = routes.filter((r) => r.path.includes('/balance'));
      expect(balanceRoutes.length).toBeGreaterThan(0);
    });

    it('should have /api/service/optimize route defined', () => {
      const routes = app.routes as Route[];
      const optimizeRoutes = routes.filter((r) => r.path === '/api/service/optimize');
      expect(optimizeRoutes.length).toBeGreaterThan(0);
    });
  });
});