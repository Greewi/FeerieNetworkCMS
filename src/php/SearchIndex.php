<?php

/**
 * This class represente the search index for the website.
 */
class SearchIndex {

	private $wordRegex = '/(\p{L}|\p{N})+/u';

	/** @var Sitemap */
	private $sitemap;
	/** @var string */
	private $sourceDir;
	/** @var string */
	private $searchIndexFile;

	/** @var array<int, string> */
	private $pagesIndex;
	/** @var array<string, array<int, int>> */
	private $wordsIndex;

	// Generation properties
	/** @var int */
	private $indexedPageNb;
	/** @var array<string, int> */
	private $reversePageIndex;


	public function __construct($sitemap, $sourceDir="data/", $sitemapFile = "data/sitemap.json", $searchIndexFile = "cache/searchIndex.php") {
		$this->sitemap = $sitemap;
		$this->sourceDir = $sourceDir;
		$this->searchIndexFile = $searchIndexFile;
		if(!file_exists($searchIndexFile) || filemtime($searchIndexFile)<filemtime($sitemapFile))
			$this->generateIndexes();
		else
			$this->loadIndexes();
	}

	/**
	 * Search a word inside the index and return an array associating each
	 * page where it was found to a score (based on the number of occurence
	 * and the presence in the title).
	 * 
	 * @param string $request the words to search
	 * @param int $limit the max number of result to show
	 * @return array The search results
	 */
	public function search($request, $limit) {
		// Parsing the request
		$matches = array();
		preg_match_all($this->wordRegex, $request, $matches, PREG_SET_ORDER);
		$words = array();
		foreach($matches as $match)
			$words[] = strtolower($match[0]);

		// Searching in the index
		$pages = array();
		foreach($words as $word) {
			if(empty($this->wordsIndex[$word]))
				continue;
			foreach($this->wordsIndex[$word] as $pageIndex => $weight) {
				$page = $this->pagesIndex[$pageIndex];
				$pages[$page][$word] = $weight;
			}
		}

		// Constructing result
		$results = array();
		foreach($pages as $page => $matches) {
			$wordCount = 0;
			$totalWeight = 0;
			foreach($matches as $word => $weight) {
				$wordCount++;
				$totalWeight+=$weight;
			}
			$results[] = array(
				'url' => $page,
				'title' => $this->sitemap->getShortItem($page)->title,
				'matchedWords' => $wordCount,
				'weight' => $totalWeight,
			);
		}

		// Sorting results
		$cmp = function($a, $b) {
			if($a['matchedWords'] != $b['matchedWords'])
				return $b['matchedWords'] - $a['matchedWords'];
			return $b['weight'] - $a['weight'];
		};
		usort($results, $cmp);
		return $results;
	}

	/**
	 * Load the indexes from the cache
	 */
	private function loadIndexes() {
		include($this->searchIndexFile);
		$this->pagesIndex = $storedPagesIndex;
		$this->wordsIndex = $storedWordsIndex;
	}

	/**
	 * Generate the indexes and save it into the cache
	 */
	private function generateIndexes() {
		$this->indexedPageNb = 0;
		$this->reversePageIndex = array();
		$this->pagesIndex = array();
		$this->wordsIndex = array();
		$this->indexPage("/");
		$this->saveIndex();
	}

	/**
	 * Index all the words inside a given page and it's children
	 * @param string $url the page url
	 */
	private function indexPage($url) {
		$words = $this->extractWordsOfPage($url);
		foreach ($words as $word => $weight) {
			if(empty($this->reversePageIndex[$url])) {
				$this->reversePageIndex[$url] = $this->indexedPageNb++;
				$this->pagesIndex[$this->reversePageIndex[$url]] = $url;
			}
			$pageIndex = $this->reversePageIndex[$url];
			$this->wordsIndex[$word][$pageIndex] = $weight;
		}

		// Recursively run this method on the children
		foreach ($this->sitemap->getChildren($url) as $children) {
			$this->indexPage($children);
		}
	}

	/**
	 * Extract all the words on a page and construct an array link each words founded and it's weight
	 * @param string $url
	 * @return array<string, int> the weigted words
	 */
	private function extractWordsOfPage($url) {
		$words = array();

		# Matching title
		$siteItem = $this->sitemap->getItem($url);
		if($siteItem == NULL)
			return $words;
		$matches = array();
		preg_match_all($this->wordRegex, $siteItem->title, $matches, PREG_SET_ORDER);
		foreach($matches as $match) {
			$word = strtolower($match[0]);
			if(empty($words[$word]))
				$words[$word] = 0;
			$words[$word] += 10; // Titles words have a bigger weight
		}

		# Matching page body
		if($url == '/')
			return $words;
		$rawPage = file_get_contents($this->sourceDir.$url.".md");
		if($rawPage===FALSE)
			return $words;
		$matches = array();
		preg_match_all($this->wordRegex, $rawPage, $matches, PREG_SET_ORDER);
		foreach($matches as $match) {
			$word = strtolower($match[0]);
			if(empty($words[$word]))
				$words[$word] = 0;
			$words[$word] += 1;
		}

		return $words;
	}

	/**
	 * Save the index into the cache
	 */
	private function saveIndex() {
		$file = fopen($this->searchIndexFile, 'w');
		fwrite($file, '<?php');fwrite($file, PHP_EOL);
		fwrite($file, '$storedPagesIndex = array(');fwrite($file, PHP_EOL);
		foreach($this->pagesIndex as $index => $url) {
			fwrite($file, "\t$index=>'".addslashes($url)."',");fwrite($file, PHP_EOL);
		}
		fwrite($file, ');');fwrite($file, PHP_EOL);
		fwrite($file, '$storedWordsIndex = array(');fwrite($file, PHP_EOL);
		foreach($this->wordsIndex as $word => $matches) {
			fwrite($file, "\t'$word'=>array(");fwrite($file, PHP_EOL);
			fwrite($file, "\t\t");
			foreach($matches as $pageIndex => $weight) {
				fwrite($file, "$pageIndex=>$weight,");
			}
			fwrite($file, PHP_EOL);
			fwrite($file, "\t),");fwrite($file, PHP_EOL);
		}
		fwrite($file, ');');fwrite($file, PHP_EOL);
		fclose($file);
	}
}