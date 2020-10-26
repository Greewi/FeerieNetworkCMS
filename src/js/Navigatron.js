import { Article } from "./pages/Article";
import { ErrorPage } from "./pages/Error";

export class Navigatron {
	constructor(sitemap, mainUI) {
		this._sitemap = sitemap;
		this._mainUI = mainUI;
		this._pageActuelle = null;
		this._lockInteraction = false;
		window.onpopstate = (event) => {
			if(event.state==null)
				return;
			let url = event.state.url;
			let animation = event.state.animation;
			if(animation=="CHILD")
				animation = "PARENT";
			else if(animation=="PARENT")
				animation = "CHILD";
			this.openLink(url, animation);
		};
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
			let page = this._createPage(url, data);

			if(this._pageActuelle)
				await this._pageActuelle.close(this._mainUI, animation);
			this._pageActuelle = page;
			this._updateNavigation();
			this._updateTheme(url);
			if(this._pageActuelle)
				await this._pageActuelle.open(this._mainUI, animation);
			history.pushState({url:url, animation:"INIT"}, "", url);
		} finally {
			this._lockInteraction = false;
		}
	}

	_createPage(url, data) {
		let page = null;
		if(data.type=="article")
			page = new Article(url, data);
		else if(data.type=="error")
			page = new ErrorPage(url, data);
		return page;
	}

	_updateNavigation() {
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
		for(let url in this._sitemap.map) {
			if(url.match(regexp)) {
				this._addChildPageNavElement(url, this._pageActuelle);
			}
		}

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

	_addChildPageNavElement(url, page) {
		if(this._sitemap.map[url])
			this._addNavElement(this._sitemap.map[url].title, "navButton_child", ">", url, "CHILD");
		if(page) {
			let tocButton = document.createElement("button");
			tocButton.className = "button button_navButton";
			tocButton.innerHTML = this._sitemap.map[url].title;
			tocButton.onclick = () => this.openLink(url, "CHILD");
			page.appendToCButton(tocButton);
		}
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

	_updateTheme(url) {
		while(url!=""){
			if(this._sitemap.map[url] && this._sitemap.map[url].theme) {
				this._mainUI.setTheme(this._sitemap.map[url].theme);
				return;
			}
			url = url.replace(/(\/[^\/]*)$/gm, "");
		}
		this._mainUI.setTheme(this._sitemap.map["/"].theme);
	}
};