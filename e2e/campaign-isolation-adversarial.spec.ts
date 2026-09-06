import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.E2E_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.E2E_SUPABASE_KEY;

const accounts = {
  gmA: { email: process.env.E2E_GM_EMAIL, password: process.env.E2E_GM_PASSWORD },
  playerA: { email: process.env.E2E_PLAYER_EMAIL, password: process.env.E2E_PLAYER_PASSWORD },
  gmB: { email: process.env.E2E_GM2_EMAIL, password: process.env.E2E_GM2_PASSWORD },
  playerB: { email: process.env.E2E_PLAYER2_EMAIL, password: process.env.E2E_PLAYER2_PASSWORD },
};

type Client = ReturnType<typeof createClient>;

function client(){
  if(!url || !key) throw new Error('Missing Supabase E2E URL/key');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}

async function signIn(label:keyof typeof accounts){
  const creds=accounts[label];
  if(!creds.email || !creds.password) throw new Error(`Missing ${label} E2E credentials`);
  const c=client();
  const {data,error}=await c.auth.signInWithPassword({email:creds.email,password:creds.password});
  if(error) throw error;
  return {c,user:data.user!};
}

async function createCampaign(c:Client,name:string){
  const {data:userData}=await c.auth.getUser();
  const user=userData.user!;
  const code=`E2E-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
  const {data,error}=await c.from('campaigns').insert({owner_id:user.id,name,description:'adversarial isolation test',invite_code:code}).select('id,name,invite_code').single();
  if(error) throw error;
  const {error:memberError}=await c.from('campaign_members').upsert({campaign_id:data.id,user_id:user.id,role:'gm'},{onConflict:'campaign_id,user_id'});
  if(memberError) throw memberError;
  return data;
}

async function joinByCode(c:Client,code:string){
  const {data,error}=await c.rpc('join_campaign_by_code',{p_invite_code:code});
  if(error) throw error;
  return Array.isArray(data)?data[0]:data;
}

async function createCrawler(c:Client,userId:string,name:string){
  const id=crypto.randomUUID();
  const {error}=await c.from('crawler_characters').insert({id,user_id:userId,name,data:{id,name,level:1,floor:1}});
  if(error) throw error;
  return id;
}

async function assignCrawler(c:Client,campaignId:string,characterId:string,userId:string){
  const {error}=await c.from('campaign_characters').insert({campaign_id:campaignId,character_id:characterId,user_id:userId});
  if(error) throw error;
}

function requireFourAccounts(){
  return Boolean(url && key && accounts.gmA.email && accounts.gmA.password && accounts.playerA.email && accounts.playerA.password && accounts.gmB.email && accounts.gmB.password && accounts.playerB.email && accounts.playerB.password);
}

test('campaign boundaries block cross-GM and cross-player access', async () => {
  test.skip(!requireFourAccounts(), 'Set Supabase URL/key plus E2E_GM*, E2E_PLAYER*, E2E_GM2*, and E2E_PLAYER2* credentials.');

  const [{c:gmA,user:gmAUser},{c:playerA,user:playerAUser},{c:gmB,user:gmBUser},{c:playerB,user:playerBUser}] = await Promise.all([
    signIn('gmA'),signIn('playerA'),signIn('gmB'),signIn('playerB')
  ]);

  const stamp=Date.now();
  const campaignA=await createCampaign(gmA,`Isolation A ${stamp}`);
  const campaignB=await createCampaign(gmB,`Isolation B ${stamp}`);
  await joinByCode(playerA,campaignA.invite_code);
  await joinByCode(playerB,campaignB.invite_code);

  const crawlerA=await createCrawler(playerA,playerAUser.id,`Crawler A ${stamp}`);
  const crawlerB=await createCrawler(playerB,playerBUser.id,`Crawler B ${stamp}`);
  await assignCrawler(playerA,campaignA.id,crawlerA,playerAUser.id);
  await assignCrawler(playerB,campaignB.id,crawlerB,playerBUser.id);

  // Correct GM can read the crawler assigned to their campaign.
  const ownA=await gmA.from('crawler_characters').select('id,name').eq('id',crawlerA);
  expect(ownA.error).toBeNull();
  expect(ownA.data).toHaveLength(1);

  // Other campaign's GM cannot read it.
  const crossGm=await gmB.from('crawler_characters').select('id,name').eq('id',crawlerA);
  expect(crossGm.error).toBeNull();
  expect(crossGm.data).toHaveLength(0);

  // Unrelated player cannot read another player's crawler.
  const crossPlayer=await playerB.from('crawler_characters').select('id,name').eq('id',crawlerA);
  expect(crossPlayer.error).toBeNull();
  expect(crossPlayer.data).toHaveLength(0);

  // GM cannot attach an unrelated crawler from another campaign.
  const badAttach=await gmA.from('campaign_characters').insert({campaign_id:campaignA.id,character_id:crawlerB,user_id:playerBUser.id});
  expect(badAttach.error).not.toBeNull();

  // GM cannot push a targeted event to an unassigned crawler.
  const badPush=await gmA.from('campaign_events').insert({campaign_id:campaignA.id,sender_id:gmAUser.id,event_type:'loot',payload:{test:true},target_character_id:crawlerB});
  expect(badPush.error).not.toBeNull();

  // Players cannot forge authoritative GM loot pushes.
  const forgedPush=await playerA.from('campaign_events').insert({campaign_id:campaignA.id,sender_id:playerAUser.id,event_type:'loot',payload:{forged:true},target_character_id:crawlerA});
  expect(forgedPush.error).not.toBeNull();

  // Campaign B participants cannot read Campaign A event history.
  const crossEvents=await playerB.from('campaign_events').select('id').eq('campaign_id',campaignA.id);
  expect(crossEvents.error).toBeNull();
  expect(crossEvents.data).toHaveLength(0);

  // Campaign B participants cannot read Campaign A leaderboard.
  const crossBoard=await playerB.rpc('public_leaderboard',{p_campaign:campaignA.id,p_sort:'score',p_limit:100});
  expect(crossBoard.error).toBeNull();
  expect(crossBoard.data).toHaveLength(0);

  // Campaign A player cannot mutate Campaign B membership.
  const badMembership=await playerA.from('campaign_members').insert({campaign_id:campaignB.id,user_id:playerAUser.id,role:'gm'});
  expect(badMembership.error).not.toBeNull();
});

test('anonymous client cannot reach authenticated campaign data', async () => {
  test.skip(!url || !key, 'Set Supabase E2E URL/key.');
  const anon=client();
  for(const table of ['campaigns','campaign_members','campaign_characters','campaign_events','crawler_characters','leaderboard_entries','profiles','studio_admins']){
    const {data,error}=await anon.from(table).select('*').limit(1);
    expect(data, `${table} should not return anonymous rows`).toBeFalsy();
    expect(error, `${table} should reject anonymous table access`).not.toBeNull();
  }
  const join=await anon.rpc('join_campaign_by_code',{p_invite_code:'NOT-A-REAL-CODE'});
  expect(join.error).not.toBeNull();
});
