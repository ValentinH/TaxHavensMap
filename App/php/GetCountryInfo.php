<?php
require_once "functions.php";

if(isset($_GET["code"]))
		$code = $_GET["code"];
else
	print_JSON(array("error"=>"Need to provide a code"));

getCountry($code);
