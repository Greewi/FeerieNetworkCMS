<?php
	$mimetypes = array(
		"epub" => "application/epub+zip",
		"gif" => "image/gif",
		"jpg" => "image/jpeg",
		"jpeg" => "image/jpeg",
		"md" => "text/plain",
		"mobi" => "application/x-mobipocket-ebook",
		"pdf" => "application/pdf",
		"png" => "image/png",
		"txt" => "text/plain",
		"ico" => "image/image/x-icon",
	);

	function sendHTTPError($code, $text) {
		header("HTTP/1.0 $code $text");
		die("$code - $text");
	}

	// Checking request
	if(empty($_GET["url"]))
		sendHTTPError(400, "Bad Request");
	$url = $_GET["url"];
	$extension = explode('.', $_GET["url"]);
	if(count($extension) != 2)
		sendHTTPError(400, "Bad Request");
	$extension = $extension[1];
	if(empty($mimetypes[$extension]))
		sendHTTPError(403, "Forbidden");
	if(!file_exists('data/'.$url))
		sendHTTPError(404, "Not Found");

	// Set the header
	header('Content-type: '.$mimetypes[$extension]);
	die(file_get_contents('data/'.$url));