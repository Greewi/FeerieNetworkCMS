import { InternalURL } from "./InternalURL";
import { Article } from "./pages/Article";
import { ErrorPage } from "./pages/Error";
import { SearchPage } from "./pages/SearchPage";

/**
 * This class is responsible for all navigation operations
 * (including loading page and generating navigation buttons)
 */
export class Navigatron {
	/**
	 * 
	 * @param {Object} sitemap the sitemap data of the site
	 * @param {MainUI} mainUI the main UI
	 */
	constructor(sitemap, mainUI) {
		this._sitemap = sitemap;
		this._mainUI = mainUI;
		this._pageActuelle = null;
		this._lockInteraction = false;
		window.onpopstate = (event) => this._onHistoryPopState(event);
		window.openLink = (url) => this.openLink(url, "CHILD");
		mainUI.setTitle(this._sitemap.sitename);
		mainUI.listenSearchButton(()=>this.openLink("/search", "CHILD"));
	}

	/**
	 * Load the initial page by using the browser url
	 */
	async initializeCurrentURL() {
		let url = decodeURI(window.location.pathname);
		await this.openLink(url, "INIT");
	}

	/**
	 * Open an internal link
	 * @param {string} url the url to open
	 * @param {string} animation the closing/opening animation to play
	 * @param {boolean} pushState if set to true the new url will be push into the history (default to true).
	 */
	async openLink(url, animation, pushState = true) {
		if(url[0]!="/")
			url = "/" + url;
		if(this._lockInteraction)
			return;
		if(url.includes("#")) {
			if(url.includes("#TOP"))
				this._pageActuelle.getElement().scrollTop=0;
			else
				document.location.hash = "#"+url.split("#")[1];
			return;
		}

		this._lockInteraction = true;
		try {
			let response = await fetch("/getPage.php?url="+url)
			let data = await response.json();
			let page = this._createPage(url, data);

			if(this._pageActuelle)
				this._pageActuelle.close(this._mainUI, animation);
			document.documentElement.scrollTop = 0;
			this._pageActuelle = page;
			this._updateNavigation();
			this._updateTheme(url);
			if(this._pageActuelle) {
				this._mainUI.setSubtitle(this._pageActuelle.getTitle());
				this._pageActuelle.open(this._mainUI, animation);
			}
			if(pushState)
				history.pushState({url:url, animation:"INIT"}, "", url);
		} finally {
			this._lockInteraction = false;
		}
	}

	/**
	 * Handle the page change from the browser (mainly the back button)
	 * @param {*} event 
	 */
	_onHistoryPopState(event) {
		if(event.state==null)
			return;
		let url = event.state.url;
		let animation = event.state.animation;
		if(animation=="CHILD")
			animation = "PARENT";
		else if(animation=="PARENT")
			animation = "CHILD";
		else if(animation=="LEFT")
			animation = "RIGHT";
		else if(animation=="RIGHT")
			animation = "LEFT";
		this.openLink(url, animation, false);
	}

	/**
	 * Create a page
	 * @param {string} url the url of the page
	 * @param {object} data the data of the page
	 */
	_createPage(url, data) {
		let page = null;
		if(data.type=="article")
			page = new Article(url, data, this);
		else if(data.type=="search")
			page = new SearchPage(url, data, this);
		else if(data.type=="error")
			page = new ErrorPage(url, data, this);
		return page;
	}

	/**
	 * Update the navigation ui
	 */
	_updateNavigation() {
		this._mainUI.clearNavigation();
		if(!this._pageActuelle) {
			this._addNavElement(this._sitemap.map['/'].title, "navButton_current", "#", '/', "INIT");
			return;
		}

		let internalUrl = new InternalURL(this._pageActuelle.getUrl(), this._sitemap)

		// Parents
		for(let url of internalUrl.getAncestors())
			if(this._sitemap.map[url])
				this._addNavElement(this._sitemap.map[url].title, "navButton_parent", "<", url, "PARENT");

		// Current page
		this._addNavElement(this._pageActuelle.getTitle(), "navButton_current", "#", this._pageActuelle.getUrl()+"#TOP", "SAMEPAGE");
	
		// Childrens
		for(let url of internalUrl.getChildren()) {
			if(this._sitemap.map[url])
				this._addNavElement(this._sitemap.map[url].title, "navButton_child", ">", url, "CHILD");
			if(this._pageActuelle && !this._sitemap.map[this._pageActuelle.getUrl()].notoc) {
				let tocButton = document.createElement("button");
				tocButton.className = "button button_navButton";
				tocButton.innerHTML = this._sitemap.map[url].title;
				tocButton.onclick = () => this.openLink(url, "CHILD");
				this._pageActuelle.appendToCButton(tocButton);
			}
		}

		// Page headings
		for(let heading of this._pageActuelle.getHeadings())
			this._addNavElement(heading.title, "navButton_heading", "§", this._pageActuelle.getUrl()+"#"+heading.anchor, "SAMEPAGE");

		// Parent buttons
		if(internalUrl.getUrl()!="/")
			this._mainUI.listenBackButton(()=>{this.openLink(internalUrl.getParent(), "PARENT")})
		else
			this._mainUI.listenBackButton(null)

		// Previous button
		if(internalUrl.getPrevious())
			this._mainUI.listenLeftButton(()=>{this.openLink(internalUrl.getPrevious(), "LEFT")})
		else
			this._mainUI.listenLeftButton(null)

		// Next Button
		if(internalUrl.getNext())
			this._mainUI.listenRightButton(()=>{this.openLink(internalUrl.getNext(), "RIGHT")})
		else
			this._mainUI.listenRightButton(null)
	}

	_addChildPageNavElement(url, page) {
		if(this._sitemap.map[url])
			this._addNavElement(this._sitemap.map[url].title, "navButton_child", ">", url, "CHILD");
		if(page && !this._sitemap.map[page.getUrl()].notoc) {
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
		let button = document.createElement("a");
		button.href = url;
		button.className = "navButton " + cssClass;
		button.onclick = (event) => {
			this.openLink(url, animation);
			event.preventDefault();
		};

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

	/**
	 * Update the current theme to reflect the current url
	 * @param {string} url the url
	 */
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