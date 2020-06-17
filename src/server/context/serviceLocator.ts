/**
 * A service locator enbales one instance of a class to be active at a time.
 * It allows for exemple to have a single repository per interface and call it when you need to inject it.
 * This pattern is used for ***dependency injection***.
 *
 * https://en.wikipedia.org/wiki/Service_locator_pattern
 *
 *
 * Code inspired by: https://github.com/joaojacome/simple-injection
 */

export default class ServiceLocator {
	private static services: Map<string, any> = new Map<string, any>();

	public static register(serviceName: string, serviceClass: Object) {
		if (this.services.has(serviceName)) {
			//TODO define a better error
			throw new Error();
		}
		this.services.set(serviceName, serviceClass);
	}

	public static resolve(serviceName: string): any {
		const service = this.services.get(serviceName);
		if (!service) {
			//TODO define a better error
			throw new Error();
		}
		return service;
	}
}
