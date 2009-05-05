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
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
	</div>
	
{for category in body}
        <table id="body-table" style="width: 100%">
            <!--caption>${category.no} - ${category.name}</caption-->
            <thead>
            	<tr>
            		<td colspan="6" class="subtitle">${category.no} - ${category.name}</td>
            	</tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( '(rpt)No.' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Name' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Barcode' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Tax' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Stock' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Safe_Stock' )}</th>
                </tr>
            </thead>
            <tbody>
{for plu in category.plu}
                <tr>
                    <td style="text-align: left;">${plu.no}</td>
                    <td style="text-align: left;">${plu.name}</td>
                    <td style="text-align: left;">${plu.barcode}</td>
                    <td style="text-align: left;">${plu.rate}</td>
                    <td style="text-align: right;">${plu.stock}</td>
                    <td style="text-align: right;">${plu.min_stock}</td>
                </tr>
                <tr>
                    <td></td>
                    <td colspan="5">
                        <table>
                            <tr>
                                <td style="width: 19%;"></td>
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
                                <td style="text-align: right;">${plu.price_level1|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_level2|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_level3|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_level4|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_level5|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_level6|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_level7|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_level8|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_level9|viviFormatPrices:true}</td>
                            </tr>
                            <tr>
                                <td>${_( '(rpt)Halo' ) + ':'}</td>
                                <td style="text-align: right;">${plu.price_halo1|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_halo1|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_halo1|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_halo4|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_halo5|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_halo6|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_halo7|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_halo8|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_halo9|viviFormatPrices:true}</td>
                            </tr>
                            <tr>
                                <td>${_( '(rpt)Lalo' ) + ':'}</td>
                                <td style="text-align: right;">${plu.price_lalo1|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_lalo1|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_lalo1|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_lalo4|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_lalo5|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_lalo6|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_lalo7|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_lalo8|viviFormatPrices:true}</td>
                                <td style="text-align: right;">${plu.price_lalo9|viviFormatPrices:true}</td>
                            </tr>
                            <tr>
                                <td colspan="2">${_( '(rpt)Maintain_Stock' ) + ': '}${plu.auto_maintain_stock|boolToLetter}</td>
                                <td colspan="2">${_( '(rpt)Return_Stock' ) + ': '}${plu.return_stock|boolToLetter}</td>
                                <td colspan="2">${_( '(rpt)Single' ) + ': '}${plu.single|boolToLetter}</td>
                                <td colspan="2">${_( '(rpt)Age_Verification' ) + ': '}${plu.age_verification|boolToLetter}</td>
                                <td colspan="2">${_( '(rpt)Visible' ) + ': '}${plu.visible|boolToLetter}</td>
                            </tr>
                        </table>
                    </td>
                </tr>

{/for}
            </tbody>
            <tfoot>
                <tr>
                <td colspan="4"></td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
</div>
<!--/div -->
