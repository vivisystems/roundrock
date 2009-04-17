<!-- div class="paper" style="overflow:auto;" -->
<!--div id="printhead">
	<img src="chrome://viviecr/content/skin/images/logo.png" /><br />
</div-->
<div id="docbody" class="paper">
	<p class="heading_store">${head.store.name} - ${head.store.branch}</p>
	<p class="heading_store">${head.store.telephone1}</p>

	<div style="float: left;">
		<!--p class="heading_p">${_( '(rpt)Terminal' ) + ': '}${head.store.terminal_no}</p>
		<p class="heading_p">${_( '(rpt)Clerk' ) + ': '}${head.clerk_displayname}</p-->
		<p class="caption">${head.title}<br />${head.subtitle}</p>
	</div>

	<div style="float: right;">
		<!--p class="heading_p">&nbsp;</p>
		<p class="heading_p" align="right">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p-->
		<p class="caption">${head.start_time} - ${head.end_time}</p>
	</div>

<table style="width: 720px;">
    <!--caption>${head.title}&nbsp;${head.subtitle}<br />${head.start_time} - ${head.end_time}</caption-->

    <tr>
        <td colspan="3">
            <table id="body-table">
                <tr>
                    <td style="text-align: right;">${_( '(rpt)Total' )}</td>
                    <td style="text-align: right;">${_( '(rpt)Add-on Tax' )}</td>
                    <td style="text-align: right;">${_( '(rpt)Surcharge' )}</td>
                    <td style="text-align: right;">${_( '(rpt)Discount' )}</td>
                    <td style="text-align: right;">${_( '(rpt)Revenue' )}</td>
                </tr>
                <tr>
                    <td style="text-align: right;">${body.sales_summary.ItemSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.TaxSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.Total|default:0|viviFormatPrices:true}</td>
                </tr>
            </table>
        </td>
    </tr>

    <tr>
        <td valign="top">
            <table id="body-table">
                <caption>${_( '(rpt)Sales Summary' )}</caption>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Orders' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.OrderNum|default:0}</td>
                    </tr>

                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Total' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.Total|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Guests' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.Guests|default:0}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Items' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.ItemsCount|default:0}</td>
                    </tr>

                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Average Total' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.AvgTotal|default:0|format:2}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Average Guest' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.AvgGuests|default:0|format:2}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Average Items' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.AvgItemsCount|default:0|format:2}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>${_( '(rpt)Payment List' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Payment' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.payment_list.records}
                    <tr>
                        <td style="text-align: left;">${detail.name}</td>
                        <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {for payment in detail.detail}
    				<tr>
    					<td style="text-align: left;">&nbsp;&nbsp;&nbsp;&nbsp;${payment.memo1}</td>
                        <td style="text-align: right;">${payment.amount - payment.change|default:0|viviFormatPrices:true}</td>
                    </tr>
   	{/for}
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>${_( '(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.payment_list.summary.payment_total - body.payment_list.summary.change_total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>${_( '(rpt)Destination Summary' )}</caption>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                	<!--tr>
                		<td style="text-align: left;">Total Orders:</td>
                		<td style="text-align: right;">${body.destination_summary.total_trans }</td>
                	</tr-->
	{for detail in body.destination_summary.data}
                    <tr>
                        <td style="text-align: left;">${detail.destination}&nbsp;${_( '(rpt)Times' ) + ':'}</td>
                        <td style="text-align: right;">${detail.num_trans|default:0}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${detail.destination}&nbsp;${_( '(rpt)Amount' ) + ':'}</td>
                        <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
	{/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <br />
            
        </td>
        
        <td valign="top">
        	<table id="body-table">
                <caption>${_( '(rpt)Top Department Sales' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Department' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Qty' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.dept_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.cate_no}-${detail.cate_name}</td>
                        <td style="text-align: right;">${detail.qty|default:0}</td>
                        <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>${_( '(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.dept_sales.summary.qty|default:0}</td>
                        <td style="text-align: right;">${body.dept_sales.summary.total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

        	<table id="body-table">
                <caption>${_( '(rpt)Hourly Sales' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Time' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Guests' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Orders' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.hourly_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.Hour}</td>
                        <td style="text-align: right;">${detail.Guests|default:0}</td>
                        <td style="text-align: right;">${detail.OrderNum|default:0}</td>
                        <td style="text-align: right;">${detail.HourTotal|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>${_( '(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.hourly_sales.summary.Guests|default:0}</td>
                        <td style="text-align: right;">${body.hourly_sales.summary.OrderNum|default:0}</td>
                        <td style="text-align: right;">${body.hourly_sales.summary.HourTotal|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
        </td>
        <td valign="top">
            <table id="body-table">
                <caption>${_( '(rpt)Top Product Sales' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Product' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Qty' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.prod_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.product_name}</td>
                        <td style="text-align: right;">${detail.qty|default:0}</td>
                        <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>${_( '(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.prod_sales.summary.qty|default:0}</td>
                        <td style="text-align: right;">${body.prod_sales.summary.total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
            
            <table id="body-table">
                <caption>${_( '(rpt)Tax summary' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Name' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Rate' )}</th>
                        <th style="text-align: left;">${_( '(rpt)Type' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Total' )}</th>
                    </tr>
                </thead>
                <tbody>
	{for detail in body.tax_summary.records}
                    <tr>
                        <td style="text-align: left;">${detail.tax_name}</td>
                        <td style="text-align: right;">${detail.tax_rate}</td>
                        <td style="text-align: left;">${detail.tax_type}</td>
                        <td style="text-align: right;">${detail.tax_subtotal|default:0|viviFormatPrices:true}</td>
                    </tr>
	{/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3">${_( '(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.tax_summary.summary.tax_total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
            
            <table id="body-table">
            	<caption>${_( '(rpt)Discount Summary' )}</caption>
            	<thead>
            		<tr>
            			<th style="text-align: left;">${_( '(rpt)Name' )}</th>
            			<th style="text-align: left;">${_( '(rpt)TYPE' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Count' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Amount' )}</th>
            		</tr>
            	</thead>
            	<tbody>
	{for detail in body.discount_summary.data}
					<tr>
						<td style="text-align: left;">${detail.discount_name}</td>
						<td style="text-align: left;">${detail.itemOrAddition}</td>
						<td style="text-align: right;">${detail.num_rows|default:0}</td>
						<td style="text-align: right;">${detail.amount|default:0|viviFormatPrices:true}</td>
					</tr>
	{/for}
				</tbody>
				<tfoot>
					<tr>
						<td colspan="2">${_( '(rpt)Summary' ) + ':'}</td>
						<td style="text-align: right;">${body.discount_summary.summary.num_rows|default:0}</td>
						<td style="text-align: right;">${body.discount_summary.summary.amount|default:0|viviFormatPrices:true}</td>
					</tr>
				</tfoot>
			</table>
			<br />
		
			<table id="body-table">
            	<caption>${_( '(rpt)Surcharge Summary' )}</caption>
            	<thead>
            		<tr>
            			<th style="text-align: left;">${_( '(rpt)Name' )}</th>
            			<th style="text-align: left;">${_( '(rpt)TYPE' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Count' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Amount' )}</th>
            		</tr>
            	</thead>
            	<tbody>
	{for detail in body.surcharge_summary.data}
					<tr>
						<td style="text-align: left;">${detail.surcharge_name}</td>
						<td style="text-align: left;">${detail.itemOrAddition}</td>
						<td style="text-align: right;">${detail.num_rows|default:0}</td>
						<td style="text-align: right;">${detail.amount|default:0|viviFormatPrices:true}</td>
					</tr>
	{/for}
				</tbody>
				<tfoot>
					<tr>
						<td colspan="2">${_( '(rpt)Summary' ) + ':'}</td>
						<td style="text-align: right;">${body.surcharge_summary.summary.num_rows|default:0}</td>
						<td style="text-align: right;">${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true}</td>
					</tr>
				</tfoot>
			</table>
			<br />
        </td>
    </tr>

    <!--tr>
        <td></td>
        <td valign="top">
            

        </td>
    </tr-->


    <!--tr>
        <td colspan="2">
            <table id="body-table">
                <caption>Invoice Record</caption>
                <tr>
                    <td>Num:</td>
                    <td>100</td>

                    <td>Cancel_Num:</td>
                    <td>5</td>

                    <td>Start_No:</td>
                    <td>FQ24252627</td>
                </tr>
                <tr>
                    <td>Amount:</td>
                    <td>5000</td>

                    <td>Cancel_Amt:</td>
                    <td>980</td>

                    <td>End_No:</td>
                    <td>FQ24253637</td>
                </tr>
            </table>
        </td>
    </tr-->

</table>

</div>
<!--/div -->
