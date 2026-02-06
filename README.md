MR-KIM

Setup (MySQL + local uploads)
mysql -h localhost -P 3360 -u root -p arashi < db/schema.mysql.sql

1. Create the MySQL schema using `db/schema.mysql.sql`.
2. Create an admin user:

```sql
INSERT INTO admin_users (id, email, password_hash)
VALUES (UUID(), 'admin@example.com', '<bcrypt_hash>');
```

3. Copy `.env.example` to `.env.local` and update values.

Uploads are stored in `public/uploads` and served from `/uploads/...`.
4 .login with admin@gmail.com and password => root
