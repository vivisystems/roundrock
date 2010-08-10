[&INIT]
[&QSON]${head.store.name|center:21}[&QSOFF]
[&DWON]${head.store.branch|center:21}[&DWOFF]
${head.store.telephone1|center:42}
${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no + ' '|left:11}${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname|left:14}

${head.title|center:42}
${_( '(rpt)Product Count' ) + ': '|left:30}${head.total|format:0|right:12}
${_( '(rpt)Products Displayed' ) + ': '|left:30}${head.displayed|format:0|right:12}

${_('(rpt)Condition') + ' - '}
${queryFormLabel.department_label}${queryFormLabel.department}
${queryFormLabel.plugroup_label}${queryFormLabel.plugroup}
${queryFormLabel.sortby_label}${queryFormLabel.sortby}

{for category in body}
------------------------------------------
${category.no} - ${category.name}
{for plu in category.plu}
------------------------------------------
${_( '(rpt)Product Number' ) + ':'|left:14}${plu.no|right:28}
${_( '(rpt)Product Name' ) + ':'|left:14}${plu.name|right:28}
${_( '(rpt)Alt Name1' ) + ':'|left:14}${plu.alt_name1|default:''|right:28}
${_( '(rpt)Alt Name2' ) + ':'|left:14}${plu.alt_name2|default:''|right:28}
${_( '(rpt)Barcode' ) + ':'|left:14}${plu.barcode|default:''|right:28}
${_( '(rpt)Tax Code' ) + ':'|left:14}${plu.rate|default:''|right:28}
${_( '(rpt)Stock Level' ) + ':'|left:14}${plu.stock|format:0|right:28}
${_( '(rpt)Low Stock Threshold' ) + ':'|left:14}${plu.min_stock|format:0|right:28}

${_( '(rpt)Price Level' )}1 {if plu.level_enable1}*
{else} 
{/if}
${plu.price_level1|viviFormatPrices:false|right:14}${plu.halo1|viviFormatPrices:false|right:14}${plu.lalo1|viviFormatPrices:false|right:14}
${_( '(rpt)Price Level' )}2 {if plu.level_enable2}*
{else} 
{/if}
${plu.price_level2|viviFormatPrices:false|right:14}${plu.halo2|viviFormatPrices:false|right:14}${plu.lalo2|viviFormatPrices:false|right:14}
${_( '(rpt)Price Level' )}3 {if plu.level_enable3}*
{else} 
{/if}
${plu.price_level3|viviFormatPrices:false|right:14}${plu.halo3|viviFormatPrices:false|right:14}${plu.lalo3|viviFormatPrices:false|right:14}
${_( '(rpt)Price Level' )}4 {if plu.level_enable4}*
{else} 
{/if}
${plu.price_level4|viviFormatPrices:false|right:14}${plu.halo4|viviFormatPrices:false|right:14}${plu.lalo4|viviFormatPrices:false|right:14}
${_( '(rpt)Price Level' )}5 {if plu.level_enable5}*
{else} 
{/if}
${plu.price_level5|viviFormatPrices:false|right:14}${plu.halo5|viviFormatPrices:false|right:14}${plu.lalo5|viviFormatPrices:false|right:14}
${_( '(rpt)Price Level' )}6 {if plu.level_enable6}*
{else} 
{/if}
${plu.price_level6|viviFormatPrices:false|right:14}${plu.halo6|viviFormatPrices:false|right:14}${plu.lalo6|viviFormatPrices:false|right:14}
${_( '(rpt)Price Level' )}7 {if plu.level_enable7}*
{else} 
{/if}
${plu.price_level7|viviFormatPrices:false|right:14}${plu.halo7|viviFormatPrices:false|right:14}${plu.lalo7|viviFormatPrices:false|right:14}
${_( '(rpt)Price Level' )}8 {if plu.level_enable8}*
{else} 
{/if}
${plu.price_level8|viviFormatPrices:false|right:14}${plu.halo8|viviFormatPrices:false|right:14}${plu.lalo8|viviFormatPrices:false|right:14}
${_( '(rpt)Price Level' )}9 {if plu.level_enable9}*
{else} 
{/if}
${plu.price_level9|viviFormatPrices:false|right:14}${plu.halo9|viviFormatPrices:false|right:14}${plu.lalo9|viviFormatPrices:false|right:14}

${_( '(rpt)auto_maintain_stock' ) + ': '|left:30}${plu.auto_maintain_stock|boolToLetter|right:12}
${_( '(rpt)return_stock' ) + ': '|left:30}${plu.return_stock|boolToLetter|right:12}
${_( '(rpt)manual_adjustment_only' ) + ': '|left:30}${plu.manual_adjustment_only|boolToLetter|right:12}
${_( '(rpt)force_memo' ) + ': '|left:30}${plu.force_memo|boolToLetter|right:12}
${_( '(rpt)force_condiment' ) + ': '|left:30}${plu.force_condiment|boolToLetter|right:12}
${_( '(rpt)age_verification' ) + ': '|left:30}${plu.age_verification|boolToLetter|right:12}
${_( '(rpt)single' ) + ': '|left:30}${plu.single|boolToLetter|right:12}
${_( '(rpt)visible' ) + ': '|left:30}${plu.visible|boolToLetter|right:12}
${_( '(rpt)display_mode' ) + ': '|left:30}${plu.display_mode|right:12}
{/for}
------------------------------------------
${_( '(rpt)Records Found' ) + ': '|left:30}${category.count|format:0|right:12}
${_( '(rpt)Records Displayed' ) + ': '|left:30}${category.plu.length|format:0|right:12}
------------------------------------------
{/for}
${foot.gen_time}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]
