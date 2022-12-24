<?php

if(substr(explode('?', $_SERVER['REQUEST_URI'])[0], -4) != ".php") {
    require_once "index.php";
    die();
}

require_once "php/Sitemap.php";
require_once "php/Page.php";

$url = $_GET["url"];

// Special Pages
if(trim($url)=="/search" || trim($url)=="/search/") {
    $content = new PageData("Rechercher", "search", "", 200);
} else {
    $map = new Sitemap();
    $page = new Page($url, $map);
    
    $content = $page->getContent();
}

header("Content-type: application/json; charset=utf-8");
die(json_encode($content));
