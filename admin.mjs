import AdminJS from 'adminjs';
import AdminJSSQL, { Database, Resource } from '@adminjs/sql';
import AdminJSExpress from '@adminjs/express';
import bcrypt from 'bcrypt';
import createConnection from './db.js';

AdminJS.registerAdapter({ Database, Resource });

const dbConnection = await new AdminJSSQL('mysql2', {
    database: 'usof_db_alukash',
    user: 'alukash',
    password: 'alukash',
    host: 'localhost',
    port: 3306,
}).init();

const adminJs = new AdminJS({
    databases: [dbConnection],
    rootPath: '/admin',
    branding: {
        companyName: 'Admin Panel',
        softwareBrothers: false,
    },
});

const authenticate = async (email, password) => {
    const db = await createConnection();
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    const user = rows[0];

    if (user && user.role === 'admin') {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            await db.end();
            return user;
        }
    }
    await db.end();
    return null;
};

const router = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
        authenticate,
        cookieName: 'adminjs',
        cookiePassword: 'sessionsecret',
    }
);

export default router;
