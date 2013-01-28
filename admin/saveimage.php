<?

$imagePath = '../images';
$name = md5(time()).'.jpg';
rename($_FILES['upload']['tmp_name'], $imagePath.'/'.$name);
echo $name;
