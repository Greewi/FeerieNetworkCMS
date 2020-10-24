import { Page } from "./Page";

export class ErrorPage extends Page {
	constructor(url, data) {
		super(url, data);
		this.getElement().innerHTML = data.content;
	}
}