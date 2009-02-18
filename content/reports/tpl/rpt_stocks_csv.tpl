"Dept.No","Dept.Name","No","Name","Stock","Min.Stock"
{for category in body}
"'${category.no}","'${category.name}"
{for plu in category.plu}
"","","'${plu.no}","'${plu.name}","${plu.stock}","${plu.min_stock}"
{/for}
{/for}