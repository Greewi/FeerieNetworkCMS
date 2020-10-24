<?php

/**
 * This class handles md/html conversions.
 */
class Markdown {
	private $linkPattern;
	private $imgPattern;

	/**
	 * @param {String} $linkPattern a string containing the link conversion pattern. The $2 substring will be replaced by the link url and $1 by the link text.
	 * @param {String} $imgPattern a string containing the image conversion pattern. The $2 substring will be replaced by the image url and $1 by the alternate text.
	 */
	public function __construct($linkPattern, $imgPattern) {
		$this->linkPattern = $linkPattern;
		$this->imgPattern = $imgPattern;
	}

	/**
	 * Convert a markdown file to a HTML file.
	 * @param mdSource the markdown file path
	 * @param htmlOutput the HTML output file path
	 */
	public function convertFile($mdSource, $htmlOutput) {
		$markdown = file_get_contents($mdSource);
		$html = $this->convert($markdown);
		file_put_contents($htmlOutput, $html);
	}

	/**
	 * Convert a markdown string to a html string
	 * @param markdown the markdown string to convert
	 * @returns the converted html string
	 */
	public function convert($markdown) {
		$rawLines = $this->parseMD($markdown);
		$htmlLines = $this->convertToHTML($rawLines);
		$html = implode("\n", $htmlLines);
		return $html;
	}

	/**
	 * Parse the markdown string and classify lines
	 */
	private function parseMD($markdown) {
		$rawLines = explode("\n", $markdown);
		$lines = array();
		foreach($rawLines as $line) {
			$line = trim($line);
			if(preg_match('/^## /m', $line))
				$lines[] = array("type"=>"H2", "text"=>substr($line, 3));
			else if (preg_match('/^# /m', $line))
				$lines[] = array("type" => "H1", "text" => substr($line, 2));
			else if (preg_match('/^\* /m', $line))
				$lines[] = array("type" => "LI", "text" => substr($line, 2));
			else if (preg_match('/^>$/m', $line))
				$lines[] = array("type" => "QUOTE", "text" => "");
			else if (preg_match('/^> /m', $line))
				$lines[] = array("type" => "QUOTE", "text" => substr($line, 2));
			else if (preg_match('/^>> ### /m', $line))
				$lines[] = array("type" => "ASIDEHEADING", "text" => substr($line, 7));
			else if (preg_match('/^>> \* /m', $line))
				$lines[] = array("type" => "ASIDELINK", "text" => substr($line, 5));
			else if (preg_match('/^>>$/m', $line))
				$lines[] = array("type" => "ASIDE", "text" => "");
			else if (preg_match('/^>> /m', $line))
				$lines[] = array("type" => "ASIDE", "text" => substr($line, 3));
			else if (preg_match('/^<.*>$/', $line))
				$lines[] = array("type" => "HMTL", "text" => $line);
			else if (preg_match('/^----$/', $line))
				$lines[] = array("type" => "PAGEBREAK", "text" => "");
			else if ($line == "")
				$lines[] = array("type" => "VOID", "text" => "");
			else
				$lines[] = array("type" => "TEXT", "text" => $line);
		}
		return $lines;
	}

	/**
	 * Convert inline markdown markup to html markup
	 */
	public function convertInlineMarkup($line) {
		$line = str_replace("&", "&amp;", $line);
		$line = str_replace("<", "&lt;", $line);
		$line = str_replace(">", "&gt;", $line);
		$line = preg_replace("/!\[([^\[]+)]\(([^(]+)\)/m", $this->imgPattern, $line);
		$line = preg_replace("/\[([^\[]+)]\((http[^(]+)\)/m",'<a class="external" href="$2">$1</a>', $line);
		$line = preg_replace("/\[([^\[]+)]\(([^(]+)\)/m", $this->linkPattern, $line);
		$line = preg_replace("/\*\*([^ ][.^\*]*[^ ]|[^*])\*\*/m",'<em>$1</em>', $line);
		$line = preg_replace("/\*([^ ][^\*]*[^ ]|[^*])\*/m",'<cite>$1</cite>', $line);
		return $line;
	}

	/**
	 * Convert segmented markdown lines to html lines
	 */
	private function convertToHTML($lines) {
		$finalLines = array();
		$nbLines = count($lines);
		for($current = 0; $current < $nbLines; $current++) {
			$currentLine = $lines[$current];
			$previousLine = $current>0? $lines[$current-1] : array("type" => "VOID", "text" => "");
			$nextLine = $current < $nbLines-1 ? $lines[$current+1] : array("type" => "VOID", "text" => "");
			
			switch($currentLine["type"]) {
				case "H1":
					$finalLines[] = "<h1>".$this->convertInlineMarkup($currentLine["text"])."</h1>";
					break;
				case "H2":
					$finalLines[] = "<h2>".$this->convertInlineMarkup($currentLine["text"])."</h2>";
					break;
				case "LI":
					if ($previousLine["type"] != "LI")
						$finalLines[] = "<ul>";
					$finalLines[] = "    <li>".$this->convertInlineMarkup($currentLine["text"])."</li>";
					if ($nextLine["type"] != "LI")
						$finalLines[] = "</ul>";
					break;
				case "TEXT":
					if ($previousLine["type"] != "TEXT")
						$finalLines[] = "<p>";
					$finalLines[] = "    ".$this->convertInlineMarkup($currentLine["text"]);
					if ($nextLine["type"] != "TEXT")
						$finalLines[] = "</p>";
					break;
				case "QUOTE":
					if ($previousLine["type"] != "QUOTE") {
						$finalLines[] = "<blockquote>";
						$finalLines[] = "    <p>";
					}
					if (trim($currentLine["text"]) == "") {
						$finalLines[] = "    </p>";
						$finalLines[] = "    <p>";
					}
					else
						$finalLines[] = "        ".$this->convertInlineMarkup($currentLine["text"]);
					if ($nextLine["type"] != "QUOTE") {
						$finalLines[] = "    </p>";
						$finalLines[] = "</blockquote>";
					}
					break;
				case "ASIDEHEADING":
					if ($previousLine["type"] != "ASIDE" && $previousLine["type"] != "ASIDEHEADING" && $previousLine["type"] != "ASIDELINK")
						$finalLines[] = "<aside>";
					$finalLines[] = "    <h3>".$this->convertInlineMarkup($currentLine["text"])."</h3>";
					if ($nextLine["type"] != "ASIDE" && $nextLine["type"] != "ASIDEHEADING" && $nextLine["type"] != "ASIDELINK")
						$finalLines[] = "</aside>";
					break;
				case "ASIDELINK":
					if ($previousLine["type"] != "ASIDE" && $previousLine["type"] != "ASIDEHEADING" && $previousLine["type"] != "ASIDELINK")
						$finalLines[] = "<aside>";
					if ($previousLine["type"] != "ASIDELINK")
						$finalLines[] = "    <ul>";
					$finalLines[] = "        <li>".$this->convertInlineMarkup($currentLine["text"])."</li>";
					if ($nextLine["type"] != "ASIDELINK")
						$finalLines[] = "    </ul>";
					if ($nextLine["type"] != "ASIDE" && $nextLine["type"] != "ASIDEHEADING" && $nextLine["type"] != "ASIDELINK")
						$finalLines[] = "</aside>";
					break;
				case "ASIDE":
					if ($previousLine["type"] != "ASIDE" && $previousLine["type"] != "ASIDEHEADING" && $previousLine["type"] != "ASIDELINK")
						$finalLines[] = "<aside>";
					if ($previousLine["type"] != "ASIDE")
						$finalLines[] = "    <p>";
					if (trim($currentLine["text"]) == "") {
						if ($previousLine["type"] == "ASIDE" && $nextLine["type"] == "ASIDE") {
							$finalLines[] = "    </p>";
							$finalLines[] = "    <p>";
						}
					}
					else
						$finalLines[] = "        ".$this->convertInlineMarkup($currentLine["text"]);
					if ($nextLine["type"] != "ASIDE")
						$finalLines[] = "    </p>";
					if ($nextLine["type"] != "ASIDE" && $nextLine["type"] != "ASIDEHEADING" && $nextLine["type"] != "ASIDELINK")
						$finalLines[] = "</aside>";
					break;
				case "PAGEBREAK":
					$finalLines[] = "<div class=\"PAGEBREAK\"></div>";
					break;
				case "VOID":
					break;
				default:
					$finalLines[] = $currentLine["text"];
			}
		}
		return $finalLines;
	}
}
