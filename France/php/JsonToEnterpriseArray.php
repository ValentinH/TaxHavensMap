<?php

header('Content-type: application/json');
 
// Set your CSV feed
$file = '../data/source.json';
 
$json = file_get_contents ($file, FILE_USE_INCLUDE_PATH);
$array = json_decode($json);

$new_array = array();
foreach($array as $el)
{
  if(!isset($new_array[$el->Entreprise]))
    $new_array[$el->Entreprise] = new Entreprise();

  array_push($new_array[$el->Entreprise]->coords, array($el->Latitude, $el->Longitude));
  array_push($new_array[$el->Entreprise]->names, ucsmart($el->Pays));
  array_push($new_array[$el->Entreprise]->values, $el->Valeur);
}
echo json_encode($new_array);

class Entreprise
{
    public $coords;
    public $names;
    public $values;

    public function __construct()
    {
        $this->coords = array();
        $this->names = array();
        $this->values = array();
    }
}

function ucsmart($text)
{
   return preg_replace('/([^a-z\']|^)([a-zéç])/e', '"$1".strtoupper("$2")',
                       strtolower($text));
}
?>