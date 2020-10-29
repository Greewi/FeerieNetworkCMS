export class InternalURL {
	constructor(url, sitemap) {
		this._url = url;
		this._sitemap = sitemap;

		// ancestors
		let urlParent = url;
		this._ancestors = [];
		while(urlParent && urlParent!="/" && urlParent!= ""){
			urlParent = urlParent.replace(/(\/[^\/]*)$/gm, ""); // Getting parent URL
			if(urlParent=="")
				urlParent = "/";
			this._ancestors.push(urlParent);
		}
		if(this._ancestors.length > 0)
			this._parent = this._ancestors[0];
		else
		this._parent = null;
		this._ancestors.reverse();

		// children & siblings
		this._children = [];
		this._siblings = [];
		this._allSibling = [];
		this._previous = null;
		this._next = null;
		let currentFound = false;
		let regexpIsChild = this._buildRegExpIsChildOf(this._url);
		let regexpIsSibling = this._buildRegExpIsSiblingOf(this._url, this._parent);
		for(let urlEntry in this._sitemap.map) {
			let isSibling = false;
			// Children and sibling
			if(urlEntry.match(regexpIsChild))
				this._children.push(urlEntry);
			else if(urlEntry.match(regexpIsSibling)) {
				isSibling = true;
				this._allSibling.push(urlEntry);
				if(urlEntry!=this._url)
					this._siblings.push(urlEntry);
			}

			// Previous and next page
			this._commonAncestor = this._getCommonAncestor(urlEntry, this._url);
			if(urlEntry == this._url)
				currentFound = true;
			else if(this._sitemap.map[this._commonAncestor].book) {
				if(!currentFound)
					this._previous = urlEntry;
				else if(!this._next)
					this._next = urlEntry;
			}
		}
	}

	_buildRegExpIsChildOf(url) {
		if(url == "/")
			return new RegExp('^\/[^\/]+$');
		return new RegExp('^'+url.replace('/','\\/') +'\/[^\/]+$');
	}

	_buildRegExpIsSiblingOf(url, parentUrl) {
		if(url == "/" || !parentUrl)
			return  new RegExp('^\/$');
		if(parentUrl == "/")
			return new RegExp('^\/[^\/]+$');
		return new RegExp('^'+parentUrl.replace('/','\\/') +'\/[^\/]+$');
	}

	_getCommonAncestor(url1, url2) {
		url1 = url1.split('/');
		url2 = url2.split('/');
		let commonAncestor = [];
		let i = 0;
		while(i<url1.length && i<url2.length && url1[i]==url2[i]){
			commonAncestor.push(url1[i]);
			i++;
		}
		commonAncestor = commonAncestor.join('/');
		if(commonAncestor == "")
			return "/";
		return commonAncestor;
	}

	getUrl() {
		return this._url;
	}

	getParent() {
		return this._parent;
	}

	getAncestors() {
		return this._ancestors;
	}

	getChildren() {
		return this._children;
	}

	getSibling(includeSelf=false) {
		if(includeSelf)
			return this._allSibling;
		return this._siblings;
	}

	getPrevious() {
		return this._previous;
	}

	getNext() {
		return this._next;
	}
};