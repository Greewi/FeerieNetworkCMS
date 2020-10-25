<?php

/**
 * Represents the sitemap, storing the navgation and meta data of the website.
 */
class Sitemap {
	private $rawmap;
	private $title;
	private $mainTemplate;
	private $mainTheme;

	function __construct($sitemapFile = "data/sitemap.json") {
		$rawmap = self::loadMap($sitemapFile);
		$this->rawmap = $rawmap;
		$this->title = $rawmap["sitename"];
		$this->mainTemplate = $rawmap["template"];
		$this->mainTheme = $rawmap["theme"];
	}

	/**
	 * Load the data for the sitemap
	 */
	private static function loadMap($sitemapFile) {
		$json = file_get_contents($sitemapFile);
		$rawmap = json_decode($json, true);
		return $rawmap;
	}

	/**
	 * @returns {string} the title of the website
	 */
	public function getTitle() {
		return $this->title;
	}

	/**
	 * @returns {string} the main template name
	 */
	public function getMainTemplate() {
		return $this->mainTemplate;
	}

	/**
	 * @returns {string} the main theme name
	 */
	public function getMainTheme() {
		return $this->mainTheme;
	}

	/**
	 * @returns the rawmap as an associative array
	 */
	public function getRawMap() {
		return $this->rawmap;
	}

	/**
	 * @param {string} $url
	 * @returns {SitemapShortItem} the short item of the corresponding url
	 */
	public function getShortItem($url) {
		if(empty($this->rawmap["map"][$url]))
			return NULL;
		return new SitemapShortItem($url, $this->rawmap["map"][$url]);
	}

	/**
	 * @param {string} $url
	 * @returns {SitemapItem} the sitemap item of the corresponding url
	 */
	public function getItem($url) {
		if(empty($this->rawmap["map"][$url]))
			return NULL;
		return new SitemapItem($url, $this);
	}

	/**
	 * @param {string} $url
	 * @returns {array} teh raw array data for an item corresponding to the url
	 */
	public function getSourceItem($url) {
		$url = trim($url);
		if($url == "")
			$url = "/";
		if(empty($this->rawmap["map"][$url]))
			return NULL;
		return $this->rawmap["map"][$url];
	}

	/**
	 * @returns {string} the parent url
	 */
	public function getParent($url) {
		$url = trim($url);
		if($url == "" || $url == "/")
			return NULL;
		if($url[0] == "/")
			$url = substr($url, 1);
		$path = explode("/", $url);
		$parentPath = array_pop($path);
		if($parentPath==NULL)
			return "/";
		$parentUrl = "/".implode("/", $path);
		return $parentUrl;
	}

	/**
	 * @returns {array<string>} the children url
	 */
	public function getChildren($url, $exclude=false) {
		$url = trim($url);
		if($url == "")
			$url = "/";
		if($url[strlen($url)-1]!="/")
			$url .= "/";
		$children = array();
		foreach($this->rawmap["map"] as $urlChild => $sourceItem) {
			if(preg_match("%^".$url."([^/]+)$%m", $urlChild) && $urlChild!==$exclude)
				$children[] = $urlChild;
		}
		return $children;
	}

	/**
	 * @returns {array<string>} the siblings url
	 */
	public function getSiblings($url) {
		$parentUrl = $this->getParent($url);
		if($parentUrl==NULL)
			return array();
		return $this->getChildren($parentUrl, $url);
	}
}

/**
 * Represents an abreviated item of the site map
 */
class SitemapShortItem {
	public $url;
	public $type;
	public $title;
	
	/**
	 * @param {string} $url 
	 * @param {array} $sourceItem 
	 */
	function __construct($url, $sourceItem) {
		$this->url = $url;
		$this->type = $sourceItem["type"];
		$this->title = $sourceItem["title"];
	}

	/**
	 * Converts this item into an associative array
	 * @returns {array}
	 */
	public function toArray() {
		return array(
			"url" => $this->url,
			"type" => $this->type,
			"title" => $this->title,
		);
	}
}

/**
 * Represents an item of the site map (the meta and navigation data of a page)
 */
class SitemapItem {
	public $url;
	public $title;
	public $type;
	public $template;
	public $parent;
	public $siblings;
	public $children;

	/**
	 * @param {string} $url 
	 * @param {Sitemap} $map 
	 */
	function __construct($url, $map) {
		$this->url = $url;
		$source = $map->getSourceItem($url);
		$this->title = $source["title"];
		$this->type = $source["type"];
		$this->template = $source["template"];
		$this->parent = $map->getShortItem($map->getParent($url));
		$this->children = array();
		foreach($map->getChildren($url) as $childUrl)
			$this->children[] = $map->getShortItem($childUrl);
		$this->siblings = array();
		foreach($map->getSiblings($url) as $siblingUrl)
			$this->siblings[] =$map->getShortItem($siblingUrl);
	}

	/**
	 * Converts this item into a associative array
	 * @returns {array}
	 */
	public function toArray() {
		$array = array(
			"url" => $this->url,
			"title" => $this->title,
			"type" => $this->type,
			"template" => $this->template,
		);
		$array["children"] = array();
		foreach($this->children as $child)
			$array["children"][] = $child->toArray();
		$array["siblings"] = array();
		foreach($this->siblings as $sibling)
			$array["siblings"][] = $sibling->toArray();
		return $array;
	}

	/**
	 * Converts this item into json
	 * @returns {string}
	 */
	public function toJson() {
		return json_encode($this->toArray());
	}
}
