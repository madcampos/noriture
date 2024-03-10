/* eslint-disable @typescript-eslint/no-invalid-void-type */
if (!('URLPattern' in globalThis)) {
	await import('urlpattern-polyfill');
}

type IsParameter<Part> = Part extends `:${infer ParamName}` ? ParamName : never;

type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}`
	? FilteredParts<PartB> | IsParameter<PartA>
	: IsParameter<Path>;

type Params<Path> = {
	[Key in FilteredParts<Path>]: string;
};

export interface RouteLocation<Path = string> {
	path: Path,
	params: Params<Path>,
	query?: Record<string, string | undefined>,
	hash?: string
}

type RouteGuardHandler = (origin: string, destination: string) => Promise<RouteLocation | false | void> | RouteLocation | false | void;

export interface RouterView extends HTMLElement {
	navigate(destination: RouteLocation, origin: RouteLocation): Promise<string | void> | string | void
}

type ViewImplementation = new () => RouterView;

interface RouteDefinition {
	path: string,
	view: ViewImplementation,
	guard?: RouteGuardHandler
}

interface RouterConfig {
	routes: RouteDefinition[],
	baseUrl: string,
	appTitle?: string,
	selectorAttribute?: string,
	beforeEach?: RouteGuardHandler,
	fallback?: RouterView
}

export class Router {
	static #routes: [URLPattern, RouterView][] = [];
	static #beforeEach: RouteGuardHandler | undefined;
	static #fallback: RouterView | undefined;
	static readonly #fallbackPattern = new URLPattern({ pathname: '*' });
	static #selectorAttribute = 'router-link';
	static #baseUrl: string;

	static #currentPath = '';
	static #currentLocation: RouteLocation;

	static appTitle = 'App';

	static get currentPath() {
		return this.#currentPath;
	}

	static get selectorAttribute() {
		return this.#selectorAttribute;
	}

	static get beforeEach(): RouteGuardHandler | undefined {
		return Router.#beforeEach;
	}

	static set beforeEach(handler: RouteGuardHandler) {
		Router.#beforeEach = handler;
	}

	static get fallback(): RouterView | undefined {
		return Router.#fallback;
	}

	static set fallback(view: RouterView) {
		Router.#fallback = view;
	}

	static add<T extends ViewImplementation>(path: string, ViewClass: T) {
		const view = new ViewClass();

		view.dataset.routerView = '';

		Router.#routes.push([new URLPattern({ pathname: path }), view]);

		document.body.appendChild(view as unknown as Node);
	}

	static async navigate(path: string) {
	try {
			const newPath = new URL(path, Router.#baseUrl).pathname;

			if (Router.#currentPath === newPath) {
				return;
			}

			const guardResult = await Router.#beforeEach?.(this.#currentPath, newPath);

			if (guardResult === false) {
				return;
			}

			const pathToSearch = guardResult?.path ?? newPath;

			const [matcher, view] = Router.#routes.find(([pattern]) => pattern.test(pathToSearch, this.#baseUrl)) ?? [];

			if (matcher !== undefined && view) {
				const destinationMatcher = matcher.exec(pathToSearch, Router.#baseUrl);
				const destination: RouteLocation = {
					path: pathToSearch,
					params: destinationMatcher?.pathname.groups ?? {},
					query: destinationMatcher?.search.groups ?? {},
					hash: destinationMatcher?.hash.input
				};

				const title = await view.navigate(destination, Router.#currentLocation);

				Router.#routes.forEach(([, otherView]) => {
					delete otherView.dataset.activeView;
				});

				view.dataset.activeView = '';

				/* eslint-disable require-atomic-updates */
				Router.#currentPath = pathToSearch;
				Router.#currentLocation = destination;
				/* eslint-enable require-atomic-updates */

				const basePath = new URL(Router.#baseUrl).pathname.replace(/\/$/u, '');
				const normalizedPath = new URL(`${basePath}${path}`, Router.#baseUrl).pathname;

				window.history.pushState(null, '', normalizedPath);

				if (title) {
					window.document.title = `${title} · ${Router.appTitle}`;
				} else {
					window.document.title = Router.appTitle;
				}
			}
		} catch (err) {
			console.error(`[⛵️] Error while navigating to ${path}:`, err);
		}
	}

	static init({ routes, baseUrl, appTitle, selectorAttribute, beforeEach, fallback }: RouterConfig) {
		Router.#baseUrl = baseUrl;

		if (Router.#baseUrl === '/' || Router.#baseUrl === '') {
			Router.#baseUrl = new URL('/', window.location.origin).toString();
		}

		const currentMatcher = Router.#fallbackPattern.exec(window.location.href, Router.#baseUrl);

		Router.#currentPath = '';
		Router.#currentLocation = {
			path: Router.#currentPath,
			params: currentMatcher?.pathname.groups ?? {},
			query: currentMatcher?.search.groups ?? {},
			hash: currentMatcher?.hash.input
		};

		routes.forEach(({ path, view }) => Router.add(path, view));

		if (selectorAttribute) {
			Router.#selectorAttribute = selectorAttribute;
		}

		if (appTitle) {
			Router.appTitle = appTitle;
		}

		if (beforeEach) {
			Router.beforeEach = beforeEach;
		}

		if (fallback) {
			Router.fallback = fallback;
		}

		window.addEventListener('popstate', async (evt) => {
			evt.preventDefault();
			evt.stopPropagation();

			await Router.navigate(window.location.href);
		});

		window.addEventListener('hashchange', async () => {
			await Router.navigate(window.location.href);
		});

		window.addEventListener('click', async (evt) => {
			const element = evt.target as HTMLElement;

			if (element.matches(`a[${Router.#selectorAttribute}]`)) {
				evt.preventDefault();
				evt.stopPropagation();

				// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
				const path = element.getAttribute(Router.#selectorAttribute) || element.getAttribute('href');

				if (path) {
					await Router.navigate(path);
				}
			}
		});

		document.body.insertAdjacentHTML('beforebegin', '<style>[data-router-view]:not([data-active-view]) { display: none; }</style>');

		// eslint-disable-next-line no-console
		console.info('[⛵️] Router initialized');

		void Router.navigate(window.location.href);
	}
}

import './router-link';
