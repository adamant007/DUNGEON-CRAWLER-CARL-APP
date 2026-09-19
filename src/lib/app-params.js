import { getAccessToken } from '@base44/sdk';

const isNode = typeof window === 'undefined';
const DEFAULT_APP_ID = '6aa08093485633062c57e946';

const isClearAccessTokenRequested = () =>
	!isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
	window.localStorage.removeItem('base44_access_token');
	window.localStorage.removeItem('token');
}

const getAppParams = () => {
	if (isClearAccessTokenRequested()) {
		clearStoredAccessToken();
	}

	/* Base44 injects these values when it hosts the app. External hosts such
	   as Vercel do not, so keep a safe public app-id fallback and use the
	   browser origin for auth redirects. The Vercel /api rewrite proxies the
	   existing same-origin SDK calls to the Base44 backend. */
	const browserOrigin = !isNode && window.location?.origin ? window.location.origin : '';

	return {
		appId: import.meta.env.VITE_BASE44_APP_ID || DEFAULT_APP_ID,
		token: getAccessToken(),
		functionsVersion: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION,
		appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL || browserOrigin,
	}
}


export const appParams = {
	...getAppParams()
}
