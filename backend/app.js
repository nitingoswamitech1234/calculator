import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initDB } from './database/db.js';
import mastersRouter from './routes/masters.js';
import customersRouter from './routes/customers.js';
import ordersRouter from './routes/orders.js';
import reportsRouter from './routes/reports.js';
import settingsRouter from './routes/settings.js';
import loginroutes from './login.routes.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

let dbInstance;

// ✅ Initialize SQLite DB (init.sql auto-run inside initDB)
initDB()
  .then(db => {
    dbInstance = db;
    app.locals.db = dbInstance;

    // All routes
    app.use('/api/masters', mastersRouter);
    app.use('/api/customers', customersRouter);
    app.use('/api/orders', ordersRouter);
    app.use('/api/reports', reportsRouter);
    app.use('/api/settings', settingsRouter);
    app.use('/auth', loginroutes);

    app.get("/", (req, res) => {
      res.send("Admin Auth API running ✅");
    });

    const PORT = 5000;
    app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB init error:', err);
  });
