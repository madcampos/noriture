/* oxlint-disable @typescript-eslint/no-invalid-void-type */

type IsParameter<Part> = Part extends `:${infer ParamName}` ? ParamName : never;

type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}` ? FilteredParts<PartB> | IsParameter<PartA>
	: IsParameter<Path>;

type Params<Path> = Record<FilteredParts<Path>, string>;

export interface RouteLocation<Path = string> {
	path: Path;
	params: Params<Path>;
	query?: Record<string, string | undefined>;
	hash?: string;
}

// TODO: move guard to be a funcion on the view

type RouteGuardHandler = (origin: string, destination: string) => Promise<RouteLocation | false | void> | RouteLocation | false | void;

export interface RouterView extends HTMLElement {
	navigate?(destination: RouteLocation, origin: RouteLocation): Promise<string | void> | string | void;
	updateTitle?(): string;
}

// TODO: get the actual view and don't instantiate it
type ViewImplementation = new () => RouterView;

interface RouteDefinition {
	path: string;
	view: ViewImplementation;
}

interface RouterConfig {
	routes: RouteDefinition[];
	// TODO: remove and use navigator.location or something?
	baseUrl: string;
	// TODO: move to router calls
	appTitle?: string;
	// TODO: remove
	beforeEach?: RouteGuardHandler;
	fallback?: RouterView;
	renderTarget?: HTMLElement;
}

export class Router {
	static #routes: [URLPattern, RouterView][] = [];
	static readonly #fallbackPattern = new URLPattern({ pathname: '*' });
	static #baseUrl: string;
	static #renderTarget: HTMLElement | undefined;

	static #currentPath = '';
	static #currentLocation: RouteLocation;

	static appTitle = 'App';

	static get baseUrl() {
		return this.#baseUrl;
	}

	static get currentPath() {
		return this.#currentPath;
	}

	static beforeEach: RouteGuardHandler | undefined;

	static fallback: RouterView | undefined;

	static get renderTarget() {
		return Router.#renderTarget ?? document.body;
	}

	static set renderTarget(target: HTMLElement) {
		const previousRenderTarget = Router.renderTarget;

		Router.#renderTarget = target;

		Router.#routes.forEach(([, view]) => {
			if (previousRenderTarget.contains(view)) {
				previousRenderTarget.removeChild(view);
				target.appendChild(view);
			}
		});
	}

	static add(path: string, ViewClass: ViewImplementation) {
		const view = new ViewClass();

		view.dataset['routerView'] = '';

		Router.#routes.push([new URLPattern({ pathname: path }), view]);

		Router.renderTarget.appendChild(view);
	}

	static async navigate(path: string) {
		try {
			const newPath = new URL(path, Router.#baseUrl).pathname;

			if (Router.#currentPath === newPath) {
				return;
			}

			const guardResult = await Router.beforeEach?.(this.#currentPath, newPath);

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

				const title = await view.navigate?.(destination, Router.#currentLocation) ?? undefined;

				Router.#routes.forEach(([, otherView]) => {
					delete otherView.dataset['activeView'];
				});

				view.dataset['activeView'] = '';

				Router.#currentPath = pathToSearch;
				Router.#currentLocation = destination;

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

	static init({
		routes,
		baseUrl,
		appTitle,
		renderTarget,
		beforeEach,
		fallback
	}: RouterConfig) {
		Router.#baseUrl = baseUrl;

		if (Router.#baseUrl.startsWith('/') || Router.#baseUrl.startsWith('./')) {
			Router.#baseUrl = new URL(Router.#baseUrl, window.location.origin).toString();
		} else if (Router.#baseUrl === '') {
			Router.#baseUrl = new URL('/', window.location.origin).toString();
		} else if (!Router.#baseUrl.startsWith(window.location.origin)) {
			throw new Error('The base URL must be on the same origin as the app');
		} else {
			throw new Error('The base URL must be an absolute path or a relative path starting with / or ./');
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

		if (renderTarget) {
			Router.renderTarget = renderTarget;
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

		// TODO: use navigation API
		window.addEventListener('popstate', async (evt) => {
			evt.preventDefault();
			evt.stopPropagation();

			await Router.navigate(window.location.href);
		});

		window.addEventListener('hashchange', async () => {
			await Router.navigate(window.location.href);
		});

		window.addEventListener('click', async (evt) => {
			// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
			const element = evt.target as HTMLElement;

			if (element.matches(`a[href]`)) {
				evt.preventDefault();
				evt.stopPropagation();

				const path = element.getAttribute('href');

				if (path) {
					await Router.navigate(path);
				}
			}
		});

		document.body.insertAdjacentHTML('beforebegin', '<style>[data-router-view]:not([data-active-view]) { display: none; }</style>');

		// oxlint-disable-next-line no-console
		console.info('[⛵️] Router initialized');

		void Router.navigate(window.location.href);
	}
}

import './router-link';
