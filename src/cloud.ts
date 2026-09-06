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
 const {data,error}=await supabase.from('campaigns').insert({owner_id:user.id,title:title||'My Crawler Campaign',invite_code:invite}).select().single();
 if(error) throw error;
 const {error:memberError}=await supabase.from('campaign_members').upsert({campaign_id:data.id,user_id:user.id,role:'gm'},{onConflict:'campaign_id,user_id'}); if(memberError) throw memberError;
 return data;
}
export async function cloudJoinCampaign(inviteCode:string){
 const user=await cloudUser(); if(!user) throw new Error('Please log in before joining a campaign.');
 const {data:campaign,error}=await supabase.from('campaigns').select('id,title,invite_code,owner_id').eq('invite_code',inviteCode.trim().toUpperCase()).maybeSingle();
 if(error) throw error; if(!campaign) throw new Error('Campaign code not found.');
 const {error:joinError}=await supabase.from('campaign_members').upsert({campaign_id:campaign.id,user_id:user.id,role:'player'},{onConflict:'campaign_id,user_id'}); if(joinError) throw joinError;
 return campaign;
}
export async function cloudListCampaigns(){
 const user=await cloudUser(); if(!user) return [];
 const {data:members,error}=await supabase.from('campaign_members').select('campaign_id,role,campaigns(id,title,invite_code,owner_id,created_at)').eq('user_id',user.id);
 if(error) throw error;
 return (members||[]).map((m:any)=>({...m.campaigns,role:m.role})).filter(Boolean);
}
export async function cloudCampaignMembers(campaignId:string){const {data,error}=await supabase.from('campaign_members').select('user_id,role,profiles(display_name)').eq('campaign_id',campaignId);if(error)throw error;return data||[];}

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
export async function cloudTrackOpen(){try{let device=localStorage.getItem('cc-device-id');if(!device){device=crypto.randomUUID();localStorage.setItem('cc-device-id',device)}await supabase.from('app_visits').upsert({device_id:device,last_seen:new Date().toISOString()},{onConflict:'device_id'});}catch{}}
export async function cloudOwnerAnalytics(){const {data,error}=await supabase.rpc('owner_analytics');if(error)throw error;return data;}
