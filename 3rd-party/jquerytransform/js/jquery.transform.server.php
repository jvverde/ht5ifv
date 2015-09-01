<?
$xml = new DOMDocument;
$xml->loadXML(stripslashes($_POST["xmlstr"]));

$xsl = new DOMDocument;
$xsl->loadXML(stripslashes($_POST["xslstr"]));

FixHREF($xsl,"import");
FixHREF($xsl,"include");

$proc = new XSLTProcessor;

if($_POST["xslParams"]) {
	foreach($_POST["xslParams"] as $p) {
		$xp = explode("|||",$p);
		$proc->setParameter("http://www.w3.org/1999/XSL/Transform",$xp[0],$xp[1]);
	}
}

$proc->importStyleSheet($xsl);
echo $proc->transformToXML($xml);

function FixHREF($x,$sel) {
	foreach($x->getElementsByTagNameNS("http://www.w3.org/1999/XSL/Transform",$sel) as $node) {
		$href = $node -> getAttribute("href");
		$node->setAttribute("href", $_POST["path"] . $href);
	}
}
?>
