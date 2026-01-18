/**
 * Example: Using Structured Log Queries
 * 
 * This file demonstrates how to use the new structured query interface
 * to analyze workflow execution logs programmatically.
 */

import Logger from '../utils/Logger';
import { NetworkLog, SessionLog } from '../utils/Logger';

async function exampleLogAnalysis() {
  const logger = Logger;

  console.log('='.repeat(60));
  console.log('STRUCTURED LOG QUERY EXAMPLES');
  console.log('='.repeat(60));

  // ============================================================
  // 1. GET LOGS SUMMARY
  // ============================================================
  console.log('\n1. LOGS SUMMARY');
  console.log('-'.repeat(60));
  const summary = logger.getLogsSummary();
  console.log(`  Session ID: ${summary.sessionId}`);
  console.log(`  Total Events: ${summary.totalEvents}`);
  console.log(`  Network Requests: ${summary.networkRequests}`);
  console.log(`  Session Events: ${summary.sessionEvents}`);
  console.log(`  Unique Agents: ${summary.uniqueAgents.size}`);
  console.log(`  Unique Workflows: ${summary.uniqueWorkflows.size}`);
  console.log(`  Total Network Duration: ${summary.totalNetworkDuration}ms`);
  console.log(`  Errors: ${summary.errorCount}`);

  // ============================================================
  // 2. NETWORK LOG QUERIES
  // ============================================================
  console.log('\n2. NETWORK LOG QUERIES');
  console.log('-'.repeat(60));

  // Get all network logs
  console.log('\n  All Network Logs:');
  const allNetworkLogs = logger.queryNetworkLogs();
  allNetworkLogs.forEach((log: NetworkLog) => {
    console.log(
      `    [${log.timestamp}] ${log.method} ${log.provider} - Status: ${log.statusCode} (${log.duration}ms)`
    );
  });

  // Failed requests only
  console.log('\n  Failed Requests:');
  const failedRequests = logger.queryNetworkLogs({ errorOnly: true });
  if (failedRequests.length === 0) {
    console.log('    None');
  } else {
    failedRequests.forEach((log: NetworkLog) => {
      console.log(`    ${log.provider}: ${log.error}`);
    });
  }

  // Slow requests (> 200ms)
  console.log('\n  Slow Requests (>200ms):');
  const slowRequests = logger.queryNetworkLogs({ minDuration: 200 });
  if (slowRequests.length === 0) {
    console.log('    None');
  } else {
    slowRequests.forEach((log: NetworkLog) => {
      console.log(`    ${log.provider}: ${log.duration}ms`);
    });
  }

  // ============================================================
  // 3. SESSION LOG QUERIES
  // ============================================================
  console.log('\n3. SESSION LOG QUERIES');
  console.log('-'.repeat(60));

  const allSessionLogs = logger.querySessionLogs();
  console.log(`  Total Session Events: ${allSessionLogs.length}`);

  // Get execution events
  console.log('\n  Workflow Execution Timeline:');
  const executionEvents = logger.querySessionLogs({ event: 'Workflow' });
  executionEvents.forEach((log: SessionLog) => {
    console.log(`    [${log.timestamp}] ${log.event}`);
  });

  // Get agent events
  console.log('\n  Agent Execution Events:');
  const agentEvents = logger.querySessionLogs({ event: 'Agent' });
  console.log(`    Total Agent Events: ${agentEvents.length}`);

  // ============================================================
  // 4. EXECUTION TIMELINE
  // ============================================================
  console.log('\n4. EXECUTION TIMELINE');
  console.log('-'.repeat(60));

  const timeline = logger.getExecutionTimeline();
  console.log(`  Total Timeline Events: ${timeline.length}`);
  console.log('\n  Timeline (first 10 events):');
  timeline.slice(0, 10).forEach((event: any) => {
    const typeLabel = event.type === 'network' ? '🔵 NETWORK' : '🟣 SESSION';
    const data = event.data as any;
    const description =
      event.type === 'network'
        ? `${data.method} ${data.provider}`
        : `${data.event}`;
    console.log(`    [${event.timestamp}] ${typeLabel} - ${description}`);
  });

  // ============================================================
  // 5. AGENT EXECUTION SUMMARY
  // ============================================================
  console.log('\n5. AGENT EXECUTION SUMMARY');
  console.log('-'.repeat(60));

  const agentStats = logger.getAgentExecutionSummary();
  agentStats.forEach((stat: any) => {
    console.log(`\n  Agent: ${stat.agent}`);
    console.log(`    Events: ${stat.eventCount}`);
    if (stat.averageResponseTime) {
      console.log(`    Avg Response Time: ${stat.averageResponseTime}ms`);
    }
  });

  // ============================================================
  // 6. PROVIDER STATISTICS
  // ============================================================
  console.log('\n6. PROVIDER STATISTICS');
  console.log('-'.repeat(60));

  const providerStats = logger.getProviderStats();
  providerStats.forEach((stat: any) => {
    console.log(`\n  Provider: ${stat.provider}`);
    console.log(`    Requests: ${stat.requestCount}`);
    console.log(`    Success: ${stat.successCount}`);
    console.log(`    Errors: ${stat.errorCount}`);
    console.log(`    Avg Duration: ${stat.averageDuration}ms`);
    console.log(`    Total Duration: ${stat.totalDuration}ms`);
  });

  // ============================================================
  // 7. WORKFLOW STATISTICS
  // ============================================================
  console.log('\n7. WORKFLOW STATISTICS');
  console.log('-'.repeat(60));

  const workflowStats = logger.getWorkflowStats();
  workflowStats.forEach((stat: any) => {
    console.log(`\n  Workflow: ${stat.workflowId}`);
    console.log(`    Events: ${stat.eventCount}`);
    console.log(`    Agents: ${stat.agentCount}`);
    console.log(`    Status: ${stat.status}`);
    if (stat.duration) {
      console.log(`    Duration: ${stat.duration}ms`);
    }
  });

  // ============================================================
  // 8. EXPORT FUNCTIONALITY
  // ============================================================
  console.log('\n8. EXPORT LOGS');
  console.log('-'.repeat(60));

  // Export as JSON
  const jsonExport = logger.exportLogs('json');
  console.log(`  JSON Export Size: ${jsonExport.length} bytes`);

  // Export as CSV
  const csvExport = logger.exportLogs('csv');
  console.log(`  CSV Export Size: ${csvExport.length} bytes`);
  console.log('\n  CSV Preview (first 3 lines):');
  csvExport.split('\n').slice(0, 3).forEach((line: string) => {
    console.log(`    ${line}`);
  });

  // ============================================================
  // 9. ADVANCED FILTERING
  // ============================================================
  console.log('\n9. ADVANCED FILTERING EXAMPLES');
  console.log('-'.repeat(60));

  // Query by provider
  console.log('\n  Queries by Provider:');
  const providers = ['groq', 'gemini', 'openai', 'qdrant', 'duckduckgo'];
  providers.forEach(provider => {
    const count = logger.queryNetworkLogs({ provider }).length;
    if (count > 0) {
      console.log(`    ${provider}: ${count} requests`);
    }
  });

  // Query by time range
  console.log('\n  Query by Time Range:');
  const allLogs = logger.getExecutionTimeline();
  if (allLogs.length >= 2) {
    const firstTime = allLogs[0].timestamp;
    const lastTime = allLogs[allLogs.length - 1].timestamp;
    const rangeEvents = logger.querySessionLogs({
      startTime: firstTime,
      endTime: lastTime
    });
    console.log(`    Events from ${firstTime} to ${lastTime}: ${rangeEvents.length}`);
  }

  // ============================================================
  // 10. PERFORMANCE ANALYSIS
  // ============================================================
  console.log('\n10. PERFORMANCE ANALYSIS');
  console.log('-'.repeat(60));

  const perfSummary = logger.getLogsSummary();
  const avgEventTime =
    perfSummary.totalNetworkDuration / (perfSummary.networkRequests || 1);
  console.log(`  Average Network Request Time: ${Math.round(avgEventTime)}ms`);
  console.log(
    `  Total Network Overhead: ${perfSummary.totalNetworkDuration}ms`
  );
  console.log(`  Requests per Second: ${((perfSummary.networkRequests / (perfSummary.totalNetworkDuration / 1000)) || 0).toFixed(2)}`);

  console.log('\n' + '='.repeat(60));
  console.log('QUERY EXAMPLES COMPLETE');
  console.log('='.repeat(60) + '\n');
}

// Run if this is the main module
if (require.main === module) {
  exampleLogAnalysis().catch(console.error);
}

export { exampleLogAnalysis };
