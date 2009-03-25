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
	</div>
{for category in body}
        <table id="body-table">
            <!--caption>${category.no} - ${category.name}</caption-->
            <thead>
            	<tr>
            		<td colspan="8" style="text-align: left;
							  font-weight: bold;
							  font-size: 12pt;
							  color: #292929;
							  margin: 10px 5px;
							  padding: 4px;">${category.no} - ${category.name}</td>
            	</tr>
                <tr class="fields">
                    <th style="text-align: left;">${_( 'No.' )}</th>
                    <th style="text-align: left;">${_( 'Name' )}</th>
                    <th style="text-align: right;">${_( 'Stock' )}</th>
                    <th style="text-align: right;">${_( 'Min Stock' )}</th>
                </tr>
            </thead>
            <tbody>
{for plu in category.plu}
                <tr>
                    <td style="text-align: left;">${plu.no}</td>
                    <td style="text-align: left;">${plu.name}</td>
                    <td style="text-align: right;">${plu.stock}</td>
                    <td style="text-align: right;">${plu.min_stock}</td>
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
