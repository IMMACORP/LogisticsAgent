export function formatAgentChannel(channel: string) {
  return channel.toUpperCase().replace(/_/g, ' ');
}

export function createAgentSummary(channel: string, prompt: string) {
  return `Agent channel: ${formatAgentChannel(channel)} ? prompt: ${prompt}`;
}
