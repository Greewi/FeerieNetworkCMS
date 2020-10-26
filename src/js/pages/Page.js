export class Page {
	constructor(url, data) {
		this._url = url;
		this._data = data;
		this._element = document.createElement("div");
		this._element.className = "page";
	}

	getUrl() {
		return this._url;
	}

	getTitle() {
		return this._data.title;
	}

	getElement() {
		return this._element;
	}

	getHeadings() {
		return [];
	}

	appendToCButton(button) {
		this._element.appendChild(button);
	}

	async open(mainUI, animation) {
		mainUI.setTitle(this._data.title);
		mainUI.addPageElement(this._element);
	}

	async close(mainUI, animation) {
		mainUI.removePageElement(this._element);
	}
};
