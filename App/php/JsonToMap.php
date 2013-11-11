<?php
require_once "functions.php";

mysql_connect("127.0.0.1","root", "");
mysql_select_db("ic05");

if(isset($_GET["file"]))
  $file = $_GET["file"];
else
  print_JSON(array("error"=>"Need to provide a valid file"));

$file = "../data/".$file;

$json = file_get_contents ($file, FILE_USE_INCLUDE_PATH);
$array = json_decode($json);

$new_array = array();
$companies_array = array();
$i = 0;
$countries = array();
foreach($array as $el)
{
  // if the enterprise is not yet in the array
  if(!isset($companies_array[$el->Entreprise]))
  {
    $i = count($companies_array);
    $companies_array[$el->Entreprise] = count($companies_array); 
    $new_array[$i] = new Entreprise($el->Entreprise);   
  }
  else
    $i = $companies_array[$el->Entreprise];

  array_push($new_array[$i]->values, $el->Valeur);
  if(isset($el->Pays))
  {
    array_push($new_array[$i]->countries, ucsmart($el->Pays));
    array_push($new_array[$i]->coords, array($el->Latitude, $el->Longitude));
  }
  else
  {
    if(isset($countries[$el->Code]))
      $country = $countries[$el->Code];
    else
    {
      $country = getCountryFromDB($el->Code);
      if($country == null)
      {
        $country = getCountry($el->Code, false);
        if(!isset($country["error"]))
          mysql_query("INSERT INTO countries(code, name, latitude, longitude) VALUES('".trim($el->Code)."', '".trim($country["name"])."', '".$country["latitude"]."', '".$country["longitude"]."');");
        else
          mysql_query("INSERT INTO countries(code, name) VALUES('".trim($el->Code)."', '###');");
      }
      $countries[$el->Code] = $country;
    }
    if(!isset($country["name"]))
    {
      array_push($new_array[$i]->countries, "###");
    }
    else
    {
      array_push($new_array[$i]->countries, ucsmart($country["name"]));
      array_push($new_array[$i]->coords, array($country["latitude"], $country["longitude"]));      
    }
  }
}
//order by enterprise name
usort($new_array, 'cmp');
print_JSON($new_array);
?>