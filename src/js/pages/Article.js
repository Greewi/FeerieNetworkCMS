import { Page } from "./Page";

export class Article extends Page {
	constructor(url, data) {
		super(url, data);
		this.getElement().innerHTML = data.content.html;
		this._headings = [];
		for(let h of this.getElement().querySelectorAll("h2")) {
			let title = h.innerText
			let anchor = title.replace(/[?.:!]/g, "").replace(/[  ]+/g, "_");
			h.id = anchor;
			this._headings.push({
				title : title,
				anchor : anchor
			});
		}
	}

	getHeadings() {
		return this._headings;
	}
}