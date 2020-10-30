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
		mainUI.addPageElement(this._element);
		await this._animation(animation, "open");
	}

	async close(mainUI, animation) {
		await this._animation(animation, "close");
		mainUI.removePageElement(this._element);
	}

	/**
	 * 
	 * @param {string} animation 
	 * @param {string} action 
	 */
	async _animation(animation, action) {
		if(animation == "INIT" || animation == "SAMEPAGE")
			return;
		return new Promise((resolve)=> {
			const onAnimationEnd = () => {
				this._element.removeEventListener("animationend", onAnimationEnd);
				resolve();
			};
			this._element.addEventListener("animationend", onAnimationEnd);
			this._element.className = `page page_${action}_${animation.toLowerCase()}`;
		});
	}

};
