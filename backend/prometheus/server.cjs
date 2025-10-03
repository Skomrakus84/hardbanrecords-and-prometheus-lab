const app = require('./app.cjs');
const config = require('../config/env.cjs');
const logger = require('../shared/utils/logger.cjs');

const PORT = config.PROMETHEUS_SERVICE_PORT || 3004;

app.listen(PORT, () => {
    logger.info(`Prometheus AI Service running on port ${PORT}`);
});