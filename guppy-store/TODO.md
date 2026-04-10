# Fix Supabase Connection - TODO Steps

## [ ] 1. Update backend/.env
```
DATABASE_URL=\"postgresql://postgres.hchtnjhphtwyvirquecb:3%25CbyTuQt3iDGRr@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres\"
```
(Note: % encoded as %25 for literal % in password)

## [ ] 2. Create tables in Supabase
- Go to Supabase Dashboard → SQL Editor
- Copy ALL content from `backend/utils/schema.sql`
- Paste & run (creates users/products/etc with RLS disabled)

## [ ] 3. Test backend connection
```
cd backend
npm install  # if needed
npm start
```
Watch logs: Should see \"Server running on port 5003\", \"Admin ready: admin@guppystore.com\", no [DB] errors.

## [ ] 4. (Optional) Seed demo data
```
node utils/seedDemo.js
```

## [ ] 5. Test API
```
curl http://localhost:5003/api/products
```
Should return JSON products (empty array OK if not seeded).

**Next:** Mark steps complete, reply with status/logs if issues.
