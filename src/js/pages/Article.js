import { Page } from "./Page";

export class Article extends Page {
	constructor(url, data, navigatron) {
		super(url, data, navigatron);
		this.getElement().innerHTML = data.content.html;
		// Générating headers
		this._headings = [];
		for(let heading of this.getElement().querySelectorAll("h2")) {
			let title = heading.innerText
			let anchor = title.replace(/[?.:!]/g, "").replace(/[  ]+/g, "_");
			heading.id = anchor;
			this._headings.push({
				title : title,
				anchor : anchor
			});
		}
		// Handling links
		for(let link of this.getElement().querySelectorAll("a")) {
			let linkurl = link.attributes["href"].value;
			// External link
			if(linkurl.match(/https?:\/\/.*/))
				link.target = "_blank";
			// Ressources (images, pdf, etc.)
			else if(linkurl.match(/.*\..*/))
				link.target = "_blank";
			// Internal link
			else
				link.onclick = (event) => {
					window.openLink(linkurl);
					event.preventDefault();
				}
		}
		// Fixing linked image styles
		for(let img of this.getElement().querySelectorAll("a > img"))
			img.parentElement.classList.add("media");
	}

	getHeadings() {
		return this._headings;
	}
}