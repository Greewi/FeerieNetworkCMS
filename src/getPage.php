<?php

require_once "php/Sitemap.php";
require_once "php/Page.php";

$url = $_GET["url"];
$map = new Sitemap();
$page = new Page($url, $map);

$content = $page->getContent();

header("Content-type: application/json; charset=utf-8");
die(json_encode($content));
