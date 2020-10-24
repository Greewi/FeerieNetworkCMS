<?php

require_once "src/php/Page.php";
use PHPUnit\Framework\TestCase;

final class PageTest extends TestCase {
	public function testGetSource() {
		$map = new Sitemap("test/php/sitemap.json");
		$page = new Page("/", $map, "test/php/data/", "test/php/cache/");
		$this->assertEquals("# Hello world !\n", $page->getSource());
	}

	public function testGetCache() {
		$map = new Sitemap("test/php/sitemap.json");
		$page = new Page("/", $map, "test/php/data/", "test/php/cache/");
		$this->assertEquals("<h1>Hello world !</h1>", $page->getCache());
	}

	public function testGetContent() {
		$map = new Sitemap("test/php/sitemap.json");
		$page = new Page("/", $map, "test/php/data/", "test/php/cache/");
		$content = $page->getContent();
		$this->assertNotEmpty($content);
		$this->assertEquals("Accueil", $content->title);
		$this->assertEquals("article", $content->type);
		$this->assertEquals(200, $content->statusCode);

		$this->assertNotEmpty($content->content);
		$this->assertEquals("article", $content->content["type"]);
		$this->assertEquals("<h1>Hello world !</h1>", $content->content["html"]);
	}
}