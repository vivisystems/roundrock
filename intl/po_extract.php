<?php

  if (!isset($argv[1])) {
	die("Usage: $argv[0] <locale>\n");
  }
  $locale = $argv[1];

  # Aaaand back to the way it was
  $dir = dirname(__FILE__);
  $locale_podir = "$dir/$locale"."_pofiles";

  $handle = fopen($locale.".csv", "r");
  if (!$handle) {
	die($locale.".csv not found\n");
  }


   $lastFile = "";
   $lastContent = "";

	while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {

		$num = count($data);
		if ($num < 3) continue;

		if (strlen(trim($data[0])) == 0) continue;

		if (ereg(".dtd|.properties",$data[0])) {

			$lastFile = str_replace(":", "", trim($data[0])). ".po";

			echo "open $lastFile \n\n";
		        $lastContent = file_get_contents($locale_podir . "/" . $lastFile);

			continue;
		}

		$template = 'msgstr "'.$data[0].'"';
		$value = 'msgstr "'.$data[2].'"';

                $lastContent = str_replace($template, $value, $lastContent);

		file_put_contents($locale_podir . "/" . $lastFile, $lastContent);


	}


fclose($handle);  



?>
