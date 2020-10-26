/**
 * Represent the main UI
 */
export class MainUI {
	constructor() {
		this._title = document.getElementById("mainUI_title");
		this._pageContainer = document.getElementById("mainUI_pageContainer");
		this._navPanel = document.getElementById("mainUI_navPanel");
		this._sidePanel = document.getElementById("mainUI_sidePanel");
		this._sidePanelOpenButton = document.getElementById("button_openSidePanel");
		this._sidePanelOpenButton.onclick = () => this._sidePanel.classList.toggle("mainUI_sidePanel_opened");
	}

	setTitle(title) {
		this._title.innerHTML = title;
	}

	addPageElement(page) {
		this._pageContainer.appendChild(page);
	}

	removePageElement(page) {
		this._pageContainer.removeChild(page);
	}

	clearNavigation() {
		this._navPanel.innerHTML = "";
	}

	addNavigationElement(element) {
		this._navPanel.appendChild(element);
	}

	setTheme(theme) {
		document.body.className = theme;
	}
}