/**
 * Represent the main UI
 */
export class MainUI {
	constructor() {
		this._title = document.getElementById("mainUI_title");
		this._subTitle = document.getElementById("mainUI_header_title");
		this._overlayLoading = document.getElementById("mainUI_overlayLoading");
		this._pageContainer = document.getElementById("mainUI_pageContainer");
		this._navPanel = document.getElementById("mainUI_navPanel");
		this._sidePanel = document.getElementById("mainUI_sidePanel");
		this._sidePanelOverlay = document.getElementById("mainUI_overlaySidePanel");
		this._buttonOpenSidePanel = document.getElementById("button_openSidePanel");
		this._buttonBack = document.getElementById("button_back");
		this._buttonLeft = document.getElementById("button_left");
		this._buttonRight = document.getElementById("button_right");

		this._buttonOpenSidePanel.onclick = () => {
			this._sidePanel.classList.toggle("mainUI_sidePanel_opened");
			this._sidePanelOverlay.classList.toggle("mainUI_overlaySidePanel_opened");
		}
		this._sidePanelOverlay.onclick = this._sidePanel.onclick = () => {
			this._sidePanel.classList.remove("mainUI_sidePanel_opened");
			this._sidePanelOverlay.classList.remove("mainUI_overlaySidePanel_opened");
		}

		this._buttonBack = document.getElementById("button_back");
		this._buttonLeft = document.getElementById("button_left");
		this._buttonRight = document.getElementById("button_right");
		this.listenBackButton(null);
		this.listenLeftButton(null);
		this.listenRightButton(null);
	}

	fadeLoadingOverlay() {
		this._overlayLoading.classList.add("mainUI_overlayLoading_off");
	}

	setTitle(title) {
		this._title.innerHTML = title;
	}

	setSubtitle(title) {
		this._subTitle.innerHTML = title;
	}

	setTheme(theme) {
		document.body.className = theme;
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

	listenLeftButton(callback) {
		this._buttonLeft.onclick = callback;
		this._buttonLeft.disabled = !callback;
	}

	listenRightButton(callback) {
		this._buttonRight.onclick = callback;
		this._buttonRight.disabled = !callback;
	}

	listenBackButton(callback) {
		this._buttonBack.onclick = callback;
		this._buttonBack.disabled = !callback;
	}
}