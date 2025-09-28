/**
 * Health Check Service
 * Production monitoring and system status
 */

const db = require('../db.cjs');

class HealthCheckService {
    /**
     * Comprehensive system health check
     */
    static async getSystemHealth() {
        const checks = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
            uptime: process.uptime(),
            status: 'healthy',
            checks: {}
        };

        // Database connectivity check
        try {
            await db.query('SELECT 1');
            checks.checks.database = {
                status: 'healthy',
                message: 'Database connection successful'
            };
        } catch (error) {
            checks.checks.database = {
                status: 'unhealthy',
                message: `Database connection failed: ${error.message}`,
                error: error.code
            };
            checks.status = 'unhealthy';
        }

        // Memory usage check
        const memUsage = process.memoryUsage();
        const memoryCheck = {
            status: 'healthy',
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        };

        // Check if memory usage is too high (>500MB)
        if (memUsage.rss > 500 * 1024 * 1024) {
            memoryCheck.status = 'warning';
            memoryCheck.message = 'High memory usage detected';
        }

        checks.checks.memory = memoryCheck;

        // Environment variables check
        const requiredEnvVars = [
            'DATABASE_URL',
            'JWT_SECRET',
            'SUPABASE_URL'
        ];

        const envCheck = {
            status: 'healthy',
            missing: []
        };

        requiredEnvVars.forEach(envVar => {
            if (!process.env[envVar]) {
                envCheck.missing.push(envVar);
                envCheck.status = 'unhealthy';
                checks.status = 'unhealthy';
            }
        });

        if (envCheck.missing.length > 0) {
            envCheck.message = `Missing environment variables: ${envCheck.missing.join(', ')}`;
        }

        checks.checks.environment = envCheck;

        // External services check (Supabase)
        try {
            // Simple check - if we have Supabase config
            if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
                checks.checks.supabase = {
                    status: 'healthy',
                    message: 'Supabase configuration present'
                };
            } else {
                checks.checks.supabase = {
                    status: 'warning',
                    message: 'Supabase configuration incomplete'
                };
            }
        } catch (error) {
            checks.checks.supabase = {
                status: 'unhealthy',
                message: `Supabase check failed: ${error.message}`
            };
        }

        return checks;
    }

    /**
     * Quick health check for load balancer
     */
    static async getQuickHealth() {
        try {
            // Quick database ping
            await db.query('SELECT 1');

            return {
                status: 'healthy',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message
            };
        }
    }

    /**
     * Get system metrics
     */
    static getMetrics() {
        const usage = process.cpuUsage();
        const memUsage = process.memoryUsage();

        return {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            cpu: {
                user: usage.user,
                system: usage.system
            },
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external
            },
            nodejs: {
                version: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };
    }
}

module.exports = HealthCheckService;
