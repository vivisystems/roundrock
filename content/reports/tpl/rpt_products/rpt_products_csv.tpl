"${head.title}"

"${head.store.name}"
"${head.store.branch}"
"${_( '(rpt)Telephone' ) + ':'}","${head.store.telephone1}"
"${_( '(rpt)Clerk' ) + ':'}","${head.clerk_displayname}"
"${_( '(rpt)Printed Time' ) + ':'}","${foot.gen_time}"

"${_( '(rpt)Product Count' )}","${head.total}"
"${_( '(rpt)Products Displayed' )}","${head.displayed}"

"${_('(rpt)Condition') + ' - '}"
"${queryFormLabel.department_label}","${queryFormLabel.department}"
"${queryFormLabel.plugroup_label}","${queryFormLabel.plugroup}"
"${queryFormLabel.sortby_label}","${queryFormLabel.sortby}"

"${_( '(rpt)Department Number' )}","${_( '(rpt)Department Name' )}","${_( '(rpt)Product Number' )}","${_( '(rpt)Product Name' )}","${_( '(rpt)Alt Name1' )}","${_( '(rpt)Alt Name2' )}","${_( '(rpt)Barcode' )}","${_( '(rpt)Tax Code' )}","${_( '(rpt)Stock Level' )}","${_( '(rpt)Low Stock Threshold' )}","'${_( '(rpt)auto_maintain_stock') }","${_( '(rpt)return_stock' )}","${_( '(rpt)manual_adjustment_only' )}","${_( '(rpt)force_memo' )}","${_( '(rpt)force_condiment' )}","${_( '(rpt)age_verification' )}","${_( '(rpt)single' )}","${_( '(rpt)visible' )}","${_( '(rpt)display_mode' )}"

{for category in body}
"'${category.no}","${category.name}"
{for plu in category.plu}
"","","'${plu.no}","'${plu.name}","'${plu.alt_name1}","'${plu.alt_name2}","'${plu.barcode}","'${plu.rate}","${plu.stock}","${plu.min_stock}","${plu.auto_maintain_stock|boolToLetter}","${plu.return_stock|boolToLetter}","${plu.manual_adjustment_only|boolToLetter}","${plu.force_memo|boolToLetter}","${plu.force_condiment|boolToLetter}","${plu.age_verification|boolToLetter}","${plu.single|boolToLetter}","${plu.visible|boolToLetter}","${plu.display_mode}"

"","","","","","Level1{if plu.level_enable1}*{/if}","Level2{if plu.level_enable2}*{/if}","Level3{if plu.level_enable3}*{/if}","Level4{if plu.level_enable4}*{/if}","Level5{if plu.level_enable5}*{/if}","Level6{if plu.level_enable6}*{/if}","Level7{if plu.level_enable7}*{/if}","Level8{if plu.level_enable8}*{/if}","Level9{if plu.level_enable9}*{/if}"
"","","","","'${_( '(rpt)Price' ) + ':'}","${plu.price_level1|viviFormatPrices:false}","${plu.price_level2|viviFormatPrices:false}","${plu.price_level3|viviFormatPrices:false}","${plu.price_level4|viviFormatPrices:false}","${plu.price_level5|viviFormatPrices:false}","${plu.price_level6|viviFormatPrices:false}","${plu.price_level7|viviFormatPrices:false}","${plu.price_level8|viviFormatPrices:false}","${plu.price_level9|viviFormatPrices:false}"
"","","","","'${_( '(rpt)Halo' ) + ':'}","${plu.halo1|viviFormatPrices:false}","${plu.halo1|viviFormatPrices:false}","${plu.halo1|viviFormatPrices:false}","${plu.halo4|viviFormatPrices:false}","${plu.halo5|viviFormatPrices:false}","${plu.halo6|viviFormatPrices:false}","${plu.halo7|viviFormatPrices:false}","${plu.halo8|viviFormatPrices:false}","${plu.halo9|viviFormatPrices:false}"
"","","","","'${_( '(rpt)Lalo' ) + ':'}","${plu.lalo1|viviFormatPrices:false}","${plu.lalo1|viviFormatPrices:false}","${plu.lalo1|viviFormatPrices:false}","${plu.lalo4|viviFormatPrices:false}","${plu.lalo5|viviFormatPrices:false}","${plu.lalo6|viviFormatPrices:false}","${plu.lalo7|viviFormatPrices:false}","${plu.lalo8|viviFormatPrices:false}","${plu.lalo9|viviFormatPrices:false}"
"",""
{/for}
"${_( '(rpt)Records Found' ) + ':'}","${category.count}"
"${_( '(rpt)Records Displayed' ) + ':'}","${category.plu.length|format:0}"
{/for}
