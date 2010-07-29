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
	</div>
       <table id="condition-table">
            <tr>
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.department_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.department|escape}</span>
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                </td>
           </tr>
       </table>
{for category in body}
        <table id="body-table">
            <!--caption>${category.no} - ${category.name}</caption-->
            <thead>
            	<tr>
            		<td colspan="4" class="subtitle">${category.no} - ${category.name}</td>
            	</tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( '(rpt)Product Number' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Product Name' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Stock Level' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Low Watermark' )}</th>
                    <th style="text-align: right;">${_( '(rpt)High Watermark' )}</th>
                    <th style="text-align: right;">${_( '(rpt)Recommended Purchase Quantity' )}</th>
                </tr>
            </thead>
            <tbody>
{for plu in category.plu}
                <tr>
                    <td style="text-align: left;">${plu.no}</td>
                    <td style="text-align: left;">${plu.name}</td>
                    <td style="text-align: right;">${plu.stock}</td>
                    <td style="text-align: right;">${plu.min_stock}</td>
                    <td style="text-align: right;">${plu.max_stock}</td>
                    <td style="text-align: right;">${plu.delta}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4" style="text-align: left;">${_('(rpt)Records Found') + ': '}${category.plu.length|format:0}</td>
                </tr>
            </tfoot>
        </table>
        </br>
{/for}
{if rowLimitExcess}
    <div>
		<p class="caption" style="text-align: center">${_( '(rpt)There are too many reocrds to display.' )}</p>
		<p class="caption" style="text-align: center">${_( '(rpt)To scrutinize the complete record set, please export the .csv file.' )}</p>
	</div>
{/if}
</div>
<!--/div -->
