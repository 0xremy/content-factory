#!/usr/bin/env node
/**
 * Agent Desk Spawn Helper
 * 
 * Usage: node spawn-agent.js <agent> <task>
 * 
 * Example: node spawn-agent.js BERLIN "Analyze Bitcoin ETF impact"
 */

const fs = require('fs');
const path = require('path');

const AGENT_MODELS = {
  PROFESUI: {
    primary: 'openrouter/deepseek/deepseek-v3.2',
    fallback1: 'openai/gpt-5-nano',
    fallback2: 'ollama/qwen2.5:7b'
  },
  RIO: {
    primary: 'google/gemini-2.0-flash',
    fallback1: 'openrouter/free',
    fallback2: 'ollama/qwen3:8b'
  },
  BERLIN: {
    primary: 'openrouter/deepseek/deepseek-v3.2',
    fallback1: 'openrouter/nvidia/nemotron-3-super-120b-a12b',
    fallback2: 'ollama/qwen2.5:7b'
  },
  NAIROBI: {
    primary: 'openai/gpt-5-nano',
    fallback1: 'openai/gpt-4o-mini',
    fallback2: 'ollama/qwen3:8b'
  },
  TOKYO: {
    primary: 'openai/gpt-5-nano',
    fallback1: 'openrouter/minimax/minimax-m2.5',
    fallback2: 'ollama/qwen2.5:7b'
  },
  DENVER: {
    primary: 'openrouter/minimax/minimax-m2.5:free',
    fallback1: 'google/gemini-2.0-flash',
    fallback2: 'ollama/qwen3:8b'
  }
};

const AGENT_DESCRIPTIONS = {
  RIO: 'Trend Hunter: detects early crypto trends; outputs trend name, why now, sentiment, stage, risk; no deep analysis.',
  BERLIN: 'Research: analyzes a crypto topic/project with what it is, why now, bull case, bear case, hidden insight.',
  NAIROBI: 'Writer: turns insights into one tweet or one 5–10 tweet thread with a strong hook and punchy crypto-native style.',
  TOKYO: 'Brand Filter: rewrites content into a confident, insider, non-corporate crypto KOL voice; removes AI tone and fluff.',
  DENVER: 'Engagement: crafts short, natural, slightly playful replies that encourage interaction.'
};

function getAgentConfig(agentName) {
  const normalized = agentName.toUpperCase();
  const config = AGENT_MODELS[normalized];
  if (!config) {
    throw new Error(`Unknown agent: ${agentName}. Available: ${Object.keys(AGENT_MODELS).join(', ')}`);
  }
  
  const description = AGENT_DESCRIPTIONS[normalized] || '';
  return { ...config, description, name: normalized };
}

function generatePrompt(agentName, task) {
  const config = getAgentConfig(agentName);
  
  let prompt = `You are ${agentName} - ${config.description}\n\n`;
  prompt += `Task: ${task}\n\n`;
  
  if (agentName === 'RIO') {
    prompt += `Output format:\n`;
    prompt += `1. Trend name\n`;
    prompt += `2. Why now (catalyst)\n`;
    prompt += `3. Sentiment (bullish/bearish/neutral)\n`;
    prompt += `4. Stage (early/mid/late)\n`;
    prompt += `5. Risk level (low/medium/high)\n`;
    prompt += `Keep it concise, no deep analysis.`;
  } else if (agentName === 'BERLIN') {
    prompt += `Analyze with:\n`;
    prompt += `1. What it is (brief)\n`;
    prompt += `2. Why now (catalyst)\n`;
    prompt += `3. Bull case\n`;
    prompt += `4. Bear case\n`;
    prompt += `5. Hidden insight (alpha)\n`;
    prompt += `Be thorough but focused.`;
  } else if (agentName === 'NAIROBI') {
    prompt += `Create Twitter content:\n`;
    prompt += `- One tweet OR 5–10 tweet thread\n`;
    prompt += `- Strong hook\n`;
    prompt += `- Punchy crypto-native style\n`;
    prompt += `- Optimize for virality & engagement\n`;
    prompt += `- No AI tone, sound like insider`;
  } else if (agentName === 'TOKYO') {
    prompt += `Rewrite content to:\n`;
    prompt += `- Confident, insider crypto KOL voice\n`;
    prompt += `- Remove AI tone and corporate fluff\n`;
    prompt += `- Make it sharp, intentional, slightly contrarian\n`;
    prompt += `- Early to trends feeling\n`;
  } else if (agentName === 'DENVER') {
    prompt += `Craft engagement:\n`;
    prompt += `- Short, natural replies\n`;
    prompt += `- Slightly playful tone\n`;
    prompt += `- Encourage interaction\n`;
    prompt += `- Keep it human, not robotic`;
  }
  
  return prompt;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
Agent Desk Spawn Helper

Usage: node spawn-agent.js <agent> "<task>"

Available agents:
${Object.entries(AGENT_MODELS).map(([name, config]) => 
  `  ${name.padEnd(8)} - ${config.primary} (${config.fallback1}, ${config.fallback2})`
).join('\n')}

Examples:
  node spawn-agent.js BERLIN "Analyze Bitcoin ETF impact on Asian markets"
  node spawn-agent.js RIO "Find early trends in DeFi Q2 2026"
  node spawn-agent.js NAIROBI "Write tweet thread about AI x crypto narrative"
  node spawn-agent.js TOKYO "Rewrite this corporate announcement into crypto KOL style"
  node spawn-agent.js DENVER "Reply to someone asking about Solana vs Ethereum"
`);
    process.exit(1);
  }
  
  const agentName = args[0];
  const task = args.slice(1).join(' ');
  
  try {
    const config = getAgentConfig(agentName);
    const prompt = generatePrompt(agentName, task);
    
    console.log(`\n=== ${agentName} SPAWN CONFIG ===\n`);
    console.log(`Primary model: ${config.primary}`);
    console.log(`Fallback 1:   ${config.fallback1}`);
    console.log(`Fallback 2:   ${config.fallback2}`);
    console.log(`\n=== TASK ===\n${task}`);
    console.log(`\n=== PROMPT ===\n${prompt}`);
    console.log(`\n=== COMMAND ===\n`);
    console.log(`/subagents spawn ${agentName} "${task}" --model ${config.primary}`);
    console.log(`\n=== OR USING sessions_spawn ===\n`);
    console.log(JSON.stringify({
      task: prompt,
      label: agentName,
      model: config.primary
    }, null, 2));
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { AGENT_MODELS, AGENT_DESCRIPTIONS, getAgentConfig, generatePrompt };