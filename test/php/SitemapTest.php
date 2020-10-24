<?php
require_once "src/php/SiteMap.php";
use PHPUnit\Framework\TestCase;

final class SitemapTest extends TestCase {
	public function testNew() {
		$this->assertInstanceOf(SiteMap::class, new Sitemap("test/php/sitemap.json"));
	}

	public function testGetSourceItem() {
		$map = new Sitemap("test/php/sitemap.json");
		$this->assertNotEmpty($map->getSourceItem("/"));
		$this->assertNotEmpty($map->getSourceItem("/contact"));
		$this->assertNotEmpty($map->getSourceItem("/contact/bidule"));
		$this->assertNull($map->getSourceItem("/blabla"));
	}

	public function testGetParent() {
		$map = new Sitemap("test/php/sitemap.json");
		$this->assertNull($map->getParent("/"));
		$this->assertEquals("/", $map->getParent("/contact"));
		$this->assertEquals("/contact", $map->getParent("/contact/bidule"));
	}

	public function testGetChildren() {
		$map = new Sitemap("test/php/sitemap.json");
		$this->assertContains("/contact", $map->getChildren("/"));
		$this->assertContains("/contact/bidule", $map->getChildren("/contact"));
		$this->assertContains("/contact/truc", $map->getChildren("/contact"));
		$this->assertEmpty($map->getChildren("/contact/truc"));
		$this->assertEmpty($map->getChildren("/machin"));
	}

	public function testGetSiblings() {
		$map = new Sitemap("test/php/sitemap.json");
		$this->assertContains("/contact/bidule", $map->getSiblings("/contact/machin"));
		$this->assertNotContains("/contact/chose", $map->getSiblings("/contact/machin"));
		$this->assertEmpty($map->getSiblings("/contact"));
		$this->assertEmpty($map->getSiblings("/"));
	}

	public function testGetShortItem() {
		$map = new Sitemap("test/php/sitemap.json");
		$item = $map->getShortItem("/contact");
		$this->assertEquals("/contact", $item->url);
		$this->assertEquals("article", $item->type);
		$this->assertEquals("Contact", $item->title);
	}

	public function testGetItem() {
		$map = new Sitemap("test/php/sitemap.json");
		$item = $map->getItem("/contact");
		$this->assertEquals("/contact", $item->url);
		$this->assertEquals("article", $item->type);
		$this->assertEquals("Contact", $item->title);
		$this->assertEquals("article", $item->template);
		$this->assertEquals("/", $item->parent->url);
		$this->assertEquals(3, count($item->children));
		$this->assertEquals(0, count($item->siblings));
		$item = $map->getItem("/contact/bidule");
		$this->assertEquals("/contact", $item->parent->url );
		$this->assertEquals(2, count($item->siblings));
		$this->assertEquals(0, count($item->children));
		$this->assertNull($map->getItem("/contact/pala"));
	}

}