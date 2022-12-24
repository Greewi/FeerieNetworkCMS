import { Page } from "./Page";

export class ErrorPage extends Page {
	constructor(url, data, navigatron) {
		super(url, data, navigatron);
		this.getElement().innerHTML = data.content;
	}
}