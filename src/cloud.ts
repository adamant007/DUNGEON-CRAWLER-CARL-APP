import { createClient } from '@supabase/supabase-js';

const configuredUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const configuredKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) || (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);
export const cloudConfigured = Boolean(configuredUrl && configuredKey);
export const supabase = createClient(configuredUrl || 'https://placeholder.supabase.co', configuredKey || 'placeholder', {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

export async function cloudSignUp(email:string,password:string,displayName:string){
 const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:displayName||email.split('@')[0]}}});
 if(error) throw error; return data;
}
export async function cloudSignIn(email:string,password:string){const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error) throw error;return data;}
export async function cloudSignOut(){const {error}=await supabase.auth.signOut();if(error) throw error;}
export async function cloudUser(){const {data,error}=await supabase.auth.getUser();if(error)return null;return data.user;}
export function cloudAuthChanges(cb:(user:any)=>void){const {data}=supabase.auth.onAuthStateChange((_event,session)=>cb(session?.user||null));return data.subscription;}

export async function cloudSaveCharacter(character:any){
 const user=await cloudUser(); if(!user) throw new Error('Please log in to the cloud account first.');
 const id=character.id || crypto.randomUUID();
 const row={id,user_id:user.id,name:character.name||'Unnamed Crawler',data:{...character,id},updated_at:new Date().toISOString()};
 const {data,error}=await supabase.from('crawler_characters').upsert(row,{onConflict:'id'}).select().single();
 if(error) throw error; return data;
}
export async function cloudSaveCharacters(characters:any[]){for(const c of characters)await cloudSaveCharacter(c);}
export async function cloudListCharacters(){
 const user=await cloudUser(); if(!user) throw new Error('Please log in to the cloud account first.');
 const {data,error}=await supabase.from('crawler_characters').select('id,name,data,updated_at').eq('user_id',user.id).order('updated_at',{ascending:false});
 if(error) throw error; return (data||[]).map((r:any)=>({...r.data,id:r.id}));
}
export async function cloudGetCharacter(){const rows=await cloudListCharacters();return rows[0]||null;}
export async function cloudDeleteCharacter(id:string){const user=await cloudUser();if(!user)throw new Error('Please log in first.');const {error}=await supabase.from('crawler_characters').delete().eq('id',id).eq('user_id',user.id);if(error)throw error;}

export async function cloudCreateCampaign(title:string){
 const user=await cloudUser(); if(!user) throw new Error('Please log in before creating a campaign.');
 const invite=Math.random().toString(36).slice(2,6).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
 const {data,error}=await supabase.from('campaigns').insert({owner_id:user.id,name:title||'My Crawler Campaign',description:'',invite_code:invite}).select().single();
 if(error) throw error;
 const {error:memberError}=await supabase.from('campaign_members').upsert({campaign_id:data.id,user_id:user.id,role:'gm'},{onConflict:'campaign_id,user_id'}); if(memberError) throw memberError;
 return {...data,title:data.name};
}
export async function cloudJoinCampaign(inviteCode:string){
 const user=await cloudUser(); if(!user) throw new Error('Please log in before joining a campaign.');
 const {data,error}=await supabase.rpc('join_campaign_by_code',{p_invite_code:inviteCode.trim().toUpperCase()});
 if(error) throw error; const campaign=Array.isArray(data)?data[0]:data; if(!campaign) throw new Error('Campaign code not found.');
 return {...campaign,title:campaign.name};
}
export async function cloudListCampaigns(){
 const user=await cloudUser(); if(!user) return [];
 const {data:members,error}=await supabase.from('campaign_members').select('campaign_id,role,campaigns(id,name,invite_code,owner_id,created_at)').eq('user_id',user.id);
 if(error) throw error;
 return (members||[]).map((m:any)=>m.campaigns?({...m.campaigns,title:m.campaigns.name,role:m.role}):null).filter(Boolean);
}
export async function cloudCampaignMembers(campaignId:string){const {data,error}=await supabase.from('campaign_members').select('user_id,role').eq('campaign_id',campaignId);if(error)throw error;const rows=data||[];const ids=rows.map((r:any)=>r.user_id);if(!ids.length)return rows;const {data:profiles}=await supabase.from('profiles').select('user_id,display_name').in('user_id',ids);const names=new Map((profiles||[]).map((p:any)=>[p.user_id,p.display_name]));return rows.map((r:any)=>({...r,profiles:{display_name:names.get(r.user_id)||'Crawler'}}));}

export async function cloudAssignCharacterToCampaign(campaignId:string,characterId:string){
 const user=await cloudUser(); if(!user) throw new Error('Please log in first.');
 const {error}=await supabase.from('campaign_characters').upsert({campaign_id:campaignId,character_id:characterId,user_id:user.id},{onConflict:'campaign_id,character_id'});
 if(error) throw error;
}
export async function cloudRemoveCharacterFromCampaign(campaignId:string,characterId:string){
 const {error}=await supabase.from('campaign_characters').delete().eq('campaign_id',campaignId).eq('character_id',characterId); if(error) throw error;
}
export async function cloudCampaignCharacters(campaignId:string){
 const {data:links,error}=await supabase.from('campaign_characters').select('character_id,user_id').eq('campaign_id',campaignId); if(error) throw error;
 const ids=(links||[]).map((r:any)=>r.character_id); if(!ids.length) return [];
 const {data:characters,error:characterError}=await supabase.from('crawler_characters').select('id,user_id,name,data,updated_at').in('id',ids); if(characterError) throw characterError;
 return characters||[];
}

export async function cloudPushEvent(campaignId:string,type:string,payload:any,targetCharacterId?:string){
 const user=await cloudUser(); if(!user) throw new Error('Please log in first.');
 const {data,error}=await supabase.from('campaign_events').insert({campaign_id:campaignId,sender_id:user.id,event_type:type,payload,target_character_id:targetCharacterId||null}).select().single();
 if(error) throw error; return data;
}
export async function cloudListEvents(campaignId:string,limit=50){const {data,error}=await supabase.from('campaign_events').select('*').eq('campaign_id',campaignId).order('created_at',{ascending:false}).limit(limit);if(error)throw error;return data||[];}
export function cloudSubscribeCampaign(campaignId:string,cb:(event:any)=>void){
 const channel=supabase.channel(`campaign:${campaignId}:${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'campaign_events',filter:`campaign_id=eq.${campaignId}`},p=>cb(p.new)).subscribe();
 return ()=>{void supabase.removeChannel(channel)};
}
export function cloudSubscribeCharacters(userId:string,cb:(row:any)=>void){
 const channel=supabase.channel(`characters:${userId}:${Math.random().toString(36).slice(2)}`).on('postgres_changes',{event:'*',schema:'public',table:'crawler_characters',filter:`user_id=eq.${userId}`},p=>cb(p)).subscribe();
 return ()=>{void supabase.removeChannel(channel)};
}

export async function cloudPublicAccountCount(){try{const {data,error}=await supabase.rpc('public_account_count');if(error)return null;return Number(data)||0}catch{return null}}
export async function cloudTrackOpen(){try{let device=localStorage.getItem('cc-device-id');if(!device){device=crypto.randomUUID();localStorage.setItem('cc-device-id',device)}await supabase.from('app_visits').upsert({device_id:device,last_seen:new Date().toISOString()},{onConflict:'device_id'});const user=await cloudUser();await supabase.from('app_activity').insert({user_id:user?.id||null,device_id:device,event_type:'app_open',payload:{path:location.pathname}});}catch{}}
export async function cloudOwnerAnalytics(){const {data,error}=await supabase.rpc('owner_analytics');if(error)throw error;return data;}

export async function cloudPublishLeaderboard(character:any,campaignId:string){
 const user=await cloudUser(); if(!user) throw new Error('Please log in before publishing to the leaderboard.');
 if(!campaignId) throw new Error('Choose a campaign before publishing to its leaderboard.');
 if(!character?.id) throw new Error('Save this crawler before publishing to the leaderboard.');
 await cloudAssignCharacterToCampaign(campaignId,character.id);
 const score=Math.max(0,Number(character.floor||0))*100000+Math.max(0,Number(character.level||0))*1000+Math.max(0,Number(character.popularity||0))*10+Math.max(0,Number(character.aiFavor||0));
 const row={character_id:character.id,user_id:user.id,campaign_id:campaignId,crawler_name:character.name||'Unnamed Crawler',display_name:user.user_metadata?.display_name||user.email?.split('@')[0]||'Crawler',floor:Number(character.floor||0),level:Number(character.level||0),popularity:Number(character.popularity||0),ai_favor:Number(character.aiFavor||0),score,updated_at:new Date().toISOString(),is_public:true};
 const {error}=await supabase.from('leaderboard_entries').upsert(row,{onConflict:'campaign_id,character_id'}); if(error)throw error; return row;
}
export async function cloudLeaderboard(campaignId:string,sort='score'){
 if(!campaignId) throw new Error('Choose a campaign to view its leaderboard.');
 const allowed=['score','floor','level','popularity','ai_favor']; const order=allowed.includes(sort)?sort:'score';
 const {data,error}=await supabase.rpc('public_leaderboard',{p_campaign:campaignId,p_sort:order,p_limit:100}); if(error)throw error; return data||[];
}
export async function cloudTrackActivity(eventType:string,payload:any={}){try{const user=await cloudUser();await supabase.from('app_activity').insert({user_id:user?.id||null,event_type:eventType,payload});}catch{}}
export async function cloudOwnerActivity(limit=200){const {data,error}=await supabase.rpc('owner_activity_log',{p_limit:limit});if(error)throw error;return data||[];}
