<?php

header('Content-type: application/json');
 
// Set your CSV feed
$file = '../data/source.json';
 
$json = file_get_contents ($file, FILE_USE_INCLUDE_PATH);
$array = json_decode($json);

$new_array = array();
$companies_array = array();
$i = 0;
foreach($array as $el)
{
  if(!isset($companies_array[$el->Entreprise]))
  {
    $i = count($companies_array);
    $companies_array[$el->Entreprise] = count($companies_array); 
    $new_array[$i] = new Entreprise($el->Entreprise);   
  }
  else
  {
    $i = $companies_array[$el->Entreprise];
  }

  array_push($new_array[$i]->coords, array($el->Latitude, $el->Longitude));
  array_push($new_array[$i]->countries, ucsmart($el->Pays));
  array_push($new_array[$i]->values, $el->Valeur);
}
echo json_encode($new_array);

class Entreprise
{
    public $name;
    public $coords;
    public $countries;
    public $values;

    public function __construct($name)
    {
        $this->name = $name;
        $this->coords = array();
        $this->countries = array();
        $this->values = array();
    }
}

function ucsmart($text)
{
   return preg_replace('/([^a-z\']|^)([a-zéç])/e', '"$1".strtoupper("$2")',
                       strtolower($text));
}
?>