<?php
/*
 * Converts CSV to JSON
 * Example uses Google Spreadsheet CSV feed
 * csvToArray function I think I found on php.net
 */
 
header('Content-type: application/json');
 
// Set your CSV feed
$file = '../data/cac40.json';
 
$json = file_get_contents ($file, FILE_USE_INCLUDE_PATH);
$array = json_decode($json);

$new_array = array();
foreach($array as $el)
{
  $obj = new Pays($el->Code, $el->Pays, $el->Valeur);
  if(isset($new_array[$el->Entreprise]))
    array_push($new_array[$el->Entreprise], $obj );
  else
    $new_array[$el->Entreprise] = array($obj );
}
echo json_encode($new_array);

class Pays
{
    public $code ;
    public $valeur;
    public $intitule;

    public function __construct($code, $intitule, $valeur)
    {
        $this->code = $code;
        $this->intitule = $intitule;
        $this->valeur = $valeur;
    }
}
?>