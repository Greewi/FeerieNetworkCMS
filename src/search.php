<?php

require_once "php/Sitemap.php";
require_once "php/SearchIndex.php";

$search = $_GET["s"];
$map = new Sitemap();
$searchIndex = new SearchIndex($map);
$content = $searchIndex->search($search, 50);

header("Content-type: application/json; charset=utf-8");
die(json_encode($content));
