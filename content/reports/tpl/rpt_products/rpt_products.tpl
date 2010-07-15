<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}</p>
		<p class="heading_p">${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
		<p class="heading_p">${_( '(rpt)Product Count' ) + ': '}${head.total} ${_( '(rpt)Products Displayed' ) + ': '}${head.displayed}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" style="text-align: right;">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
	</div>
        <table id="condition-table">
            <tr>
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.department_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.department|escape}</span>
                       <span class="caption">${queryFormLabel.plugroup_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.plugroup|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                </td>
           </tr>
       </table>
	
{for category in body}
        <table id="body-table" style="width: 100%">
            <!--caption>${category.no} - ${category.name}</caption-->
            <thead>
            	<tr>
            		<td colspan="8" class="subtitle">${category.no} - ${category.name}</td>
            	</tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( '(rpt)Product Number' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Product Name' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Alt Name1' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Alt Name2' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Barcode' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Tax Code' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Stock Level' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Low Stock Threshold' )}</th>
                </tr>
            </thead>
            <tbody>
{for plu in category.plu}
                <tr>
                    <td style="text-align: left;">${plu.no}</td>
                    <td style="text-align: left;">${plu.name}</td>
                    <td style="text-align: left;">${plu.alt_name1|default:''}</td>
                    <td style="text-align: left;">${plu.alt_name2|default:''}</td>
                    <td style="text-align: left;">${plu.barcode|default:''}</td>
                    <td style="text-align: left;">${plu.rate|default:''}</td>
                    <td style="text-align: right;">${plu.stock|default:''|format:0}</td>
                    <td style="text-align: right;">${plu.min_stock|default:''|format:0}</td>
                </tr>
                <tr>
                    <td/>
                    <td colspan="7">
                        <table style="width: 100%">
                            <tr>
                                <td style="width: 15%;"></td>
                                <td style="text-align: right; width: 9%;">1{if plu.level_enable1}*{/if}</td>
                                <td style="text-align: right; width: 9%;">2{if plu.level_enable2}*{/if}</td>
                                <td style="text-align: right; width: 9%;">3{if plu.level_enable3}*{/if}</td>
                                <td style="text-align: right; width: 9%;">4{if plu.level_enable4}*{/if}</td>
                                <td style="text-align: right; width: 9%;">5{if plu.level_enable5}*{/if}</td>
                                <td style="text-align: right; width: 9%;">6{if plu.level_enable6}*{/if}</td>
                                <td style="text-align: right; width: 9%;">7{if plu.level_enable7}*{/if}</td>
                                <td style="text-align: right; width: 9%;">8{if plu.level_enable8}*{/if}</td>
                                <td style="text-align: right; width: 9%;">9{if plu.level_enable9}*{/if}</td>
                            </tr>
                            <tr>
                                <td>${_( '(rpt)Price' ) + ':'}</td>
                                <td style="text-align: right;">${plu.price_level1|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.price_level2|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.price_level3|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.price_level4|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.price_level5|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.price_level6|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.price_level7|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.price_level8|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.price_level9|viviFormatPrices:false}</td>
                            </tr>
                            <tr>
                                <td>${_( '(rpt)Halo' ) + ':'}</td>
                                <td style="text-align: right;">${plu.halo1|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.halo1|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.halo1|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.halo4|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.halo5|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.halo6|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.halo7|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.halo8|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.halo9|viviFormatPrices:false}</td>
                            </tr>
                            <tr>
                                <td>${_( '(rpt)Lalo' ) + ':'}</td>
                                <td style="text-align: right;">${plu.lalo1|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.lalo1|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.lalo1|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.lalo4|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.lalo5|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.lalo6|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.lalo7|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.lalo8|viviFormatPrices:false}</td>
                                <td style="text-align: right;">${plu.lalo9|viviFormatPrices:false}</td>
                            </tr>
                            <tr>
                                <td/>
                                <td colspan="3" style="text-align: left;">${_( '(rpt)auto_maintain_stock' ) + ': '}${plu.auto_maintain_stock|boolToLetter}</td>
                                <td colspan="3" style="text-align: left;">${_( '(rpt)return_stock' ) + ': '}${plu.return_stock|boolToLetter}</td>
                                <td colspan="3" style="text-align: left;">${_( '(rpt)manual_adjustment_only' ) + ': '}${plu.manual_adjustment_only|boolToLetter}</td>
                            </tr>
                            <tr>
                                <td/>
                                <td colspan="3" style="text-align: left;">${_( '(rpt)force_memo' ) + ': '}${plu.force_memo|boolToLetter}</td>
                                <td colspan="3" style="text-align: left;">${_( '(rpt)force_condiment' ) + ': '}${plu.force_condiment|boolToLetter}</td>
                                <td colspan="3" style="text-align: left;">${_( '(rpt)age_verification' ) + ': '}${plu.age_verification|boolToLetter}</td>
                            </tr>
                            <tr>
                                <td/>
                                <td colspan="3" style="text-align: left;">${_( '(rpt)single' ) + ': '}${plu.single|boolToLetter}</td>
                                <td colspan="3" style="text-align: left;">${_( '(rpt)visible' ) + ': '}${plu.visible|boolToLetter}</td>
                                <td colspan="3" style="text-align: left;">${_( '(rpt)display_mode' ) + ': '}${plu.display_mode}</td>
                            </tr>
                        </table>
                    </td>
                </tr>

{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="text-align: left;">${_('(rpt)Records Found') + ': '}${category.count|format:0} <br/>${_( '(rpt)Records Displayed' ) + ': '}${category.plu.length|format:0}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
