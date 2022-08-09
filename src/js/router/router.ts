if (!('URLPattern' in globalThis)) {
	await import('urlpattern-polyfill');
}

type IsParameter<Part> = Part extends `:${infer ParamName}` ? ParamName : never;

type FilteredParts<Path> = Path extends `${infer PartA}/${infer PartB}`
	? IsParameter<PartA> | FilteredParts<PartB>
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

type RouteHandler<DestinationPath = string, OriginPath = string> = (origin: RouteLocation<OriginPath>, destination: RouteLocation<DestinationPath>) => void | Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type RouteGuardReturnTypes = false | RouteLocation | void | Promise<false | RouteLocation | void>;

type RouteGuardHandler<DestinationPath = string, OriginPath = string> = (origin: OriginPath, destination: DestinationPath) => RouteGuardReturnTypes;

interface RouteDefinition<Path = string> {
	path: Path,
	handler: RouteHandler<Path>,
	guard?: RouteGuardHandler<Path>
}

interface RouterConfig {
	routes: RouteDefinition[],
	baseUrl: string,
	attribute?: string,
	beforeEach?: RouteGuardHandler,
	fallback?: RouteHandler
}

export class Router {
	static #routes: [URLPattern, RouteHandler][] = [];
	static #beforeEach: RouteGuardHandler | undefined;
	static #fallback: RouteHandler | undefined;
	static readonly #fallbackPattern = new URLPattern({ pathname: '*' });
	static #selectorAttribute = 'router-link';
	static #baseUrl: string;

	static #currentPath = '';
	static #currentLocation: RouteLocation;

	// @ts-expect-error
	static get beforeEach(): RouteGuardHandler | undefined {
		return Router.#beforeEach;
	}

	static set beforeEach(handler: RouteGuardHandler) {
		Router.#beforeEach = handler;
	}

	// @ts-expect-error
	static get fallback(): RouteHandler | undefined {
		return Router.#fallback;
	}

	static set fallback(handler: RouteHandler) {
		Router.#fallback = handler;
	}

	static add(path: string, handler: RouteHandler) {
		Router.#routes.push([new URLPattern({ pathname: path }), handler]);
	}

	static async navigate(path: string) {
		try {
			if (Router.#currentPath === path) {
				return;
			}

			const guardResult = await Router.#beforeEach?.(this.#currentPath, path);

			if (guardResult === false) {
				return;
			}

			const pathToSearch = guardResult?.path ?? path;

			const [matcher, handler] = Router.#routes.find(([pattern]) => pattern.test(pathToSearch, this.#baseUrl)) ?? [Router.#fallbackPattern, Router.fallback];

			if (handler) {
				const destinationMatcher = matcher.exec(pathToSearch, Router.#baseUrl);
				const destination: RouteLocation = {
					path: pathToSearch,
					params: destinationMatcher?.pathname.groups ?? {},
					query: destinationMatcher?.search.groups ?? {},
					hash: destinationMatcher?.hash.input
				};

				await handler(Router.#currentLocation, destination);

				/* eslint-disable require-atomic-updates */
				Router.#currentPath = pathToSearch;
				Router.#currentLocation = destination;
				/* eslint-enable require-atomic-updates */

				window.history.pushState(null, '', path);
			}
		} catch (err) {
			console.error(`[⛵️] Error while navigating to ${path}:`, err);
		}
	}

	static init({ routes, baseUrl, attribute, beforeEach, fallback }: RouterConfig) {
		Router.#baseUrl = baseUrl;

		const currentMatcher = Router.#fallbackPattern.exec(window.location.href, Router.#baseUrl);

		Router.#currentPath = currentMatcher?.pathname.input ?? '';
		Router.#currentLocation = {
			path: Router.#currentPath,
			params: currentMatcher?.pathname.groups ?? {},
			query: currentMatcher?.search.groups ?? {},
			hash: currentMatcher?.hash.input
		};

		routes.forEach(({ path, handler }) => Router.add(path, handler));

		if (attribute) {
			Router.#selectorAttribute = attribute;
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

		// eslint-disable-next-line no-console
		console.info('[⛵️] Router initialized');
	}
}
