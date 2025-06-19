const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","img/trash_panda.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.B5tfVM8T.js",app:"_app/immutable/entry/app.DWAYKOzS.js",imports:["_app/immutable/entry/start.B5tfVM8T.js","_app/immutable/chunks/CLtJzFen.js","_app/immutable/chunks/C_I3Pzvd.js","_app/immutable/chunks/D5ALHaBg.js","_app/immutable/chunks/CWSeHdkT.js","_app/immutable/entry/app.DWAYKOzS.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/DjdlJ9ao.js","_app/immutable/chunks/C_I3Pzvd.js","_app/immutable/chunks/b-Rpt_S2.js","_app/immutable/chunks/CNxMpzt5.js","_app/immutable/chunks/CWSeHdkT.js","_app/immutable/chunks/C2CNzB8j.js","_app/immutable/chunks/D5ALHaBg.js","_app/immutable/chunks/CDubzdnj.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-BrSQlDQW.js')),
			__memo(() => import('./chunks/1-_PDzPsRp.js')),
			__memo(() => import('./chunks/2-BHmajUIZ.js')),
			__memo(() => import('./chunks/3-DKCI7yWf.js')),
			__memo(() => import('./chunks/4-ByiRAJFZ.js')),
			__memo(() => import('./chunks/5-CTfn6zUJ.js')),
			__memo(() => import('./chunks/6-CoHZN1ij.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/about",
				pattern: /^\/about\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/api/posts",
				pattern: /^\/api\/posts\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server-Cz5qN8Zf.js'))
			},
			{
				id: "/posts",
				pattern: /^\/posts\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/posts/[slug]",
				pattern: /^\/posts\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/[slug]",
				pattern: /^\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		prerendered_routes: new Set(["/feed"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set(["/feed"]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
