[&INIT]
[&QSON]${head.store.name|center:12}[&QSOFF]
[&DWON]${head.store.branch|center:12}[&DWOFF]
${head.store.telephone1|center:24}

${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}
${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}

${head.title|center:24}
${_( '(rpt)Product Count' ) + ':'|left:24}
${head.total|format:0|right:24}
${_( '(rpt)Products Displayed' ) + ':'|left:24}
${head.displayed|format:0|right:24}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.department_label}${queryFormLabel.department}
${queryFormLabel.plugroup_label}${queryFormLabel.plugroup}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

{for category in body}
------------------------
${_( '(rpt)Department Number' ) + ':'}
${category.no|right:24}
${_( '(rpt)Department Name' ) + ':'}
${category.name|right:24}
{for plu in category.plu}
------------------------
${_( '(rpt)Product Number' ) + ':'}
${plu.no|right:24}
${_( '(rpt)Product Name' ) + ':'}
${plu.name|right:24}
${_( '(rpt)Alt Name1' ) + ':'}
${plu.alt_name1|right:24}
${_( '(rpt)Alt Name2' ) + ':'}
${plu.alt_name2|right:24}
${_( '(rpt)Barcode' ) + ':'}
${plu.barcode|right:24}
${_( '(rpt)Tax Code' ) + ':'}
${plu.rate|right:24}
${_( '(rpt)Stock Level' ) + ':'}
${plu.stock|right:24}
${_( '(rpt)Low Stock Threshold' ) + ':'}
${plu.min_stock|right:24}

${_( '(rpt)Price Level' )}1 {if plu.level_enable1}*
{else} 
{/if}
${plu.price_level1|viviFormatPrices:false|right:24}
${plu.halo1|viviFormatPrices:false|right:24}
${plu.lalo1|viviFormatPrices:false|right:24}
${_( '(rpt)Price Level' )}2 {if plu.level_enable2}*
{else} 
{/if}
${plu.price_level2|viviFormatPrices:false|right:24}
${plu.halo2|viviFormatPrices:false|right:24}
${plu.lalo2|viviFormatPrices:false|right:24}
${_( '(rpt)Price Level' )}3 {if plu.level_enable3}*
{else} 
{/if}
${plu.price_level3|viviFormatPrices:false|right:24}
${plu.halo3|viviFormatPrices:false|right:24}
${plu.lalo3|viviFormatPrices:false|right:24}
${_( '(rpt)Price Level' )}4 {if plu.level_enable4}*
{else} 
{/if}
${plu.price_level4|viviFormatPrices:false|right:24}
${plu.halo4|viviFormatPrices:false|right:24}
${plu.lalo4|viviFormatPrices:false|right:24}
${_( '(rpt)Price Level' )}5 {if plu.level_enable5}*
{else} 
{/if}
${plu.price_level5|viviFormatPrices:false|right:24}
${plu.halo5|viviFormatPrices:false|right:24}
${plu.lalo5|viviFormatPrices:false|right:24}
${_( '(rpt)Price Level' )}6 {if plu.level_enable6}*
{else} 
{/if}
${plu.price_level6|viviFormatPrices:false|right:24}
${plu.halo6|viviFormatPrices:false|right:24}
${plu.lalo6|viviFormatPrices:false|right:24}
${_( '(rpt)Price Level' )}7 {if plu.level_enable7}*
{else} 
{/if}
${plu.price_level7|viviFormatPrices:false|right:24}
${plu.halo7|viviFormatPrices:false|right:24}
${plu.lalo7|viviFormatPrices:false|right:24}
${_( '(rpt)Price Level' )}8 {if plu.level_enable8}*
{else} 
{/if}
${plu.price_level8|viviFormatPrices:false|right:24}
${plu.halo8|viviFormatPrices:false|right:24}
${plu.lalo8|viviFormatPrices:false|right:24}
${_( '(rpt)Price Level' )}9 {if plu.level_enable9}*
{else} 
{/if}
${plu.price_level9|viviFormatPrices:false|right:24}
${plu.halo9|viviFormatPrices:false|right:24}
${plu.lalo9|viviFormatPrices:false|right:24}

${_( '(rpt)auto_maintain_stock' ) + ': '}
${plu.auto_maintain_stock|boolToLetter|right:24}
${_( '(rpt)return_stock' ) + ': '}
${plu.return_stock|boolToLetter|right:24}
${_( '(rpt)manual_adjustment_only' ) + ': '}
${plu.manual_adjustment_only|boolToLetter|right:24}
${_( '(rpt)force_memo' ) + ': '}
${plu.force_memo|boolToLetter|right:24}
${_( '(rpt)force_condiment' ) + ': '}
${plu.force_condiment|boolToLetter|right:24}
${_( '(rpt)age_verification' ) + ': '}
${plu.age_verification|boolToLetter|right:24}
${_( '(rpt)single' ) + ': '}
${plu.single|boolToLetter|right:24}
${_( '(rpt)visible' ) + ': '}
${plu.visible|boolToLetter|right:24}
${_( '(rpt)display_mode' ) + ': '}
${plu.display_mode|right:24}
{/for}
------------------------
${_( '(rpt)Records Found' ) + ':'|left:24}
${category.count|format:0|right:24}
${_( '(rpt)Records Displayed' ) + ':'|left:24}
${category.plu.length|format:0|right:24}
------------------------
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
