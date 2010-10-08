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
		<p class="heading_p" style="text-align: right;">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p-->
		<p class="caption" style="text-align: right;">${head.start_time} - ${head.end_time}</p>
	</div>
        <table id="condition-table">
            <tr>
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.terminal_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.terminal_no|escape}</span>
                       <span class="caption">${queryFormLabel.shift_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.shift_no|escape}</span>
                       <span class="caption">${queryFormLabel.period_type_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.period_type|escape}</span>
                       <span class="caption">${queryFormLabel.num_dept_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.num_dept|escape}</span>
                       <span class="caption">${queryFormLabel.num_product_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.num_product|escape}</span>
                       <br>
                       <span class="caption">${queryFormLabel.database_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
           </tr>
       </table>
<table style="width: 100%;">
    <!--caption>${head.title}&nbsp;${head.subtitle}<br />${head.start_time} - ${head.end_time}</caption-->

    <tr>
        <td colspan="3">
            <table id="body-table" style="width: 100%">
                <thead>
                    <tr>
                        <th style="text-align: right;">${_( '(rpt)Gross Sales' )}</td>
                        <th style="text-align: right;">${_( '(rpt)Add-on Tax' )}</td>
                        <th style="text-align: right;">${_( '(rpt)Surcharge' )}</td>
                        <th style="text-align: right;">${_( '(rpt)Discount' )}</td>
                        <th style="text-align: right;">${_( '(rpt)Promotion' )}</td>
                        <th style="text-align: right;">${_( '(rpt)Revalue' )}</td>
                        <th style="text-align: right;">${_( '(rpt)Total' )}</td>
                    </tr>
                </thead>
                <tr>
                    <td style="text-align: right;">${body.sales_summary.GrossSales|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.TaxSubtotal|default:0|viviFormatTaxes:true}</td>
                    <td style="text-align: right;">${body.sales_summary.SurchargeSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.DiscountSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.PromotionSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.RevalueSubtotal|default:0|viviFormatPrices:true}</td>
                    <td style="text-align: right;">${body.sales_summary.NetSales|default:0|viviFormatPrices:true}</td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td colspan="7"><br/></td>
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
                        <td style="text-align: left;">${_( '(rpt)Number of Orders' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.OrderNum|default:0|format:0}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Number of Guests' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.Guests|default:0|format:0}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Number of Items' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.QtySubtotal|default:0|format:0}</td>
                    </tr>
					<tr>
                        <td style="text-align: left;">${_( '(rpt)Number of Voided Orders' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.VoidedOrders|default:0|format:0}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Gross Sales' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.GrossSales|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Gross Sales/Order' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.AvgGrossSales|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Gross Sales/Guest' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.AvgGrossSalesPerGuest|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Total' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.NetSales|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Total/Order' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.AvgNetSales|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Total/Guest' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.AvgNetSalesPerGuest|default:0|viviFormatPrices:true}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Number of Guests/Order' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.AvgGuests|default:0|format:2}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left;">${_( '(rpt)Number of Items/Order' ) + ':'}</td>
                        <td style="text-align: right;">${body.sales_summary.AvgQtySubtotal|default:0|format:2}</td>
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
                        <th style="text-align: right;">${_( '(rpt)Payment Amount' )}</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.payment_list.records}
                    <tr>
                        <td style="text-align: left;">${_('(rpt)' + detail.name)|default:''}</td>
                        <td style="text-align: right;">${detail.total|default:0|viviFormatPrices:true}</td>
                    </tr>
    {for payment in detail.detail}
    				<tr>
    					<td style="text-align: left;">&nbsp;&nbsp;&nbsp;&nbsp;${payment.memo1|default:''}</td>
                        <td style="text-align: right;">${payment.amount|default:0|viviFormatPrices:true}</td>
                    </tr>
   	{/for}
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>${_( '(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.payment_list.summary.payment_total|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

            <table id="body-table">
                <caption>${_( '(rpt)Groupable Payments' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Groupable Payment Type' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Groupable Payment Count' )}</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.groupable_payments.records}
                    <tr>
                        <td style="text-align: left;">${detail.memo1|default:''} ${detail.amount|viviFormatPrices:true}</td>
                        <td style="text-align: right;">X ${detail.count}</td>
                    </tr>
    {/for}
                </tbody>
            </table>
            <br />

        </td>
        
        <td valign="top">
        	<table id="body-table">
                <caption>${_( '(rpt)Hourly Sales' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Hour' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Number of Guests' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Number of Orders' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Gross Sales' )}</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.hourly_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.Hour}</td>
                        <td style="text-align: right;">${detail.Guests|default:0|format:0}</td>
                        <td style="text-align: right;">${detail.OrderNum|default:0|format:0}</td>
                        <td style="text-align: right;">${detail.HourGrossSales|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>${_( '(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.hourly_sales.summary.Guests|default:0|format:0}</td>
                        <td style="text-align: right;">${body.hourly_sales.summary.OrderNum|default:0|format:0}</td>
                        <td style="text-align: right;">${body.hourly_sales.summary.HourGrossSales|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
            
        	<table id="body-table">
                <caption>${_( '(rpt)Top Department Sales' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Department' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Quantity' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Gross Sales' )}</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.dept_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.cate_no}-${detail.cate_name}</td>
                        <td style="text-align: right;">${detail.qty|default:0|format:0}</td>
                        <td style="text-align: right;">${detail.gross|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>${_( '(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.dept_sales.summary.qty|default:0|format:0}</td>
                        <td style="text-align: right;">${body.dept_sales.summary.gross|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

        	<table id="body-table">
                <caption>${_( '(rpt)Top Product Sales' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Product' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Quantity' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Gross Sales' )}</th>
                    </tr>
                </thead>
                <tbody>
    {for detail in body.prod_sales.records}
                    <tr>
                        <td style="text-align: left;">${detail.product_name}</td>
                        <td style="text-align: right;">${detail.qty|default:0|format:0}</td>
                        <td style="text-align: right;">${detail.gross|default:0|viviFormatPrices:true}</td>
                    </tr>
    {/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td>${_( '(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.prod_sales.summary.qty|default:0|format:0}</td>
                        <td style="text-align: right;">${body.prod_sales.summary.gross|default:0|viviFormatPrices:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />

        </td>
        <td valign="top">
        	<table id="body-table">
                <caption>${_( '(rpt)Destination Summary' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_('(rpt)Destination')}</th>
                        <th style="text-align: center;">${_('(rpt)Destination Count')}</th>
                        <th style="text-align: right;">${_('(rpt)Destination Gross Sales')}</th>
                        <th style="text-align: right;">${_('(rpt)Destination Average Gross Sales')}</th>
                    </tr>
                </thead>
                <tbody>
	{for detail in body.destination_summary.data}
                    <tr>
                        <td style="text-align: left;">${detail.destination}</td>
                        <td style="text-align: center;">${detail.num_trans|default:0|format:0}</td>
                        <td style="text-align: right;">${detail.gross|default:0|viviFormatPrices:true}</td>
                        <td style="text-align: right;">${detail.gross_per_trans|default:0|viviFormatPrices:true}</td>
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
            
            <table id="body-table">
                <caption>${_( '(rpt)Tax Summary' )}</caption>
                <thead>
                    <tr>
                        <th style="text-align: left;">${_( '(rpt)Tax Name' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Taxable Amount' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Add-On Tax Amount' )}</th>
                        <th style="text-align: right;">${_( '(rpt)Included Tax Amount' )}</th>
                    </tr>
                </thead>
                <tbody>
	{for detail in body.tax_summary.records}
                    <tr>
                        <td style="text-align: left;">${detail.tax_name} (${detail.tax_no})</td>
                        <td style="text-align: right;">${detail.taxable_amount|default:0|viviFormatTaxes:true}</td>
                        <td style="text-align: right;">${detail.tax_subtotal|default:0|viviFormatTaxes:true}</td>
                        <td style="text-align: right;">${detail.included_tax|default:0|viviFormatTaxes:true}</td>
                    </tr>
	{/for}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2">${_('(rpt)Summary' ) + ':'}</td>
                        <td style="text-align: right;">${body.tax_summary.summary.addon_tax_total|default:0|viviFormatTaxes:true}</td>
                        <td style="text-align: right;">${body.tax_summary.summary.included_tax_total|default:0|viviFormatTaxes:true}</td>
                    </tr>
                </tfoot>
            </table>
            <br />
            
            <table id="body-table">
            	<caption>${_( '(rpt)Discount Summary' )}</caption>
            	<thead>
            		<tr>
            			<th style="text-align: left;">${_( '(rpt)Discount Name' )}</th>
            			<th style="text-align: left;">${_( '(rpt)Discount Type' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Discount Count' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Discount Amount' )}</th>
            		</tr>
            	</thead>
            	<tbody>
	{for detail in body.discount_summary.data}
					<tr>
						<td style="text-align: left;">${detail.discount_name}</td>
						<td style="text-align: left;">${detail.itemOrAddition}</td>
						<td style="text-align: right;">${detail.num_rows|default:0|format:0}</td>
						<td style="text-align: right;">${detail.amount|default:0|viviFormatPrices:true}</td>
					</tr>
	{/for}
				</tbody>
				<tfoot>
					<tr>
						<td colspan="2">${_( '(rpt)Summary' ) + ':'}</td>
						<td style="text-align: right;">${body.discount_summary.summary.num_rows|default:0|format:0}</td>
						<td style="text-align: right;">${body.discount_summary.summary.amount|default:0|viviFormatPrices:true}</td>
					</tr>
				</tfoot>
			</table>
			<br />
		
			<table id="body-table">
            	<caption>${_( '(rpt)Surcharge Summary' )}</caption>
            	<thead>
            		<tr>
            			<th style="text-align: left;">${_( '(rpt)Surcharge Name' )}</th>
            			<th style="text-align: left;">${_( '(rpt)Surcharge Type' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Surcharge Count' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Surcharge Amount' )}</th>
            		</tr>
            	</thead>
            	<tbody>
	{for detail in body.surcharge_summary.data}
					<tr>
						<td style="text-align: left;">${detail.surcharge_name}</td>
						<td style="text-align: left;">${detail.itemOrAddition}</td>
						<td style="text-align: right;">${detail.num_rows|default:0|format:0}</td>
						<td style="text-align: right;">${detail.amount|default:0|viviFormatPrices:true}</td>
					</tr>
	{/for}
				</tbody>
				<tfoot>
					<tr>
						<td colspan="2">${_( '(rpt)Summary' ) + ':'}</td>
						<td style="text-align: right;">${body.surcharge_summary.summary.num_rows|default:0|format:0}</td>
						<td style="text-align: right;">${body.surcharge_summary.summary.amount|default:0|viviFormatPrices:true}</td>
					</tr>
				</tfoot>
			</table>
			<br />
			
			<table id="body-table">
            	<caption>${_( '(rpt)Promotion Summary' )}</caption>
            	<thead>
            		<tr>
            			<th style="text-align: left;">${_( '(rpt)Promotion Name' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Promotion Count' )}</th>
            			<th style="text-align: right;">${_( '(rpt)Promotion Amount' )}</th>
            		</tr>
            	</thead>
            	<tbody>
	{for detail in body.promotion_summary.results}
					<tr>
						<td style="text-align: left;">${detail.name}</td>
						<td style="text-align: right;">${detail.matched_count|default:0|format:0}</td>
						<td style="text-align: right;">${detail.discount_subtotal|default:0|viviFormatPrices:true}</td>
					</tr>
	{/for}
				</tbody>
				<tfoot>
					<tr>
						<td>${_( '(rpt)Summary' ) + ':'}</td>
						<td style="text-align: right;">${body.promotion_summary.summary.matched_count|default:0|format:0}</td>
						<td style="text-align: right;">${body.promotion_summary.summary.discount_subtotal|default:0|viviFormatPrices:true}</td>
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
