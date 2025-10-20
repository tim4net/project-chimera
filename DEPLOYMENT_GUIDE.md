# Nuaibria - Deployment Guide

**Status**: Production Ready
**Date**: 2025-10-19

---

## QUICK START (Local Development)

### 1. Restart Backend (CRITICAL after code changes)

```bash
cd /srv/nuaibria/backend

# Stop current server (Ctrl+C if running)

# Rebuild
npm run build

# Start development server
npm run dev

# Should see:
# > Server is running on port 3001
# > [Startup] Cleaned up X stale asset requests
```

### 2. Start Frontend

```bash
cd /srv/nuaibria/frontend

# Development server
npm run dev

# Should see:
# > Local: http://localhost:5173/
```

### 3. Access Game

Open browser: `http://localhost:5173`

---

## TESTING SESSION 0 INTERVIEW

**IMPORTANT**: Delete old test characters first!

### Delete Test Characters:

```sql
-- In Supabase SQL Editor or via API:
DELETE FROM characters
WHERE name IN ('zarf', 'barzafa', 'braa')
  OR name LIKE 'Test_%';
```

### Create Fresh Character:

1. Go to http://localhost:5173
2. Create account / Login
3. Create new Bard named "TestBard"
4. **Expected**: Welcome message about Session 0
5. Say: "ready" or "let's start"
6. **Expected**: Class introduction (NOT desert narrative!)
7. Follow interview through spell selection
8. **Expected**: Character review before world entry
9. Say: "I'm ready to enter the world"
10. **Expected**: Level 0→1, enter at (500,500)

---

## PRODUCTION DEPLOYMENT

### Prerequisites:

- Supabase Cloud project (already configured)
- Backend server (Node.js host)
- Frontend hosting (Vercel/Netlify/static host)
- Domain (optional)

### Backend Deployment:

```bash
cd /srv/nuaibria/backend

# Build production
npm run build

# Set environment variables
cp .env .env.production

# Edit .env.production:
# - SUPABASE_URL=your_prod_url
# - SUPABASE_SERVICE_KEY=your_prod_key
# - GEMINI_API_KEY=your_key
# - LOCAL_LLM_ENDPOINT=your_llm (or cloud)
# - PORT=3001

# Run production
NODE_ENV=production npm start

# OR use Docker/Podman:
podman build -t nuaibria-backend .
podman run -d -p 3001:3001 --env-file .env.production nuaibria-backend
```

### Frontend Deployment:

```bash
cd /srv/nuaibria/frontend

# Build for production
npm run build

# Output in: dist/

# Deploy to Vercel:
vercel deploy

# OR Netlify:
netlify deploy --prod --dir=dist

# OR static host:
# Copy dist/ contents to your web server
```

### Environment Variables (Frontend):

Create `.env.production`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## HEALTH CHECKS

### Backend Health:
```bash
curl http://localhost:3001/
# Should return: "Nuaibria Backend is running!"

curl http://localhost:3001/api/characters
# Should return: [] or character list
```

### Frontend Health:
- Visit homepage → Should load
- Create account → Should work
- Login → Should redirect to dashboard

---

## TROUBLESHOOTING

### Issue: "Desert narrative instead of spell selection"

**Cause**: Backend not restarted after code changes
**Fix**: Restart backend (see step 1 above)

### Issue: "401 Unauthorized on /api/tension"

**Cause**: TensionBadge auth header (already fixed)
**Fix**: Already patched, restart frontend if needed

### Issue: "Character has no spells"

**Cause**: Old character created before Session 0
**Fix**: Delete and recreate character, OR auto-fix will trigger on next chat

### Issue: "Cannot connect to backend"

**Cause**: Backend not running or wrong port
**Fix**: Check backend is on port 3001, frontend proxy configured

---

## VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Backend responds to health check
- [ ] Frontend loads homepage
- [ ] Can create account
- [ ] Can login
- [ ] Can create character
- [ ] Session 0 interview starts (NOT world narrative)
- [ ] Can select spells (for spellcasters)
- [ ] Character reaches Level 1
- [ ] Can enter world
- [ ] Can chat with DM in world
- [ ] Combat works (dice rolls shown)
- [ ] Quests work
- [ ] Loot works
- [ ] Can level up

---

## DATABASE MIGRATIONS

All migrations should be applied. Verify:

```bash
# Check migration status
ls /srv/nuaibria/backend/supabase/migrations/

# Should see:
# - create_spell_system_and_tutorial
# - add_tutorial_state_columns
# - create_quest_system
# - create_loot_system
# - create_enemy_database
# - add_threat_and_reputation_system
# - expand_tutorial_states_for_session_0
```

If any are missing, apply them via Supabase dashboard.

---

## PERFORMANCE OPTIMIZATION

### Backend:

- **Cache**: Enable Redis for session storage (optional)
- **Rate Limiting**: Add rate limits to API endpoints
- **Monitoring**: Set up logging (Winston, Sentry)

### Frontend:

- **Build**: Already optimized (Vite production build)
- **CDN**: Use CDN for static assets
- **Caching**: Enable browser caching headers

### Database:

- **Indexes**: All critical indexes already created
- **RLS**: Row-level security already enabled
- **Connection Pooling**: Supabase handles this

---

## MONITORING

### Logs to Watch:

**Backend Console:**
```
[DM Chat Secure] Intent detection: { actions: [...] }
[LevelingSystem] Character leveled up!
[QuestGenerator] Created quest: "..."
[ThreatChecker] Threat triggered: royal_target
```

**Browser Console:**
```
[ChatInterface] ActionResults received: [...]
[TensionBadge] Fetching tension...
```

### Error Patterns:

- "Failed to fetch" → Backend down
- "401 Unauthorized" → Auth issue
- "Tutorial state X" → Track Session 0 flow

---

## BACKUP & RECOVERY

### Database Backups:

Supabase provides automatic backups. To manual backup:

```bash
# Export characters
pg_dump $DATABASE_URL -t characters > backup_characters.sql

# Export all game data
pg_dump $DATABASE_URL > backup_full.sql
```

### Code Backups:

```bash
# Git commit current state
git add .
git commit -m "Production-ready: Session 0 complete"
git push origin master
```

---

## SCALING CONSIDERATIONS

### Current Capacity:

- **Users**: 100+ concurrent (Supabase free tier)
- **AI Calls**: Depends on LLM endpoint limits
- **Storage**: 500MB free (Supabase)

### When to Scale:

- **> 1000 users**: Upgrade Supabase plan
- **> 10k AI calls/day**: Optimize LLM usage or upgrade
- **> 1GB data**: Upgrade storage

---

## SUPPORT & MAINTENANCE

### Regular Tasks:

- **Weekly**: Review error logs
- **Monthly**: Database cleanup (old test characters)
- **Quarterly**: Dependency updates (`npm audit`)

### Update Procedure:

1. Test changes locally
2. Run test suite (`npm test`)
3. Deploy to staging (optional)
4. Deploy to production
5. Monitor for issues
6. Rollback if needed

---

## LAUNCH CHECKLIST

Final checks before going live:

- [ ] Backend restarted with latest code
- [ ] Frontend rebuilt and deployed
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Test character creation end-to-end
- [ ] Test Session 0 interview flow
- [ ] Test combat and quests
- [ ] Delete all test characters
- [ ] Create admin account
- [ ] Monitor logs for errors
- [ ] Ready for alpha testers!

---

**YOU'RE READY TO LAUNCH!** 🚀
