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
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.terminal_no_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.terminal_no|escape}</span>
                       <span class="caption">${queryFormLabel.shiftno_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.shiftno|escape}</span>
                       <span class="caption">${queryFormLabel.periodtype_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.periodtype|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                       <br>
                       <span class="caption">${queryFormLabel.database_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.database|escape}</span>
                </td>
           </tr>
       </table>

{for category in body.department}
    <table id="body-table">
        <thead>
        	<tr>
            	<td colspan="5" class="subtitle">${category.no} - ${category.name}</td>
            </tr>
            <tr class="fields">
                <th style="text-align: center;">${_( '(rpt)Product Number' )}</th>
                <th style="text-align: center;">${_( '(rpt)Product Name' )}</th>
                <th style="text-align: right;">${_( '(rpt)Average Net Price' )}</th>
                <th style="text-align: right;">${_( '(rpt)Quantities Sold' )}</th>
                <th style="text-align: right;">${_( '(rpt)Gross Sales' )}</th>
                <th style="text-align: right;">${_( '(rpt)Net Sales' )}</th>
            </tr>
        </thead>
        <tbody>
{for item in category.orderItems}
            <tr>
                <td style="text-align: left;">${item.product_no}</td>
                <td style="text-align: left;">${item.product_name}</td>
                <td style="text-align: right;">${item.avg_price|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.qty|format:0}</td>
                <td style="text-align: right;">${item.gross|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.net|default:0|viviFormatPrices:true}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td style="text-align: left;">${_( '(rpt)Records Found' ) + ': '}${category.orderItems.length|format:0}</td>
                <td colspan="2" style="text-align: right;">${_( '(rpt)Summary' ) + ':'}</td>
                <td style="text-align: right;">${category.summary.qty|format:0}</td>
                <td style="text-align: right;">${category.summary.gross|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${category.summary.net|default:0|viviFormatPrices:true}</td>
            </tr>
        </tfoot>
    </table>
    <br />
{/for}

{for category in body.group}
    <table id="body-table">
        <thead>
        	<tr>
            	<td colspan="5" class="subtitle">${category.name}</td>
            </tr>
            <tr class="fields">
                <th style="text-align: center;">${_( '(rpt)Product Number' )}</th>
                <th style="text-align: center;">${_( '(rpt)Product Name' )}</th>
                <th style="text-align: right;">${_( '(rpt)Average Net Price' )}</th>
                <th style="text-align: right;">${_( '(rpt)Quantities Sold' )}</th>
                <th style="text-align: right;">${_( '(rpt)Gross Sales' )}</th>
                <th style="text-align: right;">${_( '(rpt)Net Sales' )}</th>
            </tr>
        </thead>
        <tbody>
{for item in category.orderItems}
            <tr>
                <td style="text-align: left;">${item.product_no}</td>
                <td style="text-align: left;">${item.product_name}</td>
                <td style="text-align: right;">${item.avg_price|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.qty|format:0}</td>
                <td style="text-align: right;">${item.gross|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${item.net|default:0|viviFormatPrices:true}</td>
            </tr>
{/for}
        </tbody>
        <tfoot>
            <tr>
                <td style="text-align: left;">${_( '(rpt)Records Found' ) + ': '}${category.orderItems.length|format:0}</td>
                <td colspan="2" style="text-align: right;">${_( '(rpt)Summary' ) + ':'}</td>
                <td style="text-align: right;">${category.summary.qty|format:0}</td>
                <td style="text-align: right;">${category.summary.gross|default:0|viviFormatPrices:true}</td>
                <td style="text-align: right;">${category.summary.net|default:0|viviFormatPrices:true}</td>
            </tr>
        </tfoot>
    </table>
    <br />
{/for}

</div>
<br />
