import 'dotenv/config';
import { applyMigrations } from '../services/migrationService';

async function main() {
  console.log('Applying database migrations...');
  const results = await applyMigrations();

  results.forEach(r => {
    if (r.success) {
      console.log(`✅ ${r.name}`);
    } else {
      console.log(`❌ ${r.name}: ${r.error}`);
    }
  });

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\nSummary: ${successful} successful, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
