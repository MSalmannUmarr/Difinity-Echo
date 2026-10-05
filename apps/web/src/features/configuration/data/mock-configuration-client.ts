export interface ConfigurationClient { repairOwnershipMapping(issue: string): Promise<{ readonly savedAt: string; readonly issue: string }> }
export class MockConfigurationClient implements ConfigurationClient {
  async repairOwnershipMapping(issue: string) {
    await new Promise((resolve) => setTimeout(resolve, 420))
    return { issue, savedAt: new Date().toISOString() }
  }
}
export const configurationClient: ConfigurationClient = new MockConfigurationClient()
