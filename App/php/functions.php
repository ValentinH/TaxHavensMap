<?php

function getCountry($code, $json_output = true)
{
	$code = trim($code);
	$json = file_get_contents("http://api.worldbank.org/countries/".$code."?format=json");
	$res = json_decode($json);

	if(count($res) < 2)
	{
		if($json_output) print_JSON(array("error"=>"Invalid code"));
		else
			return array("error"=>"Invalid code");
	}
	else
	{
		$infos = $res[1];
		$resp = array();
		$resp["name"] = $infos[0]->name;
		$resp["code"] = $infos[0]->iso2Code;
		$resp["latitude"] = $infos[0]->latitude;
		$resp["longitude"] = $infos[0]->longitude;
		if($json_output)
			print_JSON($resp);
		else
			return $resp;
	}
}

function getCountryFromDB($code)
{	
	$code = trim($code);
	$data = mysql_fetch_array(mysql_query("SELECT* FROM countries WHERE code='".$code."';"));
	$nb = mysql_affected_rows();
	if($nb==0)
		return null;
	return $data;
}

function print_JSON($array)
{
	header('Content-type: application/json');
	echo json_encode($array);
	exit(0);
}

function ucsmart($text)
{
   return preg_replace('/([^a-zéèêàç\']|^)([a-zéèêàç])/e', '"$1".strtoupper("$2")',
                       strtolower($text));
}

function cmp($a, $b) {
    return strcmp ($a->name, $b->name);
}
function cmp_value_desc($a, $b) {
	if($b->value > $a->value) return 1;
	if($a->value > $b->value) return -1;
	return 0;
}

class Entreprise
{
    public $name;
    public $countries;

    public function __construct($name)
    {
        $this->name = ucsmart($name);
        $this->countries = array();
    }
}
class Country
{
    public $name;
    public $coords;
    public $value;

    public function __construct($name, $coords, $value)
    {
        $this->name = ucsmart($name);
        $this->coords = $coords;
        $this->value = intval($value);
    }
}