import * as fog from '../../services/fogOfWarService';

jest.mock('../../services/supabaseClient', () => {
  return {
    supabaseServiceClient: {
      rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
      from: jest.fn().mockReturnValue({ upsert: jest.fn().mockResolvedValue({ error: null }) })
    }
  };
});

const { supabaseServiceClient } = require('../../services/supabaseClient');

describe('fogOfWarService.updateCampaignBounds RPC payload', () => {
  it('passes an array (not string) for p_new_tiles', async () => {
    const tiles = [ { x: 1, y: 2 }, { x: 3, y: 4 } ];

    // Call the private helper via public path function which triggers it
    await fog.revealTilesAlongPath('seed', 0, 0, 1, 1, 1, 'char-1');

    const calls = (supabaseServiceClient.rpc as jest.Mock).mock.calls;
    const rpcCall = calls.find((c: any[]) => c[0] === 'update_campaign_bounds_atomic');
    expect(rpcCall).toBeTruthy();
    const payload = rpcCall[1];
    expect(Array.isArray(payload.p_new_tiles)).toBe(true);
  });
});

