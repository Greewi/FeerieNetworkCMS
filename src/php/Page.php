<?php

require_once "Markdown.php";

/**
 * This class represente a page in the website. Built from an internal url and the
 * sitemap, it retreive the content and metadata for the page.
 */
class Page {
	private $url;
	private $folderPath;
	private $infos;
	private $sourceDir;
	private $cachePath;
	private $sourcePath;

	/**
	 * @param {string} $url
	 * @param {Sitemap} $sitemap
	 */
	function __construct($url, $sitemap, $sourceDir="data/", $cacheDir="cache/") {
		$this->url = $url;
		$this->folderPath = preg_replace('%[^/]+$%m', '', $this->url);
		$this->infos = $sitemap->getItem($url);
		$this->sourceDir = $sourceDir;
		$this->cacheDir = $cacheDir;
		if(!empty($this->infos)) {
			if($this->url=="/"){
				$this->cachePath = $this->cacheDir."index.html";
				$this->sourcePath = $this->sourceDir."index.md";
			} else {
				$this->cachePath = $this->cacheDir.$this->url.".html";
				$this->sourcePath = $this->sourceDir.$this->url.".md";
			}
		}
	}

	/**
	 * Retuns a composite array containing this page's metadata and content.
	 * @returns {array}
	 */
	public function getContent() {
		if(empty($this->infos)) {
			return new PageData("404 - Not found", "error", "<h1>Error 404 : not found</h1>", 404);
		}

		$content = $this->infos->toArray();
		switch($this->infos->type) {
			case "article" :
				$content["html"] = $this->getCache();
			break;
			default:
			// no special data
		}

		return new PageData($this->infos->title, $this->infos->type, $content, 200);
	}

	/**
	 * Get the cached content of the page (Article only)
	 * @returns {string}
	 */
	public function getCache() {
		if(!file_exists($this->cachePath) || filemtime($this->cachePath)<filemtime($this->sourcePath))
			$this->regenerateCache();
		return file_get_contents($this->cachePath);
	}

	/**
	 * Get the page source (Article only)
	 * @returns {string}
	 */
	public function getSource() {
		return file_get_contents($this->sourcePath);
	}

	/**
	 * Regenerate the cached content of this page (Article only)
	 */
	private function regenerateCache() {
		if(!file_exists(preg_replace('/[^\/]+$/', '', $this->cachePath)))
			mkdir(preg_replace('/[^\/]+$/', '', $this->cachePath), 0777, true);
		$md = new Markdown('<a href="$2">$1</a>', '<img src="/getRessource.php?url='.$this->folderPath.'$2" alt="$1"/>');
		$md->convertFile($this->sourcePath, $this->cachePath);
	}
}

/**
 * Contain the data for a page
 */
class PageData {
	public $title;
	public $type;
	public $content;
	public $statusCode;
	
	function __construct($title="", $type="article", $content="", $statusCode=200) {
		$this->title = $title;
		$this->type = $type;
		$this->content = $content;
		$this->statusCode = $statusCode;
	}
}
