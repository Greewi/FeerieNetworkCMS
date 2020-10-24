<?php
require_once "src/php/Markdown.php";
use PHPUnit\Framework\TestCase;

final class MarkdownTest extends TestCase {
	public function testConvertInlineMarkup(){
		$md = new Markdown('<a href="/root/$2">$1</a>', '<img src="/root/$2" alt="$1"/>');
		$this->assertEquals('&amp;&lt;&gt;<em>em</em> <cite>cite</cite> **em <cite>sd</cite> ds** <img src="/root/b" alt="a"/> <a href="/root/b">a</a> <img src="/root/http://b" alt="a"/> <a class="external" href="http://b">a</a>', $md->convertInlineMarkup('&<>**em** *cite* **em *sd* ds** ![a](b) [a](b) ![a](http://b) [a](http://b)'));
	}

	public function testConvert(){
		$md = new Markdown('<a href="/$2">$1</a>', '<img src="/$2" alt="$1"/>');
		$source = "
# Titre
> « The legend »
> 
> Unknown author

## Subtitle

Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, suscipit fuga officiis vel tenetur tempore voluptate quam perferendis velit veritatis. Sunt provident labore neque ut molestias velit, illo rerum quisquam.

Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, suscipit fuga officiis vel tenetur tempore voluptate quam perferendis velit veritatis. Sunt provident labore neque ut molestias velit, illo rerum quisquam.

>> ### Titre aside
>> Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, suscipit fuga officiis vel tenetur tempore voluptate quam perferendis velit veritatis.
>> 
>> Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, suscipit fuga officiis vel tenetur tempore voluptate quam perferendis velit veritatis.
";
		$expected = "<h1>Titre</h1>
<blockquote>
    <p>
        « The legend »
    </p>
    <p>
        Unknown author
    </p>
</blockquote>
<h2>Subtitle</h2>
<p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, suscipit fuga officiis vel tenetur tempore voluptate quam perferendis velit veritatis. Sunt provident labore neque ut molestias velit, illo rerum quisquam.
</p>
<p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, suscipit fuga officiis vel tenetur tempore voluptate quam perferendis velit veritatis. Sunt provident labore neque ut molestias velit, illo rerum quisquam.
</p>
<aside>
    <h3>Titre aside</h3>
    <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, suscipit fuga officiis vel tenetur tempore voluptate quam perferendis velit veritatis.
    </p>
    <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Impedit, suscipit fuga officiis vel tenetur tempore voluptate quam perferendis velit veritatis.
    </p>
</aside>";
		$this->assertEquals($expected, $md->convert($source));
	}

}