/**
 * Represent the main UI
 */
export class MainUI {
	constructor() {
		this._title = document.getElementById("mainUI_title");
		this._pageContainer = document.getElementById("mainUI_pageContainer");
		this._navPanel = document.getElementById("mainUI_navPanel");
		this._sidePanel = document.getElementById("mainUI_sidePanel");
		this._sidePanelOverlay = document.getElementById("mainUI_overlaySidePanel");
		this._sidePanelOpenButton = document.getElementById("button_openSidePanel");
		this._sidePanelOpenButton.onclick = () => {
			this._sidePanel.classList.toggle("mainUI_sidePanel_opened");
			this._sidePanelOverlay.classList.toggle("mainUI_overlaySidePanel_opened");
		}
		this._sidePanelOverlay.onclick = this._sidePanel.onclick = () => {
			this._sidePanel.classList.remove("mainUI_sidePanel_opened");
			this._sidePanelOverlay.classList.remove("mainUI_overlaySidePanel_opened");
		}
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