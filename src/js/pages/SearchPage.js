import { Page } from "./Page";

const LANG_SEARCH = "Rechercher";
const LANG_RESULTS = "Résultats";
const LANG_NO_RESULT = "Aucun résultat";
const LANG_RELEVANCE = "(Pertinence : %relevance%)";


export class SearchPage extends Page {
	constructor(url, data, navigatron) {
		super(url, data, navigatron);
		this.getElement().innerHTML = data.content;
		this.getElement().classList.add("searchPage");

		this._title = document.createElement("h1");
		this._title.innerHTML = LANG_SEARCH;
		this.getElement().appendChild(this._title);

		this._searchForm = document.createElement("form");
		this._searchForm.className = "searchPage_form";
		this.getElement().appendChild(this._searchForm);

		this._searchInput = document.createElement("input");
		this._searchInput.className = "searchPage_form_input";
		this._searchInput.type = "text";
		this._searchForm.appendChild(this._searchInput);

		this._searchButton = document.createElement("button");
		this._searchButton.className = "button searchPage_form_button";
		this._searchButton.type = "submit";
		this._searchButton.innerHTML = LANG_SEARCH;
		this._searchForm.appendChild(this._searchButton);

		this._resultPanel = document.createElement("div");
		this._resultPanel.className = "searchPage_results";
		this.getElement().appendChild(this._resultPanel);

		this._resultTitle = document.createElement("h2");
		this._resultTitle.innerHTML = LANG_RESULTS;
		this._resultPanel.appendChild(this._resultTitle);

		this._resultList = document.createElement("div");
		this._resultList.className = "searchPage_results_list";
		this._resultPanel.appendChild(this._resultList);

		this._searchForm.onsubmit = () => {
			this._search(this._searchInput.value);
			return false;
		}
	}

	/**
	 * Do the search thing
	 * @param {string} query the query string to search for
	 */
	async _search(query) {
		this._searchButton.disabled = true;
		this._resultPanel.classList.remove("searchPage_results_visible");
		this._resultList.innerHTML="";

		let response = await fetch("/search.php?s="+encodeURI(query))
		let data = await response.json();

		if(data.length>0) {
			for(let result of data)
				this._addSearchResult(result.url, result.title, result.matchedWords, result.weight);
		} else {
			this._resultList.innerHTML=`<p>${LANG_NO_RESULT}</p>`;
		}

		this._resultPanel.classList.add("searchPage_results_visible");
		this._searchButton.disabled = false;
	}

	/**
	 * Add a result to the result list
	 * @param {string} url the url of the result page
	 * @param {string} title the title of the result page
	 * @param {number} wordMatched the number of matched word in the query
	 * @param {number} weight the weight of the result
	 */
	_addSearchResult(url, title, wordMatched, weight) {
		let resultRow = document.createElement("div");
		resultRow.className = "searchPage_results_row";
		this._resultList.appendChild(resultRow);

		let resultLink = document.createElement("a");
		resultLink.className = "searchPage_results_link";
		resultLink.innerText = title;
		resultLink.href = url;
		resultRow.appendChild(resultLink);

		let relevance = document.createElement("span");
		relevance.className = "searchPage_results_relevance";
		relevance.innerText = ` ${LANG_RELEVANCE.replace("%relevance%", Math.floor(wordMatched*100+weight)/100)}`;
		resultRow.appendChild(relevance);

		resultLink.onclick = (event) => {
			this.openInternalLink(url);
			event.preventDefault();
			event.stopPropagation();
			return false;
		}
	}
}