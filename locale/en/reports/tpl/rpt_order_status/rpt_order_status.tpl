<!-- div class="paper" style="overflow:auto;" -->
<div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div>
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<p class="heading_p">Terminal: ${head.store.terminal_no}</p>
		<p class="heading_p">Clerk: ${head.clerk_displayname}</p>
		<p class="caption">${head.title}</p>
	</div>

	<div style="float: right;">
		<p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">Printed Time: ${foot.gen_time}</p>
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>
        <table id="body-table">
            <!--caption>${head.title}</caption-->
            <thead>
                <tr>
                    <th style="text-align: left;">Term_No.</th>
                    <th style="text-align: left;">Service Clerk</th>
                    <th style="text-align: left;">Status</th>
                    <th style="text-align: left;">Time</th>
                    <th style="text-align: left;">Sequence</th>
                    <th style="text-align: left;">Invoice No</th>
                    <th style="text-align: right;">Total</th>
                    <th style="text-align: right;">Add-on Tax</th>
                    <th style="text-align: right;">Surcharge</th>
                    <th style="text-align: right;">Discount</th>
                    <th style="text-align: right;">Payment</th>
                </tr>
            </thead>
            <tbody>
{for detail in body}
                <tr>
                    <td style="text-align: left;">${detail.terminal_no}</td>
                    <td style="text-align: left;">${detail.service_clerk_displayname}</td>
                    <td style="text-align: left;">${detail.status}</td>
                    <td style="text-align: left;">${detail.transaction_created|unixTimeToString:'yyyy-M-d'}</td>
                    <td style="text-align: left;">${detail.sequence}</td>
                    <td style="text-align: left;">${detail.invoice_no}</td>
                    <td style="text-align: right;">${detail.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.tax_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${detail.total|viviFormatPrices:true}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td></td>
                    <td></td>
                    <td colspan="4">Summary:</td>
                    <td style="text-align: right;">${foot.foot_datas.item_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.tax_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.surcharge_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.discount_subtotal|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${foot.foot_datas.total|viviFormatPrices:true}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
<!--/div -->
