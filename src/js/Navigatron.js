import { Article } from "./pages/Article";
import { ErrorPage } from "./pages/Error";

export class Navigatron {
	constructor(sitemap, mainUI) {
		this._sitemap = sitemap;
		this._mainUI = mainUI;
		this._pageActuelle = null;
		this._lockInteraction = false;
		window.openLink = (url) => this.openLink(url, "CHILD");
	}

	async initializeCurrentURL() {
		this.openLink(window.location.pathname, "INIT");
	}

	async openLink(url, animation) {
		if(this._lockInteraction)
			return;
		if(url.includes("#")) {
			document.location.hash = "#"+url.split("#")[1];
			return;
		}

		this._lockInteraction = true;
		try {
			let response = await fetch("/getPage.php?url="+url)
			let data = await response.json();
			let page = null;
			if(data.type=="article")
				page = new Article(url, data);
			else if(data.type=="error")
				page = new ErrorPage(url, data);

			if(this._pageActuelle)
				await this._pageActuelle.close(this._mainUI, animation);
			this._pageActuelle = page;
			this.updateNavigation();
			if(this._pageActuelle)
				await this._pageActuelle.open(this._mainUI, animation);
			history.pushState("", "", url);
		} finally {
			this._lockInteraction = false;
		}
	}

	updateNavigation() {
		this._mainUI.clearNavigation();
		if(!this._pageActuelle) {
			this._addNavElement(this._sitemap.map['/'].title, "navButton_current", "#", '/', "INIT");
			return;
		}

		let currentUrl = this._pageActuelle.getUrl();

		// Parents
		this._addParentPageNavElement(currentUrl);

		// Current page
		this._addCurrentPageNavElement();

		// Childrens
		let regexp = currentUrl!="/" 
			? new RegExp('^'+currentUrl.replace('/','\\/') +'\/[^\/]+$') 
			: new RegExp('^\/[^\/]+$') ;
		for(let url in this._sitemap.map)
			if(url.match(regexp))
				this._addChildPageNavElement(url);

		// Page headings
		for(let heading of this._pageActuelle.getHeadings())
			this._addHeadingNavElement(heading.title, heading.anchor);
	}

	_addParentPageNavElement(url) {
		if(url=="" || url=="/")
			return;
		url = url.replace(/(\/[^\/]*)$/gm, ""); // Getting parent URL
		this._addParentPageNavElement(url); // Adding parent's parents first

		if(url=="")
			url="/";

		if(this._sitemap.map[url])
			this._addNavElement(this._sitemap.map[url].title, "navButton_parent", "<", url, "PARENT");
	}

	_addCurrentPageNavElement() {
		this._addNavElement(this._pageActuelle.getTitle(), "navButton_current", "#", this._pageActuelle.getUrl()+"#TOP", "SAMEPAGE");
	}

	_addChildPageNavElement(url) {
		if(this._sitemap.map[url])
			this._addNavElement(this._sitemap.map[url].title, "navButton_child", ">", url, "CHILD");
	}

	_addHeadingNavElement(title, anchor) {
		this._addNavElement(title, "navButton_heading", "§", this._pageActuelle.getUrl()+"#"+anchor, "SAMEPAGE");
	}

	_addNavElement(title, cssClass, iconSymbol, url, animation) {
		let button = document.createElement("div");
		button.className = "navButton " + cssClass;
		button.onclick = () => this.openLink(url, animation);

		let icon = document.createElement("div");
		icon.className = "navButton_icon";
		icon.innerHTML = iconSymbol;
		button.appendChild(icon);

		let text = document.createElement("div");
		text.className = "navButton_text";
		text.innerHTML = title;
		button.appendChild(text);

		this._mainUI.addNavigationElement(button);
	}

};