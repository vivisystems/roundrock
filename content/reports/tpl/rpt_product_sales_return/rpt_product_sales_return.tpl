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
		<p class="heading_p" style="text-align: right;">${_( '(rpt)Printed Time' ) + ': '}${foot.gen_time}</p>
		<p class="caption" style="text-align: right;">${head.start_time} - ${head.end_time}</p>
	</div>
        <table id="condition-table">
            <tr>
                <td class="condition-title"><span class="caption">${queryFormLabel.database_label|escape}</span></td>
                <td align="left" >

                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
            </tr>
            <tr>
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.terminal_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.terminal_no|escape}</span>
                       <span class="caption">${queryFormLabel.shiftno_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.shiftno|escape}</span>
                       <span class="caption">${queryFormLabel.periodtype_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.periodtype|escape}</span>
                       <span class="caption">${queryFormLabel.returntype_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.returntype|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                </td>
           </tr>
       </table>

{for category in body}
    <table id="body-table">
        <thead>
        	<tr>
            	<td colspan="5" class="subtitle">${category.no} - ${category.name}</td>
            </tr>
            <tr class="fields">
                <th style="text-align: center;">${_( '(rpt)Product Number' )}</th>
                <th style="text-align: center;">${_( '(rpt)Product Name' )}</th>
                <th style="text-align: right;">${_( '(rpt)Average Price' )}</th>
                <th style="text-align: right;">${_( '(rpt)Units Returned' )}</th>
                <th style="text-align: right;">${_( '(rpt)Quantity Returned' )}</th>
                <th style="text-align: right;">${_( '(rpt)Gross Returns' )}</th>
                <th style="text-align: right;">${_( '(rpt)Net Returns' )}</th>
                <th style="text-align: right;">${_( '(rpt)Order Sequence' )}</th>
                <th style="text-align: right;">${_( '(rpt)Return Type' )}</th>
            </tr>
        </thead>
        <tbody>
{for item in category.orderItems}
            <tr id="${item.order_id}">
                <td style="text-align: left;">${item.product_no}</td>
                <td style="text-align: left;">${item.product_name}</td>
                <td style="text-align: right;">${item.avg_price|default:0|viviFormatPrices:true}</td>
{if item.units == 0}
                <td/>
{else}
                <td style="text-align: right;">${item.units|format:0}</td>
{/if}
                <td style="text-align: right;">${item.quantity}</td>
                <td style="text-align: right;">${item.gross|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.net|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;" class="hyperlink">${item.order_sequence}</td>
{if item.status == 1}
                <td style="text-align: right;">${_('(rpt)return type item')}</td>
{elseif item.status == -2}
                <td style="text-align: right;">${_('(rpt)return type order')}</td>
{else}
                <td/>
{/if}
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td style="text-align: left;">${_( '(rpt)Records Found' ) + ': '}${category.orderItems.length|format:0}</td>
                <td colspan="2" style="text-align: right;">${_( '(rpt)Summary' ) + ':'}</td>
{if category.summary.units == 0}
                <td/>
{else}
                <td style="text-align: right;">${category.summary.units|format:0}</td>
{/if}
                <td colspan="2" style="text-align: right;">${category.summary.gross|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${category.summary.net|default:0|viviFormatPrices:true}</td>
                <td colspan="2"/>
            </tr>
        </tfoot>
    </table>
    <br />
{/for}
</div>
<br />
