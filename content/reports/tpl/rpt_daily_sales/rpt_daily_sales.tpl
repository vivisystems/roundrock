<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">${_( 'Terminal' ) + ': '}${head.store.terminal_no}</p>
		<p class="heading_p">${_( 'Clerk' ) + ': '}${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">${_( 'Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>
	
        <table id="body-table">
            <!--caption>${head.title}</caption-->
            <thead>
                <tr>
                    <th style="text-align: left;">${_( 'Term_No.' )}</th>
                    <th style="text-align: left;">${_( 'Service Clerk' )}</th>
                    <th style="text-align: left;">${_( 'Proceeds Clerk' )}</th>
                    <th style="text-align: left;">${_( 'Time' )}</th>
                    <th style="text-align: left;">${_( 'Sequence' )}</th>
                    <th style="text-align: right;">${_( 'Total' )}</th>
                    <th style="text-align: right;">${_( 'Add-on Tax' )}</th>
                    <th style="text-align: right;">${_( 'Surcharge' )}</th>
                    <th style="text-align: right;">${_( 'Discount' )}</th>
                    <th style="text-align: right;">${_( 'Payment' )}</th>
                    <th style="text-align: right;">${_( 'Cash' )}</th>
                    <th style="text-align: right;">${_( 'Check' )}</th>
                    <th style="text-align: right;">${_( 'Credit Card' )}</th>
                    <th style="text-align: right;">${_( 'Coupon' )}</th>
                    <th style="text-align: right;">${_( 'Gift Card' )}</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td style="text-align: left;">${detail.service_clerk_displayname}</td>
                    <td style="text-align: left;">${detail.proceeds_clerk_displayname}</td>
                    <td style="text-align: left;">${detail.transaction_created|unixTimeToString:'yyyy-M-d'}</td>
                    <td style="text-align: left;">${detail.sequence}</td>
                    <td style="text-align: right;">${detail.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.tax_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.total|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.cash|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.check|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.creditcard|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.coupon|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.giftcard|default:0|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td colspan="3">${_( 'Summary' ) + ':'}</td>
                    <td style="text-align: right;">${foot.foot_datas.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.tax_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.total|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.cash|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.check|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.creditcard|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.coupon|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.giftcard|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>
</div>
<!--/div -->
