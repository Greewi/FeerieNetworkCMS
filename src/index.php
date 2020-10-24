<?php

require_once "php/Sitemap.php";

header("Content-type: text/html; charset=utf-8");

$map = new Sitemap();

?><!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title><?=$map->getTitle();?></title>
	<link rel="stylesheet" href="<?="/templates/".$map->getMainTemplate()."/style.css"?>" />
</head>
<body>
<?php
	require("templates/".$map->getMainTemplate()."/mainUI.html");
?>
<script type="text/javascript">
<?php
	echo "window.siteMap = ".json_encode($map->getRawMap()).";";
?>
</script>
<script type="module" src="/js/main.js"></script>
</body>
</html>