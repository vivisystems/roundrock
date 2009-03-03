<?php
$dir = "./work/";

// Open a known directory, and proceed to read its contents
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
		if ($file == '.' || $file == '..') continue;

		if (strpos($file, '.txt') !== false)  {

			echo "Signing $file .... \n";

			$content = file_get_contents($dir.$file);


			$out_file = $dir . str_replace(".txt", ".lic", $file);
		
			preg_match('/license stub= (.*)$/', $content, $m);

			$out = shell_exec("echo " . trim($m[1]) . " | ./getSystemLicense > " . $out_file);

			
		}


        }
        closedir($dh);
    }
}
?>

