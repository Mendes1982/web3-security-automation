import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global Teardown
 * 
 * Runs once after all test suites complete.
 * Used for:
 * - Cleaning up test data
 * - Stopping local services
 * - Generating reports
 * - Archiving artifacts
 */
async function globalTeardown(config: FullConfig) {
  console.log('\n🧹 Running global teardown...');

  try {
    // Archive test results if needed
    const testResultsDir = path.join(process.cwd(), 'test-results');
    
    if (fs.existsSync(testResultsDir)) {
      const files = fs.readdirSync(testResultsDir);
      console.log(`📊 Test results: ${files.length} files generated`);

      // Create summary report
      const summaryPath = path.join(testResultsDir, 'summary.json');
      const summary = {
        timestamp: new Date().toISOString(),
        runId: process.env.TEST_RUN_ID || 'unknown',
        results: files.filter(f => f.endsWith('.json')).length,
        screenshots: files.filter(f => f.endsWith('.png')).length,
        videos: files.filter(f => f.endsWith('.webm')).length,
      };

      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      console.log('✅ Test summary saved');
    }

    // Clean up temporary files
    const tempDirs = ['.temp', 'tmp'];
    for (const dir of tempDirs) {
      const tempPath = path.join(process.cwd(), dir);
      if (fs.existsSync(tempPath)) {
        fs.rmSync(tempPath, { recursive: true, force: true });
        console.log(`🗑️  Cleaned up: ${dir}`);
      }
    }

    // Optional: Stop local blockchain if it was started by the tests
    // This would require storing the process ID or using a process manager

    console.log('✅ Global teardown completed!\n');

  } catch (error) {
    console.error('⚠️  Global teardown encountered issues:', error);
    // Don't throw - we want cleanup to be best-effort
  }
}

export default globalTeardown;
