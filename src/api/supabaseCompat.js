const SUPABASE_URL = "https://mitbmrdeksicjzxjajyx.supabase.co";
const SUPABASE_KEY = "sb_publishable_U2zk1sXsarpeiRkCXPwwrw_sgQnhR88";
const SESSION_KEY = "gds_supabase_session";

const jsonHeaders = () => ({
  apikey: SUPABASE_KEY,
  "Content-Type": "application/json",
});

function makeError(message, status, data) {
  const error = new Error(message || "Request failed");
  error.status = status;
  error.data = data;
  error.response = { status, data };
  return error;
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (!session?.access_token) return null;
  const next = {
    ...session,
    expires_at:
      session.expires_at ||
      (session.expires_in ? Math.floor(Date.now() / 1000) + Number(session.expires_in) : null),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  return next;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function jwtPayload(token) {
  try {
    const part = token.split(".")[1];
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

async function authRequest(path, options = {}) {
  const res = await fetch(SUPABASE_URL + "/auth/v1" + path, {
    ...options,
    headers: {
      ...jsonHeaders(),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw makeError(
      data?.msg || data?.message || data?.error_description || data?.error || "Authentication failed",
      res.status,
      data
    );
  }
  return data;
}

async function refreshSession() {
  const current = readSession();
  if (!current?.refresh_token) {
    clearSession();
    throw makeError("Authentication required", 401);
  }
  try {
    const next = await authRequest("/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: current.refresh_token }),
    });
    return saveSession(next);
  } catch (error) {
    clearSession();
    throw error;
  }
}

async function accessToken() {
  let session = readSession();
  if (!session?.access_token) throw makeError("Authentication required", 401);
  const expiresAt = Number(session.expires_at || 0);
  if (expiresAt && expiresAt <= Math.floor(Date.now() / 1000) + 30) {
    session = await refreshSession();
  }
  return session.access_token;
}

async function apiFetch(path, options = {}, requireAuth = true) {
  const headers = {
    apikey: SUPABASE_KEY,
    ...(options.body instanceof Blob || options.body instanceof File ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };
  if (requireAuth) headers.Authorization = "Bearer " + (await accessToken());
  const res = await fetch(SUPABASE_URL + path, { ...options, headers });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw makeError(
      data?.message || data?.msg || data?.error_description || data?.error || "Request failed",
      res.status,
      data
    );
  }
  return data;
}

function consumeRedirectSession() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const token = params.get("access_token");
  if (!token) return null;
  const session = saveSession({
    access_token: token,
    refresh_token: params.get("refresh_token"),
    expires_in: Number(params.get("expires_in") || 0),
    token_type: params.get("token_type") || "bearer",
  });
  window.history.replaceState({}, "", window.location.pathname + window.location.search);
  return session;
}

let claimPromise = null;
async function claimImportedCharacters() {
  if (!readSession()?.access_token) return 0;
  if (!claimPromise) {
    claimPromise = apiFetch("/rest/v1/rpc/claim_imported_characters", {
      method: "POST",
      body: JSON.stringify({}),
    }).catch(() => 0);
  }
  return claimPromise;
}

function currentUserId() {
  const session = readSession();
  return session?.access_token ? jwtPayload(session.access_token)?.sub || "" : "";
}

function recordFromRow(row) {
  if (!row) return null;
  return {
    ...(row.data || {}),
    id: row.id,
    created_date: row.created_at,
    updated_date: row.updated_at,
    created_by_id: row.user_id,
  };
}

function orderSpec(sort) {
  const raw = String(sort || "-updated_date");
  const desc = raw.startsWith("-");
  const field = raw.replace(/^-/, "");
  const map = {
    created_date: "created_at",
    updated_date: "updated_at",
  };
  return (map[field] || "updated_at") + "." + (desc ? "desc" : "asc");
}

function entity(table, options = {}) {
  const isCharacter = table === "crawler_characters";
  return {
    async list(sort = "-updated_date", limit = 100) {
      if (isCharacter) await claimImportedCharacters();
      const rows = await apiFetch(
        `/rest/v1/${table}?select=*&order=${encodeURIComponent(orderSpec(sort))}&limit=${Number(limit) || 100}`
      );
      return (rows || []).map(recordFromRow);
    },

    async get(id) {
      if (isCharacter) await claimImportedCharacters();
      const rows = await apiFetch(
        `/rest/v1/${table}?select=*&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      if (!rows?.[0]) throw makeError("Record not found", 404);
      return recordFromRow(rows[0]);
    },

    async create(data) {
      const userId = currentUserId();
      if (!userId) throw makeError("Authentication required", 401);
      const now = new Date().toISOString();
      const row = {
        user_id: userId,
        data,
        created_at: now,
        ...(isCharacter ? { name: data?.name || "" } : {}),
      };
      const rows = await apiFetch(`/rest/v1/${table}`, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(row),
      });
      return recordFromRow(rows?.[0]);
    },

    async update(id, data) {
      const now = new Date().toISOString();
      const patch = {
        data,
        updated_at: now,
        ...(isCharacter ? { name: data?.name || "" } : {}),
      };
      const rows = await apiFetch(
        `/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(patch),
        }
      );
      if (!rows?.[0]) throw makeError("Record not found", 404);
      return recordFromRow(rows[0]);
    },

    async delete(id) {
      await apiFetch(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });
      return true;
    },

    async filter(filters = {}, sort = "-updated_date", limit = 1000) {
      const rows = await this.list(sort, limit);
      return rows.filter((row) =>
        Object.entries(filters).every(([key, value]) => row?.[key] === value)
      );
    },
  };
}

async function uploadStorageObject(bucket, path, file, retryAuth = true) {
  const token = await accessToken();
  const url =
    SUPABASE_URL +
    "/storage/v1/object/" +
    bucket +
    "/" +
    path.split("/").map(encodeURIComponent).join("/");

  /* XMLHttpRequest is intentionally used for binary uploads instead of the
     JSON-oriented apiFetch helper. It has no short application timeout and is
     more reliable for multi-megabyte PDFs on mobile/tablet browsers. */
  try {
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.timeout = 0;
      xhr.setRequestHeader("apikey", SUPABASE_KEY);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.setRequestHeader("x-upsert", "false");
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
          return;
        }
        let data = null;
        try { data = JSON.parse(xhr.responseText || "null"); } catch { data = xhr.responseText; }
        reject(makeError(data?.message || data?.error || "Upload failed", xhr.status, data));
      };
      xhr.onerror = () => reject(makeError("Network error while uploading file", 0));
      xhr.onabort = () => reject(makeError("Upload was cancelled", 0));
      xhr.send(file);
    });
  } catch (error) {
    if (retryAuth && error?.status === 401) {
      await refreshSession();
      return uploadStorageObject(bucket, path, file, false);
    }
    throw error;
  }
}

async function uploadToBucket(bucket, file, makePublic) {
  const userId = currentUserId();
  if (!userId) throw makeError("Authentication required", 401);
  const safeName = String(file.name || "upload")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "upload";
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
  await uploadStorageObject(bucket, path, file);
  return {
    path,
    publicUrl: makePublic
      ? `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
      : null,
  };
}

const auth = {
  consumeRedirectSession,

  hasSession() {
    return !!readSession()?.access_token;
  },

  async me() {
    consumeRedirectSession();
    const token = await accessToken();
    const user = await authRequest("/user", {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });
    await claimImportedCharacters();
    const profiles = await apiFetch(
      `/rest/v1/profiles?select=*&user_id=eq.${encodeURIComponent(user.id)}&limit=1`
    );
    const profile = profiles?.[0] || {};
    return {
      ...user,
      role: profile.role || "user",
      display_name:
        profile.display_name ||
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "",
      active_character_id: profile.active_character_id || "",
    };
  },

  async loginViaEmailPassword(email, password) {
    const session = await authRequest("/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveSession(session);
    claimPromise = null;
    await claimImportedCharacters();
    return session;
  },

  async register({ email, password }) {
    const redirectTo =
      typeof window !== "undefined" ? window.location.origin + "/login" : undefined;
    const query = redirectTo ? "?redirect_to=" + encodeURIComponent(redirectTo) : "";
    const result = await authRequest("/signup" + query, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (result?.access_token) saveSession(result);
    return result;
  },

  async verifyOtp({ email, otpCode }) {
    const result = await authRequest("/verify", {
      method: "POST",
      body: JSON.stringify({ type: "signup", email, token: otpCode }),
    });
    if (result?.access_token) {
      saveSession(result);
      claimPromise = null;
      await claimImportedCharacters();
    }
    return result;
  },

  async resendOtp(email) {
    return authRequest("/resend", {
      method: "POST",
      body: JSON.stringify({ type: "signup", email }),
    });
  },

  async resetPasswordRequest(email) {
    const redirectTo =
      typeof window !== "undefined" ? window.location.origin + "/reset-password" : undefined;
    const query = redirectTo ? "?redirect_to=" + encodeURIComponent(redirectTo) : "";
    return authRequest("/recover" + query, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async updatePassword(newPassword) {
    const token = await accessToken();
    return authRequest("/user", {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
      body: JSON.stringify({ password: newPassword }),
    });
  },

  async resetPassword({ newPassword }) {
    return this.updatePassword(newPassword);
  },

  loginWithProvider(provider, returnTo = "/") {
    const isNative =
      typeof window !== "undefined" &&
      Boolean(window.Capacitor?.isNativePlatform?.());

    const redirect = isNative
      ? "com.gingerdragonstudios.rpgcompanion://login-callback"
      : new URL(returnTo || "/", window.location.origin).toString();

    window.location.href =
      `${SUPABASE_URL}/auth/v1/authorize?provider=${encodeURIComponent(provider)}&redirect_to=${encodeURIComponent(redirect)}`;
  },

  setToken(token) {
    if (!token) return;
    const current = readSession() || {};
    saveSession({ ...current, access_token: token });
  },

  setSession(session) {
    return saveSession(session);
  },

  async logout(redirectTo) {
    try {
      const token = readSession()?.access_token;
      if (token) {
        await authRequest("/logout", {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
        });
      }
    } catch {
      // Local sign-out still proceeds if the server session already expired.
    } finally {
      clearSession();
      claimPromise = null;
      if (redirectTo && typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  },

  redirectToLogin(returnTo = "/") {
    if (typeof window === "undefined") return;
    const path = new URL(returnTo || "/", window.location.origin);
    const localReturn = path.origin === window.location.origin ? path.pathname + path.search : "/";
    window.location.href = "/login?returnTo=" + encodeURIComponent(localReturn);
  },

  async updateMe(patch) {
    const userId = currentUserId();
    if (!userId) throw makeError("Authentication required", 401);
    const dbPatch = {};
    if ("display_name" in patch) dbPatch.display_name = patch.display_name;
    if ("role" in patch) dbPatch.role = patch.role;
    if ("active_character_id" in patch)
      dbPatch.active_character_id = patch.active_character_id || null;
    dbPatch.updated_at = new Date().toISOString();
    const rows = await apiFetch(
      `/rest/v1/profiles?user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(dbPatch),
      }
    );
    return rows?.[0] || null;
  },
};

const campaigns = {
  async list() {
    const userId = currentUserId();
    if (!userId) throw makeError("Authentication required", 401);
    const rows = await apiFetch(
      "/rest/v1/campaign_members?select=role,campaigns(id,name,description,invite_code,owner_id,created_at,updated_at)&user_id=eq." +
        encodeURIComponent(userId) +
        "&order=joined_at.desc"
    );
    return (rows || [])
      .filter((row) => row?.campaigns)
      .map((row) => ({ ...row.campaigns, title: row.campaigns.name, role: row.role }));
  },

  async create(name) {
    const userId = currentUserId();
    if (!userId) throw makeError("Authentication required", 401);
    const cleanName = String(name || "").trim() || "My Crawler Campaign";
    const invite =
      crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase() +
      "-" +
      crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
    const created = await apiFetch("/rest/v1/campaigns", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        owner_id: userId,
        name: cleanName,
        description: "",
        invite_code: invite,
      }),
    });
    const campaign = created?.[0];
    if (!campaign?.id) throw makeError("Campaign could not be created", 500);
    await apiFetch("/rest/v1/campaign_members", {
      method: "POST",
      headers: { Prefer: "return=minimal,resolution=merge-duplicates" },
      body: JSON.stringify({ campaign_id: campaign.id, user_id: userId, role: "gm" }),
    });
    return { ...campaign, title: campaign.name, role: "gm" };
  },

  async join(inviteCode) {
    const code = String(inviteCode || "").trim().toUpperCase();
    if (!code) throw makeError("Enter a campaign invite code", 400);
    const data = await apiFetch("/rest/v1/rpc/join_campaign_by_code", {
      method: "POST",
      body: JSON.stringify({ p_invite_code: code }),
    });
    const campaign = Array.isArray(data) ? data[0] : data;
    if (!campaign?.id) throw makeError("Campaign code not found", 404);
    return { ...campaign, title: campaign.name, role: "player" };
  },

  async characters(campaignId) {
    if (!campaignId) return [];
    const links = await apiFetch(
      "/rest/v1/campaign_characters?select=character_id,user_id,joined_at&campaign_id=eq." +
        encodeURIComponent(campaignId) +
        "&order=joined_at.asc"
    );
    const ids = (links || []).map((row) => row.character_id).filter(Boolean);
    if (!ids.length) return [];
    const inList = ids.map((id) => String(id).replace(/[^a-f0-9-]/gi, "")).join(",");
    const rows = await apiFetch(
      "/rest/v1/crawler_characters?select=*&id=in.(" + encodeURIComponent(inList) + ")"
    );
    const linkByCharacter = new Map((links || []).map((row) => [row.character_id, row]));
    return (rows || []).map((row) => ({
      ...recordFromRow(row),
      owner_user_id: row.user_id || null,
      campaign_user_id: linkByCharacter.get(row.id)?.user_id || null,
      is_guest: !row.user_id,
    }));
  },

  async createGuest(campaignId, name, data) {
    const result = await apiFetch("/rest/v1/rpc/create_guest_crawler", {
      method: "POST",
      body: JSON.stringify({
        p_campaign_id: campaignId,
        p_name: String(name || "").trim(),
        p_data: data || {},
      }),
    });
    return Array.isArray(result) ? result[0] : result;
  },

  async claimGuest(token) {
    const result = await apiFetch("/rest/v1/rpc/claim_guest_crawler", {
      method: "POST",
      body: JSON.stringify({ p_claim_token: String(token || "").trim() }),
    });
    return Array.isArray(result) ? result[0] : result;
  },

  async mobs(campaignId) {
    if (!campaignId) return [];
    const rows = await apiFetch(
      "/rest/v1/campaign_mobs?select=*&campaign_id=eq." +
        encodeURIComponent(campaignId) +
        "&order=name.asc"
    );
    return (rows || []).map((row) => ({
      id: row.id,
      campaign_id: row.campaign_id,
      name: row.name,
      ...(row.stats || {}),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  },

  async saveMob(campaignId, mob) {
    if (!campaignId) throw makeError("Campaign required", 400);
    const name = String(mob?.name || "").trim();
    if (!name) throw makeError("Mob name required", 400);
    const { id, campaign_id, created_at, updated_at, ...stats } = mob || {};
    if (id) {
      const rows = await apiFetch(
        "/rest/v1/campaign_mobs?id=eq." + encodeURIComponent(id),
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            name,
            stats,
            updated_at: new Date().toISOString(),
          }),
        }
      );
      return rows?.[0] || null;
    }
    const rows = await apiFetch("/rest/v1/campaign_mobs", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        campaign_id: campaignId,
        name,
        stats,
      }),
    });
    return rows?.[0] || null;
  },

  async deleteMob(id) {
    if (!id) return true;
    await apiFetch(
      "/rest/v1/campaign_mobs?id=eq." + encodeURIComponent(id),
      { method: "DELETE", headers: { Prefer: "return=minimal" } }
    );
    return true;
  },

  async gmUpdateCharacter(campaignId, characterId, data, recordEvent = false) {
    const result = await apiFetch("/rest/v1/rpc/gm_update_campaign_character", {
      method: "POST",
      body: JSON.stringify({
        p_campaign_id: campaignId,
        p_character_id: characterId,
        p_data: data || {},
        p_record_event: Boolean(recordEvent),
      }),
    });
    const row = Array.isArray(result) ? result[0] : result;
    return recordFromRow(row);
  },
};

const functions = {
  async invoke(name, payload = {}) {
    if (name === "uploadRulebook") {
      const file = payload.file;
      if (!file) throw makeError("No file supplied", 400);
      const uploaded = await uploadToBucket("rulebooks", file, false);
      return {
        data: {
          file_uri: `supabase://rulebooks/${uploaded.path}`,
          original_filename: file.name || "",
          mime_type: file.type || "application/pdf",
          file_size: typeof file.size === "number" ? file.size : undefined,
        },
      };
    }

    if (name === "processRulebook") {
      const data = await apiFetch("/functions/v1/process-rulebook", {
        method: "POST",
        body: JSON.stringify(payload || {}),
      });
      return { data };
    }

    throw makeError(
      `${name} has not been migrated from Base44 yet.`,
      501,
      { function: name }
    );
  },
};

export const supabaseBase44Compat = {
  app: {
    async getPublicSettings() {
      return { id: "gds-crawler-companion", public_settings: {} };
    },
  },
  auth,
  campaigns,
  entities: {
    Character: entity("crawler_characters"),
    Rulebook: entity("rulebooks"),
    RulebookExtraction: entity("rulebook_extractions"),
    RulebookProcessingJob: entity("rulebook_processing_jobs"),
  },
  integrations: {
    Core: {
      async UploadPublicFile({ file }) {
        const uploaded = await uploadToBucket("portraits", file, true);
        return { file_url: uploaded.publicUrl };
      },
    },
  },
  functions,
};

export const supabaseConfig = {
  url: SUPABASE_URL,
  publishableKey: SUPABASE_KEY,
};
