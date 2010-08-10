<!---->
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
		<!--p class="caption" style="text-align: right;">${head.start_time} - ${head.end_time}</p-->
	</div>
        <table id="condition-table">
            <tr>
                <td class="condition-title"><span class="caption">${_('(rpt)Condition') + ' - '}</span></td>
                <td align="left" >
                       <span class="caption">${queryFormLabel.sortby_label|escape}</span>
                       <span class="heading_p">${queryFormLabel.sortby|escape}</span>
                </td>
           </tr>
       </table>

        <table id="body-table">
            <!--caption>${head.title}</caption-->
            <thead>
                <tr>
                    <th style="text-align: left;">${_( '(rpt)Department Number' )}</th>
                    <th style="text-align: left;">${_( '(rpt)Department Name' )}</th>
                </tr>
            </thead>
            <tbody>
{for category in body}
                <tr>
                    <td style="text-align: left;">${category.no}</td>
                    <td style="text-align: left;">${category.name}</td>
                </tr>
{/for}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="text-align:left;">${_( '(rpt)Records Found' ) + ': '}${body.length|format:0}</td>
                </tr>
            </tfoot>
        </table>
        </br>

</div>
