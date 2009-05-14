"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"

"${_( '(rpt)Dept.No' )}","${_( '(rpt)Dept.Name' )}","${_( '(rpt)No.' )}","${_( '(rpt)Name' )}","${_( '(rpt)Barcode' )}","${_( '(rpt)Tax' )}","${_( '(rpt)Min.Stock' )}","${_( '(rpt)Stock' )}"
{for category in body}
"'${category.no}","${category.name}"
{for plu in category.plu}
"","","${plu.no}","${plu.name}","${plu.barcode}","${plu.rate}","${plu.min_stock}","${plu.stock}"
"","","","","","Level1{if plu.level_enable1}*{/if}","Level2{if plu.level_enable2}*{/if}","Level3{if plu.level_enable3}*{/if}","Level4{if plu.level_enable4}*{/if}","Level5{if plu.level_enable5}*{/if}","Level6{if plu.level_enable6}*{/if}","Level7{if plu.level_enable7}*{/if}","Level8{if plu.level_enable8}*{/if}","Level9{if plu.level_enable9}*{/if}"
"","","","","${_( '(rpt)Price' ) + ':'}","${plu.price_level1|viviFormatPrices:true}","${plu.price_level2|viviFormatPrices:true}","${plu.price_level3|viviFormatPrices:true}","${plu.price_level4|viviFormatPrices:true}","${plu.price_level5|viviFormatPrices:true}","${plu.price_level6|viviFormatPrices:true}","${plu.price_level7|viviFormatPrices:true}","${plu.price_level8|viviFormatPrices:true}","${plu.price_level9|viviFormatPrices:true}"
"","","","","${_( '(rpt)Halo' ) + ':'}","${plu.price_halo1|viviFormatPrices:true}","${plu.price_halo1|viviFormatPrices:true}","${plu.price_halo1|viviFormatPrices:true}","${plu.price_halo4|viviFormatPrices:true}","${plu.price_halo5|viviFormatPrices:true}","${plu.price_halo6|viviFormatPrices:true}","${plu.price_halo7|viviFormatPrices:true}","${plu.price_halo8|viviFormatPrices:true}","${plu.price_halo9|viviFormatPrices:true}"
"","","","","${_( '(rpt)Lalo' ) + ':'}","${plu.price_lalo1|viviFormatPrices:true}","${plu.price_lalo1|viviFormatPrices:true}","${plu.price_lalo1|viviFormatPrices:true}","${plu.price_lalo4|viviFormatPrices:true}","${plu.price_lalo5|viviFormatPrices:true}","${plu.price_lalo6|viviFormatPrices:true}","${plu.price_lalo7|viviFormatPrices:true}","${plu.price_lalo8|viviFormatPrices:true}","${plu.price_lalo9|viviFormatPrices:true}"
"","","","","${_( '(rpt)Maintain_Stock' ) + ':'}","Return_Stock:","Single:","Age_Verification:","Visible:","","",
"","","","","${plu.auto_maintain_stock|boolToLetter}","${plu.return_stock|boolToLetter}","${plu.single|boolToLetter}","${plu.age_verification|boolToLetter}","${plu.visible|boolToLetter}","",""
"",""
{/for}
{/for}
